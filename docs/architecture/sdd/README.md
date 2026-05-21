# SDD Amauta — Arquitectura Propia de Cambios

> **Sistema de Documentación de Cambios (SDD)** — Especificación, Diseño e Implementación de mejoras arquitectónicas. Independiente de cualquier framework externo.

**Versión**: 1.0  
**Creado**: 2026-05-20  
**Responsable**: Equipo Amauta

---

## 📋 Qué es SDD Amauta

Un **sistema determinístico y auditable** para documentar y ejecutar cambios de arquitectura:

- 📄 **Cada cambio es un documento** (no ephemeral, commiteable)
- 🔄 **7 fases de transformación** (Propuesta → Implementación → Cierre)
- ✅ **100% persistente en Git** (histórico completo)
- 🎯 **Comportamiento establecido** (skills con responsabilidades claras)
- 📊 **Trazabilidad completa** (qué se hizo, por qué, cuándo)

---

## 🗂️ Estructura

```
docs/architecture/sdd/
├── README.md                         (Este archivo)
├── plantillas/                       (Templates reutilizables)
│   ├── 01-propuesta-template.md
│   ├── 02-especificacion-template.md
│   ├── 03-diseño-template.md
│   ├── 04-tareas-template.md
│   ├── 05-implementacion-template.md
│   ├── 06-verificacion-template.md
│   └── 07-cierre-template.md
│
└── cambios/                          (Registro de TODOS los cambios)
    ├── INDICE.md                     (Índice de cambios)
    │
    └── {cambio-id}/                  (Carpeta por cambio)
        ├── 01-propuesta.md
        ├── 02-especificacion.md
        ├── 03-diseño.md
        ├── 04-tareas.md
        ├── 05-implementacion.md
        ├── 06-verificacion.md
        └── 07-cierre.md
```

---

## 📑 Las 7 Fases de SDD Amauta

### **Fase 1: PROPUESTA** (`01-propuesta.md`)

**Skill**: `arquitecto-proyecto`  
**Salida**: Análisis inicial del cambio

```
├─ Problema (qué está mal hoy)
├─ Solución propuesta
├─ Módulos afectados
├─ Violaciones SOLID encontradas
├─ Plan de refactorización (fases)
├─ Criterios de éxito
└─ Impacto estimado
```

**Ejemplo**: `cambios/soft-delete-lecciones/01-propuesta.md`

---

### **Fase 2: ESPECIFICACIÓN** (`02-especificacion.md`)

**Skill**: `especificador-cambios`  
**Entrada**: 01-propuesta.md  
**Salida**: Requirements formales

```
├─ 5+ Requirements (con scenarios)
├─ Acceptance criteria
├─ Casos de uso (happy path + edge cases)
├─ Trazabilidad: Propuesta → Spec
└─ Cambios en API (si aplica)
```

**Ejemplo**: `cambios/soft-delete-lecciones/02-especificacion.md`

---

### **Fase 3: DISEÑO** (`03-diseño.md`)

**Skill**: `diseñador-arquitectura`  
**Entrada**: 02-especificacion.md  
**Salida**: Decisiones arquitectónicas

```
├─ Current state (cómo está ahora)
├─ Proposed state (cómo será)
├─ Decisiones de arquitectura
├─ Code snippets (ejemplos concretos)
├─ Patrones aplicados
├─ Files to modify (lista exacta)
└─ Database impact (si aplica)
```

**Ejemplo**: `cambios/soft-delete-lecciones/03-diseño.md`

---

### **Fase 4: TAREAS** (`04-tareas.md`)

**Skill**: `desglosador-tareas`  
**Entrada**: 03-diseño.md  
**Salida**: Breakdown ejecutable

```
├─ N tareas granulares
├─ Pasos accionables ([x] checklist)
├─ Dependencias (Task X bloquea Task Y)
├─ Esfuerzo estimado (por task)
├─ Criterios de verificación
└─ Estado inicial: [ ] pending
```

**Ejemplo**: `cambios/soft-delete-lecciones/04-tareas.md`

---

### **Fase 5: IMPLEMENTACIÓN** (`05-implementacion.md`)

**Skill**: `implementador-tareas`  
**Entrada**: 04-tareas.md  
**Salida**: Lo que se hizo

```
├─ [x] Task 1 completada
│   ├─ Archivo: apps/api/prisma/schema.prisma
│   ├─ Cambio: +estado field
│   └─ Líneas: 184-186
│
├─ [x] Task 2 completada
│   ├─ Archivo: apps/api/src/lecciones/lecciones.service.ts
│   ├─ Cambio: soft delete en eliminar()
│   └─ Líneas: 237-263
│
├─ Commits asociados: [e7c12a5, ...]
├─ Build status: ✅ Passing
├─ Tests: 41/41 passing
└─ Issues encontrados: (if any)
```

**Ejemplo**: `cambios/soft-delete-lecciones/05-implementacion.md`

---

### **Fase 6: VERIFICACIÓN** (`06-verificacion.md`)

**Skill**: `verificador-cambios`  
**Entrada**: 05-implementacion.md + código + tests  
**Salida**: Validación contra spec

```
├─ ✅ Requirement 1: Spec vs Implementación → OK
├─ ✅ Requirement 2: OK
├─ ✅ Design decision A: OK
├─ ✅ Design decision B: OK
├─ TypeScript: 0 errors
├─ Tests: 41/41 passing
├─ Coverage: 95% statements, 80% branches
├─ Deviations: (si hay desviaciones documentadas)
└─ Veredicto final: ✅ APPROVED
```

