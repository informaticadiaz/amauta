# Módulo: Cursos

> CRUD completo de cursos educativos.

---

## Descripción Funcional

El módulo de cursos permite a educadores crear, editar y publicar cursos. Los estudiantes pueden ver el catálogo de cursos publicados e inscribirse.

### Roles y Permisos

| Acción                 | ESTUDIANTE | EDUCADOR    | ADMIN_ESCUELA | SUPER_ADMIN |
| ---------------------- | ---------- | ----------- | ------------- | ----------- |
| Listar cursos públicos | Público    | Público     | Público       | Público     |
| Ver detalle de curso   | Público    | Público     | Público       | Público     |
| Crear curso            | -          | Sí          | Sí            | Sí          |
| Editar curso propio    | -          | Sí          | Sí            | Sí          |
| Publicar/Despublicar   | -          | Sí (propio) | Sí            | Sí          |
| Eliminar (archivar)    | -          | Sí (propio) | Sí            | Sí          |
| Listar mis cursos      | -          | Sí          | Sí            | Sí          |

---

## Archivos del Módulo

### Backend

| Archivo                                       | Propósito                  |
| --------------------------------------------- | -------------------------- |
| `apps/api/src/cursos/cursos.module.ts`        | Módulo NestJS              |
| `apps/api/src/cursos/cursos.controller.ts`    | Endpoints REST             |
| `apps/api/src/cursos/cursos.service.ts`       | Lógica de negocio          |
| `apps/api/src/cursos/dto/create-curso.dto.ts` | Schema Zod para crear      |
| `apps/api/src/cursos/dto/update-curso.dto.ts` | Schema Zod para actualizar |
| `apps/api/src/cursos/dto/query-cursos.dto.ts` | Schema Zod para filtros    |

### Frontend

| Archivo                                                  | Propósito                |
| -------------------------------------------------------- | ------------------------ |
| `apps/web/src/app/api/cursos/route.ts`                   | Proxy POST (crear)       |
| `apps/web/src/app/api/cursos/[id]/route.ts`              | Proxy PATCH (actualizar) |
| `apps/web/src/app/api/cursos/[id]/publicar/route.ts`     | Proxy publicar           |
| `apps/web/src/app/cursos/page.tsx`                       | Catálogo público         |
| `apps/web/src/app/cursos/[slug]/page.tsx`                | Detalle de curso         |
| `apps/web/src/app/dashboard/cursos/page.tsx`             | Mis cursos (educador)    |
| `apps/web/src/app/dashboard/cursos/nuevo/page.tsx`       | Crear curso              |
| `apps/web/src/app/dashboard/cursos/[id]/editar/page.tsx` | Editar curso             |
| `apps/web/src/components/cursos/CursoForm.tsx`           | Formulario               |
| `apps/web/src/components/cursos/CursoCard.tsx`           | Card para listas         |
| `apps/web/src/components/cursos/ImageUploader.tsx`       | Subida de imagen         |

---

## Endpoints API

Base: `/api/v1/cursos`

| Método | Ruta            | Auth | Roles     | Descripción                                   |
| ------ | --------------- | ---- | --------- | --------------------------------------------- |
| GET    | `/`             | No   | Público   | Listar cursos publicados                      |
| GET    | `/buscar`       | No   | Público   | Buscar cursos con relevancia, filtros y sorts |
| GET    | `/mis-cursos`   | Sí   | EDUCADOR+ | Mis cursos como educador                      |
| GET    | `/slug/:slug`   | No   | Público   | Obtener por slug (con lecciones)              |
| GET    | `/:id`          | No   | Público   | Obtener por ID                                |
| POST   | `/`             | Sí   | EDUCADOR+ | Crear curso                                   |
| PATCH  | `/:id`          | Sí   | EDUCADOR+ | Actualizar curso                              |
| PATCH  | `/:id/publicar` | Sí   | EDUCADOR+ | Publicar/Despublicar                          |
| DELETE | `/:id`          | Sí   | EDUCADOR+ | Eliminar (archivar)                           |

### Query Parameters (GET /)

| Param         | Tipo          | Default   | Descripción                        |
| ------------- | ------------- | --------- | ---------------------------------- |
| `page`        | number        | 1         | Página                             |
| `limit`       | number        | 10        | Resultados por página (max 100)    |
| `categoriaId` | string (cuid) | -         | Filtrar por categoría              |
| `nivel`       | enum          | -         | PRINCIPIANTE, INTERMEDIO, AVANZADO |
| `buscar`      | string        | -         | Búsqueda en título/descripción     |
| `ordenarPor`  | enum          | createdAt | createdAt, titulo, publicadoEn     |
| `orden`       | enum          | desc      | asc, desc                          |

### Query Parameters (GET /buscar)

