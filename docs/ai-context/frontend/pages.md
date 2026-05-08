# Frontend: Páginas y Rutas

> Estructura de rutas con Next.js App Router.

---

## Estructura de Rutas

```
apps/web/src/app/
├── layout.tsx                    # Layout raíz
├── page.tsx                      # Home (/)
├── globals.css                   # Estilos globales
│
├── (auth)/                       # Grupo de rutas auth (sin layout dashboard)
│   ├── login/page.tsx           # /login
│   └── register/page.tsx        # /register
│
├── dashboard/                    # Área privada
│   ├── layout.tsx               # Layout con sidebar
│   ├── page.tsx                 # /dashboard
│   ├── asistencias/
│   │   └── page.tsx             # /dashboard/asistencias (ADMIN_ESCUELA, EDUCADOR)
│   ├── calificaciones/
│   │   └── page.tsx             # /dashboard/calificaciones (ADMIN_ESCUELA, EDUCADOR)
│   ├── mi-asistencia/
│   │   └── page.tsx             # /dashboard/mi-asistencia (ESTUDIANTE)
│   ├── mi-boletin/
│   │   └── page.tsx             # /dashboard/mi-boletin (ESTUDIANTE) — boletín con impresión PDF
│   ├── mis-notas/
│   │   └── page.tsx             # /dashboard/mis-notas (ESTUDIANTE)
│   ├── grupos/
│   │   ├── page.tsx             # /dashboard/grupos
│   │   ├── nuevo/page.tsx       # /dashboard/grupos/nuevo
│   │   └── [id]/
│   │       ├── editar/page.tsx  # /dashboard/grupos/[id]/editar
│   │       ├── estudiantes/
│   │       │   └── page.tsx     # /dashboard/grupos/[id]/estudiantes
│   │       └── educadores/
│   │           └── page.tsx     # /dashboard/grupos/[id]/educadores
│   └── cursos/
│       ├── page.tsx             # /dashboard/cursos (mis cursos)
│       ├── nuevo/page.tsx       # /dashboard/cursos/nuevo
│       └── [id]/
│           ├── editar/page.tsx  # /dashboard/cursos/[id]/editar
│           └── lecciones/
│               ├── page.tsx     # /dashboard/cursos/[id]/lecciones
│               ├── nueva/page.tsx
│               └── [leccionId]/editar/page.tsx
│
├── cursos/                       # Catálogo público
│   ├── page.tsx                 # /cursos
│   └── [slug]/
│       ├── page.tsx             # /cursos/[slug]
│       └── foro/
│           ├── page.tsx         # /cursos/[slug]/foro
│           └── [postId]/
│               └── page.tsx     # /cursos/[slug]/foro/[postId]
│
├── offline/                      # Experiencia offline
│   └── cursos/
│       └── [slug]/
│           ├── page.tsx          # /offline/cursos/[slug]
│           └── lecciones/
│               └── [leccionId]/
│                   └── page.tsx  # /offline/cursos/[slug]/lecciones/[leccionId]
│
└── api/                          # API Routes (proxy al backend)
    ├── auth/
    ├── cursos/
    │   └── [id]/foros/
    │       ├── route.ts
    │       └── [postId]/
    │           ├── route.ts
    │           ├── cerrar/route.ts
    │           └── respuestas/route.ts
    ├── lecciones/
    ├── educadores/me/grupos/
    ├── grupos/[id]/asistencias/
    ├── grupos/[id]/calificaciones/
    ├── grupos/[id]/estudiantes/
    ├── grupos/[id]/educadores/
    ├── instituciones/[id]/estudiantes/
    ├── instituciones/[id]/educadores/
    ├── instituciones/[id]/periodos/
    ├── mi-institucion/
    └── upload/
```

---

## Layouts

### Layout Raíz (`layout.tsx`)

```typescript
import { Inter } from 'next/font/google';
import { SessionProvider } from '@/components/auth/SessionProvider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Amauta - Plataforma Educativa',
  description: 'Sistema educativo para la gestión del aprendizaje',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
```

### Layout Dashboard (`dashboard/layout.tsx`)

```typescript
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
```

---

## Patrones de Página

### Página protegida orientada a rol

```typescript
// app/dashboard/asistencias/page.tsx

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { AsistenciaRapidaSection } from '@/components/asistencias/AsistenciaRapidaSection';

export default async function AsistenciasPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const rol = session.user?.rol;
  if (!['ADMIN_ESCUELA', 'EDUCADOR'].includes(rol || '')) {
    redirect('/dashboard');
  }

  return <AsistenciaRapidaSection />;
}
```

### Página Pública con Datos

```typescript
// app/cursos/page.tsx (F6-003 — búsqueda y filtros implementados)
//
// Query params soportados: page, buscar, categoriaId, nivel
// Llama a GET /api/v1/cursos?estado=PUBLICADO&limit=12&...
// Categorías cacheadas 1h (revalidate: 3600)
// Layout: BuscadorCursos arriba + FiltrosCursos lateral + CatalogoCursos grid

import { CatalogoCursos } from '@/components/catalogo/CatalogoCursos';
import { BuscadorCursos } from '@/components/catalogo/BuscadorCursos';
import { FiltrosCursos } from '@/components/catalogo/FiltrosCursos';

export default async function CursosPage({ searchParams }) {
  const resolvedParams = await searchParams;
  const [categorias, cursosData] = await Promise.all([
    getCategorias(),
    getCursos(resolvedParams),
  ]);

  return (
    <div>
      <BuscadorCursos />
      <div className="grid lg:grid-cols-[250px_1fr]">
        <FiltrosCursos categorias={categorias} />
        <CatalogoCursos cursosData={cursosData} />
      </div>
    </div>
  );
}
```

