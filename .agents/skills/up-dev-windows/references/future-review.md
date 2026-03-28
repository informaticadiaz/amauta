# Revisión futura de la skill `up-dev-windows`

Este documento registra mejoras detectadas durante la primera implementación de la skill y su script asociado.

Objetivo: preservar estas observaciones para una segunda iteración sin frenar la utilidad actual de la skill.

## Estado actual

La skill y el script ya son útiles para Amauta en Windows y cubren el flujo real validado en esta sesión:

- sincronizar dependencias
- validar `.env.local`
- levantar backend con `DOTENV_CONFIG_PATH`
- verificar healthcheck
- levantar frontend

Sin embargo, todavía hay mejoras de diseño y portabilidad que conviene aplicar más adelante.

## Prioridad alta

### 1. Cambiar la estrategia de instalación por defecto

**Problema**:

El script hoy corre `npm install` por defecto, salvo que se use `-SkipInstall`.

**Riesgo**:

- agrega fricción innecesaria en usos diarios
- puede modificar lockfiles o artefactos locales
- hace más lento el arranque

**Mejora propuesta**:

Invertir la semántica:

- por defecto: no instalar
- flag explícito: `-Install`

**Impacto esperado**:

Menor fricción y menor riesgo de cambios locales no deseados.

---

### 2. Declarar con más honestidad el alcance “agnóstico”

**Problema**:

La skill se presenta como agnóstica, pero el script trae defaults muy orientados a Amauta:

- `@amauta/web`
- `@amauta/api`
- `http://localhost:3001/health`

**Mejora propuesta**:

Explicitar en `SKILL.md` que es:

- agnóstica en patrón
- orientada a Amauta en defaults

**Impacto esperado**:

Reduce confusión y mejora expectativas de reutilización.

---

### 3. Validar explícitamente workspaces o rutas objetivo

**Problema**:

El script asume que los workspaces y carpetas objetivo existen.

**Mejora propuesta**:

Agregar validaciones previas para:

- `apps/web/package.json`
- `apps/api/package.json`

o validar que los workspaces configurados sean reales antes del arranque.

**Impacto esperado**:

Errores más claros y diagnóstico más rápido.

## Prioridad media

### 4. Documentar mejor el comportamiento de `-NoNewWindows`

**Problema**:

El modo en background jobs es útil, pero puede ser menos transparente para quien espera logs visibles.

**Mejora propuesta**:

Documentar claramente:

- cuándo conviene usarlo
- cómo inspeccionar jobs
- cómo detenerlos

**Impacto esperado**:

Mejor DX y menos confusión operativa.

---

### 5. Validar coherencia entre `API_URL` y `NEXT_PUBLIC_API_URL`

**Problema**:

Hoy se valida existencia de claves, pero no coherencia entre URLs del frontend y backend.

**Mejora propuesta**:

Agregar chequeos de consistencia para:

- `API_URL`
- `NEXT_PUBLIC_API_URL`
- `NEXTAUTH_URL`

**Impacto esperado**:

Diagnóstico más temprano de configuraciones inconsistentes.

## Prioridad baja

### 6. Crear script complementario `down-dev-windows.ps1`

**Problema**:

La skill ayuda a levantar el entorno, pero no ofrece una forma simétrica de bajarlo o limpiar procesos.

**Mejora propuesta**:

Agregar un script hermano para:

- detener jobs
- cerrar procesos lanzados por la skill
- facilitar cleanup

**Impacto esperado**:

Ciclo de trabajo más completo y ordenado.

---

### 7. Agregar salida más rica de estado final

**Problema**:

El script informa lo esencial, pero podría resumir mejor qué quedó arriba y con qué configuración.

**Mejora propuesta**:

Imprimir al final:

- frontend workspace
- backend workspace
- env path usado
- health URL usada
- modo de ejecución (`NoNewWindows` o nuevas ventanas)

**Impacto esperado**:

Más observabilidad y menos ambigüedad.

## Criterio de evolución

Estas mejoras deben aplicarse sin romper la promesa principal de la skill:

> permitir levantar el entorno local en Windows de forma rápida, clara y con chequeos explícitos.

La siguiente iteración debe priorizar:

1. menos fricción
2. mensajes de error más claros
3. mejor equilibrio entre agnosticismo y defaults útiles
