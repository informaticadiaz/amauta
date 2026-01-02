# Patrones y Recetas - Amauta

Soluciones estándar para problemas comunes en el proyecto.

---

## Backend (NestJS + Fastify)

### Receta: Crear un nuevo módulo CRUD

**Situación**: Necesitás crear endpoints para una nueva entidad.

**Pasos:**

1. **Agregar modelo a Prisma**

```prisma
// prisma/schema.prisma
model Categoria {
  id          String   @id @default(cuid())
  nombre      String   @unique
  descripcion String?
  activo      Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  cursos      Curso[]
}
```

2. **Ejecutar migración**

```bash
npm run prisma:migrate -- --name add_categoria
```

3. **Crear estructura del módulo**

```
apps/api/src/modules/categorias/
├── categorias.module.ts
├── categorias.controller.ts
├── categorias.service.ts
└── dto/
    ├── create-categoria.dto.ts
    └── update-categoria.dto.ts
```

4. **Crear DTOs**

```typescript
// dto/create-categoria.dto.ts
import { IsString, IsOptional, MinLength } from 'class-validator';

export class CreateCategoriaDto {
  @IsString()
  @MinLength(2)
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;
}

// dto/update-categoria.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoriaDto } from './create-categoria.dto';

export class UpdateCategoriaDto extends PartialType(CreateCategoriaDto) {}
```

5. **Crear Service**

```typescript
// categorias.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

@Injectable()
export class CategoriasService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.categoria.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: string) {
    const categoria = await this.prisma.categoria.findUnique({
      where: { id },
    });

    if (!categoria) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }

    return categoria;
  }

  async create(dto: CreateCategoriaDto) {
    // Verificar que no exista
    const existente = await this.prisma.categoria.findUnique({
      where: { nombre: dto.nombre },
    });

    if (existente) {
      throw new ConflictException(
        `Ya existe una categoría con el nombre "${dto.nombre}"`
      );
    }

    return this.prisma.categoria.create({
      data: dto,
    });
  }

  async update(id: string, dto: UpdateCategoriaDto) {
    await this.findOne(id); // Verificar que existe

    return this.prisma.categoria.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Verificar que existe

    // Soft delete
    return this.prisma.categoria.update({
      where: { id },
      data: { activo: false },
    });
  }
}
```

6. **Crear Controller**

```typescript
// categorias.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CategoriasService } from './categorias.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

@Controller('categorias')
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  @Get()
  findAll() {
    return this.categoriasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriasService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  create(@Body() createCategoriaDto: CreateCategoriaDto) {
    return this.categoriasService.create(createCategoriaDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  update(
    @Param('id') id: string,
    @Body() updateCategoriaDto: UpdateCategoriaDto
  ) {
    return this.categoriasService.update(id, updateCategoriaDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.categoriasService.remove(id);
  }
}
```

7. **Crear Module**

```typescript
// categorias.module.ts
import { Module } from '@nestjs/common';
import { CategoriasController } from './categorias.controller';
import { CategoriasService } from './categorias.service';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CategoriasController],
  providers: [CategoriasService],
  exports: [CategoriasService],
})
export class CategoriasModule {}
```

8. **Registrar en AppModule**

```typescript
// app.module.ts
import { CategoriasModule } from './modules/categorias/categorias.module';

@Module({
  imports: [
    // ... otros módulos
    CategoriasModule,
  ],
})
export class AppModule {}
```

---

### Receta: Proteger endpoints con RBAC

**Situación**: Necesitás restringir acceso a endpoints según el rol del usuario.

**Sistema RBAC implementado en Amauta** (F1-002):

#### Roles disponibles

| Rol             | Descripción                    |
| --------------- | ------------------------------ |
| `ESTUDIANTE`    | Usuario que consume cursos     |
| `EDUCADOR`      | Crea y gestiona cursos propios |
| `ADMIN_ESCUELA` | Administra su institución      |
| `SUPER_ADMIN`   | Acceso total al sistema        |

#### Backend: Decoradores y Guards

Los guards están configurados **globalmente** en `app.module.ts`, por lo que:

- **Todos los endpoints requieren autenticación por defecto**
- Usar `@Public()` para endpoints sin autenticación
- Usar `@Roles()` para restringir por rol