### Página protegida para foro por curso

```typescript
// app/cursos/[slug]/foro/page.tsx

import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';
import { ForoListado } from '@/components/foros/ForoListado';

export default async function CursoForoPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/cursos/[slug]/foro');
  }

  const curso = await api.get('/cursos/slug/[slug]');
  if (!curso) {
    notFound();
  }

  return (
    <ForoListado
      cursoId={curso.id}
      cursoSlug={curso.slug}
      currentUserId={session.user.id}
      currentUserRol={session.user.rol}
    />
  );
}
```

### Proxies de foros

- `GET/POST /api/cursos/[id]/foros`
  - Reenvía filtros `tipo`, `etiqueta`, `sinResponder`, `page`, `limit`.
- `GET/DELETE /api/cursos/[id]/foros/[postId]`
  - Obtiene detalle del thread o aplica soft delete vía backend.
- `POST /api/cursos/[id]/foros/[postId]/respuestas`
  - Crea respuestas raíz o respuestas anidadas de un nivel.
- `POST /api/cursos/[id]/foros/[postId]/cerrar`
  - Cierra el thread en backend.

### Página Protegida con Formulario

```typescript
// app/dashboard/cursos/nuevo/page.tsx

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { CursoForm } from '@/components/cursos/CursoForm';

const API_URL = process.env.API_URL || 'http://localhost:3001';

async function getCategorias() {
  const res = await fetch(`${API_URL}/api/v1/categorias`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.categorias || [];
}

export default async function NuevoCursoPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  // Verificar rol
  const rol = session.user?.rol;
  if (!['EDUCADOR', 'ADMIN_ESCUELA', 'SUPER_ADMIN'].includes(rol || '')) {
    redirect('/dashboard');
  }

  const categorias = await getCategorias();

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Crear Nuevo Curso</h1>
      <CursoForm categorias={categorias} />
    </div>
  );
}
```

### Páginas administrativas de grupos

- `/dashboard/grupos` muestra el listado filtrable de grupos.
- `/dashboard/grupos/[id]/estudiantes` carga la gestión de asignaciones de estudiantes.
- `/dashboard/grupos/[id]/educadores` carga la gestión de asignaciones de educadores.
- Estas páginas resuelven primero la institución del usuario o el grupo actual y luego delegan la interacción a client components.

---

## Rutas relevantes de Fase 4

| Ruta                                 | Rol principal           | Descripción                                    |
| ------------------------------------ | ----------------------- | ---------------------------------------------- |
| `/dashboard/grupos`                  | ADMIN_ESCUELA           | Gestión base de grupos                         |
| `/dashboard/grupos/[id]/estudiantes` | ADMIN_ESCUELA           | Asignación y remoción de estudiantes           |
| `/dashboard/grupos/[id]/educadores`  | ADMIN_ESCUELA           | Asignación y remoción de educadores            |
| `/dashboard/asistencias`             | ADMIN_ESCUELA, EDUCADOR | Carga rápida de asistencias                    |
| `/dashboard/calificaciones`          | ADMIN_ESCUELA, EDUCADOR | Carga rápida de calificaciones por materia     |
| `/api/mi-institucion`                | ADMIN_ESCUELA           | Proxy para resolver la institución del usuario |
| `/api/educadores/me/grupos`          | EDUCADOR                | Proxy para grupos del educador                 |
| `/api/grupos/[id]/asistencias`       | ADMIN_ESCUELA, EDUCADOR | Proxy GET/PUT de asistencias                   |

### Página con Parámetro Dinámico

```typescript
// app/cursos/[slug]/page.tsx

import { notFound } from 'next/navigation';
import { CursoHeader } from '@/components/catalogo/CursoHeader';
import { CursoInfo } from '@/components/catalogo/CursoInfo';
import { CursoTemario } from '@/components/catalogo/CursoTemario';

const API_URL = process.env.API_URL || 'http://localhost:3001';

async function getCurso(slug: string) {
  const res = await fetch(`${API_URL}/api/v1/cursos/slug/${slug}`, {
    cache: 'no-store',
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.curso;
}

export default async function CursoDetallePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const curso = await getCurso(slug);

  if (!curso) {
    notFound();
  }

  return (
    <main>
      <CursoHeader curso={curso} />
      <div className="container mx-auto grid md:grid-cols-3 gap-8 py-8">
        <div className="md:col-span-2">
          <CursoInfo curso={curso} />
          <CursoTemario lecciones={curso.lecciones || []} />
        </div>
        <aside>
          {/* Sidebar con info adicional */}
        </aside>
      </div>
    </main>
  );
}
```

---

## Grupos de Rutas

### `(auth)` - Autenticación

Rutas sin el layout de dashboard:

- `/login` - Formulario de login
- `/register` - Formulario de registro

### `dashboard` - Área Privada

Requiere autenticación. Layout con sidebar.

---

## Metadata

```typescript
// Por página
export const metadata: Metadata = {
  title: 'Mis Cursos | Amauta',
  description: 'Gestiona tus cursos',
};

// Dinámica
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const curso = await getCurso(slug);

  return {
    title: `${curso?.titulo || 'Curso'} | Amauta`,
    description: curso?.descripcion,
  };
}
```

---

## Notas para IA

1. **App Router**: Usar convenciones de Next.js 14+
2. **Params async**: `params` y `searchParams` son Promise
3. **auth()**: Obtener sesión en Server Components
4. **notFound()**: Para 404 en páginas dinámicas
5. **redirect()**: Para redirecciones server-side
6. **cache**: `no-store` para datos en tiempo real, `revalidate` para estáticos
