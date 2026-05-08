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

| Método | Ruta                                      | Auth | Roles          | Descripción                          |
| ------ | ----------------------------------------- | ---- | -------------- | ------------------------------------ |
| POST   | `/instituciones/:institucionId/grupos`    | Sí   | ADMIN_ESCUELA+ | Crear grupo                          |
| GET    | `/instituciones/:institucionId/grupos`    | Sí   | ADMIN_ESCUELA+ | Listar con filtros (activo, periodo) |
| GET    | `/grupos/:id`                             | Sí   | ADMIN_ESCUELA+ | Obtener grupo por ID                 |
| PATCH  | `/grupos/:id`                             | Sí   | ADMIN_ESCUELA+ | Actualizar grupo                     |
| DELETE | `/grupos/:id`                             | Sí   | ADMIN_ESCUELA+ | Desactivar grupo (soft delete)       |
| GET    | `/grupos/:id/asistencias`                 | Sí   | ADMIN/EDUCADOR | Obtener nómina diaria por fecha      |
| PUT    | `/grupos/:id/asistencias`                 | Sí   | ADMIN/EDUCADOR | Registrar asistencias del día        |
| GET    | `/grupos/:id/asistencias/resumen-mensual` | Sí   | ADMIN/EDUCADOR | Obtener resumen mensual del grupo    |
| POST   | `/grupos/:id/estudiantes`                 | Sí   | ADMIN_ESCUELA+ | Asignar estudiantes de forma masiva  |
| GET    | `/grupos/:id/estudiantes`                 | Sí   | ADMIN_ESCUELA+ | Listar estudiantes del grupo         |
| DELETE | `/grupos/:id/estudiantes/:estudianteId`   | Sí   | ADMIN_ESCUELA+ | Remover estudiante (soft delete)     |
| POST   | `/grupos/:id/educadores`                  | Sí   | ADMIN_ESCUELA+ | Asignar un educador al grupo         |
| GET    | `/grupos/:id/educadores`                  | Sí   | ADMIN_ESCUELA+ | Listar educadores asignados          |
| DELETE | `/grupos/:id/educadores/:educadorId`      | Sí   | ADMIN_ESCUELA+ | Remover educador (soft delete)       |
| GET    | `/educadores/me/grupos`                   | Sí   | EDUCADOR       | Listar grupos del educador actual    |
| GET    | `/grupos/:id/reportes/asistencia`         | Sí   | ADMIN/EDUCADOR | Reporte de asistencia por grupo      |
| GET    | `/grupos/:id/reportes/rendimiento`        | Sí   | ADMIN/EDUCADOR | Reporte de rendimiento por grupo     |
| GET    | `/grupos/:id/reportes/asistencia/csv`     | Sí   | ADMIN/EDUCADOR | Exportar CSV de asistencia           |

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
10. **Educadores**: el educador asignado debe tener rol `EDUCADOR` y pertenecer a la misma institución del grupo.
11. **Rol del educador**: la asignación exige `rol` `TITULAR` o `SUPLENTE`.
12. **Mis grupos**: `/educadores/me/grupos` solo devuelve grupos con asignación activa para el usuario autenticado.
13. **Asistencias mensuales**: el resumen mensual solo consolida estudiantes activos del grupo y reutiliza la validación de acceso de asistencias diarias.
14. **Porcentaje de asistencia**: en la versión inicial se calcula como `(presentes + justificados) / totalRegistros * 100`.
15. **Reportes**: EDUCADOR solo puede ver reportes de grupos en los que está asignado (via `GrupoEducador` activo). ADMIN_ESCUELA puede ver todos los grupos de su institución. `porcentajeAsistencia = Math.round(presente / totalClases * 100)`.
16. **CSV de asistencia**: generado como string en el backend, sin dependencias externas. Formato: `Estudiante,Presente,Ausente,Tardanza,Justificado,%Asistencia`.

---

---

## Frontend (F4-006)

### Proxies Next.js

