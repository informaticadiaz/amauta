# Skill: Fix Security Findings

> Aplica de forma autónoma los fixes para las vulnerabilidades encontradas en un
> informe de auditoría de seguridad previo. Parte del informe guardado como única
> fuente de verdad, con contexto limpio.
>
> **Requiere**: haber ejecutado `/security-audit` previamente y tener un informe en `docs/auditorias/`.
>
> **Referencia**: Informe de auditoría generado por `security-audit.md`.

---

## Uso

```
/fix-security-findings docs/auditorias/[nombre-del-informe].md
```

**Ejemplos:**

```
/fix-security-findings docs/auditorias/auditoria-triage-auth-2026-03-15.md
/fix-security-findings docs/auditorias/auditoria-deepdive-uploads-2026-03-15.md
/fix-security-findings docs/auditorias/auditoria-triage-completo-2026-03-15.md
/fix-security-findings   ← sin argumento: muestra panorama y pide elección
```

---

## Parámetros

| Parámetro         | Descripción                                                     | Ejemplo                                               |
| ----------------- | --------------------------------------------------------------- | ----------------------------------------------------- |
| `ruta-al-informe` | Path al informe `.md` generado por `/security-audit` (opcional) | `docs/auditorias/auditoria-triage-auth-2026-03-15.md` |

---

## Convención de Nombres

El informe de remediación es la **contraparte directa** del informe de auditoría.
El nombre se construye reemplazando el prefijo `auditoria-` por `fix-security-`:

```
auditoria-triage-auth-2026-03-15.md        →  fix-security-triage-auth-2026-03-15.md
auditoria-deepdive-uploads-2026-03-16.md   →  fix-security-deepdive-uploads-2026-03-16.md
auditoria-triage-completo-2026-03-17.md    →  fix-security-triage-completo-2026-03-17.md
```

Esto permite ver de un vistazo en `docs/auditorias/` qué auditorías tienen fix y cuáles están pendientes:

```
docs/auditorias/
├── auditoria-triage-auth-2026-03-15.md          ← auditoría
├── fix-security-triage-auth-2026-03-15.md       ← ✅ resuelta (contraparte existe)
├── auditoria-deepdive-uploads-2026-03-16.md     ← ⏳ pendiente (sin contraparte)
└── auditoria-triage-completo-2026-03-17.md      ← ⏳ pendiente (sin contraparte)
```

---

## Por qué contexto limpio

La auditoría acumula mucho contexto: lee decenas de archivos, guarda código vulnerable
y hallazgos en memoria. La remediación trabaja mejor partiendo de cero, usando solo
el informe guardado como fuente de verdad.

**Flujo recomendado:**

```
Conversación A → /security-audit
                 → genera: auditoria-triage-auth-2026-03-15.md

Conversación B → /fix-security-findings docs/auditorias/auditoria-triage-auth-2026-03-15.md
                 → genera: fix-security-triage-auth-2026-03-15.md
```

---

## Proceso de Remediación (Ejecutar en Orden)

### PASO 0 — Panorama y Selección del Informe

**Ejecutar SIEMPRE al inicio**, incluso si el usuario especificó un informe.

#### 0.1 — Leer el directorio de auditorías

```bash
ls docs/auditorias/
```

#### 0.2 — Construir panorama de estado

Para cada archivo que comience con `auditoria-`, verificar si existe su contraparte
`fix-security-[resto]` en el mismo directorio. Mostrar:

```
📁 docs/auditorias/ — Estado de Auditorías

| Informe de Auditoría                          | Contraparte Fix                               | Estado       |
|-----------------------------------------------|-----------------------------------------------|--------------|
| auditoria-triage-auth-2026-03-15.md           | fix-security-triage-auth-2026-03-15.md        | ✅ Resuelta  |
| auditoria-deepdive-uploads-2026-03-16.md      | —                                             | ⏳ Pendiente |
| auditoria-triage-completo-2026-03-17.md       | —                                             | ⏳ Pendiente |
```

