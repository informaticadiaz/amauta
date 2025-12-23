# Estándares de Código - Amauta

## Principios Generales

### Filosofía de Código

- **Clean Code**: Código legible, mantenible y expresivo
- **DRY** (Don't Repeat Yourself): Evitar duplicación
- **SOLID**: Principios de diseño orientado a objetos
- **KISS** (Keep It Simple): Simplicidad sobre complejidad
- **YAGNI** (You Aren't Gonna Need It): No implementar funcionalidad especulativa

### Valores del Proyecto

- **Accesibilidad primero**: Código que sirve a todos
- **Colaboración**: Código fácil de entender para otros
- **Sostenibilidad**: Pensar en el mantenimiento a largo plazo

## TypeScript

### Configuración

Usar `strict: true` en `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}
```

### Tipos vs Interfaces

**Usar `interface` para:**

- Definir formas de objetos
- APIs públicas
- Cuando se necesita extensión/merge

```typescript
interface Usuario {
  id: string;
  nombre: string;
  email: string;
}

interface Estudiante extends Usuario {
  matricula: string;
}
```

**Usar `type` para:**

- Uniones y tipos complejos
- Tipos utilitarios
- Primitivos y literales

```typescript
type Rol = 'estudiante' | 'educador' | 'admin';
type EstadoCurso = 'borrador' | 'publicado' | 'archivado';
type NullableString = string | null;
```

### Evitar `any`

```typescript
// ❌ Mal
function procesarDatos(data: any) {
  return data.valor;
}

// ✅ Bien
function procesarDatos(data: unknown) {
  if (typeof data === 'object' && data !== null && 'valor' in data) {
    return (data as { valor: string }).valor;
  }
  throw new Error('Datos inválidos');
}

// ✅ Mejor aún
interface DatosEsperados {
  valor: string;
}

function procesarDatos(data: DatosEsperados) {
  return data.valor;
}
```

## Nomenclatura

### Variables y Funciones

- **camelCase** para variables y funciones
- Nombres descriptivos y expresivos

```typescript
// ❌ Mal
const d = new Date();
const usr = getUsr();

// ✅ Bien
const fechaActual = new Date();
const usuario = obtenerUsuario();
```

### Componentes React

- **PascalCase** para componentes
- Nombres sustantivos, descriptivos de la UI

```typescript
// ❌ Mal
function coursecard() {}
function Course_Card() {}

// ✅ Bien
function CourseCard() {}
function ListaEstudiantes() {}
```

### Archivos

- **kebab-case** para archivos
- Extensión según contenido: `.ts`, `.tsx`, `.test.ts`

```
components/
  ├── course-card.tsx
  ├── student-list.tsx
  └── navigation-menu.tsx

utils/
  ├── format-date.ts
  ├── validate-email.ts
  └── format-date.test.ts
```

### Constantes

- **UPPER_SNAKE_CASE** para constantes globales
- **camelCase** para constantes locales de configuración

```typescript
// Constantes globales
const MAX_FILE_SIZE = 10485760;
const API_BASE_URL = 'https://amauta-api.example.org';

// Config local
const defaultPaginationSize = 20;
```

### Clases y Tipos

- **PascalCase** para clases, interfaces, types, enums

```typescript
class GestorCursos {}
interface ConfiguracionCurso {}
type EstadoAutenticacion = 'autenticado' | 'no-autenticado';
enum RolUsuario {
  Estudiante = 'ESTUDIANTE',
  Educador = 'EDUCADOR',
  Admin = 'ADMIN',
}
```

## React/Next.js

### Estructura de Componentes

```typescript
// ✅ Orden recomendado
import { useState, useEffect } from 'react';  // 1. Imports externos
import { Button } from '@/components/ui';      // 2. Imports internos
import { formatDate } from '@/lib/utils';      // 3. Utils
import type { Curso } from '@/types';          // 4. Types
import styles from './course-card.module.css'; // 5. Estilos

// 6. Types/Interfaces del componente
interface CourseCardProps {
  curso: Curso;
  onEnroll?: () => void;
}

// 7. Componente principal
export function CourseCard({ curso, onEnroll }: CourseCardProps) {
  // 7a. Hooks de estado
  const [inscrito, setInscrito] = useState(false);

  // 7b. Hooks de efectos
  useEffect(() => {
    // ...
  }, []);

  // 7c. Funciones auxiliares
  const handleEnroll = () => {
    setInscrito(true);
    onEnroll?.();
  };

  // 7d. Early returns
  if (!curso) return null;

  // 7e. Render
  return (
    <div>
      <h3>{curso.titulo}</h3>
      <Button onClick={handleEnroll}>Inscribirse</Button>
    </div>
  );
}

// 8. Componentes auxiliares (si son pequeños y específicos)
function CourseMetadata({ curso }: { curso: Curso }) {
  return <span>{formatDate(curso.fechaCreacion)}</span>;
}
```

### Hooks Personalizados

```typescript
// ✅ Prefijo 'use' obligatorio
// hooks/use-curso.ts
export function useCurso(cursoId: string) {
  const [curso, setCurso] = useState<Curso | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    obtenerCurso(cursoId)
      .then(setCurso)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [cursoId]);

  return { curso, loading, error };
}
```

### Componentes Server vs Client

```typescript
// ✅ Explicitar cuando es Client Component
'use client';

import { useState } from 'react';

export function InteractiveComponent() {
  const [count, setCount] = useState(0);
  // ...
}

// ✅ Server Component (por defecto en App Router)
// No necesita directiva 'use server' para componentes
export async function CourseList() {
  const cursos = await obtenerCursos();
  return (
    <div>
      {cursos.map(curso => <CourseCard key={curso.id} curso={curso} />)}
    </div>
  );
}
```

## Backend/NestJS

### Estructura de Controladores

```typescript
// controllers/curso.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CursoService } from './curso.service';
import { CreateCursoDto, UpdateCursoDto } from './dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { Usuario } from '@prisma/client';

@Controller('cursos')
@UseGuards(JwtAuthGuard)
export class CursoController {
  constructor(private readonly cursoService: CursoService) {}

  /**
   * Obtiene todos los cursos con paginación
   * @route GET /api/cursos?page=1&limit=20
   */
  @Get()
  async obtenerTodos(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20'
  ) {
    return this.cursoService.obtenerTodos({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });
  }

  /**
   * Obtiene un curso por ID
   * @route GET /api/cursos/:id
   */
  @Get(':id')
  async obtenerPorId(@Param('id') id: string) {
    return this.cursoService.obtenerPorId(id);
  }

  /**
   * Crea un nuevo curso
   * @route POST /api/cursos
   */
  @Post()
  @Roles('EDUCADOR', 'ADMIN')
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.CREATED)
  async crear(
    @Body() createCursoDto: CreateCursoDto,
    @CurrentUser() usuario: Usuario
  ) {
    return this.cursoService.crear(createCursoDto, usuario.id);
  }

  /**
   * Actualiza un curso
   * @route PUT /api/cursos/:id
   */
  @Put(':id')
  @Roles('EDUCADOR', 'ADMIN')
  @UseGuards(RolesGuard)
  async actualizar(
    @Param('id') id: string,
    @Body() updateCursoDto: UpdateCursoDto,
    @CurrentUser() usuario: Usuario
  ) {
    return this.cursoService.actualizar(id, updateCursoDto, usuario.id);
  }

  /**
   * Elimina un curso (soft delete)
   * @route DELETE /api/cursos/:id
   */
  @Delete(':id')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async eliminar(@Param('id') id: string) {
    return this.cursoService.eliminar(id);
  }
}
```

### Módulos NestJS

```typescript
// modules/curso/curso.module.ts
import { Module } from '@nestjs/common';
import { CursoController } from './curso.controller';
import { CursoService } from './curso.service';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CursoController],
  providers: [CursoService],
  exports: [CursoService],
})
export class CursoModule {}
```

### DTOs (Data Transfer Objects)

```typescript
// dto/create-curso.dto.ts
import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
  IsUrl,
} from 'class-validator';

export class CreateCursoDto {
  @IsString()
  @IsNotEmpty({ message: 'El título es requerido' })
  @MinLength(5, { message: 'El título debe tener al menos 5 caracteres' })
  @MaxLength(200, { message: 'El título no puede exceder 200 caracteres' })
  titulo: string;

  @IsString()
  @IsNotEmpty({ message: 'La descripción es requerida' })
  @MinLength(20, {
    message: 'La descripción debe tener al menos 20 caracteres',
  })
  descripcion: string;

  @IsString()
  @IsOptional()
  @IsUrl({}, { message: 'La imagen debe ser una URL válida' })
  imagenUrl?: string;
}

// dto/update-curso.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateCursoDto } from './create-curso.dto';

export class UpdateCursoDto extends PartialType(CreateCursoDto) {}
```

### Servicios (Business Logic)

```typescript
// services/curso.service.ts
import { PrismaClient } from '@prisma/client';
import type { CrearCursoDto, ActualizarCursoDto } from '@/types/dto';

export class CursoService {
  constructor(private prisma: PrismaClient) {}

  async obtenerTodos(options: { page: number; limit: number }) {
    const skip = (options.page - 1) * options.limit;

    const [cursos, total] = await Promise.all([
      this.prisma.curso.findMany({
        skip,
        take: options.limit,
        include: { educador: true },
      }),
      this.prisma.curso.count(),
    ]);

    return {
      cursos,
      total,
      page: options.page,
      totalPages: Math.ceil(total / options.limit),
    };
  }

  async crear(datos: CrearCursoDto) {
    return this.prisma.curso.create({
      data: datos,
      include: { educador: true },
    });
  }
}
```

## Manejo de Errores

### Frontend

```typescript
// ✅ Usar try-catch con manejo específico
async function inscribirseEnCurso(cursoId: string) {
  try {
    const response = await fetch(`/api/cursos/${cursoId}/inscribir`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error al inscribirse:', error.message);
      // Mostrar mensaje al usuario
      toast.error('No se pudo completar la inscripción');
    }
    throw error;
  }
}
```

### Backend

```typescript
// middleware/error.middleware.ts
import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      error: error.message,
    });
  }

  // Error no previsto
  console.error('Error no manejado:', error);
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor',
  });
}
```

## Testing

### Nomenclatura de Tests

```typescript
// course.service.test.ts
describe('CursoService', () => {
  describe('crear', () => {
    it('debería crear un curso con datos válidos', async () => {
      // Arrange
      const datos = { titulo: 'Curso Test', descripcion: 'Test' };

      // Act
      const curso = await cursoService.crear(datos);

      // Assert
      expect(curso).toBeDefined();
      expect(curso.titulo).toBe(datos.titulo);
    });

    it('debería fallar con datos inválidos', async () => {
      // Arrange
      const datosInvalidos = { titulo: '' };

      // Act & Assert
      await expect(cursoService.crear(datosInvalidos)).rejects.toThrow(
        'Título requerido'
      );
    });
  });
});
```

## Comentarios

### Cuándo comentar

```typescript
// ❌ Mal: Comentario obvio
// Incrementa el contador
counter++;

// ✅ Bien: Explica el "por qué"
// Incrementamos antes de enviar porque el backend espera ID 1-indexed
counter++;
await enviarAlBackend(counter);

// ✅ Bien: Documenta complejidad
/**
 * Calcula el progreso del estudiante en el curso
 *
 * Considera:
 * - Lecciones completadas
 * - Evaluaciones aprobadas (peso 2x)
 * - Material descargado (peso 0.5x)
 *
 * @returns Porcentaje de 0 a 100
 */
function calcularProgreso(estudiante: Estudiante, curso: Curso): number {
  // ...
}
```

## Commits

### Convención de Mensajes

Usar [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>[scope opcional]: <descripción>

[cuerpo opcional]

[footer opcional]
```

**Tipos:**

- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Formato, punto y coma, etc (no afecta código)
- `refactor`: Refactorización
- `test`: Agregar o corregir tests
- `chore`: Tareas de mantenimiento

**Ejemplos:**

```bash
feat(cursos): agregar filtro por categoría

fix(auth): corregir validación de email vacío

docs(readme): actualizar guía de instalación

refactor(api): simplificar lógica de autenticación

test(cursos): agregar tests para creación de curso

chore(deps): actualizar dependencias a versiones seguras
```

## Prisma Patterns

### Queries Eficientes

```typescript
// ❌ Mal: N+1 queries
const cursos = await prisma.curso.findMany();
for (const curso of cursos) {
  const educador = await prisma.usuario.findUnique({
    where: { id: curso.educadorId },
  });
}

// ✅ Bien: Una sola query con include
const cursos = await prisma.curso.findMany({
  include: {
    educador: true,
    _count: {
      select: { estudiantes: true },
    },
  },
});
```

### Transacciones

```typescript
// ✅ Usar transacciones para operaciones múltiples
async inscribirEstudiante(estudianteId: string, cursoId: string) {
  return this.prisma.$transaction(async (tx) => {
    // 1. Verificar cupo
    const curso = await tx.curso.findUnique({
      where: { id: cursoId },
      include: { _count: { select: { estudiantes: true } } },
    });

    if (!curso || curso._count.estudiantes >= curso.cupoMaximo) {
      throw new Error('Curso lleno');
    }

    // 2. Crear inscripción
    const inscripcion = await tx.inscripcion.create({
      data: {
        estudianteId,
        cursoId,
        estado: 'ACTIVA',
      },
    });

    // 3. Registrar en log
    await tx.logActividad.create({
      data: {
        tipo: 'INSCRIPCION',
        estudianteId,
        cursoId,
      },
    });

    return inscripcion;
  });
}
```

### Paginación y Performance

```typescript
// ✅ Paginación cursor-based para datasets grandes
async obtenerCursosPaginados(cursor?: string, limit: number = 20) {
  const cursos = await this.prisma.curso.findMany({
    take: limit + 1, // Traer uno más para saber si hay más páginas
    ...(cursor && {
      skip: 1,
      cursor: { id: cursor },
    }),
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      titulo: true,
      descripcion: true,
      _count: { select: { estudiantes: true } },
    },
  });

  const hasMore = cursos.length > limit;
  const items = hasMore ? cursos.slice(0, -1) : cursos;

  return {
    items,
    nextCursor: hasMore ? items[items.length - 1].id : null,
  };
}
```

## Next.js App Router Avanzado

### Server Actions

```typescript
// app/actions/curso.actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function crearCurso(formData: FormData) {
  // 1. Autenticación
  const session = await auth();
  if (!session) {
    throw new Error('No autenticado');
  }

  // 2. Validación
  const titulo = formData.get('titulo') as string;
  const descripcion = formData.get('descripcion') as string;

  if (!titulo || titulo.length < 5) {
    return { error: 'Título inválido' };
  }

  // 3. Crear curso
  const curso = await prisma.curso.create({
    data: {
      titulo,
      descripcion,
      educadorId: session.user.id,
    },
  });

  // 4. Revalidar cache
  revalidatePath('/cursos');

  // 5. Redirect
  redirect(`/cursos/${curso.id}`);
}
```

### Streaming y Suspense

```typescript
// app/cursos/page.tsx
import { Suspense } from 'react';
import { CursosList } from './cursos-list';
import { CursosListSkeleton } from './cursos-list-skeleton';

export default function CursosPage() {
  return (
    <div>
      <h1>Cursos</h1>
      <Suspense fallback={<CursosListSkeleton />}>
        <CursosList />
      </Suspense>
    </div>
  );
}

// cursos-list.tsx (Server Component)
async function CursosList() {
  // Esta query se ejecuta en el servidor
  const cursos = await obtenerCursos();

  return (
    <div>
      {cursos.map(curso => (
        <CourseCard key={curso.id} curso={curso} />
      ))}
    </div>
  );
}
```

### Metadata Dinámica

```typescript
// app/cursos/[id]/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const curso = await obtenerCursoPorId(params.id);

  if (!curso) {
    return {
      title: 'Curso no encontrado',
    };
  }

  return {
    title: `${curso.titulo} | Amauta`,
    description: curso.descripcion,
    openGraph: {
      title: curso.titulo,
      description: curso.descripcion,
      images: [curso.imagenUrl],
    },
  };
}

