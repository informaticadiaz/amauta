# Etapa 4: Inscripciones y Progreso

> **Estado**: ⏳ Pendiente
> **Issue**: [#26](https://github.com/informaticadiaz/amauta/issues/26)
> **Dependencia**: Etapa 3

## Objetivo

Simular la interacción de estudiantes con los cursos: inscripciones y progreso de aprendizaje.

## ¿Qué se logrará?

### Inscripciones

Se crearán **12 inscripciones** (3 cursos por estudiante):

| Estudiante      | Cursos Inscritos                       |
| --------------- | -------------------------------------- |
| Juan Pérez      | Álgebra, Comprensión Lectora, Biología |
| Sofía Rodríguez | Álgebra, Comprensión Lectora, Biología |
| Mateo González  | Álgebra, Taller Redacción, Biología    |
| Valentina Díaz  | Geometría, Comprensión Lectora, Física |

### Estados de Inscripción

| Estudiante      | Curso       | Estado     | Progreso |
| --------------- | ----------- | ---------- | -------- |
| Juan Pérez      | Álgebra     | COMPLETADO | 100%     |
| Juan Pérez      | Comprensión | ACTIVO     | 66%      |
| Juan Pérez      | Biología    | ACTIVO     | 33%      |
| Sofía Rodríguez | Álgebra     | ACTIVO     | 50%      |
| ...             | ...         | ...        | ...      |

### Progreso por Lección

Ejemplo de progreso de Juan Pérez en Álgebra (completado):

| Lección                | Completada | Puntaje |
| ---------------------- | ---------- | ------- |
| ¿Qué es el álgebra?    | ✅ Sí      | -       |
| Variables y constantes | ✅ Sí      | -       |
| Operaciones básicas    | ✅ Sí      | -       |
| Evaluación inicial     | ✅ Sí      | 85%     |

## Flujo de Progreso

```
Estudiante se inscribe a curso
         │
         ▼
    Estado: ACTIVO
    Progreso: 0%
         │
         ▼
Completa lección 1 ───► Progreso: 25%
         │
         ▼
Completa lección 2 ───► Progreso: 50%
         │
         ▼
Completa lección 3 ───► Progreso: 75%
         │
         ▼
Completa lección 4 ───► Progreso: 100%
         │
         ▼
    Estado: COMPLETADO
```

## Datos a Simular

| Dato                  | Cantidad |
| --------------------- | -------- |
| Inscripciones         | 12       |
| Registros de progreso | ~20      |
| Quizzes completados   | 4        |
| Cursos completados    | 2        |

## Beneficios

Al completar esta etapa:

1. Se podrá ver el **dashboard del estudiante** con sus cursos
2. Los **educadores** verán el progreso de sus estudiantes
3. Se podrá probar la lógica de **completitud de cursos**
4. Habrá datos para reportes y estadísticas

## Archivos a Crear

- `apps/api/prisma/seeds/inscripciones.ts`

---

**Fecha estimada**: Por definir
**Prerrequisito**: Etapa 3 completada
