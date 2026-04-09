# Skill: Issue Inspector

> Inspector de QA automatizado que audita issues completados.
> Verifica que lo entregado cumple los requisitos del issue y funciona en producción.
> Genera un documento de auditoría en `docs/audits/`.
>
> **Ambiente de pruebas:** Producción (https://amauta-api.diazignacio.ar)
>
> **Salida:** `docs/audits/issue-{N}-{slug}.md`

---

## Uso

```
/issue-inspector #45
```

**Ejemplos:**

```
/issue-inspector #71
Audita el issue #82
Inspecciona el issue 45
```

---

## Proceso de Inspección (Ejecutar en Orden)

### PASO 1 — Leer el Issue

```bash
gh issue view [N] --json number,title,body,state,labels,closedAt
```

Extraer:

- **Número y título** del issue
- **Estado** (debe estar cerrado para auditar)
- **Criterios de aceptación** (checklist en el body)
- **Labels** (para identificar fase/módulo)
- **Fecha de cierre**

Si el issue NO está cerrado, preguntar si continuar igualmente.

**Generar slug** a partir del título:

- `Sistema de inscripciones` → `sistema-de-inscripciones`
- `API Foros por curso` → `api-foros-por-curso`

---

### PASO 2 — Identificar Módulo y Archivos

Desde el body del issue y CLAUDE.md, identificar:

1. **Módulo backend** afectado (ej: `inscripciones`, `grupos`, `foros`)
2. **Archivos clave** mencionados o esperados:
   - Controller: `apps/api/src/{modulo}/{modulo}.controller.ts`
   - Service: `apps/api/src/{modulo}/{modulo}.service.ts`
   - Tests: `apps/api/src/{modulo}/*.spec.ts`

3. **Archivos frontend** (si aplica):
   - Páginas: `apps/web/src/app/{ruta}/page.tsx`
   - Componentes: `apps/web/src/components/{modulo}/`

Verificar que cada archivo existe:

```bash
ls apps/api/src/{modulo}/{modulo}.controller.ts
ls apps/api/src/{modulo}/{modulo}.service.ts
```

---

### PASO 3 — Extraer Criterios de Aceptación

Del body del issue, buscar el checklist de criterios:

```markdown
## Criterios de Aceptación

- [ ] Endpoint POST /cursos/:id/inscribir crea inscripción
- [ ] No permite inscripción duplicada
- [ ] Tests unitarios con >80% cobertura
```

Convertir cada ítem en una verificación concreta.

---

### PASO 4 — Ejecutar Tests del Módulo

```bash
cd /home/ignacio/amauta && npx jest --config apps/api/jest.config.js \
  --testPathPattern="{modulo}" --coverage \
  --collectCoverageFrom="apps/api/src/{modulo}/**/*.ts" 2>&1
```

Capturar:

- Total de tests
- Tests pasando
- Tests fallando
- Cobertura (statements, branches, functions, lines)

**Criterios mínimos:**

- 0 tests fallando
- > 80% cobertura statements

---

### PASO 5 — Pruebas en Producción (Smoke Tests)

Para cada endpoint del módulo, hacer pruebas contra producción.

#### 5.1 Endpoints públicos (sin auth)

```bash
# Verificar que responde 200
curl -s -o /dev/null -w "%{http_code}" \
  https://amauta-api.diazignacio.ar/api/v1/cursos
```

#### 5.2 Endpoints protegidos (requieren auth)

```bash
# Sin token → debe dar 401
curl -s -o /dev/null -w "%{http_code}" \
  https://amauta-api.diazignacio.ar/api/v1/mis-cursos
# Esperado: 401
```

#### 5.3 Endpoints inexistentes

```bash
# Ruta que no existe → debe dar 404
curl -s -o /dev/null -w "%{http_code}" \
  https://amauta-api.diazignacio.ar/api/v1/ruta-falsa
# Esperado: 404
```

**Tabla de verificación:**

| Endpoint                | Método | Auth | Esperado      | Resultado |
| ----------------------- | ------ | ---- | ------------- | --------- |
| `/cursos`               | GET    | No   | 200           | ?         |
| `/cursos/:id/inscribir` | POST   | Sí   | 401 sin token | ?         |
| `/mis-cursos`           | GET    | Sí   | 401 sin token | ?         |

**Interpretación:**

- ✅ Código esperado coincide
- ❌ Código diferente (404 = no existe, 500 = error)

---

### PASO 6 — Verificar Criterios de Aceptación

Para cada criterio extraído en PASO 3, determinar:

| Criterio              | Verificación          | Estado |
| --------------------- | --------------------- | ------ |
| Endpoint POST existe  | Revisar controller    | ✅/❌  |
| No permite duplicados | Revisar service/tests | ✅/❌  |
| Tests >80% cobertura  | Resultado PASO 4      | ✅/❌  |

---

### PASO 7 — Determinar Veredicto

| Condición                                           | Veredicto                     |
| --------------------------------------------------- | ----------------------------- |
| Todos los criterios ✅, tests pasan, producción OK  | ✅ APROBADO                   |
| Funciona pero hay mejoras menores                   | ⚠️ APROBADO CON OBSERVACIONES |
| Algún criterio ❌, tests fallan, o producción falla | ❌ RECHAZADO                  |

---

### PASO 8 — Generar Documento de Auditoría

Crear archivo: `docs/audits/issue-{N}-{slug}.md`

````markdown
# Auditoría Issue #{N} — {Título}

**Fecha:** {fecha actual}
**Inspector:** Claude (automatizado)
**Issue:** #{N} - {título}
**Estado del issue:** {Cerrado/Abierto}
**Veredicto:** {✅ APROBADO / ⚠️ CON OBSERVACIONES / ❌ RECHAZADO}

---

## Resumen

{2-3 oraciones describiendo qué se auditó y el resultado general}

---

## Requisitos del Issue

Extraídos del issue #{N}:

- [x/✗] {criterio 1}
- [x/✗] {criterio 2}
- [x/✗] {criterio 3}

---

## Verificación de Código

| Archivo                                          | ¿Existe? | Notas |
| ------------------------------------------------ | -------- | ----- |
| `apps/api/src/{modulo}/{modulo}.controller.ts`   | ✅/❌    |       |
| `apps/api/src/{modulo}/{modulo}.service.ts`      | ✅/❌    |       |
| `apps/api/src/{modulo}/{modulo}.service.spec.ts` | ✅/❌    |       |

---

## Tests

**Comando ejecutado:**

```bash
npx jest --testPathPattern="{modulo}" --coverage
```
````

**Resultados:**

- Total: {N}
- Pasaron: {N}
- Fallaron: {N}

**Cobertura:**
| Métrica | Valor | Estado |
|---------|-------|--------|
| Statements | {N}% | ✅/❌ |
| Branches | {N}% | ✅/❌ |
| Functions | {N}% | ✅/❌ |
| Lines | {N}% | ✅/❌ |

---

## Pruebas en Producción

**Ambiente:** https://amauta-api.diazignacio.ar

| Endpoint         | Método | Esperado | Resultado | Estado |
| ---------------- | ------ | -------- | --------- | ------ |
| `/api/v1/{ruta}` | GET    | 200      | {código}  | ✅/❌  |
| `/api/v1/{ruta}` | POST   | 401      | {código}  | ✅/❌  |

---

## Criterios de Aceptación

| #   | Criterio   | Verificación       | Estado |
| --- | ---------- | ------------------ | ------ |
| 1   | {criterio} | {cómo se verificó} | ✅/❌  |
| 2   | {criterio} | {cómo se verificó} | ✅/❌  |

---

## Hallazgos

{Si hay problemas, listarlos aquí. Si no hay:}

Ningún hallazgo. El issue cumple todos sus requisitos.

---

## Observaciones

{Notas adicionales, recomendaciones, o mejoras sugeridas}

---

## Evidencia

{Logs relevantes, si los hay}

```
{output de comandos importantes}
```

````

---

### PASO 9 — Actualizar Índice

Agregar entrada en `docs/audits/README.md`:

```markdown
| #{N} | {Título} | {Fecha} | {Veredicto} |
````

---

## Notas para el Inspector

1. **Issues cerrados**: Preferir auditar issues ya cerrados
2. **Sin auth real**: Las pruebas de producción verifican que endpoints protegidos devuelven 401 sin token (no hacemos login real)
3. **Tests locales**: Los tests se ejecutan localmente, no en producción
4. **Evidencia mínima**: Solo incluir logs si hay problemas o son relevantes
5. **Objetividad**: Reportar hechos, no opiniones
6. **Slug corto**: Máximo 5 palabras en el slug del archivo

---

## Ejemplo de Invocación

```
Usuario: /issue-inspector #45

Inspector:
1. Lee issue #45 (Sistema de inscripciones)
2. Identifica módulo: inscripciones
3. Verifica archivos: controller ✅, service ✅, tests ✅
4. Ejecuta tests: 26 pasando, 0 fallando, 100% cobertura
5. Prueba producción:
   - GET /cursos → 200 ✅
   - POST /cursos/:id/inscribir → 401 ✅ (sin token)
   - GET /mis-cursos → 401 ✅ (sin token)
6. Verifica criterios: 4/4 cumplidos
7. Veredicto: ✅ APROBADO
8. Genera: docs/audits/issue-045-sistema-inscripciones.md
9. Actualiza índice
```

---

## Criterios de Calidad

| Aspecto              | Mínimo Aceptable  |
| -------------------- | ----------------- |
| Tests pasando        | 100%              |
| Cobertura statements | >80%              |
| Endpoints responden  | Códigos esperados |
| Criterios cumplidos  | 100%              |
| Archivos existen     | Todos los core    |
