# Skill: Complete Issue (Automata)

> Versión autónoma del skill complete-issue, diseñada para operar dentro del agentic loop.
> Ejecuta un issue de GitHub de principio a fin usando TDD: escribe primero los tests de mayor valor,
> luego implementa el código hasta que pasen, documenta y cierra el issue.
>
> **Requisito fundamental**: Ningún issue de código puede cerrarse sin verificación automatizada suficiente. Mantener TDD, pero evitando tests redundantes, triviales o costosos sin valor real.

---

## Uso

```
Ejecutá el issue #[número] de forma autónoma siguiendo el workflow completo de complete-issue.
```

---

## Parámetros

| Parámetro    | Descripción             | Ejemplo |
| ------------ | ----------------------- | ------- |
| `número`     | Número del issue GitHub | `42`    |
| `loop_count` | Contador del loop       | `[1/3]` |

Semántica de `loop_count`:

- `X` = cantidad de issues ya completados exitosamente antes de iniciar esta sesión
- `N` = cantidad máxima de issues a completar
- `complete-issue-automata` recibe `[X/N]`, ejecuta un issue y, si termina bien, dispara la siguiente sesión con `[X+1/N]`

---

## Proceso Autónomo (Ejecutar en Orden Estricto)

### PASO 0 — Verificar Estado del Proyecto (SIEMPRE al iniciar)

Antes de cualquier otra acción, verificar el estado actual del desarrollo consultando **tres fuentes** y comparándolas.

#### Fuente 1 — GitHub (estado real de cada issue)

```bash
# Determinar primero la label de la fase actual leyendo roadmap.md y CLAUDE.md.
# Ejemplo actual del proyecto: phase-4

# Issues abiertos de la fase actual, ordenados por número
gh issue list --label "[phase-label]" --state open --limit 20 --json number,title,labels \
  | jq -r '.[] | "#\(.number) \(.title) [\(.labels | map(.name) | join(", "))]"'

# Issues cerrados recientes (para detectar completados no registrados)
gh issue list --label "[phase-label]" --state closed --limit 10 --json number,title \
  | jq -r '.[] | "#\(.number) \(.title)"'
```

#### Fuente 2 — roadmap.md (orden y dependencias)

```
LEER: docs/project-management/roadmap.md → sección de la fase actual
```

Extraer:

- Orden definido para los issues de la fase
- Dependencias explícitas entre issues (cuál debe ir antes)
- Issues marcados como `must-have` vs `should-have`

#### Fuente 3 — CLAUDE.md (progreso documentado)

```
LEER: CLAUDE.md → sección "Próximos pasos" y "Completado en Fase X"
```

#### Comparar las tres fuentes

Construir una tabla de verificación:

| Issue | Título | GitHub | roadmap.md | CLAUDE.md |
| ----- | ------ | ------ | ---------- | --------- |
| #38   | F1-011 | OPEN   | Pendiente  | Pendiente |
| #37   | F1-010 | CLOSED | Completado | ✅        |

**Si las tres fuentes coinciden** → continuar al siguiente paso.

**Si hay divergencias**, resolverlas con estas reglas:

| Divergencia                                                                 | Fuente de verdad | Acción                           |
| --------------------------------------------------------------------------- | ---------------- | -------------------------------- |
| Issue cerrado en GitHub pero pendiente en CLAUDE.md                         | GitHub           | Actualizar CLAUDE.md             |
| Issue abierto en GitHub pero marcado completo en CLAUDE.md                  | GitHub           | Reabrir o investigar             |
| Orden diferente entre roadmap.md y los issues de GitHub                     | roadmap.md       | Seguir el orden del roadmap      |
| Progreso total diferente (ej: GitHub dice 10 cerrados, CLAUDE.md dice 8/16) | GitHub           | Actualizar contador en CLAUDE.md |

#### Determinar el próximo issue a trabajar

Si no se especificó un número de issue:

1. Tomar los issues OPEN en GitHub de la fase actual
2. Ordenarlos según el orden definido en `roadmap.md`
3. Aplicar criterios de selección (en orden de prioridad):
   - Priorizar issues con label `must-have`
   - Respetar dependencias (no empezar un issue si su dependencia está OPEN)
   - Tomar el primero según el orden del roadmap

Si se especificó un número:

- Verificar que el issue existe y está OPEN en GitHub
- Verificar que sus dependencias están cerradas
- Si está cerrado o tiene dependencias pendientes, registrar en `docs/ai-skills/automata-dev/loop-status.md` y hacer STOP

