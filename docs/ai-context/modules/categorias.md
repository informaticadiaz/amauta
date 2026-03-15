# Módulo: Categorías

> Categorías para organizar cursos.

---

## Descripción Funcional

Las categorías permiten clasificar los cursos por tema (ej: Programación, Matemáticas, Idiomas). Son gestionadas por administradores y usadas al crear cursos.

### Roles y Permisos

| Acción             | ESTUDIANTE | EDUCADOR | ADMIN_ESCUELA | SUPER_ADMIN |
| ------------------ | ---------- | -------- | ------------- | ----------- |
| Listar categorías  | Público    | Público  | Público       | Público     |
| Ver categoría      | Público    | Público  | Público       | Público     |
| Crear categoría    | -          | -        | Sí            | Sí          |
| Editar categoría   | -          | -        | Sí            | Sí          |
| Eliminar categoría | -          | -        | -             | Sí          |

---

## Archivos del Módulo

### Backend (por implementar si no existe)

| Archivo                                               | Propósito         |
| ----------------------------------------------------- | ----------------- |
| `apps/api/src/categorias/categorias.module.ts`        | Módulo NestJS     |
| `apps/api/src/categorias/categorias.controller.ts`    | Endpoints REST    |
| `apps/api/src/categorias/categorias.service.ts`       | Lógica de negocio |
| `apps/api/src/categorias/dto/create-categoria.dto.ts` | Schema Zod        |
| `apps/api/src/categorias/dto/update-categoria.dto.ts` | Schema Zod        |

### Frontend

| Archivo                                          | Propósito           |
| ------------------------------------------------ | ------------------- |
| `apps/web/src/app/api/categorias/route.ts`       | Proxy CRUD          |
| `apps/web/src/app/dashboard/categorias/page.tsx` | Admin de categorías |

---

## Endpoints API

Base: `/api/v1/categorias`

| Método | Ruta          | Auth | Roles          | Descripción      |
| ------ | ------------- | ---- | -------------- | ---------------- |
| GET    | `/`           | No   | Público        | Listar todas     |
| GET    | `/:id`        | No   | Público        | Obtener por ID   |
| GET    | `/slug/:slug` | No   | Público        | Obtener por slug |
| POST   | `/`           | Sí   | ADMIN_ESCUELA+ | Crear categoría  |
| PATCH  | `/:id`        | Sí   | ADMIN_ESCUELA+ | Actualizar       |
| DELETE | `/:id`        | Sí   | SUPER_ADMIN    | Eliminar         |

---

## Modelo Prisma

```prisma
model Categoria {
  id          String  @id @default(cuid())
  nombre      String  @unique
  slug        String  @unique
  descripcion String?
  icono       String?

  cursos Curso[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([slug])
  @@map("categorias")
}
```

---

## Ejemplos de Código

### DTO de Creación

```typescript
import { z } from 'zod';

export const createCategoriaSchema = z.object({
  nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  descripcion: z
    .string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .optional(),
  icono: z
    .string()
    .max(50, 'El icono no puede exceder 50 caracteres')
    .optional(),
});

export type CreateCategoriaDto = z.infer<typeof createCategoriaSchema>;
```

### Controller

```typescript
@Controller('categorias')
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  @Public()
  @Get()
  async listar(): Promise<{ categorias: Categoria[] }> {
    const categorias = await this.categoriasService.listar();
    return { categorias };
  }

  @Public()
  @Get('slug/:slug')
  async obtenerPorSlug(
    @Param('slug') slug: string
  ): Promise<CategoriaResponse> {
    const categoria = await this.categoriasService.obtenerPorSlug(slug);
    return { categoria, message: 'Categoría obtenida exitosamente' };
  }

  @Post()
  @Roles('ADMIN_ESCUELA', 'SUPER_ADMIN')
  async crear(@Body() dto: CreateCategoriaDto): Promise<CategoriaResponse> {
    const categoria = await this.categoriasService.crear(dto);
    return { categoria, message: 'Categoría creada exitosamente' };
  }

  @Patch(':id')
  @Roles('ADMIN_ESCUELA', 'SUPER_ADMIN')
  async actualizar(
    @Param('id') id: string,
    @Body() dto: UpdateCategoriaDto
  ): Promise<CategoriaResponse> {
    const categoria = await this.categoriasService.actualizar(id, dto);
    return { categoria, message: 'Categoría actualizada exitosamente' };
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async eliminar(@Param('id') id: string): Promise<void> {
    await this.categoriasService.eliminar(id);
  }
}
```

