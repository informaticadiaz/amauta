# Etapa 4: Inscripciones y Progreso

> **Estado**: ✅ Completado
> **Fecha**: 2025-12-30
> **Issue**: [#26](https://github.com/informaticadiaz/amauta/issues/26)

## Resumen

Esta etapa simula la interacción de estudiantes con los cursos: inscripciones y progreso de aprendizaje.

## ¿Qué se logró?

### Inscripciones Creadas

Se crearon **12 inscripciones** (3 cursos por estudiante):

| Estudiante      | Cursos Inscritos                       | Completados |
| --------------- | -------------------------------------- | ----------- |
| Juan Pérez      | Álgebra, Comprensión Lectora, Biología | 1           |
| Sofía Rodríguez | Álgebra, Comprensión Lectora, Biología | 0           |
| Mateo González  | Álgebra, Taller Redacción, Biología    | 1           |
| Valentina Díaz  | Geometría, Comprensión Lectora, Física | 0           |

### Estados de Inscripción

| Estudiante      | Curso               | Estado     | Progreso |
| --------------- | ------------------- | ---------- | -------- |
| Juan Pérez      | Álgebra Básica      | COMPLETADO | 100%     |
| Juan Pérez      | Comprensión Lectora | ACTIVO     | 66%      |
| Juan Pérez      | Biología Celular    | ACTIVO     | 33%      |
| Sofía Rodríguez | Álgebra Básica      | ACTIVO     | 50%      |
| Sofía Rodríguez | Comprensión Lectora | ACTIVO     | 0%       |
| Sofía Rodríguez | Biología Celular    | ACTIVO     | 66%      |
| Mateo González  | Álgebra Básica      | COMPLETADO | 100%     |
| Mateo González  | Taller Redacción    | ACTIVO     | 50%      |
| Mateo González  | Biología Celular    | ACTIVO     | 33%      |
| Valentina Díaz  | Geometría Plana     | ACTIVO     | 50%      |
| Valentina Díaz  | Comprensión Lectora | ACTIVO     | 33%      |
| Valentina Díaz  | Intro. Física       | ACTIVO     | 0%       |

### Progreso por Lección

Se crearon **28 registros de progreso**:

**Juan Pérez en Álgebra (COMPLETADO):**

| Lección                      | Estado  | Puntaje |
| ---------------------------- | ------- | ------- |
| ¿Qué es el álgebra? (VIDEO)  | ✅ 100% | -       |
| Variables y constantes       | ✅ 100% | -       |
| Evaluación: Conceptos (QUIZ) | ✅ 100% | 85 pts  |

**Mateo González en Álgebra (COMPLETADO):**

| Lección                      | Estado  | Puntaje |
| ---------------------------- | ------- | ------- |
| ¿Qué es el álgebra? (VIDEO)  | ✅ 100% | -       |
| Variables y constantes       | ✅ 100% | -       |
| Evaluación: Conceptos (QUIZ) | ✅ 100% | 100 pts |

## Flujo de Progreso

```
Estudiante se inscribe a curso
         │
         ▼
    Estado: ACTIVO
    Progreso: 0%
         │
         ▼
Completa lección 1 ───► Progreso: 33%
         │
         ▼
Completa lección 2 ───► Progreso: 66%
         │
         ▼
Completa lección 3 ───► Progreso: 100%
         │
         ▼
    Estado: COMPLETADO
```

## Estadísticas

| Métrica                   | Valor |
| ------------------------- | ----- |
| Total inscripciones       | 12    |
| Inscripciones completadas | 2     |
| Registros de progreso     | 28    |
| Quizzes con puntaje       | 3     |
| Promedio de progreso      | ~45%  |

## Beneficios Obtenidos

Al completar esta etapa:

1. Se puede ver el **dashboard del estudiante** con sus cursos
2. Los **educadores** ven el progreso de sus estudiantes
3. Se puede probar la lógica de **completitud de cursos**
4. Hay datos para reportes y estadísticas

## Archivos Creados

- `apps/api/prisma/seeds/inscripciones.ts`

## Datos en Producción

| Modelo      | Cantidad |
| ----------- | -------- |
| Inscripcion | 12       |
| Progreso    | 28       |

## Próxima Etapa

**Etapa 5**: [Módulo Administrativo](etapa-5-administrativo.md)

- Registros de asistencia
- Calificaciones
- Comunicados institucionales

---

**Implementado por**: Claude Code
**Commit**: `b5273b2`
