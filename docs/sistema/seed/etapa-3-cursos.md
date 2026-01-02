# Etapa 3: Cursos, Lecciones y Recursos

> **Estado**: ✅ Completado
> **Fecha**: 2025-12-30
> **Issue**: [#25](https://github.com/informaticadiaz/amauta/issues/25)

## Resumen

Esta etapa crea el contenido educativo principal: cursos con lecciones de diferentes tipos y recursos adjuntos.

## ¿Qué se logró?

### Cursos Creados

Se crearon **6 cursos** con diferentes estados y niveles:

| Curso                 | Educador        | Categoría     | Nivel        | Estado    |
| --------------------- | --------------- | ------------- | ------------ | --------- |
| Álgebra Básica        | Ana Martínez    | Matemáticas   | PRINCIPIANTE | PUBLICADO |
| Geometría Plana       | Ana Martínez    | Matemáticas   | INTERMEDIO   | BORRADOR  |
| Comprensión Lectora   | Pedro Sánchez   | Lengua y Lit. | PRINCIPIANTE | PUBLICADO |
| Taller de Redacción   | Pedro Sánchez   | Lengua y Lit. | INTERMEDIO   | REVISION  |
| Biología Celular      | Laura Fernández | Ciencias Nat. | PRINCIPIANTE | PUBLICADO |
| Introducción a Física | Laura Fernández | Ciencias Nat. | AVANZADO     | BORRADOR  |

### Lecciones Creadas

Se crearon **15 lecciones** de diferentes tipos:

| Tipo        | Cantidad | Descripción                               |
| ----------- | -------- | ----------------------------------------- |
| VIDEO       | 5        | Videos con transcript y URL               |
| TEXTO       | 6        | Contenido en markdown                     |
| QUIZ        | 3        | Evaluaciones con preguntas y respuestas   |
| INTERACTIVO | 1        | Actividades (arrastrar, escritura guiada) |

### Recursos Creados

Se crearon **8 recursos** adjuntos:

| Recurso                           | Tipo  | Lección                   |
| --------------------------------- | ----- | ------------------------- |
| Guía de introducción al álgebra   | PDF   | ¿Qué es el álgebra?       |
| Plantillas de figuras geométricas | PDF   | Intro a la geometría      |
| Checklist de comprensión lectora  | PDF   | Estrategias de lectura    |
| Textos de práctica adicionales    | PDF   | Práctica de comprensión   |
| Plantilla de párrafo              | PDF   | Estructura de un párrafo  |
| Infografía de la célula           | Image | La célula: unidad de vida |
| Diagrama interactivo de la célula | PDF   | Partes de la célula       |
| Línea del tiempo de la física     | PDF   | ¿Qué es la física?        |

## Estructura de un Curso

```
Curso: Álgebra Básica
├── Información
│   ├── Título: "Álgebra Básica"
│   ├── Slug: "algebra-basica"
│   ├── Categoría: Matemáticas
│   ├── Nivel: PRINCIPIANTE
│   ├── Duración: 180 minutos
│   └── Estado: PUBLICADO
│
└── Lecciones
    ├── 1. ¿Qué es el álgebra? (VIDEO, 15 min)
    │   └── Recurso: Guía de introducción (PDF)
    ├── 2. Variables y constantes (TEXTO, 20 min)
    └── 3. Evaluación: Conceptos básicos (QUIZ, 15 min)
```

## Tipos de Contenido

### Lección tipo VIDEO

```json
{
  "videoUrl": "https://example.com/videos/intro-algebra.mp4",
  "transcript": "El álgebra es una rama de las matemáticas..."
}
```

### Lección tipo TEXTO

```json
{
  "markdown": "# Variables y Constantes\n\n## ¿Qué es una variable?..."
}
```

### Lección tipo QUIZ

```json
{
  "preguntas": [
    {
      "pregunta": "¿Qué es una variable?",
      "opciones": ["Opción A", "Opción B", "Opción C"],
      "respuestaCorrecta": 1
    }
  ],
  "puntajeMinimo": 2,
  "intentosPermitidos": 3
}
```

### Lección tipo INTERACTIVO

```json
{
  "tipo": "arrastra-y-suelta",
  "instrucciones": "Arrastra cada figura...",
  "elementos": [...],
  "zonas": [...]
}
```

## Estados de Curso

| Estado    | Significado              | Cantidad |
| --------- | ------------------------ | -------- |
| PUBLICADO | Visible para estudiantes | 3        |
| BORRADOR  | En desarrollo            | 2        |
| REVISION  | Pendiente de aprobación  | 1        |

## Beneficios Obtenidos

Al completar esta etapa:

1. Los **estudiantes** pueden ver 3 cursos publicados
2. Los **educadores** tienen ejemplos de contenido variado
3. Se puede probar la navegación de cursos/lecciones
4. Hay contenido listo para las inscripciones (Etapa 4)

## Archivos Creados

- `apps/api/prisma/seeds/cursos.ts`

## Datos en Producción

| Modelo  | Cantidad |
| ------- | -------- |
| Curso   | 6        |
| Leccion | 15       |
| Recurso | 8        |

## Próxima Etapa

**Etapa 4**: [Inscripciones y Progreso](etapa-4-inscripciones.md)

- Inscribir estudiantes a cursos
- Crear registros de progreso en lecciones
- Simular avance de aprendizaje

---

**Implementado por**: Claude Code
**Commit**: `a3dcf88`