| Ruta                                          | Métodos            | Descripción                                      |
| --------------------------------------------- | ------------------ | ------------------------------------------------ |
| `/api/grupos`                                 | GET, POST          | Lista y crea grupos (requiere `institucionId`)   |
| `/api/grupos/[id]`                            | GET, PATCH, DELETE | Opera sobre un grupo específico                  |
| `/api/grupos/[id]/estudiantes`                | GET, POST          | Lista y asigna estudiantes al grupo              |
| `/api/grupos/[id]/estudiantes/[estudianteId]` | DELETE             | Remueve estudiante asignado                      |
| `/api/grupos/[id]/educadores`                 | GET, POST          | Lista y asigna educadores al grupo               |
| `/api/grupos/[id]/educadores/[educadorId]`    | DELETE             | Remueve educador asignado                        |
| `/api/instituciones/[id]/estudiantes`         | GET                | Selector paginado de estudiantes por institución |
| `/api/instituciones/[id]/educadores`          | GET                | Selector paginado de educadores por institución  |
| `/api/educadores/me/grupos`                   | GET                | Lista de grupos visibles para el educador actual |
| `/api/mi-institucion`                         | GET                | Retorna `{ institucionId, nombre, periodos[] }`  |

### Componentes

| Archivo                                                      | Descripción                                           |
| ------------------------------------------------------------ | ----------------------------------------------------- |
| `apps/web/src/components/grupos/GruposList.tsx`              | Lista con filtros estado/período, loading/error/vacío |
| `apps/web/src/components/grupos/GrupoForm.tsx`               | Formulario crear/editar                               |
| `apps/web/src/components/grupos/GrupoEstudiantesSection.tsx` | Gestión de asignaciones de estudiantes                |
| `apps/web/src/components/grupos/GrupoEducadoresSection.tsx`  | Gestión de asignaciones de educadores                 |
| `apps/web/src/components/grupos/AsignarEstudiantesModal.tsx` | Alta masiva con preview                               |
| `apps/web/src/components/grupos/EstudiantesTable.tsx`        | Tabla de estudiantes asignados                        |
| `apps/web/src/components/grupos/AsignarEducadorForm.tsx`     | Alta de educadores con rol                            |
| `apps/web/src/components/grupos/EducadoresList.tsx`          | Lista de educadores asignados                         |
| `apps/web/src/components/grupos/GruposList.test.tsx`         | 9 tests                                               |
| `apps/web/src/components/grupos/GrupoForm.test.tsx`          | 10 tests                                              |

### Páginas

| Ruta                                 | Descripción                   |
| ------------------------------------ | ----------------------------- |
| `/dashboard/grupos`                  | Listado (solo ADMIN_ESCUELA)  |
| `/dashboard/grupos/nuevo`            | Crear grupo                   |
| `/dashboard/grupos/[id]/editar`      | Editar grupo                  |
| `/dashboard/grupos/[id]/estudiantes` | Asignar y remover estudiantes |
| `/dashboard/grupos/[id]/educadores`  | Asignar y remover educadores  |

### Nuevo endpoint backend (instituciones)

`GET /api/v1/instituciones/mi-institucion` (ADMIN_ESCUELA)
→ Retorna `{ institucionId, nombre, periodos[] }`
→ Resuelve la institución del admin desde su perfil

---

## Notas para IA

1. **Multi-tenant**: resolver institución desde `perfil.institucion`.
2. **SUPER_ADMIN**: debe enviar `institucionId` en rutas de creación/listado (la UI aún no lo soporta).
3. **Filtros**: `activo` (boolean) y `periodoAcademicoId` (cuid).
4. **Patrón frontend**: el server component llama `/instituciones/mi-institucion` primero, luego pasa `institucionId` y `periodos` como props al client component.
5. **educadorId**: en crear es obligatorio (texto UUID). En editar es opcional.
6. **Asignación masiva**: `POST /grupos/:id/estudiantes` recibe `{ estudiantesIds: string[] }` y devuelve `{ agregados, duplicados, errores }`.
7. **Asignación de educadores**: `POST /grupos/:id/educadores` recibe `{ educadorId, rol }`.
8. **Listados paginados**: tanto estudiantes como educadores del grupo usan `page`, `limit` y búsqueda opcional `buscar`.
