# Guía de Comprensión: Sistema de Contexto para IA

> Entender el qué, por qué y cómo del sistema de documentación para IAs.

---

## ¿Qué es este Sistema?

Es un conjunto de documentos estructurados que proporcionan **contexto** a asistentes de IA (Claude, Cursor, ChatGPT, etc.) para que puedan:

1. **Entender** la arquitectura y patrones del proyecto
2. **Generar** código que siga las convenciones existentes
3. **Mantener** consistencia en todo el codebase

---

## ¿Por qué Existe?

### El Problema

Cuando una IA genera código sin contexto:

- Puede usar patrones diferentes a los del proyecto
- Puede usar bibliotecas que no están en el stack
- Puede estructurar archivos de forma inconsistente
- Puede ignorar convenciones de naming, validación, etc.

### La Solución

Documentar explícitamente:

- **Qué patrones** usa el proyecto (Zod, no class-validator)
- **Cómo** se estructuran los archivos
- **Qué convenciones** seguir (español, soft delete, etc.)
- **Ejemplos reales** del código existente

---

## Estructura del Sistema

```
docs/ai-context/
│
├── _index.md          # 📋 ÍNDICE - Punto de entrada
├── _patterns.md       # 🔧 PATRONES - Cómo escribir código
│
├── modules/           # 📦 MÓDULOS - Contexto backend
│   ├── auth.md
│   ├── cursos.md
│   ├── lecciones.md
│   └── ...
│
├── frontend/          # 🎨 FRONTEND - Contexto React/Next.js
│   ├── pages.md
│   ├── components.md
│   └── hooks.md
│
├── database/          # 🗄️ DATABASE - Schema y relaciones
│   └── schema.md
│
├── MANUAL_USO.md      # 📖 Cómo usar (paso a paso)
└── GUIA_COMPRENSION.md # 📚 Este documento

ia-skills/        # ⚡ SKILLS - Generadores de código
├── crud-generator.md
├── api-endpoint.md
└── react-form.md
```

---

## Tipos de Documentos

### 1. Índice (`_index.md`)

**Propósito**: Punto de entrada único.

**Contiene**:

- Tabla de todos los contextos disponibles
- Guía de qué cargar según la tarea
- Instrucciones por herramienta (Claude, Cursor, otros)

**Cuándo usarlo**: Siempre como primer paso para orientarse.

---

### 2. Patrones (`_patterns.md`)

**Propósito**: Referencia consolidada de cómo escribir código.

**Contiene**:

- Validación con Zod (schemas, safeParse)
- Estructura de Controllers (decoradores, respuestas)
- Estructura de Services (excepciones, verificaciones)
- Paginación estándar
- Generación de slugs
- Soft delete
- API routes proxy
- Formularios React

**Cuándo usarlo**:

- Antes de escribir cualquier código nuevo
- Como referencia de "¿cómo se hace X en este proyecto?"

**Ejemplo de contenido**:

```typescript
// Patrón de validación
const result = schema.safeParse(dto);
if (!result.success) {
  throw new BadRequestException(result.error.issues[0]?.message);
}
```

---

### 3. Módulos (`modules/*.md`)

**Propósito**: Documentación específica de cada módulo backend.

**Contiene** (para cada módulo):

- Descripción funcional
- Tabla de archivos (rutas exactas)
- Endpoints con método, ruta, auth, roles
- Modelo Prisma completo
- Ejemplos de código real
- Dependencias con otros módulos
- Notas específicas para IA

**Cuándo usarlo**:

- Antes de modificar un módulo existente
- Para entender cómo funciona algo
- Como template para crear módulos similares

**Módulos documentados**:
| Módulo | Descripción |
|--------|-------------|
| `auth` | Autenticación y autorización |
| `cursos` | CRUD de cursos (template de referencia) |
| `lecciones` | Gestión de lecciones |
| `inscripciones` | Sistema de inscripción |
| `uploads` | Subida de archivos |
| `categorias` | Categorías de cursos |

---

### 4. Frontend (`frontend/*.md`)

**Propósito**: Documentación del frontend Next.js.

**Archivos**:

| Archivo         | Contiene                                          |
| --------------- | ------------------------------------------------- |
| `pages.md`      | Estructura de rutas, layouts, patrones de páginas |
| `components.md` | Componentes reutilizables, patrones, ejemplos     |
| `hooks.md`      | Hooks personalizados (useAuthorization, etc.)     |

**Cuándo usarlo**:

- Antes de crear páginas o componentes
- Para entender la estructura de archivos frontend

---

### 5. Database (`database/schema.md`)

**Propósito**: Referencia del schema Prisma.

**Contiene**:

- Diagrama de relaciones (ASCII)
- Todos los modelos con campos
- Enums disponibles
- Índices importantes
- Constraints únicos
- Cascade deletes

**Cuándo usarlo**:

- Antes de modificar el schema
- Para entender relaciones entre modelos
- Al crear queries complejas

---

### 6. Skills (`../ai-skills/*.md`)

**Propósito**: Templates para generación de código.

**Diferencia con contextos**:

- **Contextos**: Información para entender
- **Skills**: Instrucciones para generar

**Skills disponibles**:

| Skill               | Genera                               |
| ------------------- | ------------------------------------ |
| `crud-generator.md` | Módulo completo (backend + frontend) |
| `api-endpoint.md`   | Endpoint individual                  |
| `react-form.md`     | Formulario React                     |

**Estructura de un skill**:

