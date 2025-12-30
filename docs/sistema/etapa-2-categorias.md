# Etapa 2: Categorías, Instituciones y Grupos

> **Estado**: ⏳ Pendiente
> **Issue**: [#24](https://github.com/informaticadiaz/amauta/issues/24)
> **Dependencia**: Etapa 1 ✅

## Objetivo

Crear la estructura organizativa del sistema: categorías para clasificar cursos, instituciones educativas y grupos de estudiantes.

## ¿Qué se logrará?

### Categorías de Cursos

Se crearán **6 categorías** para clasificar los cursos:

| Categoría           | Descripción                   | Ejemplo de Cursos                            |
| ------------------- | ----------------------------- | -------------------------------------------- |
| Matemáticas         | Álgebra, geometría, cálculo   | "Álgebra Básica", "Geometría Plana"          |
| Lengua y Literatura | Gramática, redacción, lectura | "Comprensión Lectora", "Taller de Redacción" |
| Ciencias Naturales  | Biología, física, química     | "Biología Celular", "Física Básica"          |
| Ciencias Sociales   | Historia, geografía           | "Historia Argentina"                         |
| Arte                | Plástica, música              | "Introducción al Arte"                       |
| Tecnología          | Informática, programación     | "Programación Básica"                        |

### Instituciones Educativas

Se crearán **2 instituciones**:

| Institución                   | Tipo    | Ubicación    |
| ----------------------------- | ------- | ------------ |
| Escuela Primaria Belgrano     | ESCUELA | Buenos Aires |
| Colegio Secundario San Martín | COLEGIO | Córdoba      |

### Grupos (Clases)

Se crearán **4 grupos**, 2 por institución:

| Grupo | Institución | Educador        |
| ----- | ----------- | --------------- |
| 4°A   | Belgrano    | Ana Martínez    |
| 5°B   | Belgrano    | Pedro Sánchez   |
| 1°A   | San Martín  | Laura Fernández |
| 2°B   | San Martín  | Laura Fernández |

### Asignación de Estudiantes

| Grupo          | Estudiantes                    |
| -------------- | ------------------------------ |
| 4°A Belgrano   | Juan Pérez, Sofía Rodríguez    |
| 1°A San Martín | Mateo González, Valentina Díaz |

## Diagrama de Relaciones

```
Institución
├── Belgrano (Escuela)
│   ├── Grupo 4°A
│   │   ├── Educador: Ana Martínez
│   │   └── Estudiantes: Juan, Sofía
│   └── Grupo 5°B
│       └── Educador: Pedro Sánchez
│
└── San Martín (Colegio)
    ├── Grupo 1°A
    │   ├── Educador: Laura Fernández
    │   └── Estudiantes: Mateo, Valentina
    └── Grupo 2°B
        └── Educador: Laura Fernández
```

## Beneficios

Al completar esta etapa:

1. **Educadores** podrán crear cursos y asignarles una categoría
2. **Administradores** podrán gestionar grupos en su institución
3. **Estudiantes** estarán asignados a sus grupos correspondientes
4. Los cursos estarán organizados por categoría

## Archivos a Crear

- `apps/api/prisma/seeds/categorias.ts`
- `apps/api/prisma/seeds/instituciones.ts`

---

**Fecha estimada**: Por definir
**Prerrequisito**: Etapa 1 completada ✅
