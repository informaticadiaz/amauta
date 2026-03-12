# Skill: NotebookLM Cuadernos

> Genera un cuaderno de estudio en markdown sobre un tema de programación, listo para importar en NotebookLM. El contenido es completamente genérico — sin referencias a proyectos, datos o configuraciones específicas.

---

## Uso

```
Genera un cuaderno de estudio sobre [tema] para NotebookLM
```

**Ejemplos:**

```
Genera un cuaderno de estudio sobre TDD para NotebookLM

Genera un cuaderno de estudio sobre Docker Networking para NotebookLM

Genera un cuaderno de estudio sobre SOLID Principles para NotebookLM

Genera un cuaderno de estudio sobre PostgreSQL Indexes para NotebookLM

Genera un cuaderno de estudio sobre JWT y autenticación para NotebookLM
```

---

## Parámetros

| Parámetro  | Descripción                                      | Ejemplo              | Default       |
| ---------- | ------------------------------------------------ | -------------------- | ------------- |
| `tema`     | Tema de programación a estudiar                  | `TDD`                | —             |
| `nivel`    | Profundidad del contenido                        | `introductorio`      | `intermedio`  |
| `categoria`| Clasificación del tema                           | `testing`            | auto-detectar |

**Niveles disponibles:**
- `introductorio` — Conceptos básicos, analogías simples, ejemplos mínimos
- `intermedio` — Conceptos + patrones + ejemplos reales (default)
- `avanzado` — Profundidad, edge cases, trade-offs, comparativas

**Categorías disponibles:**

| Categoría       | Temas de ejemplo                                       |
| --------------- | ------------------------------------------------------ |
| `patrones`      | Design Patterns, SOLID, Clean Architecture, DDD        |
| `infraestructura` | Docker, CI/CD, Kubernetes, Networking, Reverse Proxy |
| `lenguajes`     | TypeScript, SQL, Python, Rust, conceptos de lenguajes  |
| `arquitectura`  | Microservicios, Monolito, Event-driven, CQRS           |
| `testing`       | TDD, BDD, testing de integración, mocking, E2E         |
| `seguridad`     | OWASP, JWT, OAuth, criptografía, autenticación         |
| `bases-de-datos`| Indexes, queries, ORM, migraciones, transacciones      |
| `ia`            | LLMs, prompting, agentes, RAG, fine-tuning             |

---

## Dónde Guardar el Archivo

```
docs/NotebookLM/[categoria]/[NNN]-[nombre-del-tema].md
```

El número `NNN` es el siguiente correlativo dentro de la categoría. Si la carpeta no existe, crearla.

**Ejemplos:**
```
docs/NotebookLM/testing/001-tdd-test-driven-development.md
docs/NotebookLM/infraestructura/001-docker-networking.md
docs/NotebookLM/patrones/001-solid-principles.md
docs/NotebookLM/seguridad/001-jwt-autenticacion.md
```

---

## Estructura del Cuaderno a Generar

El documento generado debe seguir esta estructura exacta:

---

### Plantilla

