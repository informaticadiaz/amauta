# Skill: Functional Docs

> Genera documentación funcional orientada a usuarios finales. Explica qué hace cada módulo, qué funcionalidades están disponibles, cómo usarlas. Alcance: un módulo o todo el sistema.
>
> **Referencia**: `docs/ai-context/modules/`, `apps/api/src/`, `apps/web/src/app/`,
> `docs/sistema/README.md`.

---

## Uso

```
Documenta [scope]
```

**Ejemplos:**

```
Documenta el módulo de cursos
Documenta el módulo de evaluaciones
Documenta todos los módulos implementados
Actualiza la documentación funcional del sistema
¿Qué funcionalidades tiene el módulo de inscripciones?
```

---

## Parámetros

| Parámetro | Descripción                                                  | Ejemplo            |
| --------- | ------------------------------------------------------------ | ------------------ |
| `scope`   | Qué documentar: módulo específico, varios módulos, o "todos" | `módulo de cursos` |
| `modo`    | (Opcional) `generar` (nuevo) o `actualizar` (existente)      | `actualizar`       |

---

## Proceso de Documentación (Ejecutar en Orden)

### PASO 0 — Identificar el Scope

Si el scope es un **módulo específico**:

- Identificar el nombre del módulo (ej: `cursos`, `evaluaciones`, `inscripciones`)
- Verificar que existe en `apps/api/src/[modulo]/` o `apps/web/src/`

Si el scope es **"todos"** o **"sistema completo"**:

- Listar todos los módulos implementados desde `docs/ai-context/modules/`
- Documentar cada uno en orden

```bash
ls docs/ai-context/modules/
```

---

### PASO 1 — Cargar Contexto del Módulo

Para cada módulo a documentar, leer en este orden:

```
LEER: docs/ai-context/modules/[modulo].md (si existe) — contexto técnico
LEER: apps/api/src/[modulo]/[modulo].controller.ts — endpoints disponibles
LEER: apps/api/src/[modulo]/[modulo].service.ts — lógica de negocio
```

Para funcionalidades de **frontend**:

```
LEER: apps/web/src/app/[ruta]/page.tsx — páginas del módulo
LEER: apps/web/src/components/[modulo]/ — componentes relacionados
```

Para entender el **modelo de datos**:

```
LEER: apps/api/prisma/schema.prisma — buscar el modelo correspondiente
```

---

### PASO 2 — Identificar Funcionalidades

Extraer de cada módulo:

#### 2.1 Funcionalidades del Backend (API)

Por cada endpoint en el controller, identificar:

| Método | Ruta        | ¿Qué hace?                | ¿Quién puede usarlo? |
| ------ | ----------- | ------------------------- | -------------------- |
| GET    | /cursos     | Lista todos los cursos    | Todos                |
| POST   | /cursos     | Crea un nuevo curso       | EDUCADOR, ADMIN      |
| GET    | /cursos/:id | Ve el detalle de un curso | Todos                |
| ...    | ...         | ...                       | ...                  |

#### 2.2 Funcionalidades del Frontend (Páginas)

Por cada página, identificar:

| Página                  | ¿Qué puede hacer el usuario?       | Rol requerido |
| ----------------------- | ---------------------------------- | ------------- |
| /cursos                 | Ver catálogo de cursos disponibles | Público       |
| /cursos/[slug]          | Ver detalle de un curso            | Público       |
| /dashboard/cursos/crear | Crear un nuevo curso               | EDUCADOR      |
| ...                     | ...                                | ...           |

#### 2.3 Estados y Flujos

Identificar los estados posibles de las entidades:

```
Ejemplo para Curso:
- BORRADOR → El curso está en edición, no visible
- REVISION → Pendiente de aprobación
- PUBLICADO → Visible para estudiantes
- ARCHIVADO → Oculto, no se puede inscribir
```

---

### PASO 3 — Traducir a Lenguaje No Técnico

Transformar la información técnica en descripciones comprensibles:

**Reglas de traducción:**

| Término Técnico    | Traducción para Usuario                   |
| ------------------ | ----------------------------------------- |
| Endpoint GET       | "Puedes ver..."                           |
| Endpoint POST      | "Puedes crear..."                         |
| Endpoint PUT/PATCH | "Puedes modificar..."                     |
| Endpoint DELETE    | "Puedes eliminar..."                      |
| Guard/Auth         | "Necesitas estar logueado como..."        |
| Validación         | "El sistema verifica que..."              |
| Relación (FK)      | "Está asociado a..."                      |
| Estado BORRADOR    | "Solo tú puedes verlo mientras lo editas" |
| Estado PUBLICADO   | "Visible para todos"                      |
| Paginación         | "Se muestran de a X resultados"           |

**Ejemplo de transformación:**

```
TÉCNICO:
POST /api/v1/cursos
@Roles(Rol.EDUCADOR, Rol.ADMIN_ESCUELA)
Body: CreateCursoDto (titulo, descripcion, nivel, categoriaId)

NO TÉCNICO:
## Crear un Curso
Como educador o administrador, puedes crear un nuevo curso desde
el panel de gestión. Debes completar:
- Título del curso
- Descripción
- Nivel (Principiante, Intermedio, Avanzado)
- Categoría

El curso se crea en estado "Borrador" hasta que lo publiques.
```

---

### PASO 4 — Verificar Estado de Implementación