**Ejemplo**: `cambios/soft-delete-lecciones/06-verificacion.md`

---

### **Fase 7: CIERRE** (`07-cierre.md`)

**Skill**: `archivador-cambios`  
**Entrada**: 01-07 documentos completados  
**Salida**: Resumen final y lecciones

```
├─ Resumen ejecutivo
├─ Timeline real (vs estimado)
├─ Archivos modificados: N
├─ Commits: N (lista de hashes)
├─ Estado final: ✅ COMPLETADO
├─ Bloqueantes para próxima fase: (if any)
├─ Lecciones aprendidas
├─ Métricas:
│  ├─ Esfuerzo real: X horas
│  ├─ Esfuerzo estimado: Y horas
│  └─ Varianza: ±Z%
└─ Aprobado por: (responsable)
```

**Ejemplo**: `cambios/soft-delete-lecciones/07-cierre.md`

---

## 🔄 Flujo de Ejecución

```
Usuario especifica cambio
           ↓
Skill 1: arquitecto-proyecto
├─ Analiza módulos
├─ Identifica problemas
└─ Crea 01-propuesta.md → COMMIT
           ↓
Skill 2: especificador-cambios
├─ Lee 01-propuesta.md
├─ Define requirements
└─ Crea 02-especificacion.md → COMMIT
           ↓
Skill 3: diseñador-arquitectura
├─ Lee 02-especificacion.md
├─ Define arquitectura
└─ Crea 03-diseño.md → COMMIT
           ↓
Skill 4: desglosador-tareas
├─ Lee 03-diseño.md
├─ Crea breakdown
└─ Crea 04-tareas.md → COMMIT
           ↓
Skill 5: implementador-tareas
├─ Lee 04-tareas.md
├─ Implementa 1 task a la vez
└─ Actualiza 05-implementacion.md → COMMIT (por task)
           ↓
Skill 6: verificador-cambios
├─ Valida SPEC vs IMPLEMENTACIÓN
├─ Corre tests
└─ Crea 06-verificacion.md → COMMIT
           ↓
Skill 7: archivador-cambios
├─ Cierra cambio
├─ Documenta aprendizajes
└─ Crea 07-cierre.md → COMMIT

RESULTADO: 7 commits, 7 documentos, histórico completo
```

---

## 📊 Ventajas vs Sistemas Previos

| Aspecto              | Viejo (`.sdd/` ephemeral) | Nuevo (Amauta SDD)                    |
| -------------------- | ------------------------- | ------------------------------------- |
| **Ubicación**        | Temporal                  | `docs/architecture/sdd/` (permanente) |
| **Persistencia**     | NO                        | ✅ Commiteable                        |
| **Histórico**        | Se pierde                 | ✅ Git log completo                   |
| **Auditoría**        | Difícil                   | ✅ Trazable (7 fases)                 |
| **Independencia**    | Depende Anthropic         | ✅ Arquitectura propia                |
| **Escalabilidad**    | 1 cambio a la vez         | ✅ Múltiples cambios en paralelo      |
| **Documentación**    | Vive en memoria           | ✅ Vive en repo                       |
| **Reproducibilidad** | Compleja                  | ✅ Pasos claros                       |

---

## 🎯 Naming Convention para Cambios

**Formato**: `{tipo}-{modulo}-{accion}`

**Ejemplos**:

```
soft-delete-lecciones           (fix crítico)
event-driven-modulos            (refactorización arquitectónica)
auth-middleware-v2              (mejora de performance)
api-response-unificacion        (simplificación)
database-schema-v3              (evolución de schema)
```

**Reglas**:

- Minúsculas, guiones (no espacios)
- Max 50 caracteres
- Descriptivo pero conciso

---

## 📝 Usar un Template

Cuando crees un nuevo cambio:

```bash
# 1. Copiar template
cp plantillas/01-propuesta-template.md cambios/{cambio-id}/01-propuesta.md

# 2. Rellenar con información real
vim cambios/{cambio-id}/01-propuesta.md

# 3. Commit
git add docs/architecture/sdd/cambios/{cambio-id}/01-propuesta.md
git commit -m "docs(sdd): iniciar cambio {cambio-id}"

# 4. Skills ejecutan fases 2-7 automáticamente
```

---

## 🔍 Índice de Cambios

Ver `cambios/INDICE.md` para:

- Lista de todos los cambios (abiertos + cerrados)
- Estado actual de cada uno
- Timeline
- Responsables

---

## 💡 Principios de SDD Amauta

1. **Determinístico**: Cada skill sabe exactamente qué hacer
2. **Persistente**: Todo vive en Git, nada se pierde
3. **Auditable**: 7 fases = 7 documentos = histórico completo
4. **Independiente**: Cero dependencia de frameworks externos
5. **Escalable**: Múltiples cambios en paralelo (cada uno su carpeta)
6. **Trazable**: Req → Spec → Design → Task → Code → Commit

---

## 🛠️ Próximos Pasos

- [ ] Crear estructura base (directorios)
- [ ] Escribir templates (7 fases)
- [ ] Redefinar skills (comportamiento determinístico)
- [ ] Migrar Fase 1 (soft-delete-lecciones) como piloto
- [ ] Crear INDICE.md
- [ ] Documentar API de skills

---

**Generado por**: Equipo Amauta  
**Última actualización**: 2026-05-20 23:45
