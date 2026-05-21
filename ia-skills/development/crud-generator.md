# Skill: CRUD Generator

> Genera un módulo CRUD completo (backend + frontend) siguiendo los patrones del proyecto.

---

## Uso

```
Genera un CRUD para [NombreModelo] con los campos: [lista de campos]
```

**Ejemplo:**

```
Genera un CRUD para Recurso con los campos:
- nombre: string, requerido, min 3, max 100
- tipo: enum (VIDEO, PDF, IMAGEN, AUDIO)
- url: string, requerido
- tamano: number, opcional
- leccionId: relación con Leccion
```

---

## Parámetros

| Parámetro    | Descripción                                   | Ejemplo                      |
| ------------ | --------------------------------------------- | ---------------------------- |
| `nombre`     | Nombre del modelo (singular, PascalCase)      | `Recurso`                    |
| `campos`     | Lista de campos con tipos y validaciones      | Ver ejemplos                 |
| `relaciones` | Relaciones con otros modelos                  | `leccionId -> Leccion`       |
| `roles`      | Roles que pueden acceder (default: EDUCADOR+) | `ADMIN_ESCUELA, SUPER_ADMIN` |
| `publico`    | Si hay endpoints públicos                     | `listar, obtener`            |

---

## Archivos Generados

### Backend

```
apps/api/src/{modulo}/
├── {modulo}.module.ts
├── {modulo}.controller.ts
├── {modulo}.service.ts
└── dto/
    ├── create-{modulo}.dto.ts
    ├── update-{modulo}.dto.ts
    └── query-{modulo}.dto.ts
```

### Frontend

```
apps/web/src/
├── app/
│   ├── api/{modulo}/
│   │   ├── route.ts           # POST
│   │   └── [id]/route.ts      # PATCH, DELETE
│   └── dashboard/{modulo}/
│       ├── page.tsx           # Lista
│       ├── nuevo/page.tsx     # Crear
│       └── [id]/editar/page.tsx
└── components/{modulo}/
    ├── {Modulo}Form.tsx
    └── {Modulo}Form.module.css
```

### Prisma

```prisma
// Agregar a schema.prisma
model NuevoModelo {
  // campos...
}
```

---

## Templates

### 1. DTO de Creación

```typescript
// apps/api/src/{modulo}/dto/create-{modulo}.dto.ts

import { z } from 'zod';

export const create{Modulo}Schema = z.object({
  // Campos string
  nombre: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),

  // Campos opcionales
  descripcion: z
    .string()
    .max(500)
    .optional(),

  // Enums
  tipo: z.enum(['OPCION1', 'OPCION2', 'OPCION3'], {
    message: 'Tipo inválido',
  }),

  // Números
  cantidad: z
    .number()
    .int('Debe ser un número entero')
    .positive('Debe ser positivo')
    .optional(),

  // Relaciones
  parentId: z.string().cuid('ID inválido'),

  // Booleanos
  activo: z.boolean().default(true),
});

export type Create{Modulo}Dto = z.infer<typeof create{Modulo}Schema>;
```

### 2. DTO de Actualización

```typescript
// apps/api/src/{modulo}/dto/update-{modulo}.dto.ts

import { z } from 'zod';

export const update{Modulo}Schema = z.object({
  nombre: z.string().min(3).max(100).optional(),
  descripcion: z.string().max(500).optional(),
  tipo: z.enum(['OPCION1', 'OPCION2', 'OPCION3']).optional(),
  cantidad: z.number().int().positive().optional(),
  activo: z.boolean().optional(),
});

export type Update{Modulo}Dto = z.infer<typeof update{Modulo}Schema>;
```

### 3. DTO de Query

```typescript
// apps/api/src/{modulo}/dto/query-{modulo}.dto.ts

import { z } from 'zod';

export const query{Modulo}Schema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  tipo: z.enum(['OPCION1', 'OPCION2', 'OPCION3']).optional(),
  buscar: z.string().optional(),
  ordenarPor: z.enum(['createdAt', 'nombre']).default('createdAt'),
  orden: z.enum(['asc', 'desc']).default('desc'),
});

export type Query{Modulo}Dto = z.infer<typeof query{Modulo}Schema>;
```

