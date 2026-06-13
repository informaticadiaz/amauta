# Módulo: Lecciones

> Gestión de lecciones dentro de cursos.

---

## Descripción Funcional

Las lecciones son el contenido educativo de un curso. Cada curso tiene múltiples lecciones ordenadas. Los educadores pueden crear, editar, reordenar y publicar lecciones.

### Roles y Permisos

| Acción                    | ESTUDIANTE | EDUCADOR          | ADMIN_ESCUELA | SUPER_ADMIN |
| ------------------------- | ---------- | ----------------- | ------------- | ----------- |
| Listar lecciones públicas | Público    | Público           | Público       | Público     |
| Ver lección               | Público    | Público           | Público       | Público     |
| Crear lección             | -          | Sí (propio curso) | Sí            | Sí          |
| Editar lección            | -          | Sí (propio curso) | Sí            | Sí          |
| Reordenar                 | -          | Sí (propio curso) | Sí            | Sí          |
| Eliminar                  | -          | Sí (propio curso) | Sí            | Sí          |

---

## Archivos del Módulo

### Backend

| Archivo                                             | Propósito                  |
| --------------------------------------------------- | -------------------------- |
| `apps/api/src/lecciones/lecciones.module.ts`        | Módulo NestJS              |
| `apps/api/src/lecciones/lecciones.controller.ts`    | Endpoints REST             |
| `apps/api/src/lecciones/lecciones.service.ts`       | Lógica de negocio          |
| `apps/api/src/lecciones/dto/create-leccion.dto.ts`  | Schema Zod para crear      |
| `apps/api/src/lecciones/dto/update-leccion.dto.ts`  | Schema Zod para actualizar |
| `apps/api/src/lecciones/dto/query-lecciones.dto.ts` | Schema Zod para filtros    |

### Frontend

| Archivo                                                         | Propósito                               |
| --------------------------------------------------------------- | --------------------------------------- |
| `apps/web/src/app/api/cursos/[id]/lecciones/route.ts`           | Proxy crear lección                     |
| `apps/web/src/app/api/cursos/[id]/lecciones/reordenar/route.ts` | Proxy reordenar                         |
| `apps/web/src/app/api/lecciones/[id]/route.ts`                  | Proxy actualizar/eliminar               |
| `apps/web/src/app/dashboard/cursos/[id]/lecciones/page.tsx`     | Lista de lecciones (admin)              |
| `apps/web/src/app/cursos/[slug]/lecciones/[leccionId]/page.tsx` | Visualizador (estudiante)               |
| `apps/web/src/components/lecciones/LeccionForm.tsx`             | Formulario                              |
| `apps/web/src/components/lecciones/LeccionesManager.tsx`        | Gestión drag & drop                     |
| `apps/web/src/components/lecciones/LeccionContent.tsx`          | Renderiza contenido (texto/video/audio) |
| `apps/web/src/components/lecciones/MediaUploader.tsx`           | Subida de video/audio (drag & drop)     |
| `apps/web/src/components/lecciones/LeccionSidebar.tsx`          | Sidebar con lista de lecciones          |
| `apps/web/src/components/lecciones/LeccionNavigation.tsx`       | Botones anterior/siguiente              |
| `apps/web/src/components/lecciones/MobileSidebarSheet.tsx`      | Drawer de lecciones en móvil            |

---

## Endpoints API

### Rutas Anidadas bajo Cursos

| Método | Ruta                                   | Auth | Roles     | Descripción         |
| ------ | -------------------------------------- | ---- | --------- | ------------------- |
| GET    | `/cursos/:cursoId/lecciones`           | No   | Público   | Listar lecciones    |
| POST   | `/cursos/:cursoId/lecciones`           | Sí   | EDUCADOR+ | Crear lección       |
| PATCH  | `/cursos/:cursoId/lecciones/reordenar` | Sí   | EDUCADOR+ | Reordenar lecciones |

### Rutas Directas

| Método | Ruta             | Auth | Roles     | Descripción        |
| ------ | ---------------- | ---- | --------- | ------------------ |
| GET    | `/lecciones/:id` | No   | Público   | Obtener lección    |
| PATCH  | `/lecciones/:id` | Sí   | EDUCADOR+ | Actualizar lección |
| DELETE | `/lecciones/:id` | Sí   | EDUCADOR+ | Eliminar lección   |

### Query Parameters

| Param        | Tipo    | Descripción               |
| ------------ | ------- | ------------------------- |
| `publicadas` | boolean | Solo lecciones publicadas |

---

## Modelo Prisma

```prisma
model Leccion {
  id          String      @id @default(cuid())
  titulo      String
  descripcion String?
  orden       Int

  cursoId String
  curso   Curso  @relation(fields: [cursoId], references: [id], onDelete: Cascade)

  tipo     TipoLeccion
  duracion Int?         // minutos

  contenido Json         // Estructura flexible
  recursos  Recurso[]

  publicada Boolean @default(false)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  progresos Progreso[]

  @@index([cursoId])
  @@index([orden])
  @@map("lecciones")
}

enum TipoLeccion {
  VIDEO
  TEXTO
  QUIZ
  INTERACTIVO
  DESCARGABLE
}
```

---

## Ejemplos de Código

### DTO de Creación

```typescript
import { z } from 'zod';

export const createLeccionSchema = z.object({
  titulo: z
    .string()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(200, 'El título no puede exceder 200 caracteres'),
  descripcion: z.string().max(2000).optional(),
  tipo: z.enum(['VIDEO', 'TEXTO', 'QUIZ', 'INTERACTIVO', 'DESCARGABLE']),
  duracion: z.number().int().positive().optional(),
  contenido: z.record(z.unknown()).default({}),
  publicada: z.boolean().default(false),
});

export type CreateLeccionDto = z.infer<typeof createLeccionSchema>;
```