---

### PASO 1 — Leer el Issue

```bash
gh issue view [número] --json title,body,labels
```

Extraer y registrar:

- Objetivo principal
- Checklist de subtareas (insumo para derivar escenarios de test, no una equivalencia 1:1)
- Labels: `backend`, `frontend`, `database`, etc.
- Dependencias con otros issues
- **Estado de implementación**: ¿el issue menciona que la implementación ya existe?

#### Determinar el modo de trabajo según el estado del issue

Luego de leer el issue, clasificarlo en uno de estos dos modos:

| Modo                          | Condición                                  | Flujo                                                                                                  |
| ----------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| **Modo A — TDD completo**     | Implementación NO existe                   | RED → GREEN: escribir tests, confirmar que fallan, implementar, confirmar que pasan                    |
| **Modo B — Tests pendientes** | Implementación YA existe pero faltan tests | Escribir tests que cubran lo implementado, verificar que pasan, NO modificar implementación salvo bugs |

**Señales de Modo B** (implementación existente):

- El cuerpo del issue dice "implementación completada" o "Estado Actual: ✅"
- El checklist técnico tiene ítems marcados con `[x]` pero los tests están como `[ ]`
- Existe código en `apps/api/src/[modulo]/` pero no hay archivo `.spec.ts`

**Regla para Modo B**: Los tests deben cubrir el comportamiento existente. Si un test falla porque la implementación tiene un bug, **corregir el bug** — no el test. El test describe el contrato correcto definido en el issue.

**En ambos modos, cerrar el issue requiere tests pasando.** No hay excepción.

---

### PASO 2 — Cargar Contexto Obligatorio

Leer los archivos correspondientes **antes de escribir una sola línea de código o test**:

#### Si toca base de datos o Prisma:

```
LEER: docs/ai-context/database/schema.md
LEER: apps/api/prisma/schema.prisma
```

#### Si toca backend:

```
LEER: docs/ai-context/_patterns.md
LEER: docs/ai-context/modules/[modulo].md  (si existe)
```

#### Si toca frontend:

```
LEER: docs/ai-context/frontend/components.md
LEER: docs/ai-context/frontend/pages.md
LEER: docs/ai-context/frontend/hooks.md    (si usa auth/roles)
```

#### Para entender el patrón de tests existente:

```
LEER: apps/api/src/cursos/cursos.service.spec.ts   (referencia de unit test backend)
LEER: docs/technical/testing.md                     (guía completa de testing)
LEER: docs/ai-skills/amauta-high-value-tests.md     (criterio obligatorio para diseñar tests)
```

> **Regla absoluta**: Nunca inventar nombres de campos, enums, relaciones o tablas.
> Verificar en el schema antes de usarlos en tests o en código.

---

### PASO 3 — Crear Plan de Trabajo

Crear un todo list antes de empezar. La estructura varía según el modo determinado en PASO 1:

**Modo A — TDD completo** (implementación no existe):

```
1. [Contexto]     Leer schema / patterns / módulo existente
2. [Tests RED]    Escribir tests que describen el comportamiento esperado
3. [Verificar]    Ejecutar tests → deben FALLAR (confirmar que el test es válido)
4. [Implementar]  Escribir el código mínimo para que los tests pasen
5. [Tests GREEN]  Ejecutar tests → deben PASAR
6. [Refactor]     Limpiar código sin romper tests, ejecutar tests de nuevo
7. [Docs]         Actualizar documentación del sistema
8. [Commit]       Commit con tests + implementación
9. [Cierre]       Cerrar el issue con comentario
```

**Modo B — Tests pendientes** (implementación ya existe):

```
1. [Contexto]     Leer schema / patterns / código existente del módulo
2. [Explorar]     Leer implementación existente (service, controller, module)
3. [Tests GREEN]  Escribir tests que cubran el comportamiento implementado
4. [Verificar]    Ejecutar tests → deben PASAR (si fallan, hay un bug — corregirlo)
5. [Refactor]     Si se corrigieron bugs, verificar que todos los tests siguen en verde
6. [Docs]         Actualizar documentación del sistema
7. [Commit]       Commit con tests (+ correcciones si las hubo)
8. [Cierre]       Cerrar el issue con comentario
```

---

### PASO 4 — Escribir Tests

