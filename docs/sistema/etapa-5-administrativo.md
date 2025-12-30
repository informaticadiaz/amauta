# Etapa 5: Módulo Administrativo

> **Estado**: ⏳ Pendiente
> **Issue**: [#27](https://github.com/informaticadiaz/amauta/issues/27)
> **Dependencia**: Etapa 2

## Objetivo

Completar el seed con datos del módulo administrativo escolar: asistencias, calificaciones y comunicados.

## ¿Qué se logrará?

### Asistencias

Se crearán **~40 registros** de asistencia (últimos 10 días hábiles):

| Estado      | Porcentaje | Descripción          |
| ----------- | ---------- | -------------------- |
| PRESENTE    | 80%        | Asistió normalmente  |
| AUSENTE     | 10%        | No asistió           |
| TARDANZA    | 5%         | Llegó tarde          |
| JUSTIFICADO | 5%         | Ausencia justificada |

Ejemplo de registro:

| Fecha      | Estudiante      | Estado   | Observaciones        |
| ---------- | --------------- | -------- | -------------------- |
| 2025-12-20 | Juan Pérez      | PRESENTE | -                    |
| 2025-12-20 | Sofía Rodríguez | TARDANZA | "Llegó 10 min tarde" |
| 2025-12-19 | Juan Pérez      | PRESENTE | -                    |
| 2025-12-19 | Sofía Rodríguez | AUSENTE  | -                    |

### Calificaciones

Se crearán **16 calificaciones** (4 por estudiante):

| Estudiante      | Materia     | Período       | Nota |
| --------------- | ----------- | ------------- | ---- |
| Juan Pérez      | Matemáticas | 1er Trimestre | 8.5  |
| Juan Pérez      | Lengua      | 1er Trimestre | 7.0  |
| Juan Pérez      | Ciencias    | 1er Trimestre | 9.0  |
| Juan Pérez      | Historia    | 1er Trimestre | 8.0  |
| Sofía Rodríguez | Matemáticas | 1er Trimestre | 9.5  |
| ...             | ...         | ...           | ...  |

### Comunicados Institucionales

Se crearán **4 comunicados**:

| Institución | Tipo      | Prioridad | Título                              |
| ----------- | --------- | --------- | ----------------------------------- |
| Belgrano    | GENERAL   | NORMAL    | "Bienvenidos al ciclo lectivo 2025" |
| Belgrano    | EVENTO    | ALTA      | "Acto del 25 de Mayo"               |
| San Martín  | ACADEMICO | NORMAL    | "Fechas de exámenes finales"        |
| San Martín  | URGENTE   | URGENTE   | "Suspensión de clases por clima"    |

## Flujos Administrativos

### Registro de Asistencia

```
Educador abre lista del día
         │
         ▼
    Grupo: 4°A
    Fecha: Hoy
         │
         ▼
Por cada estudiante:
├── Juan Pérez: [PRESENTE]
├── Sofía Rodríguez: [TARDANZA]
└── Guardar
         │
         ▼
   Registro guardado
```

### Carga de Calificaciones

```
Educador selecciona grupo
         │
         ▼
Selecciona materia y período
         │
         ▼
Ingresa notas:
├── Juan Pérez: 8.5
├── Sofía Rodríguez: 9.5
└── Guardar
         │
         ▼
  Calificaciones guardadas
```

### Publicar Comunicado

```
Admin selecciona institución
         │
         ▼
Completa formulario:
├── Título
├── Contenido
├── Tipo (General/Evento/Urgente)
└── Prioridad
         │
         ▼
  Comunicado publicado
```

## Datos a Crear

| Modelo       | Cantidad |
| ------------ | -------- |
| Asistencia   | ~40      |
| Calificacion | 16       |
| Comunicado   | 4        |

## Beneficios

Al completar esta etapa:

1. El sistema tendrá **datos completos** para todas las funcionalidades
2. Se podrán probar **reportes de asistencia**
3. Los estudiantes verán sus **calificaciones**
4. Se podrá probar la **bandeja de comunicados**

## Archivos a Crear

- `apps/api/prisma/seeds/administrativo.ts`

## Cierre del Seed

Al completar la Etapa 5:

1. ✅ Cerrar issue #27
2. ✅ Cerrar issue #15 (issue padre)
3. ✅ Actualizar documentación
4. ✅ Marcar T-014 como completada

---

**Fecha estimada**: Por definir
**Prerrequisito**: Etapa 2 completada (no depende de 3 y 4)