```markdown
# [Título del Tema]

> [Una oración que describe qué es y por qué importa]

---

## ¿Qué es [Tema]?

[2-3 párrafos explicando el concepto desde cero, sin asumir conocimiento previo del tema específico]

---

## Modelo Mental: La Analogía

```
[Analogía visual o diagrama ASCII que hace el concepto intuitivo]
[Usar comparaciones con cosas cotidianas o conceptos que cualquier dev conoce]
```

[Explicación de la analogía en 1-2 párrafos]

---

## Conceptos Clave

### [Concepto 1]

[Explicación + por qué importa]

```[lenguaje]
// Ejemplo de código mínimo que ilustra el concepto
// Los identificadores son genéricos: User, Order, Product, etc.
// Sin nombres de proyectos ni configuraciones específicas
```

### [Concepto 2]

[Ídem]

### [Concepto n]

[Ídem]

---

## Cómo Funciona en la Práctica

### Caso 1: [Escenario común]

[Descripción del escenario]

```[lenguaje]
// Código de ejemplo del escenario
```

### Caso 2: [Escenario más complejo]

[Descripción]

```[lenguaje]
// Código
```

---

## Comparativa: Con vs Sin [Tema]

| Aspecto          | Sin [Tema]            | Con [Tema]             |
| ---------------- | --------------------- | ---------------------- |
| [Aspecto 1]      | [Problema]            | [Solución]             |
| [Aspecto 2]      | [Problema]            | [Solución]             |
| [Aspecto 3]      | [Problema]            | [Solución]             |

---

## Errores Comunes

### ❌ Error 1: [Nombre del error]

```[lenguaje]
// Ejemplo del error
```

**Por qué es un problema:** [Explicación]

**Solución:**

```[lenguaje]
// Ejemplo corregido
```

### ❌ Error 2: [Nombre del error]

[Ídem]

---

## Cuándo Usar (y Cuándo No)

### ✅ Usar cuando:
- [Situación 1]
- [Situación 2]
- [Situación 3]

### ❌ No usar cuando:
- [Situación 1]
- [Situación 2]

---

## Preguntas de Estudio

> Estas preguntas están diseñadas para hacerle a NotebookLM después de cargar este documento.

**Conceptuales:**
1. ¿Qué problema resuelve [Tema] y cuándo surgió la necesidad?
2. ¿Cuál es la diferencia entre [Concepto A] y [Concepto B] dentro de [Tema]?
3. ¿Por qué [Principio fundamental] es importante en [Tema]?

**Prácticas:**
4. ¿Cómo implementarías [Tema] en un sistema de [tipo de sistema genérico]?
5. ¿Qué pasa si ignoras [Tema] en un proyecto que crece con el tiempo?
6. Dame un ejemplo paso a paso de [flujo principal del tema].

**Comparativas:**
7. ¿Cuáles son los trade-offs entre [opción A] y [opción B]?
8. ¿En qué se diferencia [Tema] de [tema relacionado]?

---

## Prompt para Audio Overview (NotebookLM)

> Copiar este prompt en la sección "Customize" del Audio Overview de NotebookLM.

```
Genera una conversación educativa sobre "[Tema]" basada en este documento.

AUDIENCIA: Desarrolladores de software que quieren entender [Tema] en profundidad.

PUNTOS CLAVE A CUBRIR:
- Qué es [Tema] y qué problema resuelve
- [Concepto clave 1] explicado con la analogía del documento
- [Concepto clave 2] con ejemplos de código concretos
- Los errores más comunes y cómo evitarlos
- Cuándo tiene sentido aplicar [Tema] y cuándo no

ESTILO:
- Didáctico, con ejemplos prácticos de código
- Analogías accesibles para cualquier desarrollador
- Honesto sobre las limitaciones y trade-offs

TONO: Educativo, claro, sin hype. Incluir ejemplos que cualquier dev reconozca.
DURACIÓN: 8-10 minutos
```

---

## Referencias

### Conceptos Relacionados
- [Tema relacionado 1] — [por qué se relaciona]
- [Tema relacionado 2] — [por qué se relaciona]

### Para Profundizar
- [Libro o recurso estándar del tema]
- [Documentación oficial si aplica]
- [Artículo o video de referencia conocido]
```

---

## Reglas de Contenido

### Lo que DEBE incluir el cuaderno:
- Código de ejemplo con identificadores genéricos (`User`, `Order`, `Product`, `Service`, `Repository`)
- Analogías cotidianas que hagan el concepto intuitivo
- Comparativas antes/después o con/sin
- Errores comunes reales, no inventados
- Preguntas diseñadas para sacarle valor a NotebookLM

### Lo que NO debe incluir:
- ❌ Nombres de proyectos reales (ni el proyecto donde vive este skill)
- ❌ URLs, IPs o configuraciones específicas de entornos
- ❌ Nombres de personas o empresas como ejemplos
- ❌ Datos sensibles de ningún tipo
- ❌ Opiniones sobre tecnologías sin fundamento técnico
- ❌ Contenido copiado de documentación oficial sin adaptación

### Sobre el código de ejemplo:
- Usar TypeScript o el lenguaje más natural para el tema
- Identificadores en inglés, comentarios en español
- Ejemplos auto-contenidos, que se entiendan sin contexto externo
- Preferir ejemplos realistas sobre ejemplos triviales (`foo/bar`)

---

## Checklist Post-Generación

- [ ] El archivo está en `docs/NotebookLM/[categoria]/[NNN]-[tema].md`
- [ ] No hay referencias a proyectos, empresas o datos específicos
- [ ] Todos los ejemplos de código compilan o son sintácticamente válidos
- [ ] Las preguntas de estudio son relevantes y abiertas (no sí/no)
- [ ] El prompt de Audio Overview está adaptado al tema específico
- [ ] La sección "Cuándo usar / Cuándo no" tiene al menos 2 items en cada lista
- [ ] Los errores comunes son reales y tienen su corrección