> **Modo A**: Escribir tests ANTES de implementar. Deben fallar (RED).
> **Modo B**: Escribir tests DESPUÉS de leer la implementación. Deben pasar (GREEN).

Antes de definir cualquier test, aplicar obligatoriamente:

`docs/ai-skills/amauta-high-value-tests.md`

En ambos modos, derivar una **matriz mínima de tests de alto valor**. No convertir el checklist del issue en una lista mecánica de tests.

#### Regla de selección de tests

Crear tests solo si cubren al menos una de estas categorías:

- regla de negocio relevante
- permiso, ownership o seguridad
- validación con ramas reales
- transición de estado o efecto lateral importante
- regresión conocida o bug probable
- caso límite con impacto real

No crear tests para:

- delegación trivial de controller sin lógica propia
- mapeos obvios o getters/setters
- texto, markup o props sin comportamiento relevante
- duplicados de otro test que ya cubre el mismo contrato
- líneas solo para subir cobertura

#### Regla de densidad

- Un issue puede resolverse con pocos tests si cubren el comportamiento crítico.
- Un checklist puede mapearse a menos tests si varios ítems pertenecen al mismo flujo.
- Si una rama no agrega riesgo real, no necesita test dedicado.

#### Prioridad recomendada

1. Service o capa de negocio
2. Integración liviana o utilidades críticas
3. Controller solo si agrega lógica, transformación o manejo de errores propio
4. UI solo para comportamiento visible importante

#### Dónde crear los archivos de test:

```

Backend (service): apps/api/src/[modulo]/[modulo].service.spec.ts
Backend (controller): apps/api/src/[modulo]/[modulo].controller.spec.ts
Frontend (componente): apps/web/src/components/[Componente]/[Componente].test.tsx
Frontend (página): apps/web/src/app/[ruta]/page.test.tsx

```

#### Patrón de test backend (unit test de service):

```typescript
// apps/api/src/[modulo]/[modulo].service.spec.ts

// 1. Mockear @prisma/client ANTES de cualquier import
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  })),
  // Incluir SOLO los enums que usa este módulo (verificar en schema.prisma)
  EstadoCurso: {
    BORRADOR: 'BORRADOR',
    PUBLICADO: 'PUBLICADO',
    ARCHIVADO: 'ARCHIVADO',
  },
}));

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { [Modulo]Service } from './[modulo].service';
import { PrismaService } from '../prisma/prisma.service';

describe('[Modulo]Service', () => {
  let service: [Modulo]Service;
  let prisma: ReturnType<typeof createMockPrisma>;

  const createMockPrisma = () => ({
    [modulo]: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  });

  beforeEach(async () => {
    prisma = createMockPrisma();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        [Modulo]Service,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<[Modulo]Service>([Modulo]Service);
    jest.resetAllMocks();
  });

  // Un describe por método público
  describe('[método]', () => {
    it('debería [comportamiento esperado] cuando [condición]', async () => {
      // Arrange
      prisma.[modulo].[método].mockResolvedValue([datos mock]);

      // Act
      const result = await service.[método]([args]);

      // Assert
      expect(result).[matcher];
      expect(prisma.[modulo].[método]).toHaveBeenCalledWith([args esperados]);
    });

    it('debería lanzar NotFoundException cuando el recurso no existe', async () => {
      prisma.[modulo].findUnique.mockResolvedValue(null);

      await expect(service.[método]('id-inexistente')).rejects.toThrow(
        NotFoundException
      );
    });

    it('debería lanzar BadRequestException con datos inválidos', async () => {
      await expect(service.[método]({})).rejects.toThrow(
        BadRequestException
      );
    });
  });
});
```

#### Reglas obligatorias para tests backend

- Usar mocks frescos por test o por `beforeEach`; no compartir implementaciones persistentes.
- Preferir `jest.resetAllMocks()` cuando el test configure `mockResolvedValue`, `mockImplementation` o secuencias.
- Preferir `mockResolvedValueOnce(...)` cuando el flujo depende de múltiples consultas consecutivas.
- No testear controller y service con el mismo set de casos si el controller solo delega.
- Si el riesgo vive en el service, testear el service.

#### Patrón de test frontend (componente):

