# Metodología de Trabajo con Issues - Proyecto Amauta

Este documento define el flujo de trabajo estándar para trabajar con issues en el proyecto Amauta, diseñado específicamente para colaboración con Claude Code y otros contribuidores.

## Principios Fundamentales

1. **Transparencia**: Cada paso debe ser documentado y visible
2. **Consistencia**: Seguir siempre el mismo proceso
3. **Trazabilidad**: Vincular commits con issues
4. **Comunicación clara**: Usar español y ser descriptivo
5. **Automatización**: Usar herramientas para minimizar errores
6. **Disciplina de Prisma**: Todo cambio de schema requiere migración versionada y validación

## Flujo de Trabajo Completo

### 1. Listar Issues Disponibles

**Comando:**

```bash
gh issue list --limit 100
```

**Objetivo:** Ver todos los issues abiertos con sus prioridades y etiquetas.

**Criterios de selección:**

- Priorizar issues etiquetados con prioridad operativa alta como `p0-critical` o `p1-high`
- Seguir el orden de dependencias (ej: primero infraestructura, luego features)
- Trabajar en issues del sprint actual
- Considerar estimación de puntos para planning

---

### 2. Ver Detalles del Issue

**Comando:**

```bash
gh issue view <número> --json title,body,labels | jq -r '"\(.title)\n\n\(.body)"'
```

**Objetivo:** Entender completamente qué se debe hacer.

**Qué revisar:**

- ✅ **Objetivo**: ¿Cuál es el propósito de la tarea?
- ✅ **Checklist**: Lista de subtareas a completar
- ✅ **Estimación**: Puntos de complejidad
- ✅ **Prioridad**: Must have, should have, etc.
- ✅ **Sprint**: A qué sprint pertenece
- ✅ **Referencias**: Documentación relacionada
- ✅ **Dependencias**: Otros issues que deben completarse primero

---

### 3. Crear Lista de Tareas (Todo List)

**Herramienta:** `TodoWrite` (para Claude Code)

**Objetivo:** Planificar y trackear progreso en tiempo real.

**Estructura:**

```json
[
  {
    "content": "Descripción de la tarea en imperativo",
    "status": "pending|in_progress|completed",
    "activeForm": "Descripción en gerundio (presente continuo)"
  }
]
```

**Ejemplo:**

```json
[
  {
    "content": "Crear archivo de configuración",
    "status": "in_progress",
    "activeForm": "Creando archivo de configuración"
  },
  {
    "content": "Actualizar documentación",
    "status": "pending",
    "activeForm": "Actualizando documentación"
  },
  {
    "content": "Hacer commit de los cambios",
    "status": "pending",
    "activeForm": "Haciendo commit"
  }
]
```

**Reglas importantes:**

- ✅ Crear la lista ANTES de empezar a trabajar
- ✅ Solo UNA tarea debe estar en `in_progress` a la vez
- ✅ Marcar como `completed` INMEDIATAMENTE al terminar cada tarea
- ✅ Actualizar la lista en tiempo real, no al final

---

### 4. Implementar la Solución

**Enfoque:**

1. **Leer primero**: Siempre usar `Read` antes de `Edit` o `Write`
2. **Cambios incrementales**: Hacer cambios pequeños y verificables
3. **Seguir estándares**: Consultar `docs/technical/coding-standards.md`
4. **Actualizar todo list**: Marcar progreso conforme avanzas

**Regla adicional si el issue toca Prisma o base de datos:**

1. Ejecutar `cd apps/api && npx prisma migrate status` antes de editar `prisma/schema.prisma`
2. Si hay drift o migraciones pendientes inesperadas, detenerse y resolver eso primero
3. Si cambia `prisma/schema.prisma`, crear una migración versionada en `prisma/migrations/`
4. Ejecutar `cd apps/api && npx prisma validate`
5. Revisar el SQL de la migración antes de cerrar el issue
6. No usar `prisma db push` como sustituto del flujo de migraciones

**Verificación:**

