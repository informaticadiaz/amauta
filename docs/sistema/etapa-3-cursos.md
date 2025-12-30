# Etapa 3: Cursos, Lecciones y Recursos

> **Estado**: ⏳ Pendiente
> **Issue**: [#25](https://github.com/informaticadiaz/amauta/issues/25)
> **Dependencia**: Etapa 2

## Objetivo

Crear contenido educativo de ejemplo: cursos con sus lecciones y recursos adjuntos.

## ¿Qué se logrará?

### Cursos de Ejemplo

Se crearán **6 cursos** con diferentes estados:

| Curso                 | Educador        | Categoría   | Estado      |
| --------------------- | --------------- | ----------- | ----------- |
| Álgebra Básica        | Ana Martínez    | Matemáticas | Publicado   |
| Geometría Plana       | Ana Martínez    | Matemáticas | Borrador    |
| Comprensión Lectora   | Pedro Sánchez   | Lengua      | Publicado   |
| Taller de Redacción   | Pedro Sánchez   | Lengua      | En Revisión |
| Biología Celular      | Laura Fernández | Ciencias    | Publicado   |
| Introducción a Física | Laura Fernández | Ciencias    | Borrador    |

### Lecciones

Cada curso tendrá **2-3 lecciones** de diferentes tipos:

| Tipo        | Descripción              | Ejemplo                   |
| ----------- | ------------------------ | ------------------------- |
| VIDEO       | Contenido en video       | "Introducción al Álgebra" |
| TEXTO       | Lectura con markdown     | "Variables y Constantes"  |
| QUIZ        | Evaluación con preguntas | "Evaluación - Unidad 1"   |
| INTERACTIVO | Actividad práctica       | "Ejercicios de Geometría" |

### Recursos

Se agregarán recursos de ejemplo:

- PDFs de apoyo
- Enlaces a videos externos
- Imágenes ilustrativas

## Estructura de un Curso

```
Curso: Álgebra Básica
├── Información
│   ├── Título: "Álgebra Básica"
│   ├── Descripción: "Introducción al álgebra..."
│   ├── Nivel: PRINCIPIANTE
│   ├── Duración: 180 minutos
│   └── Estado: PUBLICADO
│
└── Lecciones
    ├── 1. ¿Qué es el álgebra? (VIDEO, 15 min)
    ├── 2. Variables y constantes (TEXTO, 20 min)
    ├── 3. Operaciones básicas (TEXTO, 25 min)
    └── 4. Evaluación inicial (QUIZ, 15 min)
```

## Estados de Curso

| Estado    | Significado             | Visible para Estudiantes |
| --------- | ----------------------- | ------------------------ |
| BORRADOR  | En desarrollo           | No                       |
| REVISION  | Pendiente de aprobación | No                       |
| PUBLICADO | Disponible              | Sí                       |
| ARCHIVADO | Oculto, ya no se usa    | No                       |

## Beneficios

Al completar esta etapa:

1. Los **estudiantes** podrán ver cursos disponibles
2. Los **educadores** tendrán ejemplos de cómo estructurar cursos
3. Se podrá probar el flujo de navegación de contenidos
4. Habrá contenido para las inscripciones (Etapa 4)

## Archivos a Crear

- `apps/api/prisma/seeds/cursos.ts`

---

**Fecha estimada**: Por definir
**Prerrequisito**: Etapa 2 completada