```typescript
// apps/web/src/components/[Componente]/[Componente].test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { [Componente] } from './[Componente]';

describe('[Componente]', () => {
  it('debería renderizar [elemento] correctamente', () => {
    render(<[Componente] />);
    expect(screen.getByRole('[rol]', { name: /[texto]/i })).toBeInTheDocument();
  });

  it('debería [comportamiento] cuando el usuario [acción]', async () => {
    const mockFn = jest.fn();
    render(<[Componente] onAction={mockFn} />);

    await userEvent.click(screen.getByRole('button', { name: /[texto]/i }));

    expect(mockFn).toHaveBeenCalled();
  });
});
```

#### Regla obligatoria para frontend

- Testear comportamiento visible o interacción importante, no estructura interna irrelevante.
- Si la lógica puede probarse sin DOM, preferir test unitario de utilidad o hook antes que un render pesado.

---

### PASO 5 — Verificar Estado de los Tests

```bash
# Backend
npm run test -w @amauta/api -- --testPathPattern="[modulo]"

# Frontend
npm run test -w @amauta/web -- --testPathPattern="[Componente]"
```

**Modo A**: Los tests DEBEN fallar. Si pasan sin implementación, el test está mal escrito — revisar y corregir.

**Modo B**: Los tests DEBEN pasar. Si alguno falla:

- Investigar si es un bug en la implementación
- Corregir el bug (nunca el test)
- Si la implementación no se puede corregir de forma segura → STOP, registrar en `docs/ai-skills/automata-dev/loop-status.md`, no escribir next-prompt.md

---

### PASO 6 — Implementar el Código (GREEN)

Escribir el código mínimo necesario para que los tests pasen. Seguir los patrones del proyecto:

**Validación (SIEMPRE safeParse):**

```typescript
const result = schema.safeParse(dto);
if (!result.success) {
  throw new BadRequestException(result.error.issues[0]?.message);
}
const data = result.data;
```

**Eliminación (soft delete por defecto):**

```typescript
await this.prisma.[modulo].update({
  where: { id },
  data: { estado: 'ARCHIVADO' },
});
```

**Estructura de respuestas:**

```typescript
// Singular: { [modelo]: data, message: 'Acción exitosa' }
// Lista:    { [modelos]: data[], total, page, limit, totalPages }
```

---

### PASO 7 — Verificar que los Tests Pasan (GREEN) y Refactorizar

```bash
# Verificar que pasan
npm run test --workspace=@amauta/api -- --testPathPattern="[modulo]"

# Ver cobertura
npm run test:cov --workspace=@amauta/api
```

Si algún test falla: corregir la implementación, **no el test** (salvo que el test esté mal escrito).

Una vez en verde, refactorizar si es necesario y ejecutar tests de nuevo para confirmar que siguen en verde.

**Objetivo de cobertura mínima**: >80% statements en el módulo nuevo.

#### Criterio de salida para tests

Antes de cerrar el issue, verificar:

- los tests nuevos cubren comportamiento importante y no duplicado
- el set total de tests del módulo sigue siendo entendible y mantenible
- no se agregaron tests solo para cumplir cobertura o checklist
- los mocks no dejan estado persistente entre casos

---

### PASO 7.5 — Verificar Tipos de TypeScript (CRÍTICO)

> **Por qué este paso**: `next dev` y `nest start:dev` no verifican tipos completamente.
> El build de producción (`next build`) sí lo hace y **fallará** si hay errores de tipo.
> Este paso previene deployments fallidos.

```bash
# Backend - verificar tipos
npx tsc --noEmit -p apps/api/tsconfig.json

# Frontend - verificar tipos
npx tsc --noEmit -p apps/web/tsconfig.json
```

**Si hay errores de tipo:**

1. Corregir los errores (son errores reales que romperán producción)
2. Ejecutar tests de nuevo para confirmar que siguen en verde
3. Continuar al siguiente paso

> Si TypeScript no compila → STOP, registrar en `docs/ai-skills/automata-dev/loop-status.md`, no escribir next-prompt.md.

---

### PASO 8 — Generar Documentación (OBLIGATORIO)

> ⛔ **Ningún issue puede cerrarse sin estos dos artefactos actualizados. Sin excepción.**

---

#### 8.1 — Actualizar `docs/ai-context/` (contexto para la IA)