- ✅ El código sigue los estándares del proyecto
- ✅ La documentación está actualizada
- ✅ Todos los items del checklist del issue están completos
- ✅ No hay errores de sintaxis o linting

---

### 5. Hacer Commit

#### Paso previo (commit seguro y sincronizado)

Antes de commitear, asegurar que el branch este alineado con remoto y no haya sorpresas:

```bash
git status -sb
git fetch origin
git status -sb
git log --oneline --decorate -n 5
```

Si hay commits remotos nuevos, rebasar antes de commitear:

```bash
git pull --rebase
```

Reglas:

- ✅ No commitear si el branch esta atras de `origin`
- ✅ Resolver conflictos antes de seguir
- ✅ Revisar `git status -sb` despues del rebase

Si hay cambios locales sin commitear y necesitas rebase, usar `stash`:

```bash
git status -sb
git stash push -u -m "wip antes de rebase"
git pull --rebase
git stash pop
```

Si hay conflictos luego del `stash pop`, resolverlos y continuar.

#### Checklist pre-commit (calidad minima)

- ✅ `git status -sb` limpio (solo archivos esperados)
- ✅ Tests relevantes pasados (ej: `npm run test --workspace=@amauta/api -- --testPathPatterns=...`)
- ✅ Typecheck si aplica (ej: `npx tsc --noEmit -p apps/api/tsconfig.json`)
- ✅ Documentacion actualizada si aplica

**Formato de mensaje:**

```
<tipo>: <descripción corta>

<descripción detallada>
- Punto 1
- Punto 2
- Punto 3

Resuelve: #<número-issue>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Tipos de commit:**

- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Formateo, punto y coma faltante, etc.
- `refactor`: Refactorización de código
- `test`: Agregar o modificar tests
- `chore`: Tareas de mantenimiento

**Comando:**

```bash
git add <archivos>
git commit -m "$(cat <<'EOF'
feat: agregar nueva funcionalidad

- Detalle 1
- Detalle 2

Resuelve: #123

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

**Reglas:**

- ✅ Mensajes en español
- ✅ Primera línea máximo 72 caracteres
- ✅ Ser descriptivo en el cuerpo del mensaje
- ✅ Incluir "Resuelve: #<número>" para cerrar automáticamente
- ✅ Listar todos los cambios importantes

---

### 6. Cerrar el Issue

**Comando:**

```bash
gh issue close <número> --comment "✅ Tarea completada. [Descripción de lo realizado]

- ✅ Item 1 del checklist
- ✅ Item 2 del checklist
- ✅ Item 3 del checklist

Commit: <hash>"
```

**Objetivo:** Documentar la resolución y proporcionar contexto.

**Qué incluir:**

- ✅ Resumen de lo implementado
- ✅ Confirmación de que todos los items del checklist están completos
- ✅ Hash del commit relacionado
- ✅ Cualquier nota importante o decisión técnica tomada

---

## Ejemplo Completo de Flujo

### Escenario: Issue #42 - Implementar autenticación de usuarios

#### Paso 1: Listar issues

```bash
gh issue list
# 42  OPEN  T-042: Implementar autenticación de usuarios  backend, security, must-have
```

#### Paso 2: Ver detalles

```bash
gh issue view 42 --json title,body,labels | jq -r '"\(.title)\n\n\(.body)"'
```

#### Paso 3: Crear todo list

```json
[
  {
    "content": "Instalar y configurar JWT library",
    "status": "in_progress",
    "activeForm": "Instalando JWT library"
  },
  {
    "content": "Crear middleware de autenticación",
    "status": "pending",
    "activeForm": "Creando middleware"
  },
  {
    "content": "Implementar endpoints de login/logout",
    "status": "pending",
    "activeForm": "Implementando endpoints"
  },
  {
    "content": "Agregar tests unitarios",
    "status": "pending",
    "activeForm": "Agregando tests"
  },
  {
    "content": "Actualizar documentación de API",
    "status": "pending",
    "activeForm": "Actualizando documentación"
  },
  {
    "content": "Hacer commit",
    "status": "pending",
    "activeForm": "Haciendo commit"
  }
]
```