1. Parámetros que recibe
2. Archivos que genera
3. Templates de código
4. Checklist post-generación

---

## Filosofía de Diseño

### Agnóstico de Herramienta

El sistema funciona con cualquier IA:

- **Claude Code**: Pedir que lea archivos
- **Cursor**: Usar `.cursorrules` + referencias `@`
- **ChatGPT**: Copiar contenido al chat
- **Otros**: Cualquier forma de proporcionar contexto

### Basado en Código Real

Todos los ejemplos vienen del código existente:

- No son ejemplos teóricos
- Reflejan las decisiones ya tomadas
- Se actualizan cuando cambia el proyecto

### Carga a Demanda

No cargar todo siempre:

- Solo los contextos necesarios para la tarea
- Reduce tokens/costos
- Mejora precisión de respuestas

### Mantenible

Estructura clara para actualizar:

- Un archivo por módulo
- Separación frontend/backend/database
- Skills independientes

---

## Relación entre Documentos

```
┌─────────────────────────────────────────────────────────────┐
│                         _index.md                           │
│                    (Punto de entrada)                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       _patterns.md                          │
│                  (Patrones generales)                       │
│                                                             │
│  "Cómo se escribe código en este proyecto"                  │
└─────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│    modules/     │ │    frontend/    │ │    database/    │
│                 │ │                 │ │                 │
│ Módulos backend │ │ Pages, comps,   │ │ Schema Prisma   │
│ específicos     │ │ hooks           │ │                 │
└─────────────────┘ └─────────────────┘ └─────────────────┘
          │                   │                   │
          └───────────────────┼───────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        ai-skills/                           │
│                                                             │
│  Templates para generar código usando los patrones          │
└─────────────────────────────────────────────────────────────┘
```

---

## Convenciones Clave del Proyecto

Estas convenciones están documentadas en `_patterns.md` pero es útil entenderlas:

### Backend (NestJS + Fastify)

| Aspecto         | Convención                                                          |
| --------------- | ------------------------------------------------------------------- |
| **Validación**  | Zod con `safeParse` (no class-validator)                            |
| **DTOs**        | Archivos separados por operación (create, update, query)            |
| **Respuestas**  | `{ item, message }` o `{ items[], total, page, limit, totalPages }` |
| **Errores**     | Excepciones de NestJS (NotFoundException, BadRequestException)      |
| **Soft Delete** | Cambiar estado a ARCHIVADO                                          |
| **IDs**         | cuid() no UUID                                                      |
| **Slugs**       | Generados automáticamente, verificar unicidad                       |

### Frontend (Next.js 14+)

| Aspecto         | Convención                                 |
| --------------- | ------------------------------------------ |
| **Router**      | App Router (no Pages Router)               |
| **Componentes** | Server Components por defecto              |
| **Client**      | `'use client'` solo cuando necesario       |
| **Estilos**     | CSS Modules para componentes complejos     |
| **Auth**        | NextAuth.js v5 con sesiones                |
| **API Calls**   | Rutas proxy `/api/*` que llaman al backend |

### General

| Aspecto     | Convención                                       |
| ----------- | ------------------------------------------------ |
| **Idioma**  | Todo en español (código, docs, mensajes)         |
| **Commits** | Español, formato `tipo(scope): descripción`      |
| **Roles**   | ESTUDIANTE, EDUCADOR, ADMIN_ESCUELA, SUPER_ADMIN |

---

## Cómo Mantener el Sistema

### Al Agregar un Módulo Nuevo

1. Crear `docs/ai-context/modules/{modulo}.md`
2. Usar `cursos.md` como template
3. Documentar todos los endpoints
4. Incluir modelo Prisma
5. Agregar al índice `_index.md`

### Al Cambiar un Patrón

1. Actualizar `_patterns.md`
2. Actualizar los módulos afectados
3. Verificar que los skills siguen siendo válidos

### Al Agregar un Skill Nuevo

1. Crear `ia-skills/{skill}.md`
2. Incluir parámetros, templates, checklist
3. Agregar al índice `_index.md`

---

## Preguntas Frecuentes

### ¿Por qué no usar JSDoc o comentarios en el código?

Los comentarios en código son útiles pero:

- Están dispersos en muchos archivos
- No dan una visión general
- Difícil de "cargar" en una IA

Los documentos centralizados permiten cargar contexto completo.

### ¿Esto reemplaza la documentación técnica existente?

No. Este sistema es **complementario**:

- `docs/technical/` → Para humanos (setup, arquitectura)
- `docs/ai-context/` → Para IAs (patrones, generación)

### ¿Qué pasa si el código cambia?

El código es la fuente de verdad. Si cambia:

1. Actualizar el contexto correspondiente
2. Los ejemplos deben reflejar código real

### ¿Puedo usar esto sin IA?

Sí. Los documentos son útiles como:

- Referencia rápida de patrones
- Onboarding para nuevos desarrolladores
- Documentación de arquitectura

### ¿Funciona con modelos locales?

Sí, mientras el modelo pueda procesar el texto:

- Ollama, LM Studio, etc.
- Copiar contenido como contexto

---

## Resumen

| Concepto          | Descripción                                        |
| ----------------- | -------------------------------------------------- |
| **Sistema**       | Documentación estructurada para IAs                |
| **Objetivo**      | Código consistente con patrones del proyecto       |
| **Componentes**   | Índice + Patrones + Módulos + Skills               |
| **Uso**           | Cargar contexto → Describir tarea → Generar código |
| **Mantenimiento** | Actualizar cuando cambia el código                 |
