# Manual de Uso: Sistema de Contexto para IA

> Guía práctica paso a paso para usar el sistema de contextos y skills.

---

## Inicio Rápido (TL;DR)

```
1. Identifica tu tarea
2. Carga el contexto correspondiente (ver tabla abajo)
3. Si es generación de código, usa un skill
4. Sigue los patrones del proyecto
```

---

## Tabla de Referencia Rápida

| Quiero...                              | Cargar                                    | Skill (opcional)    |
| -------------------------------------- | ----------------------------------------- | ------------------- |
| Crear un módulo CRUD completo          | `_patterns.md`                            | `crud-generator.md` |
| Agregar un endpoint a módulo existente | `_patterns.md` + `modules/{modulo}.md`    | `api-endpoint.md`   |
| Crear un formulario React              | `_patterns.md` + `frontend/components.md` | `react-form.md`     |
| Entender un módulo                     | `modules/{modulo}.md`                     | -                   |
| Modificar el schema                    | `database/schema.md`                      | -                   |
| Crear una página                       | `frontend/pages.md`                       | -                   |
| Usar hooks de auth                     | `frontend/hooks.md`                       | -                   |

---

## Uso en Claude Code

### Paso 1: Cargar Contexto

Pide a Claude que lea los archivos necesarios:

```
Lee docs/ai-context/_patterns.md
```

Para tareas específicas:

```
Lee docs/ai-context/_patterns.md y docs/ai-context/modules/cursos.md
```

### Paso 2: Describir la Tarea

Después de cargar contexto, describe qué necesitas:

```
Ahora, agrega un endpoint GET /cursos/:id/estadisticas que devuelva
el número de inscritos y el promedio de progreso.
```

### Paso 3: Usar Skills (Opcional)

Para generación de código, carga el skill:

```
Lee ia-skills/development/crud-generator.md y genera un CRUD para el modelo
Evaluacion con campos: titulo (string), puntaje (number), leccionId (relación)
```

---

## Uso en Cursor

### Configuración Automática

El archivo `.cursorrules` ya está configurado. Cursor cargará automáticamente las convenciones.

### Referencia Manual

Usa `@` para referenciar archivos:

```
@docs/ai-context/modules/cursos.md agrega un endpoint de estadísticas
```

### Composer

En el Composer de Cursor, incluye contexto:

```
Contexto: @docs/ai-context/_patterns.md

Tarea: Crear un servicio de notificaciones siguiendo los patrones del proyecto
```

---

## Uso en Otros LLMs (ChatGPT, etc.)

### Opción 1: Copiar Contenido

1. Abre el archivo de contexto necesario
2. Copia su contenido
3. Pégalo en el chat como contexto inicial
4. Luego describe tu tarea

### Opción 2: Resumir

Si el contexto es muy largo, pide que se resuma primero:

```
[Pegar contenido de _patterns.md]

Resume los patrones clave de este proyecto y luego ayúdame a crear
un nuevo endpoint.
```

---

## Ejemplos Completos

### Ejemplo 1: Crear un CRUD Completo

**En Claude Code:**

```
1. Lee ia-skills/development/crud-generator.md

2. Genera un CRUD para Evaluacion con:
   - titulo: string, requerido, min 3, max 200
   - descripcion: string, opcional, max 1000
   - puntajeMaximo: number, requerido, positivo
   - leccionId: relación con Leccion
   - Solo roles EDUCADOR+
```

**Resultado esperado:**

- `apps/api/src/evaluaciones/` (module, controller, service, DTOs)
- Instrucciones para agregar a `app.module.ts`
- Instrucciones para migration de Prisma

### Ejemplo 2: Agregar Endpoint a Módulo Existente

**En Claude Code:**

```
1. Lee docs/ai-context/_patterns.md y docs/ai-context/modules/cursos.md

2. Agrega un endpoint PATCH /cursos/:id/destacar que:
   - Requiere rol ADMIN_ESCUELA o SUPER_ADMIN
   - Recibe { destacado: boolean }
   - Actualiza el campo destacado del curso
```

**Resultado esperado:**

