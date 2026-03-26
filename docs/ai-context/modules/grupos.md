# Módulo: Grupos/Clases

> Gestión de grupos/clases por institución con filtros por ciclo lectivo y estado.

---

## Descripción Funcional

Permite a administradores escolares crear, editar y desactivar grupos dentro de su institución. Soporta filtros por periodo académico (ciclo lectivo) y por estado activo/inactivo.

### Roles y Permisos

| Acción           | ADMIN_ESCUELA | SUPER_ADMIN |
| ---------------- | ------------- | ----------- |
| Crear grupo      | Sí            | Sí          |
| Listar grupos    | Sí            | Sí          |
| Obtener detalle  | Sí            | Sí          |
| Actualizar grupo | Sí            | Sí          |
| Desactivar grupo | Sí            | Sí          |

---

## Archivos del Módulo

### Backend

| Archivo                                       | Propósito                          |
| --------------------------------------------- | ---------------------------------- |
| `apps/api/src/grupos/grupos.module.ts`        | Módulo NestJS                      |
| `apps/api/src/grupos/grupos.controller.ts`    | Endpoints REST                     |
| `apps/api/src/grupos/grupos.service.ts`       | Lógica de negocio                  |
| `apps/api/src/grupos/dto/create-grupo.dto.ts` | Schema Zod para crear grupo        |
| `apps/api/src/grupos/dto/update-grupo.dto.ts` | Schema Zod para actualizar grupo   |
| `apps/api/src/grupos/dto/query-grupos.dto.ts` | Schema Zod para filtros y paginado |

---

## Endpoints API

Base: `/api/v1`

| Método | Ruta                                    | Auth | Roles          | Descripción                          |
| ------ | --------------------------------------- | ---- | -------------- | ------------------------------------ |
| POST   | `/instituciones/:institucionId/grupos`  | Sí   | ADMIN_ESCUELA+ | Crear grupo                          |
| GET    | `/instituciones/:institucionId/grupos`  | Sí   | ADMIN_ESCUELA+ | Listar con filtros (activo, periodo) |
| GET    | `/grupos/:id`                           | Sí   | ADMIN_ESCUELA+ | Obtener grupo por ID                 |
| PATCH  | `/grupos/:id`                           | Sí   | ADMIN_ESCUELA+ | Actualizar grupo                     |
| DELETE | `/grupos/:id`                           | Sí   | ADMIN_ESCUELA+ | Desactivar grupo (soft delete)       |
| POST   | `/grupos/:id/estudiantes`               | Sí   | ADMIN_ESCUELA+ | Asignar estudiantes de forma masiva  |
| GET    | `/grupos/:id/estudiantes`               | Sí   | ADMIN_ESCUELA+ | Listar estudiantes del grupo         |
| DELETE | `/grupos/:id/estudiantes/:estudianteId` | Sí   | ADMIN_ESCUELA+ | Remover estudiante (soft delete)     |

---

## Modelo Prisma (extracto)

```prisma
model Grupo {
  id      String  @id @default(cuid())
  nombre  String
  grado   String?
  seccion String?
  periodoAcademicoId String?
  periodoAcademico   PeriodoAcademico? @relation(fields: [periodoAcademicoId], references: [id])
  institucionId String
  institucion   Institucion @relation(fields: [institucionId], references: [id])
  educadorId String
  educador   Usuario @relation(fields: [educadorId], references: [id])
  activo Boolean @default(true)
}
```

---

## Reglas de Validación

1. **Institución**: ADMIN_ESCUELA solo puede operar sobre su institución.
2. **Periodo académico**: debe pertenecer a la institución.
3. **Educador**: debe tener rol EDUCADOR y pertenecer a la institución.
4. **Soft delete**: se desactiva con `activo=false`.
5. **Asignación masiva**: los estudiantes deben tener rol `ESTUDIANTE`.
6. **Pertenencia**: los estudiantes deben pertenecer a la misma institución del grupo.
7. **Duplicados**: si una asignación sigue activa, se reporta como duplicado.
8. **Reactivación**: una asignación inactiva puede reactivarse sin perder historial.
9. **Auditoría**: `GrupoEstudiante` guarda fecha de asignación, usuario asignador y datos de remoción lógica.

---

## Notas para IA

1. **Multi-tenant**: resolver institución desde `perfil.institucion`.
2. **SUPER_ADMIN**: debe enviar `institucionId` en rutas de creación/listado.
3. **Filtros**: `activo` y `periodoAcademicoId`.
