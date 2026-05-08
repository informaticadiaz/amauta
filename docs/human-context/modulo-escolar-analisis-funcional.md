# Módulo Escolar — Análisis Funcional Consolidado

> Documento de referencia para entender qué resuelve el módulo escolar de Amauta, cómo está estructurado y qué cubre cada submódulo.
> Última actualización: 2026-05-08 (post Fase 4 + Fase 4b completas)

---

## 1. Visión General

El módulo escolar permite gestionar el ciclo completo de una institución educativa: desde la configuración de la escuela hasta el seguimiento académico de cada estudiante.

Cubre tres perspectivas:

| Rol               | Qué puede hacer                                            |
| ----------------- | ---------------------------------------------------------- |
| **ADMIN_ESCUELA** | Configurar institución, gestionar grupos, generar reportes |
| **EDUCADOR**      | Registrar asistencias y calificaciones en sus grupos       |
| **ESTUDIANTE**    | Consultar sus notas, asistencias, boletín y comunicados    |

El sistema es **multi-tenant**: cada institución opera de forma aislada. Un admin solo ve su institución, un educador solo sus grupos, un estudiante solo sus datos.

---

## 2. Submódulos

### 2.1 Instituciones

**Qué resuelve**: configuración base de la institución educativa y sus períodos académicos.

**Funcionalidades:**

- Resolución de "mi institución" desde el usuario autenticado (sin necesidad de enviar el ID manualmente)
- Gestión de **períodos académicos** (ciclos lectivos): crear, activar/desactivar, listar
- Configuración de **escala de calificación**: nota mínima, nota máxima, nota de aprobación
- Listados paginados de estudiantes y educadores de la institución (con búsqueda)

**Reglas de negocio clave:**

- `ADMIN_ESCUELA` solo puede gestionar su propia institución
- La escala de calificación es única por institución (upsert)
- Los períodos desactivados no desaparecen — preservan historial

---

### 2.2 Grupos

**Qué resuelve**: gestión de clases/grupos escolares y sus integrantes.

**Funcionalidades:**

- CRUD de grupos (nombre, grado, sección, período académico, educador principal)
- Asignación **masiva** de estudiantes con detección de duplicados y preview previo
- Asignación de educadores con rol (TITULAR / SUPLENTE)
- Filtros por período académico y estado (activo/inactivo)
- Soft delete en grupos y asignaciones (el historial se preserva)

**Reglas de negocio clave:**

- Un educador puede estar en múltiples grupos simultáneamente
- Un estudiante puede estar en múltiples grupos
- Remover un estudiante del grupo lo desactiva (no elimina su historial de notas/asistencias)
- `EDUCADOR` solo puede ver sus grupos propios (`/educadores/me/grupos`)

---

### 2.3 Asistencias

**Qué resuelve**: registro diario de asistencias y consulta del historial.

**Funcionalidades:**

- Registro diario por grupo y fecha: PRESENTE, AUSENTE, TARDANZA, JUSTIFICADO
- Edición retroactiva (requiere observación obligatoria)
- Resumen mensual por grupo: porcentaje de asistencia por estudiante
- Vista del estudiante: historial filtrado por mes/año con resumen consolidado
- Carga rápida desde UI: grilla estudiante × estado, guardado masivo

**Cálculo de asistencia:**

```
% = (PRESENTE + JUSTIFICADO) / total_registros × 100
```

**Reglas de negocio clave:**

- Solo educadores asignados activamente al grupo pueden registrar asistencias
- El registro es idempotente (upsert por grupo + estudiante + fecha)
- Solo estudiantes activos en el grupo aparecen en la nómina

---

### 2.4 Calificaciones

**Qué resuelve**: carga y consulta de notas académicas.

**Funcionalidades:**

- Carga masiva de calificaciones por grupo + período + materia (upsert)
- Validación contra la escala institucional (no se puede cargar nota fuera del rango)
- Vista del educador: tabla editable con notas actuales
- Vista del estudiante: mis calificaciones filtradas por período
- Exportación CSV

**Reglas de negocio clave:**

- Una calificación es única por: grupo + estudiante + período + materia
- `EDUCADOR` solo accede a grupos donde está asignado activamente
- La materia es texto libre (no hay un catálogo de materias — flexibilidad para distintos tipos de instituciones)

---

### 2.5 Comunicados

**Qué resuelve**: comunicación institucional hacia toda la comunidad educativa.

**Funcionalidades:**

- Creación de comunicados con tipo y prioridad:
  - Tipos: GENERAL, ACADEMICO, ADMINISTRATIVO, EVENTO, URGENTE
  - Prioridades: BAJA, NORMAL, ALTA, URGENTE
- Listado filtrado por tipo y prioridad
- Edición y archivado (soft delete)
- Vista unificada para todos los roles

**Reglas de negocio clave:**

- Solo el autor o un ADMIN_ESCUELA/SUPER_ADMIN puede editar
- Solo ADMIN_ESCUELA/SUPER_ADMIN puede archivar (no el autor)
- La institución se resuelve automáticamente según el rol:
  - ADMIN: por su perfil de institución
  - EDUCADOR: por su primer GrupoEducador activo
  - ESTUDIANTE: por su primer GrupoEstudiante activo

---

### 2.6 Boletín Académico

**Qué resuelve**: informe académico consolidado del estudiante por período.

**Funcionalidades:**