- Nuevo método en `cursos.controller.ts`
- Nuevo método en `cursos.service.ts`
- Nuevo DTO si necesario

### Ejemplo 3: Crear Formulario

**En Claude Code:**

```
1. Lee ia-skills/development/react-form.md

2. Crea un formulario para Evaluacion con:
   - titulo: input text, requerido
   - descripcion: textarea, opcional
   - puntajeMaximo: input number, requerido
   - leccionId: select con lecciones
```

**Resultado esperado:**

- `components/evaluaciones/EvaluacionForm.tsx`
- `components/evaluaciones/EvaluacionForm.module.css`

### Ejemplo 4: Entender un Módulo

**En Claude Code:**

```
Lee docs/ai-context/modules/inscripciones.md y explícame:
1. Qué endpoints tiene
2. Cómo funciona el soft delete
3. Qué verificaciones hace antes de inscribir
```

---

## Flujo de Trabajo Recomendado

### Para Desarrollo Nuevo

```
1. PLANIFICAR
   └── ¿Qué necesito crear?
   └── ¿Es un módulo nuevo o modificación?

2. CARGAR CONTEXTO
   └── Siempre: _patterns.md
   └── Si es módulo existente: modules/{modulo}.md
   └── Si es frontend: frontend/*.md

3. USAR SKILL (si aplica)
   └── CRUD completo → crud-generator.md
   └── Solo endpoint → api-endpoint.md
   └── Solo form → react-form.md

4. REVISAR Y AJUSTAR
   └── El código generado sigue patrones
   └── Ajustar nombres y lógica específica

5. INTEGRAR
   └── Agregar a app.module.ts
   └── Crear migration si hay cambios en schema
   └── Crear API routes en frontend si necesario
```

### Para Debugging/Comprensión

```
1. IDENTIFICAR MÓDULO
   └── ¿Dónde está el problema?

2. CARGAR CONTEXTO DEL MÓDULO
   └── modules/{modulo}.md tiene archivos y endpoints

3. PREGUNTAR ESPECÍFICAMENTE
   └── "¿Cómo funciona X?"
   └── "¿Dónde se valida Y?"
   └── "¿Por qué falla Z?"
```

---

## Tips y Mejores Prácticas

### ✅ Hacer

- **Cargar `_patterns.md` primero** - Contiene las convenciones base
- **Ser específico** - "Agrega endpoint GET que devuelve X" mejor que "haz algo"
- **Mencionar roles** - Siempre especificar qué roles pueden acceder
- **Verificar después** - Ejecutar `npm run lint` y `npm run type-check`

### ❌ Evitar

- **No cargar todo** - Solo los contextos necesarios para la tarea
- **No ignorar patrones** - Si el proyecto usa Zod, no usar class-validator
- **No olvidar dependencias** - Si creas un módulo, registrarlo en app.module.ts
- **No saltear validación** - Siempre usar safeParse en services

---

## Solución de Problemas

### "El código generado no compila"

1. Verificar que se cargó `_patterns.md`
2. Revisar imports (pueden faltar)
3. Ejecutar `npm run lint` para ver errores

### "No sigue los patrones del proyecto"

1. Cargar el contexto del módulo similar existente
2. Pedir que use ese módulo como referencia
3. Comparar con código existente

### "El skill no genera todo"

Los skills son templates. Después de generar:

1. Ajustar nombres específicos
2. Agregar lógica de negocio particular
3. Registrar en app.module.ts
4. Crear migration de Prisma

### "Cursor no carga el contexto"

1. Verificar que `.cursorrules` existe en la raíz
2. Reiniciar Cursor
3. Usar `@` para referenciar archivos manualmente

---

## Actualizar la Documentación

Si agregas un nuevo módulo o patrón:

1. **Nuevo módulo**: Crear `docs/ai-context/modules/{modulo}.md` siguiendo el template de `cursos.md`
2. **Nuevo patrón**: Agregar a `_patterns.md`
3. **Nuevo skill**: Crear en `ia-skills/`
4. **Actualizar índice**: Agregar a `_index.md`