export default async function CursoPage({ params }: Props) {
  const curso = await obtenerCursoPorId(params.id);

  if (!curso) {
    notFound();
  }

  return <CursoDetalle curso={curso} />;
}
```

## Seguridad

### Validación de Entrada

```typescript
// ✅ SIEMPRE validar entrada del usuario
import { z } from 'zod';

const cursoSchema = z.object({
  titulo: z.string().min(5).max(200),
  descripcion: z.string().min(20),
  categoriaId: z.string().uuid(),
  precio: z.number().min(0).optional(),
});

// En controlador
async crear(@Body() body: unknown) {
  const validated = cursoSchema.parse(body); // Lanza error si inválido
  return this.cursoService.crear(validated);
}
```

### Prevención de SQL Injection

```typescript
// ❌ NUNCA concatenar strings en queries
const email = req.query.email;
await prisma.$queryRaw`SELECT * FROM usuarios WHERE email = ${email}`; // VULNERABLE

// ✅ Usar Prisma (escapa automáticamente)
const usuarios = await prisma.usuario.findMany({
  where: { email: email },
});
```

### Autenticación y Autorización

```typescript
// guards/roles.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler()
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    const hasRole = requiredRoles.some((role) => user.rol === role);

    if (!hasRole) {
      throw new ForbiddenException('No tienes permisos para esta acción');
    }

    return true;
  }
}
```

### Sanitización de Datos

```typescript
// ✅ Escapar HTML en contenido user-generated
import DOMPurify from 'isomorphic-dompurify';

