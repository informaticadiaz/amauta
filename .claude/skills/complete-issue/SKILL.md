---
name: complete-issue
description: Use this skill when the user asks to execute, complete, or resolve a GitHub issue autonomously. Triggered by phrases like "ejecuta el issue #N", "completá el issue #N", "resolvé el issue #N de forma autónoma", "complete issue #N", or "run issue #N". This skill follows a full TDD workflow: read issue → load context → write failing tests → implement code → verify tests pass → commit → close issue.
version: 1.0.0
---

# Complete Issue — Flujo TDD Autónomo

Ejecuta un issue de GitHub de principio a fin usando Test-Driven Development (TDD).

## Cuándo se activa

Cuando el usuario pide ejecutar o completar un issue de GitHub de forma autónoma, por ejemplo:
- "Ejecuta el issue #42 de forma autónoma"
- "Completá el issue #15"
- "Resolvé el issue #8 siguiendo el workflow"

## Proceso (Ejecutar en Orden Estricto)

### PASO 0 — Identificar el Issue a Trabajar (si no se indicó uno)

Si el usuario **no especificó un número de issue**, ejecutar este paso automáticamente:

```bash
# Listar issues abiertos ordenados por número
gh issue list --limit 20 --state open --json number,title,labels \
  | jq -r '.[] | "#\(.number) [\(.labels[].name // "sin-label" | select(. != ""))] \(.title)"'
```

Seleccionar el issue de **menor número** que corresponda a la fase actual (según `CLAUDE.md`).
Luego leer el issue completo:

```bash
gh issue view [número] --json title,body,labels,milestone \
  | jq -r '"\(.title)\n\nLabels: \(.labels[].name // "ninguno")\n\n\(.body)"'
```

Con esa información, presentar al usuario un resumen antes de continuar:

---

**Propuesta de issue a trabajar:**

> **Issue #[N] — [Título]**
>
> **Objetivo:** [1 oración que describe qué se va a construir]
>
> **Problemas a resolver:**
> - [problema/tarea 1 del checklist]
> - [problema/tarea 2 del checklist]
> - [...]
>
> **Alcance:** [backend / frontend / ambos] — [módulo o página afectada]
>
> **Dependencias:** [issues previos necesarios, o "ninguna"]

¿Continuamos con este issue? (responder sí/no o indicar otro número)

**Esperar confirmación del usuario antes de avanzar al PASO 1.**

---

### PASO 1 — Leer el Issue

```bash
gh issue view [número] --json title,body,labels,milestone | jq -r '"\(.title)\n\nLabels: \(.labels[].name // "ninguno")\n\n\(.body)"'
```

Extraer y registrar:
- Objetivo principal
- Checklist de subtareas (son los criterios de aceptación para los tests)
- Labels: `backend`, `frontend`, `database`, etc.
- Dependencias con otros issues

---

### PASO 2 — Cargar Contexto Obligatorio

**ANTES de escribir una sola línea de código o test**, leer los archivos correspondientes:

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
```

> **Regla absoluta**: Nunca inventar nombres de campos, enums, relaciones o tablas.
> Verificar en el schema antes de usarlos en tests o en código.

---

### PASO 3 — Crear Plan de Trabajo

Crear un todo list antes de empezar. Estructura TDD:

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

---

### PASO 4 — Escribir Tests Primero (RED)

Antes de implementar, escribir los tests que describen **exactamente** lo que el issue pide.

Cada item del checklist del issue = al menos un test.

#### Dónde crear los archivos de test:
```
Backend (service):     apps/api/src/[modulo]/[modulo].service.spec.ts
Backend (controller):  apps/api/src/[modulo]/[modulo].controller.spec.ts
Frontend (componente): apps/web/src/components/[Componente]/[Componente].test.tsx
Frontend (página):     apps/web/src/app/[ruta]/page.test.tsx
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

  const mockPrisma = {
    [modulo]: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        [Modulo]Service,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<[Modulo]Service>([Modulo]Service);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('[método]', () => {
    it('debería [comportamiento esperado] cuando [condición]', async () => {
      // Arrange
      mockPrisma.[modulo].[método].mockResolvedValue([datos mock]);

      // Act
      const result = await service.[método]([args]);

      // Assert
      expect(result).[matcher];
      expect(mockPrisma.[modulo].[método]).toHaveBeenCalledWith([args esperados]);
    });

    it('debería lanzar NotFoundException cuando el recurso no existe', async () => {
      mockPrisma.[modulo].findUnique.mockResolvedValue(null);
      await expect(service.[método]('id-inexistente')).rejects.toThrow(NotFoundException);
    });

    it('debería lanzar BadRequestException con datos inválidos', async () => {
      await expect(service.[método]({})).rejects.toThrow(BadRequestException);
    });
  });
});
```

---

### PASO 5 — Verificar que los Tests Fallan (RED confirmado)

```bash
# Backend
npm run test --workspace=@amauta/api -- --testPathPatterns="[modulo]"