| Param         | Tipo          | Default                                            | Descripción                                                 |
| ------------- | ------------- | -------------------------------------------------- | ----------------------------------------------------------- |
| `page`        | number        | 1                                                  | Página                                                      |
| `limit`       | number        | 10                                                 | Resultados por página (max 100)                             |
| `buscar`      | string        | -                                                  | Texto libre (busca en título y descripción)                 |
| `categoriaId` | string (cuid) | -                                                  | Filtrar por categoría                                       |
| `nivel`       | enum          | -                                                  | PRINCIPIANTE, INTERMEDIO, AVANZADO                          |
| `duracion`    | enum          | -                                                  | `corta` (<60 min), `media` (60-180 min), `larga` (>180 min) |
| `idioma`      | string        | -                                                  | Código de idioma (`es`, `en`, etc.)                         |
| `ordenarPor`  | enum          | relevancia (con buscar) / publicadoEn (sin buscar) | relevancia, publicadoEn, titulo                             |
| `orden`       | enum          | desc                                               | asc, desc                                                   |

**Reglas importantes:**

- Siempre devuelve solo cursos `PUBLICADO` — no configurable
- Con `buscar` sin `ordenarPor`: los cursos donde coincide el título van primero, luego los de descripción
- Sin `buscar`: ordenado por `publicadoEn desc` por defecto

---

## Modelo Prisma

```prisma
model Curso {
  id          String      @id @default(cuid())
  titulo      String
  descripcion String
  slug        String      @unique

  educadorId String
  educador   Usuario @relation("Educador", fields: [educadorId], references: [id])

  categoriaId String
  categoria   Categoria @relation(fields: [categoriaId], references: [id])

  nivel  Nivel
  estado EstadoCurso @default(BORRADOR)

  imagen   String?
  duracion Int?        // minutos estimados
  idioma   String      @default("es")

  publicadoEn DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  lecciones     Leccion[]
  inscripciones Inscripcion[]

  @@index([educadorId])
  @@index([categoriaId])
  @@index([estado])
  @@index([slug])
  @@map("cursos")
}

enum Nivel {
  PRINCIPIANTE
  INTERMEDIO
  AVANZADO
}

enum EstadoCurso {
  BORRADOR
  REVISION
  PUBLICADO
  ARCHIVADO
}
```

---

## Ejemplos de Código

### DTO de Creación

```typescript
// apps/api/src/cursos/dto/create-curso.dto.ts
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
    message: 'Nivel inválido',
  }),
  imagen: z.string().min(1).optional().nullable(),
  duracion: z.number().int().positive().optional(),
  idioma: z.string().length(2).default('es'),
});

export type CreateCursoDto = z.infer<typeof createCursoSchema>;
```

### Controller (extracto)

```typescript
@Controller('cursos')
export class CursosController {
  constructor(private readonly cursosService: CursosService) {}

  @Public()
  @Get()
  async listar(@Query() query: QueryCursosDto): Promise<ListaCursosResponse> {
    return this.cursosService.listar(query);
  }

  @Post()
  @Roles('EDUCADOR', 'ADMIN_ESCUELA', 'SUPER_ADMIN')
  async crear(
    @Body() dto: CreateCursoDto,
    @CurrentUser() user: RequestUser
  ): Promise<CursoResponse> {
    const curso = await this.cursosService.crear(dto, user.id);
    return { curso, message: 'Curso creado exitosamente' };
  }
}
```

### Service (extracto)

```typescript
@Injectable()
export class CursosService {
  constructor(private readonly prisma: PrismaService) {}

  async crear(
    dto: CreateCursoDto,
    educadorId: string
  ): Promise<CursoConEducador> {
    const result = createCursoSchema.safeParse(dto);
    if (!result.success) {
      throw new BadRequestException(
        result.error.issues[0]?.message ?? 'Datos inválidos'
      );
    }

    const {
      titulo,
      descripcion,
      categoriaId,
      nivel,
      imagen,
      duracion,
      idioma,
    } = result.data;

    // Verificar categoría
    const categoria = await this.prisma.categoria.findUnique({
      where: { id: categoriaId },
    });
    if (!categoria) {
      throw new BadRequestException('La categoría no existe');
    }

    // Generar slug
    const slug = await this.generarSlug(titulo);

    // Crear curso
    return this.prisma.curso.create({
      data: {
        titulo,
        descripcion,
        slug,
        educadorId,
        categoriaId,
        nivel: nivel as Nivel,
        imagen,
        duracion,
        idioma,
      },
      include: {
        educador: {
          select: { id: true, nombre: true, apellido: true, avatar: true },
        },
        categoria: { select: { id: true, nombre: true, slug: true } },
        _count: { select: { lecciones: true, inscripciones: true } },
      },
    });
  }
}
```

---

## Dependencias

### Este módulo depende de

- **Categorías**: `categoriaId` es requerido al crear
- **Usuarios**: `educadorId` se obtiene del usuario autenticado
- **Uploads**: Para subir imagen de portada

### Módulos que dependen de este

- **Lecciones**: Las lecciones pertenecen a un curso
- **Inscripciones**: Los estudiantes se inscriben a cursos

---

## Notas para IA

1. **Slug automático**: El slug se genera del título y se verifica unicidad
2. **Soft delete**: `eliminar()` cambia estado a ARCHIVADO, no borra
3. **Verificación de propiedad**: Solo el educador dueño puede editar/eliminar
4. **Include estándar**: Siempre incluir educador, categoria y \_count
5. **Estados**:
   - BORRADOR: Solo visible para el educador
   - REVISION: (futuro) En revisión por admins
   - PUBLICADO: Visible en catálogo
   - ARCHIVADO: Soft-deleted