#### 0.3 — Seleccionar informe a remediar

- Si el usuario **ya especificó un informe** → usarlo directamente.
- Si el usuario **no especificó** → preguntar cuál de las auditorías ⏳ Pendientes desea remediar.
- Si el informe ya tiene contraparte (✅ Resuelta) → advertir:

  > "Este informe ya fue remediado (`fix-security-[nombre].md` existe).
  > ¿Querés generar una nueva versión (`-v2`) o elegir otra auditoría?"

#### 0.4 — Confirmar informe seleccionado

```
Informe seleccionado: auditoria-[tipo]-[scope]-[fecha].md
Contraparte a generar: fix-security-[tipo]-[scope]-[fecha].md

Scope:     [scope auditado]
Tipo:      [Triage / Deep Dive]
Fecha:     [fecha de la auditoría]
Hallazgos: N críticos, N altos, N medios, N bajos
```

---

### PASO 1 — Clasificar Hallazgos

Leer el informe completo e identificar para cada hallazgo:

| Campo         | Qué extraer                                              |
| ------------- | -------------------------------------------------------- |
| Nombre        | Título del hallazgo                                      |
| Severidad     | 🔴/🟠/🟡/🔵                                              |
| Archivo       | Ruta y línea del código vulnerable                       |
| Remediación   | Código corregido de la sección "Remediación" del informe |
| Automatizable | ¿Puede aplicarse editando código/config local?           |

**Automatizables:**

- Cambios de código fuente (eliminar decoradores, agregar imports, modificar lógica)
- Agregar módulos/guards/pipes en configuración de NestJS o Next.js
- Instalar dependencias npm de seguridad

**Requieren intervención manual:**

- Rotación de secrets en producción (JWT_SECRET, AUTH_SECRET, etc.)
- Cambios de infraestructura (firewall, HTTPS, WAF)
- Configuración de servicios externos
- Políticas de equipo u organización

Mostrar tabla y confirmar antes de proceder:

```
| # | Hallazgo | Severidad | Automatizable | Esfuerzo |
|---|----------|-----------|---------------|---------|
| 1 | [nombre] | 🔴 Crítico | ✅ Sí | Bajo |
| 2 | [nombre] | 🟠 Alto   | ✅ Sí | Medio |
| 3 | [nombre] | 🟡 Medio  | ⚠️ Manual | — |

Voy a aplicar N fixes automáticos. ¿Procedemos?
```

---

### PASO 2 — Aplicar Fixes (Crítico → Alto → Medio → Bajo)

Para cada hallazgo automatizable, **en orden estricto de severidad**:

1. **Leer el archivo afectado** — SIEMPRE leer antes de editar, nunca editar de memoria.

2. **Si se necesitan dependencias nuevas**, instalarlas primero:

   ```bash
   npm install <paquete> --workspace=@amauta/api   # o @amauta/web
   ```

3. **Aplicar el fix** usando el código de remediación del informe como guía.
   - Respetar el estilo y convenciones existentes del archivo
   - No hacer cambios adicionales fuera del scope del fix
   - Si el fix requiere múltiples archivos, aplicarlos todos antes de verificar

4. **Confirmar** el cambio al usuario con un resumen de una línea:
   > "✅ Fix 1/N aplicado: [descripción breve del cambio]"

---

### PASO 3 — Verificación Post-Remediación

Después de aplicar **todos** los fixes, correr el build del workspace afectado:

```bash
# Si se modificó el backend
npm run build --workspace=@amauta/api 2>&1 | grep "error TS"

# Si se modificó el frontend
npm run build --workspace=@amauta/web 2>&1 | tail -20
```

#### Si el build falla

1. Identificar cada error:
   - **¿Lo introdujo este fix?** → Corregirlo antes de continuar. No cerrar con regresiones.
   - **¿Era pre-existente?** → Documentarlo en el informe de resultado.

