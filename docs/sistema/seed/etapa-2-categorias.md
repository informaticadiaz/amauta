# Etapa 2: Categorías, Instituciones y Grupos

> **Estado**: ✅ Completado
> **Fecha**: 2025-12-30
> **Issue**: [#24](https://github.com/informaticadiaz/amauta/issues/24)

## Resumen

Esta etapa crea la estructura organizativa del sistema: categorías para clasificar cursos, instituciones educativas y grupos de estudiantes.

## ¿Qué se logró?

### Categorías Creadas

Se crearon **6 categorías** curriculares:

| Categoría           | Descripción                                       | Icono      |
| ------------------- | ------------------------------------------------- | ---------- |
| Matemáticas         | Álgebra, geometría, cálculo y estadística         | calculator |
| Lengua y Literatura | Gramática, comprensión lectora, redacción         | book-open  |
| Ciencias Naturales  | Biología, física, química y astronomía            | flask      |
| Ciencias Sociales   | Historia, geografía, educación cívica             | globe      |
| Arte                | Plástica, música y expresión artística            | palette    |
| Tecnología          | Informática, programación, herramientas digitales | laptop     |

### Instituciones Creadas

Se crearon **2 instituciones** educativas:

| Institución                   | Tipo    | Ciudad       | Admin        |
| ----------------------------- | ------- | ------------ | ------------ |
| Escuela Primaria Belgrano     | ESCUELA | Buenos Aires | María García |
| Colegio Secundario San Martín | COLEGIO | Córdoba      | Carlos López |

### Grupos Creados

Se crearon **4 grupos** (clases):

| Grupo       | Institución | Educador        | Estudiantes                    |
| ----------- | ----------- | --------------- | ------------------------------ |
| 4to Grado A | Belgrano    | Ana Martínez    | Juan Pérez, Sofía Rodríguez    |
| 5to Grado B | Belgrano    | Pedro Sánchez   | (vacío)                        |
| 1er Año A   | San Martín  | Laura Fernández | Mateo González, Valentina Díaz |
| 2do Año B   | San Martín  | Laura Fernández | (vacío)                        |

### Estudiantes Asignados

Se asignaron **4 estudiantes** a sus grupos:

| Estudiante      | Grupo       | Institución |
| --------------- | ----------- | ----------- |
| Juan Pérez      | 4to Grado A | Belgrano    |
| Sofía Rodríguez | 4to Grado A | Belgrano    |
| Mateo González  | 1er Año A   | San Martín  |
| Valentina Díaz  | 1er Año A   | San Martín  |

## Estructura Organizativa

```
Sistema Amauta
│
├── Escuela Primaria Belgrano (Buenos Aires)
│   ├── Admin: María García
│   ├── Grupo 4°A
│   │   ├── Educador: Ana Martínez (Matemáticas)
│   │   └── Estudiantes: Juan, Sofía
│   └── Grupo 5°B
│       └── Educador: Pedro Sánchez (Lengua)
│
└── Colegio Secundario San Martín (Córdoba)
    ├── Admin: Carlos López
    ├── Grupo 1°A
    │   ├── Educador: Laura Fernández (Ciencias)
    │   └── Estudiantes: Mateo, Valentina
    └── Grupo 2°B
        └── Educador: Laura Fernández (Ciencias)
```

## Beneficios Obtenidos

Al completar esta etapa:

1. Los **educadores** pueden crear cursos y asignarles una categoría
2. Los **administradores** pueden gestionar grupos en su institución
3. Los **estudiantes** están asignados a sus grupos correspondientes
4. Los cursos estarán organizados por categoría

## Archivos Creados

- `apps/api/prisma/seeds/categorias.ts`
- `apps/api/prisma/seeds/instituciones.ts`

## Datos en Producción

| Modelo          | Cantidad |
| --------------- | -------- |
| Categoria       | 6        |
| Institucion     | 2        |
| Grupo           | 4        |
| GrupoEstudiante | 4        |

## Próxima Etapa

**Etapa 3**: [Cursos y Lecciones](etapa-3-cursos.md)

- Crear 6 cursos de ejemplo
- Crear lecciones de diferentes tipos
- Agregar recursos

---

**Implementado por**: Claude Code
**Commit**: `cc6f3f5`
