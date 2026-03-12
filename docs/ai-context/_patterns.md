# Patrones del Proyecto Amauta

> Referencia consolidada de patrones de código extraídos del proyecto real.

---

## 1. Validación con Zod

### Schema y Tipo Inferido

```typescript
// apps/api/src/{modulo}/dto/create-{modulo}.dto.ts

import { z } from 'zod';

export const createCursoSchema = z.object({
  titulo: z
    .string()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(200, 'El título no puede exceder 200 caracteres'),
  descripcion: z
    .string()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(5000, 'La descripción no puede exceder 5000 caracteres'),
  categoriaId: z.string().cuid('ID de categoría inválido'),
  nivel: z.enum(['PRINCIPIANTE', 'INTERMEDIO', 'AVANZADO'], {
    message: 'Nivel inválido. Debe ser PRINCIPIANTE, INTERMEDIO o AVANZADO',
  }),
  imagen: z.string().min(1, 'URL de imagen inválida').optional().nullable(),
  duracion: z
    .number()
    .int('La duración debe ser un número entero')
    .positive('La duración debe ser positiva')
    .optional(),
  idioma: z
    .string()
    .length(2, 'El idioma debe ser un código de 2 letras')
    .default('es'),
});

export type CreateCursoDto = z.infer<typeof createCursoSchema>;
```

### Validación en Service

```typescript
// Siempre usar safeParse, nunca parse directo
const result = createCursoSchema.safeParse(dto);
if (!result.success) {
  const message = result.error.issues[0]?.message ?? 'Datos inválidos';
  throw new BadRequestException(message);
}

const { titulo, descripcion, categoriaId } = result.data;
```

### Schema de Query (Paginación)

```typescript
export const queryCursosSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  categoriaId: z.string().cuid().optional(),
  nivel: z.enum(['PRINCIPIANTE', 'INTERMEDIO', 'AVANZADO']).optional(),
  estado: z.enum(['BORRADOR', 'REVISION', 'PUBLICADO', 'ARCHIVADO']).optional(),
  buscar: z.string().optional(),
  ordenarPor: z
    .enum(['createdAt', 'titulo', 'publicadoEn'])
    .default('createdAt'),
  orden: z.enum(['asc', 'desc']).default('desc'),
});

export type QueryCursosDto = z.infer<typeof queryCursosSchema>;
```

---

## 2. Estructura de Controllers

### Decoradores Comunes

```typescript
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Public, CurrentUser, Roles } from '../common/decorators';
import type { RequestUser } from '../common/guards';
```

### Patrón de Controller

```typescript
interface CursoResponse {
  curso: CursoConEducador;
  message: string;
}

interface ListaCursosResponse {
  cursos: CursoConEducador[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Controller('cursos')
export class CursosController {
  constructor(private readonly cursosService: CursosService) {}

  // Endpoint público
  @Public()
  @Get()
  async listar(@Query() query: QueryCursosDto): Promise<ListaCursosResponse> {
    return this.cursosService.listar(query);
  }

  // Endpoint protegido con roles
  @Post()
  @Roles('EDUCADOR', 'ADMIN_ESCUELA', 'SUPER_ADMIN')
  async crear(
    @Body() dto: CreateCursoDto,
    @CurrentUser() user: RequestUser
  ): Promise<CursoResponse> {
    const curso = await this.cursosService.crear(dto, user.id);
    return {
      curso,
      message: 'Curso creado exitosamente',
    };
  }

  // DELETE retorna 204 No Content
  @Delete(':id')
  @Roles('EDUCADOR', 'ADMIN_ESCUELA', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async eliminar(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser
  ): Promise<void> {
    await this.cursosService.eliminar(id, user.id);
  }
}
```

### Rutas Anidadas (Lecciones)

```typescript
// Para recursos anidados, usar @Controller() sin path base
@Controller()
export class LeccionesController {
  @Get('cursos/:cursoId/lecciones')
  async listar(@Param('cursoId') cursoId: string) { ... }

  @Post('cursos/:cursoId/lecciones')
  async crear(@Param('cursoId') cursoId: string, @Body() dto: CreateLeccionDto) { ... }

  // Operaciones sobre lección individual
  @Patch('lecciones/:id')
  async actualizar(@Param('id') id: string) { ... }
}
```

---

## 3. Estructura de Services

### Inyección y Excepciones

```typescript
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CursosService {
  constructor(private readonly prisma: PrismaService) {}
}
```

### Verificación de Propiedad

```typescript
// Verificar que el curso existe
const cursoExistente = await this.prisma.curso.findUnique({
  where: { id },
  select: { educadorId: true },
});

if (!cursoExistente) {
  throw new NotFoundException('Curso no encontrado');
}

// Verificar propiedad
if (cursoExistente.educadorId !== usuarioId) {
  throw new ForbiddenException('No tienes permiso para editar este curso');
}
```

### Paginación

```typescript
async listar(query: QueryCursosDto): Promise<ListaCursosResult> {
  const result = queryCursosSchema.safeParse(query);
  if (!result.success) {
    throw new BadRequestException(result.error.issues[0]?.message ?? 'Parámetros inválidos');
  }

  const { page, limit, ordenarPor, orden } = result.data;
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    this.prisma.curso.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [ordenarPor]: orden },
      include: { ... },
    }),
    this.prisma.curso.count({ where }),
  ]);

  return {
    cursos: items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
```

---

## 4. Generación de Slugs

