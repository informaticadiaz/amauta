# Módulo: Inscripciones

> Sistema de inscripción de estudiantes a cursos.

---

## Descripción Funcional

Permite a los usuarios inscribirse en cursos publicados. Registra el estado de la inscripción y el progreso general del estudiante en el curso.

### Roles y Permisos

| Acción                 | ESTUDIANTE  | EDUCADOR    | ADMIN_ESCUELA | SUPER_ADMIN |
| ---------------------- | ----------- | ----------- | ------------- | ----------- |
| Ver mis cursos         | Sí          | Sí          | Sí            | Sí          |
| Inscribirse            | Sí          | Sí          | Sí            | Sí          |
| Cancelar inscripción   | Sí (propia) | Sí (propia) | Sí            | Sí          |
| Ver estado inscripción | Sí (propia) | Sí (propia) | Sí            | Sí          |

---

## Archivos del Módulo

### Backend

| Archivo                                                          | Propósito               |
| ---------------------------------------------------------------- | ----------------------- |
| `apps/api/src/inscripciones/inscripciones.module.ts`             | Módulo NestJS           |
| `apps/api/src/inscripciones/inscripciones.controller.ts`         | Endpoints REST          |
| `apps/api/src/inscripciones/inscripciones.service.ts`            | Lógica de negocio       |
| `apps/api/src/inscripciones/inscripciones.service.spec.ts`       | Tests unitarios service (18 tests, 100% cobertura) |
| `apps/api/src/inscripciones/inscripciones.controller.spec.ts`    | Tests unitarios controller (8 tests, 100% cobertura) |
| `apps/api/src/inscripciones/dto/query-inscripciones.dto.ts`      | Schema Zod para filtros |
| `apps/api/src/inscripciones/dto/inscribirse.dto.ts`              | Schema Zod (si aplica)  |

### Frontend

| Archivo                                                      | Propósito                          |
| ------------------------------------------------------------ | ---------------------------------- |
| `apps/web/src/app/api/cursos/[id]/inscribir/route.ts`        | Proxy POST/DELETE inscribirse      |
| `apps/web/src/app/api/cursos/[id]/inscripcion/route.ts`      | Proxy GET estado de inscripción    |
| `apps/web/src/app/api/mis-cursos/route.ts`                   | Proxy GET mis inscripciones        |
| `apps/web/src/app/dashboard/mis-cursos/page.tsx`             | Página lista de cursos inscritos   |
| `apps/web/src/components/catalogo/InscripcionBtn.tsx`        | Botón inscripción con lógica real  |
| `apps/web/src/components/inscripciones/MiCursoCard.tsx`      | Tarjeta de curso inscrito          |

---

## Endpoints API

| Método | Ruta                      | Auth | Roles | Descripción              |
| ------ | ------------------------- | ---- | ----- | ------------------------ |
| GET    | `/mis-cursos`             | Sí   | Todos | Listar mis inscripciones |
| POST   | `/cursos/:id/inscribir`   | Sí   | Todos | Inscribirse en curso     |
| DELETE | `/cursos/:id/inscribir`   | Sí   | Todos | Cancelar inscripción     |
| GET    | `/cursos/:id/inscripcion` | Sí   | Todos | Estado de inscripción    |

### Query Parameters (GET /mis-cursos)

| Param        | Tipo   | Default    | Descripción                    |
| ------------ | ------ | ---------- | ------------------------------ |
| `page`       | number | 1          | Página                         |
| `limit`      | number | 10         | Resultados por página          |
| `estado`     | enum   | -          | ACTIVO, COMPLETADO, ABANDONADO |
| `ordenarPor` | enum   | inscritoEn | inscritoEn, progreso           |
| `orden`      | enum   | desc       | asc, desc                      |

### Respuestas

**POST /cursos/:id/inscribir**

```json
{
  "inscripcion": {
    "id": "cuid...",
    "usuarioId": "...",
    "cursoId": "...",
    "estado": "ACTIVO",
    "progreso": 0,
    "inscritoEn": "2025-01-15T...",
    "curso": {
      "id": "...",
      "titulo": "...",
      "slug": "...",
      "imagen": "..."
    }
  },
  "message": "Te has inscrito exitosamente en el curso"
}
```

**GET /cursos/:id/inscripcion**

```json
{
  "inscripcion": { ... } | null,
  "inscrito": true | false
}
```

---

## Modelo Prisma

```prisma
model Inscripcion {
  id String @id @default(cuid())

  usuarioId String
  usuario   Usuario @relation(fields: [usuarioId], references: [id])

  cursoId String
  curso   Curso  @relation(fields: [cursoId], references: [id])

  estado   EstadoInscripcion @default(ACTIVO)
  progreso Int               @default(0) // 0-100

  inscritoEn   DateTime  @default(now())
  completadoEn DateTime?

  @@unique([usuarioId, cursoId])
  @@index([usuarioId])
  @@index([cursoId])
  @@map("inscripciones")
}

enum EstadoInscripcion {
  ACTIVO
  COMPLETADO
  ABANDONADO
}
```

---

## Ejemplos de Código

### DTO de Query

