'use client';

/**
 * Hook de Autorización
 *
 * Proporciona funciones para verificar roles y permisos del usuario actual.
 *
 * @example
 * const { hasRole, hasAnyRole, isAdmin, canManageCourses } = useAuthorization();
 *
 * if (hasRole('EDUCADOR')) {
 *   // Mostrar opciones de educador
 * }
 *
 * {canManageCourses && <CreateCourseButton />}
 */

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
  isAdmin: boolean; // ADMIN_ESCUELA o SUPER_ADMIN

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
  const hasRole = (requiredRol: Rol): boolean => {
    return rol === requiredRol;
  };

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
