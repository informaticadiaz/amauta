# Frontend: Componentes

> Componentes reutilizables del proyecto.

---

## Estructura de Componentes

```
apps/web/src/components/
├── auth/                    # Autenticación
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   ├── SessionProvider.tsx
│   ├── UserMenu.tsx
│   ├── RequireRole.tsx
│   └── AccessDenied.tsx
│
├── layout/                  # Layout
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Sidebar.tsx
│   ├── MobileMenu.tsx
│   ├── MainLayout.tsx
│   └── DashboardLayout.tsx
│
├── cursos/                  # Gestión de cursos (dashboard)
│   ├── CursoForm.tsx
│   ├── CursoForm.module.css
│   ├── CursosList.tsx
│   ├── CursoCard.tsx
│   └── ImageUploader.tsx
│
├── lecciones/               # Gestión de lecciones
│   ├── LeccionForm.tsx
│   └── LeccionesList.tsx
│
├── catalogo/                # Catálogo público
│   ├── CatalogoCursos.tsx
│   ├── CursoCardPublic.tsx
│   ├── BuscadorCursos.tsx
│   ├── FiltrosCursos.tsx
│   ├── PaginacionCursos.tsx
│   ├── CursoHeader.tsx
│   ├── CursoInfo.tsx
│   ├── CursoTemario.tsx
│   ├── EducadorCard.tsx
│   ├── InscripcionBtn.tsx
│   └── DownloadCursoButton.tsx
│
└── offline/                 # Offline/PWA
    └── SyncManagerClient.tsx
```

---

## Patrones de Componentes

### Client Component con Estado

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Component.module.css';

interface Props {
  initialData?: Data;
  onSuccess?: () => void;
}

export function MyComponent({ initialData, onSuccess }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/endpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Error');
      }

      onSuccess?.();
      router.push('/destination');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && <div className={styles.error}>{error}</div>}
      {/* campos */}
    </form>
  );
}
```

### Server Component (default)

```typescript
// Sin 'use client' - es Server Component por defecto

interface Props {
  data: Data[];
}

export function DataList({ data }: Props) {
  return (
    <ul>
      {data.map((item) => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}
```

### Componente con Estilos CSS Modules

```typescript
import styles from './Component.module.css';

export function Component() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Título</h1>
      <p className={`${styles.text} ${styles.highlighted}`}>Texto</p>
    </div>
  );
}
```

---

## Componentes de Layout

### Header

```typescript
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { UserMenu } from '@/components/auth/UserMenu';

export async function Header() {
  const session = await auth();

  return (
    <header className="bg-white shadow">
      <nav className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link href="/" className="font-bold text-xl">
          Amauta
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/cursos">Cursos</Link>
          {session ? (
            <UserMenu user={session.user} />
          ) : (
            <Link href="/login">Iniciar Sesión</Link>
          )}
        </div>
      </nav>
    </header>
  );
}
```

### DashboardLayout

```typescript
'use client';

import { Sidebar } from './Sidebar';
import { MobileMenu } from './MobileMenu';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <Sidebar className="hidden md:block w-64" />
      <MobileMenu className="md:hidden" />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
```

---

## Componentes de Formulario

### CursoForm (extracto)

```typescript
'use client';

interface Curso {
  id: string;
  titulo: string;
  descripcion: string;
  categoriaId: string;
  nivel: 'PRINCIPIANTE' | 'INTERMEDIO' | 'AVANZADO';
  imagen: string | null;
  duracion: number | null;
  idioma: string;
}

interface Props {
  curso?: Curso;              // undefined = crear, definido = editar
  categorias: Categoria[];
  onSuccess?: () => void;
}

export function CursoForm({ curso, categorias, onSuccess }: Props) {
  const isEditing = !!curso;

  // Estado para campos controlados
  const [titulo, setTitulo] = useState(curso?.titulo || '');
  const [imagenUrl, setImagenUrl] = useState<string | null>(curso?.imagen || null);

  // ... handleSubmit con fetch a /api/cursos

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="titulo"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        maxLength={200}
      />

      <select name="categoriaId" defaultValue={curso?.categoriaId || ''}>
        <option value="">Selecciona...</option>
        {categorias.map((cat) => (
          <option key={cat.id} value={cat.id}>{cat.nombre}</option>
        ))}
      </select>

      <ImageUploader value={imagenUrl} onChange={setImagenUrl} />

      <button type="submit" disabled={loading}>
        {isEditing ? 'Guardar cambios' : 'Crear curso'}
      </button>
    </form>
  );
}
```

### ImageUploader

```typescript
'use client';

interface Props {
  value: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
}

export function ImageUploader({ value, onChange, disabled }: Props) {
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      onChange(data.url);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      {value && <img src={value} alt="Preview" />}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={disabled || uploading}
      />
    </div>
  );
}
```

---

## Componentes de Catálogo

### CursoCardPublic

```typescript
import Link from 'next/link';
import Image from 'next/image';

interface Props {
  curso: {
    id: string;
    titulo: string;
    slug: string;
    descripcion: string;
    imagen: string | null;
    nivel: string;
    educador: { nombre: string; apellido: string };
    _count: { lecciones: number };
  };
}

export function CursoCardPublic({ curso }: Props) {
  return (
    <Link href={`/cursos/${curso.slug}`} className="block">
      <article className="border rounded-lg overflow-hidden hover:shadow-lg">
        {curso.imagen && (
          <Image
            src={curso.imagen}
            alt={curso.titulo}
            width={400}
            height={225}
            className="w-full h-48 object-cover"
          />
        )}
        <div className="p-4">
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {curso.nivel}
          </span>
          <h3 className="font-bold mt-2">{curso.titulo}</h3>
          <p className="text-gray-600 text-sm line-clamp-2">
            {curso.descripcion}
          </p>
          <div className="mt-4 text-sm text-gray-500">
            {curso.educador.nombre} {curso.educador.apellido}
          </div>
        </div>
      </article>
    </Link>
  );
}
```

### Paginación

```typescript
'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface Props {
  page: number;
  totalPages: number;
}

export function PaginacionCursos({ page, totalPages }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function goToPage(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    router.push(`/cursos?${params.toString()}`);
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => goToPage(page - 1)}
        disabled={page <= 1}
      >
        Anterior
      </button>
      <span>Página {page} de {totalPages}</span>
      <button
        onClick={() => goToPage(page + 1)}
        disabled={page >= totalPages}
      >
        Siguiente
      </button>
    </div>
  );
}
```

---

## Componentes de Auth

### RequireRole

```typescript
'use client';

import { useSession } from 'next-auth/react';
import { AccessDenied } from './AccessDenied';

type Rol = 'ESTUDIANTE' | 'EDUCADOR' | 'ADMIN_ESCUELA' | 'SUPER_ADMIN';

interface Props {
  roles: Rol[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RequireRole({ roles, children, fallback }: Props) {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div>Cargando...</div>;
  }

  const userRole = session?.user?.rol as Rol | undefined;

  if (!userRole || !roles.includes(userRole)) {
    return fallback ?? <AccessDenied />;
  }

  return <>{children}</>;
}
```

---

## Notas para IA

1. **'use client'**: Solo para componentes interactivos
2. **CSS Modules**: Preferir sobre Tailwind inline para componentes complejos
3. **router.refresh()**: Después de mutaciones para actualizar Server Components
4. **next/image**: Usar para imágenes optimizadas
5. **next/link**: Usar para navegación interna
6. **Props explícitas**: Siempre definir interfaces para props
