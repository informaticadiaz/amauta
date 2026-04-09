# Skill: AI Context Validator

> Verifica que la documentación en `docs/ai-context/` está sincronizada con el código real.
> Detecta archivos faltantes, endpoints inexistentes, modelos desactualizados y documentación obsoleta.
>
> **Alcance**: Toda la carpeta `docs/ai-context/` o un módulo específico.
>
> **Propósito**: Evitar que la IA genere código basado en documentación desactualizada.

---

## Uso

```
Valida el contexto de IA
Valida el contexto del módulo cursos
Valida docs/ai-context
```

**Ejemplos:**

```
Valida que docs/ai-context está sincronizado con el código
Valida el contexto del módulo inscripciones
Valida solo el schema de base de datos
Valida los hooks del frontend
```

---

## Parámetros

| Parámetro | Descripción                                                                   | Ejemplo         |
| --------- | ----------------------------------------------------------------------------- | --------------- |
| `scope`   | Qué validar: `all`, `modules`, `frontend`, `database`, o un módulo específico | `módulo cursos` |

---

## Proceso de Validación (Ejecutar en Orden)

### PASO 0 — Determinar Scope

Si el scope es **todo** (`all` o sin especificar):

- Validar todos los módulos en `docs/ai-context/modules/`
- Validar todos los archivos de frontend en `docs/ai-context/frontend/`
- Validar `docs/ai-context/database/schema.md`
- Validar `docs/ai-context/_index.md`

Si el scope es un **módulo específico**:

- Validar solo `docs/ai-context/modules/{modulo}.md`

Si el scope es **frontend**:

- Validar `docs/ai-context/frontend/pages.md`
- Validar `docs/ai-context/frontend/components.md`
- Validar `docs/ai-context/frontend/hooks.md`

Si el scope es **database**:

- Validar `docs/ai-context/database/schema.md`

---

### PASO 1 — Validar Índice (`_index.md`)

```
LEER: docs/ai-context/_index.md
```

Para cada archivo listado en las tablas del índice:

```bash
# Verificar que cada archivo referenciado existe
ls docs/ai-context/modules/{archivo}.md
ls docs/ai-context/frontend/{archivo}.md
ls docs/ai-context/database/{archivo}.md
```

**Verificaciones:**

- [ ] Todos los archivos listados en el índice existen
- [ ] No hay archivos en las carpetas que no estén en el índice (huérfanos)

**Señales de problema:**

- ❌ Archivo listado en índice no existe
- ⚠️ Archivo existe pero no está en el índice

---

### PASO 2 — Validar Módulos Backend

Para cada archivo en `docs/ai-context/modules/*.md`:

```
LEER: docs/ai-context/modules/{modulo}.md
```

#### 2.1 Verificar archivos del módulo

Extraer la tabla "Archivos del Módulo" y verificar que cada archivo existe:

```bash
# Backend
ls apps/api/src/{modulo}/{modulo}.module.ts
ls apps/api/src/{modulo}/{modulo}.controller.ts
ls apps/api/src/{modulo}/{modulo}.service.ts
ls apps/api/src/{modulo}/dto/*.dto.ts

# Frontend (si está documentado)
ls apps/web/src/app/api/{ruta}/route.ts
ls apps/web/src/app/{ruta}/page.tsx
ls apps/web/src/components/{modulo}/*.tsx
```

**Verificaciones:**

- [ ] Todos los archivos backend listados existen
- [ ] Todos los archivos frontend listados existen
- [ ] No hay archivos importantes en el módulo que no estén documentados

#### 2.2 Verificar endpoints documentados

Extraer la tabla "Endpoints API" del documento.

```
LEER: apps/api/src/{modulo}/{modulo}.controller.ts
```

Para cada endpoint documentado, verificar que existe en el controller:

| Documentado   | Verificar en Controller |
| ------------- | ----------------------- |
| `GET /`       | `@Get()` o `@Get('/')`  |
| `GET /:id`    | `@Get(':id')`           |
| `POST /`      | `@Post()`               |
| `PATCH /:id`  | `@Patch(':id')`         |
| `DELETE /:id` | `@Delete(':id')`        |

**Verificaciones:**

- [ ] Todos los endpoints documentados existen en el controller
- [ ] Los métodos HTTP coinciden (GET, POST, PATCH, DELETE)
- [ ] Las rutas coinciden
- [ ] Los guards/roles documentados coinciden con los decoradores

**Señales de problema:**

- ❌ Endpoint documentado no existe en el controller
- ❌ Método HTTP no coincide
- ⚠️ Endpoint existe en controller pero no está documentado
- ⚠️ Roles/guards no coinciden

#### 2.3 Verificar modelo Prisma documentado

Extraer el bloque de código Prisma del documento.

```
LEER: apps/api/prisma/schema.prisma
```