```typescript
import { z } from 'zod';

export const queryInscripcionesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  estado: z.enum(['ACTIVO', 'COMPLETADO', 'ABANDONADO']).optional(),
  ordenarPor: z.enum(['inscritoEn', 'progreso']).default('inscritoEn'),
  orden: z.enum(['asc', 'desc']).default('desc'),
});

export type QueryInscripcionesDto = z.infer<typeof queryInscripcionesSchema>;
```

### Controller

```typescript
@Controller()
export class InscripcionesController {
  constructor(private readonly inscripcionesService: InscripcionesService) {}

  @Get('mis-cursos')
  @Roles('ESTUDIANTE', 'EDUCADOR', 'ADMIN_ESCUELA', 'SUPER_ADMIN')
  async listarMisInscripciones(
    @CurrentUser() user: RequestUser,
    @Query() query: QueryInscripcionesDto
  ): Promise<ListaInscripcionesResponse> {
    return this.inscripcionesService.listarMisInscripciones(user.id, query);
  }

  @Post('cursos/:id/inscribir')
  @Roles('ESTUDIANTE', 'EDUCADOR', 'ADMIN_ESCUELA', 'SUPER_ADMIN')
  async inscribirse(
    @Param('id') cursoId: string,
    @CurrentUser() user: RequestUser
  ): Promise<InscripcionResponse> {
    const inscripcion = await this.inscripcionesService.inscribirse(
      cursoId,
      user.id
    );
    return {
      inscripcion,
      message: 'Te has inscrito exitosamente en el curso',
    };
  }

  @Delete('cursos/:id/inscribir')
  @Roles('ESTUDIANTE', 'EDUCADOR', 'ADMIN_ESCUELA', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async cancelarInscripcion(
    @Param('id') cursoId: string,
    @CurrentUser() user: RequestUser
  ): Promise<void> {
    await this.inscripcionesService.cancelarInscripcion(cursoId, user.id);
  }

  @Get('cursos/:id/inscripcion')
  @Roles('ESTUDIANTE', 'EDUCADOR', 'ADMIN_ESCUELA', 'SUPER_ADMIN')
  async obtenerEstadoInscripcion(
    @Param('id') cursoId: string,
    @CurrentUser() user: RequestUser
  ): Promise<EstadoInscripcionResponse> {
    const inscripcion =
      await this.inscripcionesService.obtenerEstadoInscripcion(
        cursoId,
        user.id
      );
    return {
      inscripcion,
      inscrito: inscripcion !== null && inscripcion.estado === 'ACTIVO',
    };
  }
}
```

### Service (extracto)

```typescript
@Injectable()
export class InscripcionesService {
  constructor(private readonly prisma: PrismaService) {}

  async inscribirse(
    cursoId: string,
    usuarioId: string
  ): Promise<InscripcionConCurso> {
    // Verificar que el curso existe y está publicado
    const curso = await this.prisma.curso.findUnique({
      where: { id: cursoId },
      select: { id: true, estado: true },
    });

    if (!curso) {
      throw new NotFoundException('Curso no encontrado');
    }

    if (curso.estado !== 'PUBLICADO') {
      throw new BadRequestException(
        'El curso no está disponible para inscripción'
      );
    }

    // Verificar si ya está inscrito
    const existente = await this.prisma.inscripcion.findUnique({
      where: {
        usuarioId_cursoId: { usuarioId, cursoId },
      },
    });

    if (existente) {
      if (existente.estado === 'ACTIVO') {
        throw new BadRequestException('Ya estás inscrito en este curso');
      }
      // Reactivar inscripción abandonada
      return this.prisma.inscripcion.update({
        where: { id: existente.id },
        data: { estado: 'ACTIVO' },
        include: {
          curso: {
            select: { id: true, titulo: true, slug: true, imagen: true },
          },
        },
      });
    }

    return this.prisma.inscripcion.create({
      data: { usuarioId, cursoId },
      include: {
        curso: { select: { id: true, titulo: true, slug: true, imagen: true } },
      },
    });
  }

  async cancelarInscripcion(cursoId: string, usuarioId: string): Promise<void> {
    const inscripcion = await this.prisma.inscripcion.findUnique({
      where: {
        usuarioId_cursoId: { usuarioId, cursoId },
      },
    });

    if (!inscripcion) {
      throw new NotFoundException('No estás inscrito en este curso');
    }

    // Soft delete: cambiar estado a ABANDONADO
    await this.prisma.inscripcion.update({
      where: { id: inscripcion.id },
      data: { estado: 'ABANDONADO' },
    });
  }
}
```

---

## Dependencias

### Este módulo depende de

- **Cursos**: Solo se puede inscribir en cursos publicados
- **Usuarios**: El usuario autenticado se inscribe

### Módulos que dependen de este

- **Progreso**: Tracking de lecciones completadas actualiza inscripción
- **Dashboard Estudiante**: Muestra cursos inscritos

---

## Notas para IA

1. **Constraint único**: `@@unique([usuarioId, cursoId])` previene duplicados
2. **Soft delete**: Cancelar cambia estado a ABANDONADO, no elimina
3. **Reactivación**: Si estaba ABANDONADO, se puede reactivar
4. **Solo publicados**: Verificar que curso está PUBLICADO antes de inscribir
5. **Progreso**: Se calcula desde las lecciones completadas (futuro)