function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: [],
  });
}

// Uso
const descripcionLimpia = sanitizeHtml(descripcionUsuario);
```

## Performance

### React Performance

```typescript
// ✅ Memoizar componentes costosos
import { memo } from 'react';

export const CourseCard = memo(function CourseCard({ curso }) {
  return <div>{/* ... */}</div>;
});

// ✅ useMemo para cálculos costosos
const cursosOrdenados = useMemo(() => {
  return cursos.sort((a, b) => b.popularidad - a.popularidad);
}, [cursos]);

// ✅ useCallback para funciones pasadas como props
const handleEnroll = useCallback(() => {
  enrollStudent(courseId);
}, [courseId]);
```

### Lazy Loading

```typescript
// ✅ Lazy load componentes pesados
import { lazy, Suspense } from 'react';

const VideoPlayer = lazy(() => import('./video-player'));

function LeccionPage() {
  return (
    <Suspense fallback={<VideoPlayerSkeleton />}>
      <VideoPlayer url={leccion.videoUrl} />
    </Suspense>
  );
}
```

## Herramientas

### ESLint

Configuración base en `.eslintrc.js` con reglas strict

### Prettier

Formateo automático consistente

### Husky

Pre-commit hooks para validar código antes de commit

### TypeScript

Type checking estricto con `strict: true`

### class-validator

Validación de DTOs en NestJS

### Zod

Validación de schemas en frontend y backend

## Recursos

- [Clean Code by Robert C. Martin](https://www.goodreads.com/book/show/3735293-clean-code)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React Documentation](https://react.dev/)
- [Next.js Documentation](https://nextjs.org/docs)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [OWASP Security Practices](https://owasp.org/www-project-top-ten/)