### Service

```typescript
@Injectable()
export class CategoriasService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(): Promise<Categoria[]> {
    return this.prisma.categoria.findMany({
      orderBy: { nombre: 'asc' },
      include: {
        _count: { select: { cursos: true } },
      },
    });
  }

  async crear(dto: CreateCategoriaDto): Promise<Categoria> {
    const result = createCategoriaSchema.safeParse(dto);
    if (!result.success) {
      throw new BadRequestException(result.error.issues[0]?.message);
    }

    const { nombre, descripcion, icono } = result.data;

    // Verificar unicidad
    const existente = await this.prisma.categoria.findUnique({
      where: { nombre },
    });
    if (existente) {
      throw new BadRequestException('Ya existe una categoría con ese nombre');
    }

    // Generar slug
    const slug = await this.generarSlug(nombre);

    return this.prisma.categoria.create({
      data: { nombre, slug, descripcion, icono },
    });
  }

  async eliminar(id: string): Promise<void> {
    // Verificar que no tenga cursos
    const categoria = await this.prisma.categoria.findUnique({
      where: { id },
      include: { _count: { select: { cursos: true } } },
    });

    if (!categoria) {
      throw new NotFoundException('Categoría no encontrada');
    }

    if (categoria._count.cursos > 0) {
      throw new BadRequestException(
        'No se puede eliminar una categoría con cursos asociados'
      );
    }

    await this.prisma.categoria.delete({ where: { id } });
  }

  private async generarSlug(nombre: string): Promise<string> {
    const baseSlug = nombre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    let slug = baseSlug;
    let counter = 1;

    while (await this.prisma.categoria.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }
}
```

---

## Datos de Semilla (Seed)

Las categorías se crean en el seed inicial:

```typescript
// apps/api/prisma/seeds/categorias.ts
const categorias = [
  {
    nombre: 'Matemáticas',
    descripcion: 'Álgebra, geometría, cálculo y estadística',
    icono: 'calculator',
  },
  {
    nombre: 'Lengua y Literatura',
    descripcion: 'Gramática, comprensión lectora, redacción y literatura',
    icono: 'book-open',
  },
  {
    nombre: 'Ciencias Naturales',
    descripcion: 'Biología, física, química y astronomía',
    icono: 'flask',
  },
  {
    nombre: 'Ciencias Sociales',
    descripcion: 'Historia, geografía, educación cívica y economía',
    icono: 'globe',
  },
  {
    nombre: 'Educación Artística',
    descripcion: 'Artes visuales, música, danza, teatro y audiovisual',
    icono: 'palette',
  },
  {
    nombre: 'Educación Tecnológica',
    descripcion: 'Tecnología, procesos técnicos y pensamiento sociotécnico',
    icono: 'laptop',
  },
  {
    nombre: 'Educación Física',
    descripcion: 'Corporeidad, movimiento, juegos y vida saludable',
    icono: 'activity',
  },
  {
    nombre: 'Formación Ética y Ciudadana',
    descripcion: 'Ciudadanía, derechos, convivencia y participación',
    icono: 'scale',
  },
];
```

---

## Dependencias

### Módulos que dependen de este

- **Cursos**: Requieren categoriaId al crear

---

## Notas para IA

1. **Nombre único**: El nombre de categoría es único
2. **Slug automático**: Se genera del nombre
3. **No eliminar con cursos**: Verificar antes de eliminar
4. **Sin paginación**: Las categorías son pocas, se listan todas
5. **Icono opcional**: String libre para nombre de icono (lucide, heroicons, etc.)