| Tipo de issue                           | Qué actualizar                                                                       |
| --------------------------------------- | ------------------------------------------------------------------------------------ |
| DB / Prisma                             | `docs/ai-context/database/schema.md` → reflejar modelos, relaciones e índices nuevos |
| Backend — módulo nuevo                  | Crear `docs/ai-context/modules/{modulo}.md` con endpoints, permisos y ejemplos       |
| Backend — endpoints en módulo existente | Actualizar `docs/ai-context/modules/{modulo}.md` → tabla de endpoints                |
| Frontend — páginas nuevas               | Actualizar `docs/ai-context/frontend/pages.md`                                       |
| Frontend — componentes nuevos           | Actualizar `docs/ai-context/frontend/components.md`                                  |
| Patrones nuevos o cambios de convención | Actualizar `docs/ai-context/_patterns.md`                                            |

Si el archivo del módulo no existe, **crearlo**. Usar `docs/ai-context/modules/cursos.md` como plantilla de referencia.

También actualizar si aplica:

- `docs/sistema/README.md` → tabla de estado general
- `docs/sistema/etapa-X-[nombre].md` → cambiar ⏳ a ✅, agregar fecha y descripción

---

#### 8.2 — Crear `docs/human-context/issue-{número}-{slug}.md` (descripción funcional para humanos)

**SIEMPRE crear este archivo** — uno por issue, sin importar si es backend, frontend o DB.

**Nombre del archivo:** `issue-{número}-{slug}.md` donde el slug es el título del issue en minúsculas con guiones. Ej: `issue-79-calificaciones-periodo-academico.md`

**Formato obligatorio:**

```markdown
# Issue #{número} — {título del issue}

**Qué podés hacer ahora:** [una línea que resume la funcionalidad nueva en lenguaje de usuario]

---

## Como [Rol principal], ahora podés:

### [Acción principal]

1. [Paso concreto]
2. [Paso concreto]
3. [Resultado esperado]

---

## Quién puede usarlo

| Rol           | ¿Puede usarlo? |
| ------------- | -------------- |
| ESTUDIANTE    | ❌ / ✅        |
| EDUCADOR      | ❌ / ✅        |
| ADMIN_ESCUELA | ❌ / ✅        |
| SUPER_ADMIN   | ❌ / ✅        |

---

## Usuarios de prueba para testear

| Email                 | Contraseña  | Rol           |
| --------------------- | ----------- | ------------- |
| admin1@amauta.test    | password123 | ADMIN_ESCUELA |
| educador1@amauta.test | password123 | EDUCADOR      |

---

## Nota (solo si aplica)

> Si el issue es solo backend sin UI: explicar cómo probar via API (endpoint, método, body de ejemplo).
> Si hay limitaciones conocidas: documentarlas aquí.
```

---

### PASO 9 — Hacer Commit

Incluir **siempre** los archivos de test junto con la implementación:

```bash
git add apps/api/src/[modulo]/[modulo].service.ts
git add apps/api/src/[modulo]/[modulo].service.spec.ts
git add apps/api/src/[modulo]/[modulo].controller.ts
git add apps/api/src/[modulo]/[modulo].controller.spec.ts
# ... resto de archivos

git commit -m "$(cat <<'EOF'
[tipo]: [descripción corta en español, máx 72 chars]

- [cambio 1]
- [cambio 2]
- Tests: [qué se cubre con los tests]

Resuelve: #[número]
EOF
)"
```

---

### PASO 10 — Actualizar CLAUDE.md (si aplica)

Si el issue es un hito de Fase 4 (F4-0XX):

- Mover el issue de "Próximos pasos" a "Completado en Fase 4"
- Actualizar el contador de progreso

---

### PASO 11 — Cerrar el Issue

```bash
gh issue close [número] --comment "✅ Implementación completada con TDD.

**Resumen:**
[1-2 líneas de qué se implementó]

**Checklist:**
- ✅ [item 1 del issue]
- ✅ [item 2 del issue]
- ✅ Tests escritos y pasando

**Cobertura:**
- [Módulo]: >80% statements

**Documentación actualizada:**
- ✅ docs/sistema/[archivo]
- ✅ CLAUDE.md (si aplica)

**Commit:** [hash corto]"
```

---

### PASO 12 — Actualizar loop-status.md y escribir next-prompt.md

> Este paso solo aplica cuando el skill opera dentro del agentic loop (loop_count presente).

Escribir en `docs/ai-skills/automata-dev/loop-status.md`:

```
## [fecha] — Sesión [loop_count]
- Tipo: complete-issue-automata
- Issue completado: #[N] — [título]
- Commit: [hash]
- Tests: [cantidad] pasando
- Próxima sesión: [project-manager-automata o loop-auditor] [loop_count=[X+1]/[N_max]]
```