### 4. Controller

```typescript
// apps/api/src/{modulo}/{modulo}.controller.ts

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
import { {Modulo}Service, type {Modulo}Response } from './{modulo}.service';
import type { Create{Modulo}Dto } from './dto/create-{modulo}.dto';
import type { Update{Modulo}Dto } from './dto/update-{modulo}.dto';
import type { Query{Modulo}Dto } from './dto/query-{modulo}.dto';
import { Public, CurrentUser, Roles } from '../common/decorators';
import type { RequestUser } from '../common/guards';

interface {Modulo}ResponseWrapper {
  {modulo}: {Modulo}Response;
  message: string;
}

interface Lista{Modulo}Response {
  {modulo}s: {Modulo}Response[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Controller('{modulo}s')
export class {Modulo}Controller {
  constructor(private readonly {modulo}Service: {Modulo}Service) {}

  @Public() // o @Roles(...) si es privado
  @Get()
  async listar(@Query() query: Query{Modulo}Dto): Promise<Lista{Modulo}Response> {
    return this.{modulo}Service.listar(query);
  }

  @Public()
  @Get(':id')
  async obtenerPorId(@Param('id') id: string): Promise<{Modulo}ResponseWrapper> {
    const {modulo} = await this.{modulo}Service.obtenerPorId(id);
    return { {modulo}, message: '{Modulo} obtenido exitosamente' };
  }

  @Post()
  @Roles('EDUCADOR', 'ADMIN_ESCUELA', 'SUPER_ADMIN')
  async crear(
    @Body() dto: Create{Modulo}Dto,
    @CurrentUser() user: RequestUser
  ): Promise<{Modulo}ResponseWrapper> {
    const {modulo} = await this.{modulo}Service.crear(dto, user.id);
    return { {modulo}, message: '{Modulo} creado exitosamente' };
  }

  @Patch(':id')
  @Roles('EDUCADOR', 'ADMIN_ESCUELA', 'SUPER_ADMIN')
  async actualizar(
    @Param('id') id: string,
    @Body() dto: Update{Modulo}Dto,
    @CurrentUser() user: RequestUser
  ): Promise<{Modulo}ResponseWrapper> {
    const {modulo} = await this.{modulo}Service.actualizar(id, dto, user.id);
    return { {modulo}, message: '{Modulo} actualizado exitosamente' };
  }

  @Delete(':id')
  @Roles('EDUCADOR', 'ADMIN_ESCUELA', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async eliminar(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser
  ): Promise<void> {
    await this.{modulo}Service.eliminar(id, user.id);
  }
}
```

### 5. Service