Para cada funcionalidad, verificar si está:

- ✅ **Implementada y funcional**: existe código, tests pasan
- 🚧 **En desarrollo**: existe código parcial o issue abierto
- 📋 **Planificada**: existe en roadmap pero no hay código
- ❌ **No disponible**: no está en el roadmap actual

```bash
# Verificar si hay tests
ls apps/api/src/[modulo]/*.spec.ts

# Verificar si hay issues relacionados
gh issue list --search "[modulo]" --limit 10
```

---

### PASO 5 — Generar el Documento Funcional

Crear o actualizar el documento en `docs/sistema/modulos/[modulo].md`:

---

## Plantilla del Documento Funcional

```markdown
# [Nombre del Módulo]

> [Descripción en una oración de qué hace este módulo]

**Estado**: ✅ Funcional / 🚧 En desarrollo / 📋 Planificado
**Última actualización**: [fecha]

---

## ¿Qué puedo hacer?

### Como Estudiante

- [ funcionalidad 1 ]
- [ funcionalidad 2 ]
- ...

### Como Educador

- [ funcionalidad 1 ]
- [ funcionalidad 2 ]
- ...

### Como Administrador

- [ funcionalidad 1 ]
- [ funcionalidad 2 ]
- ...

---

## Funcionalidades Detalladas

### [Nombre de la funcionalidad]

**¿Qué es?**
[Explicación simple de qué hace]

**¿Cómo accedo?**
[Dónde encontrarlo en la interfaz o URL]

**¿Quién puede usarlo?**
[Roles permitidos]

**¿Qué necesito?**
[Requisitos previos, datos necesarios]

**Estados posibles**
[Si aplica, explicar los estados]

---

## Flujos Comunes

### [Nombre del flujo]

1. [Paso 1]
2. [Paso 2]
3. [Paso 3]
   ...

---

## Preguntas Frecuentes

### ¿[Pregunta común 1]?

[Respuesta]

### ¿[Pregunta común 2]?

[Respuesta]

---

## Limitaciones Conocidas

- [Limitación 1]
- [Limitación 2]

---

## Próximas Mejoras

- [ ] [Mejora planificada 1]
- [ ] [Mejora planificada 2]
```

---

### PASO 6 — Actualizar Índice del Sistema

Después de crear/actualizar documentos, actualizar `docs/sistema/README.md`:

1. Agregar el nuevo módulo a la tabla de funcionalidades
2. Actualizar el estado si cambió
3. Actualizar la fecha de última modificación

---

### PASO 7 — Resumen Final

Producir un resumen de lo documentado:

```markdown
## Documentación Generada

| Módulo   | Archivo                            | Estado   | Funcionalidades |
| -------- | ---------------------------------- | -------- | --------------- |
| [nombre] | `docs/sistema/modulos/[nombre].md` | ✅/🚧/📋 | N               |

**Archivos creados/actualizados:**

- `docs/sistema/modulos/[nombre].md` — [creado/actualizado]
- `docs/sistema/README.md` — actualizado índice

**Próximos pasos sugeridos:**

- [sugerencia 1]
- [sugerencia 2]
```

---

## Modos de Uso

### Modo: Generar (nuevo documento)

```
Documenta el módulo de evaluaciones
```

Crea un documento nuevo desde cero analizando el código.

### Modo: Actualizar (documento existente)

```
Actualiza la documentación del módulo de cursos
```

Lee el documento existente y lo actualiza con nuevas funcionalidades.

### Modo: Consulta rápida

```
¿Qué funcionalidades tiene el módulo de inscripciones?
```

No genera documento, solo responde con un resumen de las funcionalidades.

### Modo: Sistema completo

```
Documenta todos los módulos implementados
```

Genera documentos para todos los módulos en `docs/ai-context/modules/`.

---

## Estructura de Carpetas

```
docs/sistema/
├── README.md                 ← Índice general (actualizar siempre)
├── modulos/                  ← Documentación funcional por módulo
│   ├── cursos.md
│   ├── lecciones.md
│   ├── inscripciones.md
│   ├── progreso.md
│   ├── evaluaciones.md
│   └── ...
├── roles-permisos.md         ← Existente
├── autenticacion.md          ← Existente
└── seed/                     ← Existente
```

---

## Criterios de Calidad

| Criterio                 | Verificación                                                 |
| ------------------------ | ------------------------------------------------------------ |
| **Lenguaje no técnico**  | Sin términos como endpoint, API, controller, service, DTO    |
| **Orientado a acciones** | "Puedes crear...", "Puedes ver...", no "El sistema tiene..." |
| **Roles claros**         | Cada funcionalidad indica quién puede usarla                 |
| **Estados explicados**   | Si hay estados, explicar qué significa cada uno              |
| **Flujos paso a paso**   | Los flujos comunes tienen pasos numerados                    |
| **Actualizado**          | Refleja el código actual, no versiones antiguas              |

---

## Notas

- **Foco en el usuario**: La documentación debe responder "¿qué puedo hacer?" no "¿cómo está construido?"
- **Sin código**: No incluir snippets de código, comandos, ni referencias a archivos
- **Capturas opcionales**: Si hay capturas de pantalla, incluirlas en `docs/sistema/assets/`
- **Versionado**: Mantener fecha de última actualización en cada documento
- **Consistencia**: Usar la misma estructura en todos los documentos de módulos