**Condiciones para escribir next-prompt.md** (TODAS deben ser verdaderas):

- ✅ Tests pasan
- ✅ TypeScript compila
- ✅ Issue cerrado en GitHub
- ✅ Commit hecho
- ✅ `X + 1 <= N_max`

Si todas las condiciones son verdaderas, primero calcular:

- `completed_count = X + 1`

Regla simple:

- Si `completed_count` es `3`, `6`, `9`, etc. → la próxima sesión es `loop-auditor`
- Si no → la próxima sesión es `project-manager-automata`

Ejemplos:

- completaste el issue 1 del loop → sigue `project-manager-automata`
- completaste el issue 2 del loop → sigue `project-manager-automata`
- completaste el issue 3 del loop → sigue `loop-auditor`

Si la próxima sesión es `project-manager-automata`, escribir `docs/ai-skills/automata-dev/next-prompt.md`:

```
/project-manager-automata [loop_count=[completed_count]/[N_max]]

Contexto: completó issue #[N] — [título]. Commit: [hash].
```

Si la próxima sesión es `loop-auditor`, escribir `docs/ai-skills/automata-dev/next-prompt.md`:

```
/loop-auditor [loop_count=[completed_count]/[N_max]] [issues=#N-2,#N-1,#N]

Contexto: se completó un bloque de 3 issues.
Issue recién completado: #[N] — [título]. Commit: [hash].
```

Orden obligatorio para evitar carreras con el runner:

1. Actualizar `docs/ai-skills/automata-dev/loop-status.md`
2. Hacer commit de `loop-status.md`
3. Escribir `docs/ai-skills/automata-dev/next-prompt.md`

`next-prompt.md` es un archivo efímero de coordinación. No commitearlo. El runner lo
puede consumir apenas aparece.

**NO escribir next-prompt.md si:**

- Tests fallaron → STOP
- TypeScript no compila → STOP
- Issue no pudo cerrarse → STOP
- `completed_count > N_max` → STOP con resumen del loop completo

En cualquier STOP: registrar razón en `docs/ai-skills/automata-dev/loop-status.md`.

---

## Checklist Final

> ⛔ **Ningún issue puede cerrarse sin tests pasando. Sin excepción.**

- [ ] Modo de trabajo determinado (A: TDD completo / B: tests pendientes)
- [ ] **Modo A**: Tests escritos ANTES del código, confirmados en RED
- [ ] **Modo B**: Implementación leída antes de escribir tests
- [ ] Tests pasan en GREEN (confirmado con ejecución real)
- [ ] Cobertura >80% en el módulo nuevo
- [ ] **TypeScript compila sin errores** (`tsc --noEmit` en backend y frontend)
- [ ] `docs/ai-skills/amauta-high-value-tests.md` aplicado para decidir alcance y volumen de tests
- [ ] Los tests cubren el contrato importante sin duplicación innecesaria
- [ ] Código usa `safeParse` para validación
- [ ] No hay deletes físicos sin justificación en el issue
- [ ] Schema de Prisma consultado antes de cada query
- [ ] Archivos de test incluidos en el commit
- [ ] `docs/ai-context/` actualizado según tipo de issue (módulo, schema, frontend)
- [ ] `docs/human-context/issue-{número}-{slug}.md` creado con formato obligatorio
- [ ] CLAUDE.md refleja el nuevo progreso (si aplica)
- [ ] Issue cerrado con comentario descriptivo
- [ ] `docs/ai-skills/automata-dev/loop-status.md` actualizado
- [ ] `docs/ai-skills/automata-dev/next-prompt.md` escrito al final y sin commit (si condiciones cumplen) o STOP documentado

---

## Notas

- **DB en producción**: Verificar `prisma migrate status` antes de ejecutar migraciones. Afectan producción directamente.
- **Sin contexto de módulo**: Usar `docs/ai-context/modules/cursos.md` y `apps/api/src/cursos/cursos.service.spec.ts` como referencia.
- **Si un test es imposible de hacer fallar**: El comportamiento que testea ya existe — documentarlo y seguir.
- **Ante ambigüedad en el issue**: La interpretación más conservadora. En el loop autónomo → STOP y registrar, no asumir.
- **TypeScript en dev vs prod**: `next dev` y `nest start:dev` no verifican tipos completos para priorizar velocidad. `next build` sí los verifica y fallará el deployment si hay errores. Siempre ejecutar `tsc --noEmit` antes de commit.