```typescript
// apps/api/src/{modulo}/{modulo}.service.ts

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { create{Modulo}Schema, type Create{Modulo}Dto } from './dto/create-{modulo}.dto';
import { update{Modulo}Schema, type Update{Modulo}Dto } from './dto/update-{modulo}.dto';
import { query{Modulo}Schema, type Query{Modulo}Dto } from './dto/query-{modulo}.dto';

export interface {Modulo}Response {
  id: string;
  // ... campos
  createdAt: Date;
  updatedAt: Date;
}

interface Lista{Modulo}Result {
  {modulo}s: {Modulo}Response[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class {Modulo}Service {
  constructor(private readonly prisma: PrismaService) {}

  async listar(query: Query{Modulo}Dto): Promise<Lista{Modulo}Result> {
    const result = query{Modulo}Schema.safeParse(query);
    if (!result.success) {
      throw new BadRequestException(result.error.issues[0]?.message ?? 'Parámetros inválidos');
    }

    const { page, limit, buscar, ordenarPor, orden } = result.data;
    const skip = (page - 1) * limit;

    const where = {
      ...(buscar && {
        OR: [
          { nombre: { contains: buscar, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [{modulo}s, total] = await Promise.all([
      this.prisma.{modulo}.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [ordenarPor]: orden },
      }),
      this.prisma.{modulo}.count({ where }),
    ]);

    return {
      {modulo}s,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async obtenerPorId(id: string): Promise<{Modulo}Response> {
    const {modulo} = await this.prisma.{modulo}.findUnique({
      where: { id },
    });

    if (!{modulo}) {
      throw new NotFoundException('{Modulo} no encontrado');
    }

    return {modulo};
  }

  async crear(dto: Create{Modulo}Dto, usuarioId: string): Promise<{Modulo}Response> {
    const result = create{Modulo}Schema.safeParse(dto);
    if (!result.success) {
      throw new BadRequestException(result.error.issues[0]?.message ?? 'Datos inválidos');
    }

    return this.prisma.{modulo}.create({
      data: result.data,
    });
  }

  async actualizar(
    id: string,
    dto: Update{Modulo}Dto,
    usuarioId: string
  ): Promise<{Modulo}Response> {
    const result = update{Modulo}Schema.safeParse(dto);
    if (!result.success) {
      throw new BadRequestException(result.error.issues[0]?.message ?? 'Datos inválidos');
    }

    const existente = await this.prisma.{modulo}.findUnique({
      where: { id },
    });

    if (!existente) {
      throw new NotFoundException('{Modulo} no encontrado');
    }

    // Verificar propiedad si aplica
    // if (existente.creadorId !== usuarioId) {
    //   throw new ForbiddenException('No tienes permiso');
    // }

    return this.prisma.{modulo}.update({
      where: { id },
      data: result.data,
    });
  }

  async eliminar(id: string, usuarioId: string): Promise<void> {
    const existente = await this.prisma.{modulo}.findUnique({
      where: { id },
    });

    if (!existente) {
      throw new NotFoundException('{Modulo} no encontrado');
    }

    // Soft delete o delete real según el caso
    await this.prisma.{modulo}.delete({ where: { id } });
  }
}
```

### 6. Module

```typescript
// apps/api/src/{modulo}/{modulo}.module.ts

import { Module } from '@nestjs/common';
import { {Modulo}Controller } from './{modulo}.controller';
import { {Modulo}Service } from './{modulo}.service';

@Module({
  controllers: [{Modulo}Controller],
  providers: [{Modulo}Service],
  exports: [{Modulo}Service],
})
export class {Modulo}Module {}
```

### 7. Registrar en AppModule

```typescript
// apps/api/src/app.module.ts

import { {Modulo}Module } from './{modulo}/{modulo}.module';

@Module({
  imports: [
    // ... otros módulos
    {Modulo}Module,
  ],
})
export class AppModule {}
```

---

## Checklist Post-Generación

- [ ] Agregar modelo a `schema.prisma`
- [ ] Ejecutar `npx prisma migrate dev --name add_{modulo}`
- [ ] Registrar módulo en `app.module.ts`
- [ ] Crear API routes en frontend si necesario
- [ ] Crear componentes de formulario
- [ ] Ejecutar `npm run lint` para verificar
- [ ] Ejecutar `npm run type-check` para tipos

---

## Variaciones

### Recurso Anidado (como Lecciones)

Para recursos anidados bajo otro (ej: recursos bajo lecciones):

```typescript
// Controller sin @Controller() base
@Controller()
export class RecursosController {
  @Get('lecciones/:leccionId/recursos')
  async listar(@Param('leccionId') leccionId: string) {}

  @Post('lecciones/:leccionId/recursos')
  async crear(@Param('leccionId') leccionId: string) {}

  // Operaciones individuales
  @Patch('recursos/:id')
  async actualizar(@Param('id') id: string) {}
}
```

### Sin Paginación

Para recursos con pocos items (categorías):

```typescript
async listar(): Promise<{ items: Item[] }> {
  const items = await this.prisma.item.findMany({
    orderBy: { nombre: 'asc' },
  });
  return { items };
}
```

### Con Slug

Agregar generación de slug y endpoint por slug:

```typescript
@Get('slug/:slug')
async obtenerPorSlug(@Param('slug') slug: string) {}

// En service
private async generarSlug(nombre: string): Promise<string> {
  // ... ver patrones en _patterns.md
}
```