#### Paso 4: Implementar

- Instalar dependencias
- Crear archivos necesarios
- Escribir código
- Actualizar todo list conforme avanzas

#### Paso 5: Commit

```bash
git add .
git commit -m "$(cat <<'EOF'
feat: implementar sistema de autenticación JWT

- Instalar y configurar jsonwebtoken library
- Crear middleware de autenticación para proteger rutas
- Implementar endpoints POST /api/auth/login y /api/auth/logout
- Agregar tests unitarios con cobertura del 95%
- Actualizar documentación de API con ejemplos de uso

Resuelve: #42

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

#### Paso 6: Cerrar issue

```bash
gh issue close 42 --comment "✅ Tarea completada. Sistema de autenticación JWT implementado.

- ✅ JWT library instalada y configurada
- ✅ Middleware de autenticación creado
- ✅ Endpoints de login/logout funcionando
- ✅ Tests unitarios con 95% de cobertura
- ✅ Documentación de API actualizada

Commit: a1b2c3d"
```

---

## Checklist de Calidad

Antes de cerrar un issue, verificar:

- [ ] ✅ Todos los items del checklist del issue están completos
- [ ] ✅ El código sigue los estándares establecidos
- [ ] ✅ La documentación está actualizada
- [ ] ✅ No hay errores de linting o TypeScript
- [ ] ✅ Los tests pasan (si aplica)
- [ ] ✅ El commit tiene un mensaje descriptivo
- [ ] ✅ El issue está referenciado en el commit
- [ ] ✅ El todo list está limpio y completo

Si el issue cambió Prisma, además verificar:

- [ ] ✅ Se ejecutó `npx prisma migrate status` antes del cambio
- [ ] ✅ Existe migración versionada en `apps/api/prisma/migrations/`
- [ ] ✅ Se ejecutó `npx prisma validate`
- [ ] ✅ Se revisó el SQL de la migración
- [ ] ✅ No se usó `prisma db push` como flujo normal

---

## Comandos Útiles de GitHub CLI

## Taxonomía de Labels

Para evitar duplicados, filtros rotos y nomenclaturas inconsistentes, las issues de Amauta deben usar una taxonomía acotada y predecible.

### Categorías oficiales

#### 1. Tipo de issue

Usar exactamente una:

- `feature`: nueva funcionalidad
- `bug`: defecto o regresión
- `tech-debt`: deuda técnica, refactor o mejora interna
- `docs`: documentación
- `question`: consulta o aclaración

#### 2. Área afectada

Usar una o más según corresponda:

- `backend`: API, servicios, validaciones o lógica de negocio
- `frontend`: UI, UX, páginas, componentes o hooks
- `database`: Prisma, migraciones, modelos o consultas SQL
- `infrastructure`: CI/CD, Docker, deployment, Dokploy o configuración operativa
- `testing`: cobertura, suites de test, QA o diagnósticos de calidad

#### 3. Fase del roadmap

Usar exactamente una cuando la issue pertenezca a una fase planificada:

- `phase-0`
- `phase-1`
- `phase-2`
- `phase-3`
- `phase-4`
- `phase-5`

#### 4. Prioridad operativa

Usar exactamente una cuando haga falta priorización explícita:

- `p0-critical`
- `p1-high`
- `p2-medium`
- `p3-low`

#### 5. Estado o soporte

Usar solo si aplica:

- `blocked`
- `help-wanted`
- `good-first-issue`

### Reglas de uso

- No usar labels duplicadas con el mismo significado.
- No mezclar dos sistemas de prioridad en la misma issue.
- Para sprints, preferir `milestones` antes que labels de sprint.
- Si una issue corresponde al roadmap, debe tener label de fase.
- Si una issue toca Prisma o la base de datos, agregar `database` ademas del tipo y la fase.

### Labels a mantener

- `feature`
- `bug`
- `tech-debt`
- `docs`
- `question`
- `backend`
- `frontend`
- `database`
- `infrastructure`
- `testing`
- `phase-0`
- `phase-1`
- `phase-2`
- `phase-3`
- `phase-4`
- `phase-5`
- `p0-critical`
- `p1-high`
- `p2-medium`
- `p3-low`
- `blocked`
- `help-wanted`
- `good-first-issue`

### Labels a deprecar o consolidar

- `documentation` → usar `docs`
- `good first issue` → usar `good-first-issue`
- `help wanted` → usar `help-wanted`
- `must-have` y `should-have` no deben ser el sistema principal de prioridad en GitHub; conservarlos solo si todavia se necesitan para backlog historico o transicion

### Convención recomendada para issues nuevas

Una issue nueva normalmente deberia incluir:

1. una label de tipo
2. una o mas labels de area
3. una label de fase
4. opcionalmente una label de prioridad

Ejemplos:

- `feature`, `backend`, `phase-4`
- `feature`, `frontend`, `phase-4`, `p2-medium`
- `tech-debt`, `testing`, `backend`, `phase-4`

### Listar issues por estado

```bash
gh issue list --state open
gh issue list --state closed
```

### Filtrar por etiquetas

```bash
gh issue list --label "p1-high"
gh issue list --label "phase-0"
gh issue list --label "backend"
```

### Buscar issues

```bash
gh issue list --search "autenticación"
```

### Crear nuevo issue

```bash
gh issue create --title "T-XXX: Título" --body "Descripción"
```

### Ver issues de un milestone/sprint

```bash
gh issue list --milestone "Sprint 1"
```

---

## Notas para Claude Code

### Uso de TodoWrite

- **SIEMPRE** crear todo list para issues con 3+ pasos
- **NUNCA** trabajar sin todo list en tareas complejas
- **ACTUALIZAR** en tiempo real, no al final
- **UNA SOLA** tarea en `in_progress` a la vez

### Commits

- Mensajes descriptivos en español
- Incluir "Resuelve: #X" para auto-cerrar
- Usar heredoc para mensajes multilínea
- Firmar con Co-Authored-By: Claude

### Deploy y Migraciones (Producción)

- En producción, el contenedor de la API ejecuta automáticamente
  `npx prisma migrate deploy` al iniciar (configurado en `apps/api/Dockerfile`).
- Por lo tanto, un deploy de la API aplica migraciones pendientes sin pasos manuales.
- Si se requiere control manual, mover la migración a un step explícito del pipeline.

### Comunicación

- Ser claro y conciso
- Confirmar comprensión del issue antes de empezar
- Preguntar si hay ambigüedad
- Reportar progreso regularmente

### Errores Comunes a Evitar

- ❌ No leer el issue completo
- ❌ No crear todo list
- ❌ No actualizar todo list en tiempo real
- ❌ Commits sin mensaje descriptivo
- ❌ No referenciar el issue en el commit
- ❌ Cerrar issue sin verificar checklist completo
- ❌ No verificar que el código sigue estándares
- ❌ Cambiar `prisma/schema.prisma` sin migración
- ❌ Usar `prisma db push` como reemplazo de `migrate`
- ❌ Ignorar drift de Prisma y seguir desarrollando encima

---

## Integración con CLAUDE.md

Este workflow complementa las instrucciones en `CLAUDE.md`. Siempre:

1. Leer `CLAUDE.md` para contexto del proyecto
2. Seguir este `WORKFLOW.md` para proceso de issues
3. Consultar `docs/technical/coding-standards.md` para estándares de código
4. Revisar `docs/project-management/` para contexto de gestión

---

## Actualización del Workflow

Este documento es **vivo** y debe actualizarse cuando:

- Se identifican mejoras en el proceso
- Se encuentran errores comunes recurrentes
- Se agregan nuevas herramientas o comandos
- El equipo sugiere cambios

Para proponer cambios, crear un issue con label `workflow-improvement`.

---

**Última actualización**: 2026-03-24
**Versión**: 1.0.0