# Frontend
npm run test --workspace=@amauta/web -- --testPathPatterns="[Componente]"
```

**Los tests DEBEN fallar aquí.** Si pasan sin implementación, el test está mal escrito — revisar y corregir antes de continuar.

---

### PASO 6 — Implementar el Código (GREEN)

Escribir el código mínimo necesario para que los tests pasen. Patrones obligatorios:

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
npm run test --workspace=@amauta/api -- --testPathPatterns="[modulo]"
npm run test:cov --workspace=@amauta/api -- --testPathPatterns="[modulo]"
```

Si algún test falla: corregir la implementación, **no el test**.
Una vez en verde, refactorizar si es necesario y ejecutar tests de nuevo.

**Objetivo de cobertura mínima**: >80% statements en el módulo nuevo.

---

### PASO 8 — Actualizar las Tres Fuentes de Verdad (OBLIGATORIO)

Estas tres actualizaciones son **siempre obligatorias** al completar un issue. No omitir ninguna.

#### 1. `CLAUDE.md`
- Mover el issue de "Próximos pasos" a "Completado en Fase 1"
- Agregar bullets con lo implementado
- Actualizar el contador: ej. `10/16` → `11/16`

#### 2. `docs/project-management/roadmap.md`
- Cambiar el estado del issue en la tabla del sprint: `📋 Pendiente` → `✅ Completado`
- Si todos los issues del sprint están completos, actualizar el encabezado del sprint
- Actualizar el contador de progreso de la fase: `10/16` → `11/16`

#### 3. `docs/sistema/README.md`
- Actualizar la tabla "En Desarrollo": mover el módulo a ✅ Funcional si ya es usable
- Actualizar la fecha de última actualización
- Actualizar el contador de la fase actual

---

### PASO 8b — Actualizar Contexto de IA (si aplica)

Revisar `docs/ai-context/modules/[modulo].md`:
- Si se crearon archivos de test → agregar a la tabla de archivos del módulo
- Si se agregaron endpoints nuevos → agregar a la tabla de endpoints
- Si cambió algún comportamiento → actualizar la sección "Notas para IA"

Si el módulo **no tiene archivo de contexto** y se implementó algo significativo → crearlo usando `docs/ai-context/modules/cursos.md` como template.

---

### PASO 9 — Hacer Commit

Incluir **siempre** los archivos de test junto con la implementación:

> **Importante**: Usar `git add` y `git commit` directamente, sin `git -C "ruta"`.
> El working directory ya es la raíz del proyecto.

```bash
git add apps/api/src/[modulo]/[modulo].service.ts
git add apps/api/src/[modulo]/[modulo].service.spec.ts
# ... resto de archivos

git commit -m "$(cat <<'EOF'
[tipo]: [descripción corta en español, máx 72 chars]

- [cambio 1]
- [cambio 2]
- Tests: [qué se cubre con los tests]

Resuelve: #[número]

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

---

### PASO 10 — Cerrar el Issue

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
- ✅ CLAUDE.md (progreso [N]/16)
- ✅ docs/project-management/roadmap.md
- ✅ docs/sistema/README.md
- ✅ docs/ai-context/modules/[modulo].md (si aplica)

**Commit:** [hash corto]"
```

---

### PASO 11 — Resumen Final (Terminar)

Al completar todos los pasos anteriores, mostrar un resumen breve y **detenerse**. No ofrecer continuar con el siguiente issue ni hacer preguntas.

```
✅ Issue #[N] completado — [Título]

- [qué se implementó, 1 línea]
- Tests: [N] pasando, cobertura >80%
- Fuentes de verdad actualizadas: CLAUDE.md · roadmap.md · docs/sistema/README.md
- Commit: [hash]
```

---

## Checklist Final

**Tests**
- [ ] Tests escritos ANTES del código (RED → GREEN)
- [ ] Tests fallan antes de implementar (confirmado)
- [ ] Tests pasan después de implementar (confirmado)
- [ ] Cobertura >80% en el módulo nuevo
- [ ] Todos los items del checklist del issue cubiertos por tests

**Código**
- [ ] Código usa `safeParse` para validación
- [ ] No hay deletes físicos sin justificación en el issue
- [ ] Schema de Prisma consultado antes de cada query
- [ ] Archivos de test incluidos en el commit

**Tres fuentes de verdad (OBLIGATORIO)**
- [ ] `CLAUDE.md` actualizado (progreso + issue movido a completados)
- [ ] `docs/project-management/roadmap.md` actualizado (estado del issue en sprint)
- [ ] `docs/sistema/README.md` actualizado (tabla de módulos + fecha)

**Contexto de IA**
- [ ] `docs/ai-context/modules/[modulo].md` actualizado si hubo cambios

**Cierre**
- [ ] Issue cerrado con comentario descriptivo
- [ ] Resumen final mostrado — skill terminada sin preguntar por el siguiente issue

---

## Notas

- **DB en producción**: Verificar `prisma migrate status` antes de ejecutar migraciones. Afectan producción directamente.
- **Sin contexto de módulo**: Usar `docs/ai-context/modules/cursos.md` y `apps/api/src/cursos/cursos.service.spec.ts` como referencia.
- **Si un test es imposible de hacer fallar**: El comportamiento que testea ya existe — documentarlo y seguir.
- **Ante ambigüedad en el issue**: La interpretación más conservadora, documentada en el comentario de cierre.