### DTO de Reordenamiento

```typescript
export const reordenarLeccionesSchema = z.object({
  lecciones: z.array(
    z.object({
      id: z.string().cuid(),
      orden: z.number().int().nonnegative(),
    })
  ),
});

export type ReordenarLeccionesDto = z.infer<typeof reordenarLeccionesSchema>;
```

### Controller (extracto)

```typescript
@Controller()
export class LeccionesController {
  constructor(private readonly leccionesService: LeccionesService) {}

  @Public()
  @Get('cursos/:cursoId/lecciones')
  async listar(
    @Param('cursoId') cursoId: string,
    @Query() query: QueryLeccionesDto
  ): Promise<ListaLeccionesResponse> {
    const lecciones = await this.leccionesService.listarPorCurso(
      cursoId,
      query.publicadas
    );
    return { lecciones, total: lecciones.length };
  }

  @Post('cursos/:cursoId/lecciones')
  @Roles('EDUCADOR', 'ADMIN_ESCUELA', 'SUPER_ADMIN')
  async crear(
    @Param('cursoId') cursoId: string,
    @Body() dto: CreateLeccionDto,
    @CurrentUser() user: RequestUser
  ): Promise<LeccionResponseWrapper> {
    const leccion = await this.leccionesService.crear(cursoId, dto, user.id);
    return { leccion, message: 'Lección creada exitosamente' };
  }

  @Patch('cursos/:cursoId/lecciones/reordenar')
  @Roles('EDUCADOR', 'ADMIN_ESCUELA', 'SUPER_ADMIN')
  async reordenar(
    @Param('cursoId') cursoId: string,
    @Body() dto: ReordenarLeccionesDto,
    @CurrentUser() user: RequestUser
  ): Promise<ListaLeccionesResponse> {
    const lecciones = await this.leccionesService.reordenar(
      cursoId,
      dto,
      user.id
    );
    return { lecciones, total: lecciones.length };
  }
}
```

### Service - Crear con Orden Automático

```typescript
async crear(cursoId: string, dto: CreateLeccionDto, usuarioId: string): Promise<LeccionResponse> {
  // Verificar propiedad del curso
  const curso = await this.verificarPropiedadCurso(cursoId, usuarioId);

  // Obtener siguiente orden
  const ultimaLeccion = await this.prisma.leccion.findFirst({
    where: { cursoId },
    orderBy: { orden: 'desc' },
    select: { orden: true },
  });
  const orden = (ultimaLeccion?.orden ?? 0) + 1;

  return this.prisma.leccion.create({
    data: {
      ...dto,
      cursoId,
      orden,
    },
  });
}
```

### Service - Reordenar

```typescript
async reordenar(
  cursoId: string,
  dto: ReordenarLeccionesDto,
  usuarioId: string
): Promise<LeccionResponse[]> {
  await this.verificarPropiedadCurso(cursoId, usuarioId);

  // Actualizar orden de cada lección en transacción
  await this.prisma.$transaction(
    dto.lecciones.map(({ id, orden }) =>
      this.prisma.leccion.update({
        where: { id },
        data: { orden },
      })
    )
  );

  return this.listarPorCurso(cursoId);
}
```

---

## Estructura del Contenido (JSON)

El campo `contenido` es flexible según el tipo:

### VIDEO

```json
{
  "videoUrl": "https://...",
  "provider": "youtube|vimeo|local",
  "captions": [{ "lang": "es", "url": "..." }]
}
```

#### Video/audio subido (F7-003, provider "local")

Cuando el educador sube un archivo via `MediaUploader` (`POST /uploads/media`, almacenado en MinIO), se agregan campos opcionales:

```json
{
  "videoUrl": "https://media.amauta.test/amauta-media/lecciones/abc123.mp4",
  "provider": "local",
  "storageKey": "lecciones/abc123.mp4",
  "mimeType": "video/mp4",
  "size": 12345678
}
```

- Si `mimeType` empieza con `audio/`, `LeccionContent` renderiza `<audio>` en lugar de `<video>`.
- `storageKey` se usa para eliminar el archivo de MinIO via `DELETE /uploads/media`.

### TEXTO

```json
{
  "html": "<p>Contenido...</p>",
  "markdown": "# Contenido..."
}
```

### QUIZ

```json
{
  "preguntas": [
    {
      "id": "q1",
      "texto": "¿Pregunta?",
      "tipo": "multiple|unica|verdadero_falso",
      "opciones": [{ "id": "a", "texto": "Opción A", "correcta": true }]
    }
  ],
  "passingScore": 70
}
```

---

## Dependencias

### Este módulo depende de

- **Cursos**: Las lecciones pertenecen a un curso
- **Usuarios**: Verificar propiedad del curso

### Módulos que dependen de este

- **Progreso**: Tracking de lecciones completadas
- **Recursos**: Archivos adjuntos a lecciones

---

## Notas para IA

1. **Orden automático**: Al crear, calcular siguiente orden
2. **Verificar propiedad**: Siempre verificar que el usuario es dueño del curso
3. **onDelete Cascade**: Si se elimina el curso, las lecciones se eliminan
4. **Campo contenido**: Es JSON flexible, estructura depende del tipo
5. **Reordenamiento**: Usar transacción para actualizar múltiples órdenes