```typescript
// Endpoint público (sin autenticación)
import { Public } from '@/common/decorators';

@Public()
@Get('health')
healthCheck() {
  return { status: 'ok' };
}

// Endpoint que requiere autenticación (cualquier rol)
@Get('mi-perfil')
getPerfil(@CurrentUser() user: RequestUser) {
  return this.perfilService.findByUserId(user.id);
}

// Endpoint restringido a roles específicos
import { Roles, CurrentUser } from '@/common/decorators';

@Roles('EDUCADOR', 'ADMIN_ESCUELA', 'SUPER_ADMIN')
@Post('cursos')
crearCurso(@Body() dto: CreateCursoDto, @CurrentUser() user: RequestUser) {
  return this.cursosService.create(dto, user.id);
}

// Endpoint solo para admins
@Roles('ADMIN_ESCUELA', 'SUPER_ADMIN')
@Get('usuarios')
listarUsuarios() {
  return this.usuariosService.findAll();
}
```

#### Frontend: Hook useAuthorization

```typescript
'use client';
import { useAuthorization } from '@/hooks/useAuthorization';

function MiComponente() {
  const {
    user,              // Usuario actual
    isAuthenticated,   // ¿Está logueado?
    isLoading,         // ¿Cargando sesión?
    hasRole,           // Verificar rol específico
    hasAnyRole,        // Verificar múltiples roles
    // Helpers de rol
    isEstudiante,
    isEducador,
    isAdmin,           // ADMIN_ESCUELA o SUPER_ADMIN
    // Helpers de permisos
    canManageCourses,  // EDUCADOR, ADMIN_ESCUELA, SUPER_ADMIN
    canManageUsers,    // ADMIN_ESCUELA, SUPER_ADMIN
  } = useAuthorization();

  return (
    <div>
      {canManageCourses && <button>Crear Curso</button>}
      {isAdmin && <button>Panel Admin</button>}
      {hasRole('SUPER_ADMIN') && <button>Config Sistema</button>}
    </div>
  );
}
```

#### Frontend: Componente RequireRole

```typescript
import { RequireRole, AccessDenied } from '@/components/auth';

// Ocultar contenido si no tiene rol
<RequireRole roles={['EDUCADOR', 'ADMIN_ESCUELA']}>
  <CrearCursoForm />
</RequireRole>

// Con fallback personalizado
<RequireRole
  roles={['SUPER_ADMIN']}
  fallback={<AccessDenied message="Solo super admins" />}
>
  <ConfiguracionSistema />
</RequireRole>

// Con redirección
<RequireRole
  roles={['ADMIN_ESCUELA']}
  redirectTo="/dashboard"
>
  <PanelAdmin />
</RequireRole>
```

#### Middleware: Protección de rutas

Las rutas protegidas por rol se configuran en `middleware.ts`:

```typescript
// middleware.ts
const ROUTE_ROLES = [
  { path: '/admin', roles: ['ADMIN_ESCUELA', 'SUPER_ADMIN'] },
  {
    path: '/dashboard/cursos/crear',
    roles: ['EDUCADOR', 'ADMIN_ESCUELA', 'SUPER_ADMIN'],
  },
  // Agregar más rutas según necesidad
];
```

---

### Receta: Agregar validación personalizada

**Situación**: Necesitás validar un campo con lógica específica.

```typescript
// common/validators/is-unique.validator.ts
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsUniqueConstraint implements ValidatorConstraintInterface {
  constructor(private prisma: PrismaService) {}

  async validate(value: any, args: ValidationArguments) {
    const [model, field] = args.constraints;
    const record = await this.prisma[model].findFirst({
      where: { [field]: value },
    });
    return !record;
  }

  defaultMessage(args: ValidationArguments) {
    const [model, field] = args.constraints;
    return `${field} ya está en uso`;
  }
}

export function IsUnique(
  model: string,
  field: string,
  options?: ValidationOptions
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options,
      constraints: [model, field],
      validator: IsUniqueConstraint,
    });
  };
}

// Uso en DTO
export class CreateUsuarioDto {
  @IsEmail()
  @IsUnique('usuario', 'email')
  email: string;
}
```

---

### Receta: Manejar errores globalmente

**Situación**: Querés un formato consistente para todos los errores.

```typescript
// common/filters/http-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno del servidor';
    let errors: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || message;
        errors = (exceptionResponse as any).errors;
      }
    }

    response.status(status).send({
      success: false,
      statusCode: status,
      message,
      errors,
      timestamp: new Date().toISOString(),
    });
  }
}

// Registrar en main.ts
app.useGlobalFilters(new GlobalExceptionFilter());
```

---

### Receta: Paginación

**Situación**: Necesitás paginar resultados de una lista.