```typescript
private async generarSlug(titulo: string): Promise<string> {
  const baseSlug = titulo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-z0-9\s-]/g, '')    // Solo alfanuméricos
    .trim()
    .replace(/\s+/g, '-')            // Espacios a guiones
    .replace(/-+/g, '-');            // Múltiples guiones a uno

  // Verificar unicidad
  let slug = baseSlug;
  let counter = 1;

  while (await this.prisma.curso.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}
```

---

## 5. Soft Delete

```typescript
// No eliminar físicamente, cambiar estado a ARCHIVADO
async eliminar(id: string, usuarioId: string): Promise<void> {
  // ... verificaciones de existencia y propiedad ...

  await this.prisma.curso.update({
    where: { id },
    data: { estado: 'ARCHIVADO' },
  });
}
```

---

## 6. Módulo NestJS

```typescript
// apps/api/src/{modulo}/{modulo}.module.ts

import { Module } from '@nestjs/common';
import { CursosController } from './cursos.controller';
import { CursosService } from './cursos.service';

@Module({
  controllers: [CursosController],
  providers: [CursosService],
  exports: [CursosService], // Si otros módulos lo necesitan
})
export class CursosModule {}
```

---

## 7. API Routes Proxy (Frontend → Backend)

### Patrón de Proxy

```typescript
// apps/web/src/app/api/{recurso}/route.ts

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { SignJWT } from 'jose';

const API_URL = process.env.API_URL || 'http://localhost:3001';
const AUTH_SECRET = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;

async function createAuthToken(
  token: Record<string, unknown>
): Promise<string> {
  const secret = new TextEncoder().encode(AUTH_SECRET);
  return new SignJWT({
    id: token.id as string,
    sub: token.sub as string,
    email: token.email as string,
    rol: token.rol as string,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(secret);
}

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: AUTH_SECRET,
      secureCookie: true,
      salt: '__Secure-authjs.session-token',
    });

    if (!token) {
      return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
    }

    const authToken = await createAuthToken(token);
    const body = await request.json();

    const response = await fetch(`${API_URL}/api/v1/cursos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error en proxy:', error);
    return NextResponse.json(
      { message: 'Error al procesar solicitud' },
      { status: 500 }
    );
  }
}
```

### Con Parámetros Dinámicos

```typescript
// apps/web/src/app/api/{recurso}/[id]/route.ts

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // ... resto igual, usar id en la URL del backend
}
```

---

## 8. Formularios React

### Patrón de Form Component

```typescript
'use client';

interface Props {
  item?: Item;           // undefined = crear, definido = editar
  relacionados: Tipo[];  // datos para selects
  onSuccess?: () => void;
}

export function ItemForm({ item, relacionados, onSuccess }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isEditing = !!item;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = { /* extraer campos */ };

    // Validación client-side básica
    if (!data.campo || data.campo.length < 3) {
      setError('Mensaje de error');
      setLoading(false);
      return;
    }

    try {
      const endpoint = isEditing ? `/api/items/${item.id}` : '/api/items';
      const method = isEditing ? 'PATCH' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Error al guardar');
      }

      onSuccess?.();
      router.push('/dashboard/items');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className={styles.error}>{error}</div>}
      {/* campos */}
      <button type="submit" disabled={loading}>
        {loading ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear'}
      </button>
    </form>
  );
}
```

---

## 9. Hooks de Autorización

```typescript
'use client';

import { useSession } from 'next-auth/react';

type Rol = 'ESTUDIANTE' | 'EDUCADOR' | 'ADMIN_ESCUELA' | 'SUPER_ADMIN';

export function useAuthorization() {
  const { data: session, status } = useSession();

  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated' && !!session?.user;
  const rol = session?.user?.rol as Rol | undefined;

  const hasRole = (requiredRol: Rol) => rol === requiredRol;
  const hasAnyRole = (...roles: Rol[]) => (rol ? roles.includes(rol) : false);

  return {
    isLoading,
    isAuthenticated,
    user: session?.user ?? null,
    hasRole,
    hasAnyRole,
    // Permisos específicos
    canManageCourses: hasAnyRole('EDUCADOR', 'ADMIN_ESCUELA', 'SUPER_ADMIN'),
    canEnrollInCourses: hasAnyRole('ESTUDIANTE', 'EDUCADOR'),
  };
}
```

---

## 10. Estructura de Archivos por Módulo

### Backend

```
apps/api/src/{modulo}/
├── {modulo}.module.ts       # Módulo NestJS
├── {modulo}.controller.ts   # Endpoints
├── {modulo}.service.ts      # Lógica de negocio
└── dto/
    ├── create-{modulo}.dto.ts   # Schema Zod + tipo para crear
    ├── update-{modulo}.dto.ts   # Schema Zod + tipo para actualizar
    └── query-{modulo}.dto.ts    # Schema Zod + tipo para filtros
```

### Frontend

```
apps/web/src/
├── app/
│   ├── api/{recurso}/           # API routes proxy
│   │   ├── route.ts             # POST (crear)
│   │   └── [id]/
│   │       └── route.ts         # PATCH, DELETE
│   └── dashboard/{recurso}/     # Páginas CRUD
│       ├── page.tsx             # Lista
│       ├── nuevo/page.tsx       # Crear
│       └── [id]/editar/page.tsx # Editar
└── components/{recurso}/
    ├── {Recurso}Form.tsx        # Formulario
    ├── {Recurso}Form.module.css # Estilos
    └── {Recurso}Card.tsx        # Card para listas
```