- Generación del boletín para un grupo + período específico
- Consolida calificaciones y asistencias en un solo documento
- Cálculo de promedio y estado de aprobación (según escala institucional)
- Imprimible / exportable como PDF desde el navegador
- Placeholders para firma docente y sello institucional

**Estructura del boletín:**

```
Estudiante: [nombre]
Institución: [nombre]
Período: [nombre] ([fechas])
Grupo: [nombre]

Calificaciones:
  Materia | Nota | Observaciones

Asistencia:
  Total | Presente | Ausente | Tardanza | Justificado | %

Escala: nota mín [x] — nota máx [y] — aprobación [z]
```

---

### 2.7 Reportes (Admin/Educador)

**Qué resuelve**: informes de rendimiento grupal para toma de decisiones.

**Reportes disponibles:**

- **Reporte de asistencia por grupo**: resumen por estudiante con totales y porcentaje
- **Reporte de rendimiento por grupo**: promedio de calificaciones por estudiante
- **Exportación CSV de asistencia**: descargable directamente

**Acceso**: ADMIN_ESCUELA y EDUCADOR (solo sus grupos)

---

## 3. Modelo de Datos

```
Institucion
  ├── PeriodoAcademico (ciclos lectivos)
  ├── EscalaCalificacion (nota mín/máx/aprobación)
  ├── Grupo
  │     ├── GrupoEstudiante (activo, asignadoPor)
  │     ├── GrupoEducador (rol: TITULAR/SUPLENTE, activo)
  │     ├── Asistencia (fecha, estado, observaciones)
  │     └── Calificacion (periodoId, materia, nota, observaciones)
  └── Comunicado (tipo, prioridad, archivado)
```

Todos los borrados son **soft deletes** (campo `activo` o `archivado`). Ninguna entidad se elimina físicamente.

---

## 4. Seguridad y Multi-tenancy

| Rol           | Alcance                                              |
| ------------- | ---------------------------------------------------- |
| SUPER_ADMIN   | Todas las instituciones                              |
| ADMIN_ESCUELA | Solo su institución (verificado en cada endpoint)    |
| EDUCADOR      | Solo grupos donde está asignado activamente          |
| ESTUDIANTE    | Solo sus propios datos (notas, asistencias, boletín) |

La resolución de institución es automática en la mayoría de endpoints: el backend la infiere del usuario autenticado, sin que el frontend deba enviarla.

---

## 5. Superficies UI

| Página                  | Ruta                                                       | Roles                   |
| ----------------------- | ---------------------------------------------------------- | ----------------------- |
| Lista de grupos         | `/dashboard/grupos`                                        | ADMIN_ESCUELA           |
| Crear/editar grupo      | `/dashboard/grupos/nuevo`, `/dashboard/grupos/[id]/editar` | ADMIN_ESCUELA           |
| Asignar estudiantes     | `/dashboard/grupos/[id]/estudiantes`                       | ADMIN_ESCUELA           |
| Asignar educadores      | `/dashboard/grupos/[id]/educadores`                        | ADMIN_ESCUELA           |
| Carga de asistencias    | `/dashboard/asistencias`                                   | ADMIN_ESCUELA, EDUCADOR |
| Carga de calificaciones | `/dashboard/calificaciones`                                | ADMIN_ESCUELA, EDUCADOR |
| Comunicados             | `/dashboard/comunicados`                                   | Todos                   |
| Crear comunicado        | `/dashboard/comunicados/nuevo`                             | ADMIN_ESCUELA, EDUCADOR |
| Mi boletín              | `/dashboard/mi-boletin`                                    | ESTUDIANTE              |
| Mis notas               | `/dashboard/mis-notas`                                     | ESTUDIANTE              |
| Mi asistencia           | `/dashboard/mi-asistencia`                                 | ESTUDIANTE              |

---

## 6. Cobertura de Tests

Cada submódulo incluye:

- Tests de **service** (lógica de negocio, validaciones, casos borde)
- Tests de **controller** (endpoints, guards, transformaciones)
- Tests de **componentes UI** (GruposList, GrupoForm, AsignarEstudiantesModal, etc.)

---

## 7. Limitaciones Conocidas y Decisiones de Diseño

- **Materias como texto libre**: no hay catálogo de materias. Esto da flexibilidad a distintos tipos de instituciones pero dificulta análisis cruzados por materia.
- **Un período activo a la vez**: la lógica de negocio asume un período activo por institución en los flujos principales.
- **Sin notificaciones automáticas para comunicados**: los comunicados son visibles al ingresar al dashboard, no se envían notificaciones push.
- **Boletín sin firma digital**: los campos de firma docente y sello son placeholders para implementación futura.
- **Sin historial de edición en calificaciones**: se guarda la última nota, no el historial de cambios.

---

## 8. Issues Relacionados

| Issue           | Descripción                                               | Fase    |
| --------------- | --------------------------------------------------------- | ------- |
| F4-001 a F4-016 | Implementación base del módulo escolar (admin/educador)   | Fase 4  |
| #101 F4b-001    | Vista del estudiante — mis calificaciones y mi asistencia | Fase 4b |
| #102 F4b-002    | Boletín académico descargable por periodo                 | Fase 4b |
| #103 F4b-003    | Comunicados institucionales — API y UI completa           | Fase 4b |
| #104 F4b-004    | Reportes de asistencia y rendimiento académico (admin)    | Fase 4b |