```typescript
// common/dto/pagination.dto.ts
import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// common/utils/paginate.ts
export async function paginate<T>(
  prisma: any,
  model: string,
  paginationDto: PaginationDto,
  where?: any,
  include?: any,
  orderBy?: any,
): Promise<PaginatedResult<T>> {
  const { page = 1, limit = 10 } = paginationDto;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma[model].findMany({
      where,
      include,
      orderBy,
      skip,
      take: limit,
    }),
    prisma[model].count({ where }),
  ]);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// Uso en service
async findAll(paginationDto: PaginationDto) {
  return paginate<Curso>(
    this.prisma,
    'curso',
    paginationDto,
    { publicado: true },
    { educador: true },
    { createdAt: 'desc' },
  );
}

// Uso en controller
@Get()
findAll(@Query() paginationDto: PaginationDto) {
  return this.cursosService.findAll(paginationDto);
}
```

---

## Frontend (Next.js)

### Receta: Crear una página con datos del servidor

**Situación**: Página que muestra datos obtenidos del API.

```typescript
// app/cursos/page.tsx
import { CursoCard } from '@/components/CursoCard';

async function getCursos() {
  const res = await fetch(`${process.env.API_URL}/cursos`, {
    next: { revalidate: 60 }, // Revalidar cada 60 segundos
  });

  if (!res.ok) {
    throw new Error('Error al obtener cursos');
  }

  return res.json();
}

export default async function CursosPage() {
  const { data: cursos } = await getCursos();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Cursos Disponibles</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cursos.map((curso) => (
          <CursoCard key={curso.id} curso={curso} />
        ))}
      </div>

      {cursos.length === 0 && (
        <p className="text-gray-500 text-center">No hay cursos disponibles</p>
      )}
    </div>
  );
}
```

---

### Receta: Formulario con validación

**Situación**: Formulario que valida antes de enviar.

```typescript
// components/LoginForm.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }

      // Redirigir al dashboard
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          {...register('email')}
          type="email"
          id="email"
          className="mt-1 block w-full rounded border-gray-300"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Contraseña
        </label>
        <input
          {...register('password')}
          type="password"
          id="password"
          className="mt-1 block w-full rounded border-gray-300"
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
      </button>
    </form>
  );
}
```

---

### Receta: Hook personalizado para fetch

**Situación**: Reutilizar lógica de fetching en varios componentes.

```typescript
// hooks/useApi.ts
'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseApiOptions {
  immediate?: boolean;
}

interface UseApiReturn<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

export function useApi<T>(
  url: string,
  options: UseApiOptions = { immediate: true }
): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(url);

      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }

      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error desconocido'));
    } finally {
      setIsLoading(false);
    }
  }, [url]);

  useEffect(() => {
    if (options.immediate) {
      fetchData();
    }
  }, [fetchData, options.immediate]);

  return { data, error, isLoading, refetch: fetchData };
}

// Uso
function MisCursos() {
  const { data: cursos, isLoading, error, refetch } = useApi<Curso[]>('/api/mis-cursos');

  if (isLoading) return <p>Cargando...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      {cursos?.map(curso => <CursoCard key={curso.id} curso={curso} />)}
      <button onClick={refetch}>Actualizar</button>
    </div>
  );
}
```

---

### Receta: Componente con estados de carga

**Situación**: Mostrar estados de carga, error y vacío.

```typescript
// components/DataList.tsx
interface DataListProps<T> {
  data: T[] | null;
  isLoading: boolean;
  error: Error | null;
  emptyMessage?: string;
  renderItem: (item: T) => React.ReactNode;
}

export function DataList<T extends { id: string }>({
  data,
  isLoading,
  error,
  emptyMessage = 'No hay datos',
  renderItem,
}: DataListProps<T>) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded">
        <p className="font-medium">Error</p>
        <p>{error.message}</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-gray-500 text-center py-8">
        {emptyMessage}
      </div>
    );
  }

  return <div className="space-y-4">{data.map(renderItem)}</div>;
}

// Uso
<DataList
  data={cursos}
  isLoading={isLoading}
  error={error}
  emptyMessage="No hay cursos disponibles"
  renderItem={(curso) => <CursoCard key={curso.id} curso={curso} />}
/>
```

---

### Receta: Modal reutilizable

**Situación**: Necesitás modales en varios lugares.

```typescript
// components/Modal.tsx
'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>,
    document.body
  );
}

// Uso
function MiComponente() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsModalOpen(true)}>Abrir Modal</button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Confirmar acción"
      >
        <p>¿Estás seguro de realizar esta acción?</p>
        <div className="flex gap-2 mt-4">
          <button onClick={() => setIsModalOpen(false)}>Cancelar</button>
          <button onClick={handleConfirm}>Confirmar</button>
        </div>
      </Modal>
    </>
  );
}
```