Comparar:

- Nombre del modelo
- Campos y tipos
- Relaciones
- Enums referenciados

**Verificaciones:**

- [ ] El modelo existe en schema.prisma
- [ ] Los campos documentados existen
- [ ] Los tipos de datos coinciden
- [ ] Las relaciones coinciden
- [ ] Los enums existen y tienen los valores documentados

**Señales de problema:**

- ❌ Modelo no existe en schema.prisma
- ❌ Campo documentado no existe
- ❌ Tipo de dato no coincide
- ⚠️ Campo existe pero no está documentado
- ⚠️ Enum tiene valores diferentes

---

### PASO 3 — Validar Frontend

#### 3.1 Validar páginas (`frontend/pages.md`)

```
LEER: docs/ai-context/frontend/pages.md
```

Para cada ruta documentada:

```bash
ls apps/web/src/app/{ruta}/page.tsx
ls apps/web/src/app/{ruta}/layout.tsx  # si está documentado
```

**Verificaciones:**

- [ ] Todas las páginas documentadas existen
- [ ] Los layouts documentados existen
- [ ] La estructura de carpetas coincide

#### 3.2 Validar componentes (`frontend/components.md`)

```
LEER: docs/ai-context/frontend/components.md
```

Para cada componente documentado:

```bash
ls apps/web/src/components/{carpeta}/{Componente}.tsx
```

**Verificaciones:**

- [ ] Todos los componentes documentados existen
- [ ] Las props documentadas coinciden con la interfaz real

Para verificar props, leer el archivo del componente y comparar:

```
LEER: apps/web/src/components/{carpeta}/{Componente}.tsx
```

Buscar la interfaz de props y comparar con la documentación.

#### 3.3 Validar hooks (`frontend/hooks.md`)

```
LEER: docs/ai-context/frontend/hooks.md
```

Para cada hook documentado:

```bash
ls apps/web/src/hooks/{useHook}.ts
# o
ls apps/web/src/hooks/{useHook}.tsx
```

**Verificaciones:**

- [ ] Todos los hooks documentados existen
- [ ] La firma (parámetros y retorno) coincide

---

### PASO 4 — Validar Schema de Base de Datos

```
LEER: docs/ai-context/database/schema.md
LEER: apps/api/prisma/schema.prisma
```

Para cada modelo documentado en schema.md:

**Verificaciones:**

- [ ] El modelo existe en schema.prisma
- [ ] Todos los campos documentados existen
- [ ] Los tipos de datos coinciden
- [ ] Las relaciones documentadas existen
- [ ] Los enums documentados existen con sus valores

**Verificación de completitud:**

- [ ] Todos los modelos de schema.prisma están documentados
- [ ] Todos los enums de schema.prisma están documentados

**Señales de problema:**

- ❌ Modelo documentado no existe
- ❌ Campo documentado no existe
- ⚠️ Modelo existe pero no está documentado (falta agregar)
- ⚠️ Campo nuevo no documentado

---

### PASO 5 — Detectar Documentación Huérfana

Verificar si hay archivos de contexto que documentan módulos que ya no existen:

```bash
# Listar módulos documentados
ls docs/ai-context/modules/

# Listar módulos reales
ls apps/api/src/
```

Comparar y detectar:

- Módulos documentados que no existen en el código
- Módulos en el código que no tienen documentación

---

### PASO 6 — Generar Informe de Validación

Producir el informe en este formato exacto:

---

## 🔍 Informe de Validación de AI Context

**Fecha:** [fecha actual]
**Scope:** [all / módulo específico / frontend / database]
**Estado general:** [✅ SINCRONIZADO / ⚠️ DESINCRONIZADO PARCIAL / ❌ DESINCRONIZADO]

---

### Resumen Ejecutivo

[2-3 oraciones describiendo el estado general: cuántos archivos validados, cuántos problemas encontrados, riesgo de que la IA genere código incorrecto]

---

### Validación del Índice

| Verificación              | Estado | Notas          |
| ------------------------- | ------ | -------------- |
| Archivos listados existen | ✅/❌  | [detalles]     |
| No hay archivos huérfanos | ✅/⚠️  | [lista si hay] |

---

### Validación de Módulos Backend

#### Módulo: {nombre}

**Archivo de contexto:** `docs/ai-context/modules/{nombre}.md`
**Estado:** ✅ SINCRONIZADO / ⚠️ PARCIAL / ❌ DESINCRONIZADO

**Archivos del módulo:**
| Archivo documentado | ¿Existe? | Notas |
|---------------------|----------|-------|
| `apps/api/src/{modulo}/{modulo}.controller.ts` | ✅/❌ | |
| `apps/api/src/{modulo}/{modulo}.service.ts` | ✅/❌ | |