2. Para distinguir pre-existente vs introducido:
   ```bash
   git stash && npm run build --workspace=@amauta/api 2>&1 | grep -c "error TS"
   git stash pop
   ```
   Si el conteo es igual antes y después → todos pre-existentes.

---

### PASO 4 — Generar Informe de Resultado

```markdown
# Fix Security Findings — [tipo]-[scope]-[fecha]

**Informe original:** `docs/auditorias/auditoria-[tipo]-[scope]-[fecha].md`
**Fecha de remediación:** [fecha actual]
**Remediado por:** Senior Security Engineer (IA)

---

## Fixes Aplicados ✅

| #   | Hallazgo | Severidad  | Archivo modificado | Estado      |
| --- | -------- | ---------- | ------------------ | ----------- |
| 1   | [nombre] | 🔴 Crítico | `ruta/archivo.ts`  | ✅ Aplicado |
| 2   | [nombre] | 🟠 Alto    | `ruta/archivo.ts`  | ✅ Aplicado |

## Requieren Intervención Manual ⚠️

| Hallazgo | Severidad | Motivo   | Acción requerida       |
| -------- | --------- | -------- | ---------------------- |
| [nombre] | 🟡 Medio  | [motivo] | [instrucción concreta] |

## Estado del Build

- **Backend** (`@amauta/api`): ✅ Limpio / ⚠️ N errores pre-existentes / ❌ N errores nuevos
- **Frontend** (`@amauta/web`): ✅ Limpio / ⚠️ N errores pre-existentes / ❌ N errores nuevos

## Próximos Pasos

[Lista numerada de acciones manuales pendientes con instrucciones concretas]
```

---

### PASO 5 — Guardar Informe de Resultado

El nombre se construye **reemplazando `auditoria-` por `fix-security-`** en el nombre original:

```
docs/auditorias/fix-security-[tipo]-[scope]-[fecha].md
```

Si ya existe, agregar sufijo `-v2`, `-v3`, etc.

Informar al usuario:

> "✅ Remediación completada. N/N fixes aplicados.
> Informe guardado en `docs/auditorias/fix-security-[tipo]-[scope]-[fecha].md`"

---

## Niveles de Automatización

| Tipo de fix                               | Automatizable | Ejemplo                                 |
| ----------------------------------------- | ------------- | --------------------------------------- |
| Eliminar decorador inseguro               | ✅ Sí         | Quitar `@Public()` de endpoint sensible |
| Agregar guard/throttle                    | ✅ Sí         | `@Throttle()`, `@UseGuards(RolesGuard)` |
| Instalar dependencia                      | ✅ Sí         | `npm install @nestjs/throttler`         |
| Restringir campos en respuesta            | ✅ Sí         | Agregar `select` en query Prisma        |
| Sanitizar HTML en frontend                | ✅ Sí         | Agregar `DOMPurify.sanitize()`          |
| Rotar JWT_SECRET en producción            | ⚠️ Manual     | Requiere acceso al servidor             |
| Configurar firewall / rate limit en proxy | ⚠️ Manual     | Requiere acceso a infraestructura       |
| Forzar HTTPS a nivel servidor             | ⚠️ Manual     | Requiere configuración de Nginx/Dokploy |

---

## Notas

- **Nunca editar sin leer primero** — siempre leer el archivo antes de modificarlo.
- **No ir más allá del fix** — aplicar exactamente lo indicado en el informe. No refactorizar código adyacente.
- **Regresiones tienen prioridad** — si un fix introduce un error de build, corregirlo antes de avanzar al siguiente.
- **Los fixes manuales son tan importantes como los automáticos** — documentarlos con instrucciones claras y accionables.
- **Skill complementario**: este skill es el paso 2 del flujo iniciado por `/security-audit`. Ver `ia-skills/security-audit.md`.
