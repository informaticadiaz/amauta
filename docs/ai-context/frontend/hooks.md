# Frontend: Hooks

> Hooks personalizados del proyecto.

---

## Hooks Disponibles

| Hook               | Archivo                     | Propósito                  |
| ------------------ | --------------------------- | -------------------------- |
| `useAuthorization` | `hooks/useAuthorization.ts` | Verificar roles y permisos |

---

## useAuthorization

Hook para verificar roles y permisos del usuario autenticado.

### Uso

```typescript
'use client';

import { useAuthorization } from '@/hooks/useAuthorization';

export function MyComponent() {
  const {
    isLoading,
    isAuthenticated,
    user,
    hasRole,
    hasAnyRole,
    // Helpers
    isEstudiante,
    isEducador,
    isAdminEscuela,
    isSuperAdmin,
    isAdmin,
    // Permisos
    canManageCourses,
    canEnrollInCourses,
    canViewProgress,
    canManageUsers,
    canManageInstitution,
  } = useAuthorization();

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <div>No autenticado</div>;
  }

  return (
    <div>
      <p>Bienvenido, {user?.name}</p>

      {canManageCourses && (
        <button>Crear Curso</button>
      )}

      {hasRole('SUPER_ADMIN') && (
        <button>Admin Panel</button>
      )}

      {hasAnyRole('EDUCADOR', 'ADMIN_ESCUELA') && (
        <button>Dashboard Educador</button>
      )}
    </div>
  );
}
```

### Implementación

```typescript
'use client';

import { useSession } from 'next-auth/react';

type Rol = 'ESTUDIANTE' | 'EDUCADOR' | 'ADMIN_ESCUELA' | 'SUPER_ADMIN';

interface AuthorizationHook {
  // Estado
  isLoading: boolean;
  isAuthenticated: boolean;
  user: {
    id: string;
    email: string;
    name: string;
    rol: Rol;
  } | null;

  // Verificación de roles
  hasRole: (rol: Rol) => boolean;
  hasAnyRole: (...roles: Rol[]) => boolean;

  // Helpers comunes
  isEstudiante: boolean;
  isEducador: boolean;
  isAdminEscuela: boolean;
  isSuperAdmin: boolean;
  isAdmin: boolean;

  // Permisos por funcionalidad
  canManageCourses: boolean;
  canEnrollInCourses: boolean;
  canViewProgress: boolean;
  canManageUsers: boolean;
  canManageInstitution: boolean;
}

export function useAuthorization(): AuthorizationHook {
  const { data: session, status } = useSession();

  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated' && !!session?.user;

  const user = isAuthenticated
    ? {
        id: session.user.id,
        email: session.user.email ?? '',
        name: session.user.name ?? '',
        rol: session.user.rol as Rol,
      }
    : null;

  const rol = user?.rol;

  // Verificación de roles
  const hasRole = (requiredRol: Rol): boolean => rol === requiredRol;

  const hasAnyRole = (...roles: Rol[]): boolean => {
    if (!rol) return false;
    return roles.includes(rol);
  };

  // Helpers por rol específico
  const isEstudiante = rol === 'ESTUDIANTE';
  const isEducador = rol === 'EDUCADOR';
  const isAdminEscuela = rol === 'ADMIN_ESCUELA';
  const isSuperAdmin = rol === 'SUPER_ADMIN';
  const isAdmin = isAdminEscuela || isSuperAdmin;

  // Permisos por funcionalidad
  const canManageCourses = hasAnyRole(
    'EDUCADOR',
    'ADMIN_ESCUELA',
    'SUPER_ADMIN'
  );
  const canEnrollInCourses = hasAnyRole('ESTUDIANTE', 'EDUCADOR');
  const canViewProgress = isAuthenticated;
  const canManageUsers = hasAnyRole('ADMIN_ESCUELA', 'SUPER_ADMIN');
  const canManageInstitution = hasAnyRole('ADMIN_ESCUELA', 'SUPER_ADMIN');

  return {
    isLoading,
    isAuthenticated,
    user,
    hasRole,
    hasAnyRole,
    isEstudiante,
    isEducador,
    isAdminEscuela,
    isSuperAdmin,
    isAdmin,
    canManageCourses,
    canEnrollInCourses,
    canViewProgress,
    canManageUsers,
    canManageInstitution,
  };
}
```

---

## Patrón para Nuevos Hooks

### Hook de Fetch con Estado

```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseDataResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useData<T>(url: string): UseDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Error al cargar datos');
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
```

### Hook de Mutación

```typescript
'use client';

import { useState, useCallback } from 'react';

interface UseMutationResult<T, D> {
  mutate: (data: D) => Promise<T | null>;
  loading: boolean;
  error: string | null;
}

export function useMutation<T, D>(
  url: string,
  method: 'POST' | 'PATCH' | 'DELETE' = 'POST'
): UseMutationResult<T, D> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (data: D): Promise<T | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.message || 'Error en la operación');
        }

        return response.json();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Error desconocido';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [url, method]
  );

  return { mutate, loading, error };
}
```

---

## Notas para IA

1. **'use client'**: Los hooks con useState/useEffect son Client Components
2. **useSession**: De next-auth/react para obtener sesión
3. **Memoization**: Usar useCallback para funciones estables
4. **Tipos explícitos**: Definir interfaces de retorno
5. **Error handling**: Siempre manejar errores con try/catch