**Endpoints:**
| Endpoint documentado | ¿Existe en controller? | ¿Roles coinciden? |
|---------------------|------------------------|-------------------|
| `GET /` | ✅/❌ | ✅/❌ |
| `POST /` | ✅/❌ | ✅/❌ |

**Modelo Prisma:**
| Campo documentado | ¿Existe? | ¿Tipo correcto? |
|-------------------|----------|-----------------|
| `id` | ✅ | ✅ String |
| `titulo` | ✅ | ✅ String |

**Problemas encontrados:**

- [problema 1]
- [problema 2]

---

[Repetir para cada módulo]

---

### Validación de Frontend

#### Páginas

| Ruta documentada | ¿Existe? | Notas |
| ---------------- | -------- | ----- |
| `/cursos`        | ✅/❌    |       |
| `/dashboard`     | ✅/❌    |       |

#### Componentes

| Componente documentado | ¿Existe? | ¿Props coinciden? |
| ---------------------- | -------- | ----------------- |
| `CursoCard`            | ✅/❌    | ✅/⚠️/❌          |

#### Hooks

| Hook documentado | ¿Existe? | ¿Firma coincide? |
| ---------------- | -------- | ---------------- |
| `useAuth`        | ✅/❌    | ✅/⚠️/❌         |

---

### Validación de Schema de Base de Datos

**Modelos documentados:** N
**Modelos en schema.prisma:** N
**Coincidencia:** ✅/⚠️/❌

| Modelo  | Documentado | En schema.prisma | Campos coinciden |
| ------- | ----------- | ---------------- | ---------------- |
| Usuario | ✅          | ✅               | ✅/⚠️            |
| Curso   | ✅          | ✅               | ✅/⚠️            |

**Enums:**
| Enum | Documentado | En schema.prisma | Valores coinciden |
|------|-------------|------------------|-------------------|
| Rol | ✅ | ✅ | ✅/⚠️ |

---

### Resumen de Problemas

#### 🔴 CRÍTICO — Documentación incorrecta (riesgo de código malo)

| Problema   | Ubicación             | Impacto   | Acción requerida |
| ---------- | --------------------- | --------- | ---------------- |
| [problema] | `docs/ai-context/...` | [impacto] | [qué hacer]      |

#### 🟡 ADVERTENCIA — Documentación incompleta

| Problema   | Ubicación             | Impacto   | Acción recomendada |
| ---------- | --------------------- | --------- | ------------------ |
| [problema] | `docs/ai-context/...` | [impacto] | [qué hacer]        |

#### 🟢 INFO — Documentación faltante (no crítico)

| Elemento no documentado | Ubicación real | Acción sugerida |
| ----------------------- | -------------- | --------------- |
| [elemento]              | `apps/...`     | Agregar a docs  |

---

### Estadísticas

| Categoría   | Total | Sincronizados | Problemas |
| ----------- | ----- | ------------- | --------- |
| Módulos     | N     | N             | N         |
| Páginas     | N     | N             | N         |
| Componentes | N     | N             | N         |
| Hooks       | N     | N             | N         |
| Modelos DB  | N     | N             | N         |
| Enums       | N     | N             | N         |

**Total de verificaciones:** N
**Pasaron:** N (N%)
**Fallaron:** N (N%)

---

### Recomendaciones

1. **Prioridad Alta:** [acciones críticas]
2. **Prioridad Media:** [acciones importantes]
3. **Prioridad Baja:** [mejoras opcionales]

---

## Criterios de Estado

| Estado                    | Condición                              |
| ------------------------- | -------------------------------------- |
| ✅ SINCRONIZADO           | 100% de verificaciones pasan           |
| ⚠️ DESINCRONIZADO PARCIAL | >80% pasan, pero hay problemas menores |
| ❌ DESINCRONIZADO         | <80% pasan o hay problemas críticos    |

---

## Notas para la Validación

- **Foco en exactitud**: La documentación de contexto se usa para generar código. Si está mal, el código generado estará mal.
- **Campos faltantes son críticos**: Si un campo existe en Prisma pero no en la doc, la IA podría no usarlo.
- **Endpoints fantasma son peligrosos**: Si la doc dice que existe un endpoint que no existe, la IA generará código que falla.
- **Priorizar modelos Prisma**: Los errores en schema.md son los más peligrosos porque afectan queries.
- **Verificar enums**: Un enum mal documentado causa errores de validación en runtime.

---

## Acciones Post-Validación

Después de ejecutar esta skill:

1. **Si hay problemas críticos**: Actualizar la documentación ANTES de continuar con desarrollo
2. **Si hay advertencias**: Crear issue para actualizar documentación
3. **Si todo está sincronizado**: Continuar con confianza

Para actualizar la documentación de un módulo, usar como referencia `docs/ai-context/modules/cursos.md` (es el más completo).
