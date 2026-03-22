# Currícula NAP - Alineación en Amauta

> Documento funcional para entender cómo Amauta se alinea con los NAP (Núcleos de Aprendizajes Prioritarios).

## ¿Qué se logró?

Amauta ahora organiza sus categorías de cursos siguiendo las **áreas curriculares oficiales** de los NAP. Además, se crearon cursos de ejemplo para representar los **tres niveles educativos** (Inicial, Primaria, Secundaria).

## Mapeo de Áreas NAP → Categorías de Amauta

| Área NAP                    | Categoría en Amauta         | Propósito                              |
| --------------------------- | --------------------------- | -------------------------------------- |
| Matemática                  | Matemáticas                 | Habilidades numéricas y razonamiento   |
| Lengua y Literatura         | Lengua y Literatura         | Lectura, escritura y oralidad          |
| Ciencias Naturales          | Ciencias Naturales          | Naturaleza, ambiente y ciencia         |
| Ciencias Sociales           | Ciencias Sociales           | Historia, geografía y sociedad         |
| Educación Artística         | Educación Artística         | Artes visuales, música, danza y teatro |
| Educación Tecnológica       | Educación Tecnológica       | Tecnología y procesos sociotécnicos    |
| Educación Física            | Educación Física            | Movimiento, juego y vida saludable     |
| Formación Ética y Ciudadana | Formación Ética y Ciudadana | Ciudadanía, derechos y convivencia     |

## Cursos de ejemplo por nivel educativo

| Nivel educativo | Curso de ejemplo                    | Categoría          |
| --------------- | ----------------------------------- | ------------------ |
| Inicial         | Juego y Movimiento en Nivel Inicial | Educación Física   |
| Primaria        | Álgebra Básica                      | Matemáticas        |
| Secundaria      | Biología Celular                    | Ciencias Naturales |

> Estos cursos sirven como referencia para construir futuros contenidos alineados con la currícula oficial.

## Decisión sobre el modelo curricular

Por ahora **no se agregó un modelo curricular nuevo** en base de datos. La alineación se resuelve con:

- Categorías curriculares alineadas a NAP
- Cursos de ejemplo con nivel educativo explícito en su descripción

Esto evita cambios en producción mientras se valida el enfoque. Si el proyecto necesita un árbol curricular más detallado (nivel → área → eje → contenidos), se evaluará en una fase posterior.

## Dónde ver el detalle

- Análisis completo de los NAP: `docs/nap/ANALISIS.md`
- Datos de prueba (seed): `docs/sistema/seed/`

---

**Última actualización**: 15/03/2026