---

## Patrones Generales

### Patrón: Early Return

**Evitar anidación excesiva con returns tempranos.**

```typescript
// ❌ Malo
async function procesarInscripcion(usuarioId: string, cursoId: string) {
  const usuario = await this.prisma.usuario.findUnique({
    where: { id: usuarioId },
  });
  if (usuario) {
    const curso = await this.prisma.curso.findUnique({
      where: { id: cursoId },
    });
    if (curso) {
      if (curso.publicado) {
        const inscripcionExistente = await this.prisma.inscripcion.findFirst({
          where: { usuarioId, cursoId },
        });
        if (!inscripcionExistente) {
          return this.prisma.inscripcion.create({
            data: { usuarioId, cursoId },
          });
        } else {
          throw new ConflictException('Ya estás inscrito');
        }
      } else {
        throw new BadRequestException('Curso no disponible');
      }
    } else {
      throw new NotFoundException('Curso no encontrado');
    }
  } else {
    throw new NotFoundException('Usuario no encontrado');
  }
}

// ✅ Bueno
async function procesarInscripcion(usuarioId: string, cursoId: string) {
  const usuario = await this.prisma.usuario.findUnique({
    where: { id: usuarioId },
  });
  if (!usuario) {
    throw new NotFoundException('Usuario no encontrado');
  }

  const curso = await this.prisma.curso.findUnique({ where: { id: cursoId } });
  if (!curso) {
    throw new NotFoundException('Curso no encontrado');
  }

  if (!curso.publicado) {
    throw new BadRequestException('Curso no disponible');
  }

  const inscripcionExistente = await this.prisma.inscripcion.findFirst({
    where: { usuarioId, cursoId },
  });
  if (inscripcionExistente) {
    throw new ConflictException('Ya estás inscrito');
  }

  return this.prisma.inscripcion.create({ data: { usuarioId, cursoId } });
}
```

---

### Patrón: Extraer funciones auxiliares

**Cuando la lógica se repite o es compleja.**

```typescript
// ❌ Malo - lógica duplicada
async function aprobarCurso(cursoId: string) {
  const curso = await this.prisma.curso.findUnique({ where: { id: cursoId } });
  if (!curso) throw new NotFoundException('Curso no encontrado');
  // ... más lógica
}

async function publicarCurso(cursoId: string) {
  const curso = await this.prisma.curso.findUnique({ where: { id: cursoId } });
  if (!curso) throw new NotFoundException('Curso no encontrado');
  // ... más lógica
}

// ✅ Bueno - extraer función común
private async getCursoOrFail(cursoId: string) {
  const curso = await this.prisma.curso.findUnique({ where: { id: cursoId } });
  if (!curso) {
    throw new NotFoundException('Curso no encontrado');
  }
  return curso;
}

async function aprobarCurso(cursoId: string) {
  const curso = await this.getCursoOrFail(cursoId);
  // ... más lógica
}

async function publicarCurso(cursoId: string) {
  const curso = await this.getCursoOrFail(cursoId);
  // ... más lógica
}
```

---

### Patrón: Constantes en lugar de magic numbers

```typescript
// ❌ Malo
if (password.length < 8) {
  throw new Error('Contraseña muy corta');
}

if (intentosFallidos > 5) {
  bloquearCuenta();
}

// ✅ Bueno
const PASSWORD_MIN_LENGTH = 8;
const MAX_LOGIN_ATTEMPTS = 5;

if (password.length < PASSWORD_MIN_LENGTH) {
  throw new Error(
    `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`
  );
}

if (intentosFallidos > MAX_LOGIN_ATTEMPTS) {
  bloquearCuenta();
}
```

---

## Anti-Patrones a Evitar

| Anti-Patrón         | Problema                        | Solución                  |
| ------------------- | ------------------------------- | ------------------------- |
| God Object          | Clase/módulo que hace demasiado | Dividir responsabilidades |
| Callback Hell       | Anidación excesiva              | Usar async/await          |
| Copy-Paste          | Código duplicado                | Extraer función común     |
| Magic Numbers       | Números sin contexto            | Usar constantes nombradas |
| any en TypeScript   | Pierde type safety              | Definir tipos específicos |
| console.log en prod | Ruido en logs                   | Usar logger apropiado     |

---

**Última actualización**: 2025-12-23
**Versión**: 1.0.0
