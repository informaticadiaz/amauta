# Skill: Complete Issue

> Ejecuta un issue de GitHub de principio a fin de forma autónoma usando TDD:
> escribe los tests primero, luego implementa el código hasta que pasen, documenta y cierra el issue.

---

## Uso

```
Ejecuta el issue #[número] de forma autónoma siguiendo el workflow completo
```

**Ejemplos:**

```
Ejecuta el issue #42 de forma autónoma siguiendo el workflow completo

Ejecuta el issue #15 de forma autónoma siguiendo el workflow completo
```

---

## Parámetros

| Parámetro | Descripción             | Ejemplo |
| --------- | ----------------------- | ------- |
| `número`  | Número del issue GitHub | `42`    |

---

## Proceso Autónomo (Ejecutar en Orden Estricto)

### PASO 0 — Verificar Estado del Proyecto (SIEMPRE al iniciar)

Antes de cualquier otra acción, verificar el estado actual del desarrollo consultando **tres fuentes** y comparándolas.

#### Fuente 1 — GitHub (estado real de cada issue)

```bash
# Issues abiertos de la fase actual, ordenados por número
gh issue list --label "phase-1" --state open --limit 20 --json number,title,labels \
  | jq -r '.[] | "#\(.number) \(.title) [\(.labels | map(.name) | join(", "))]"'

# Issues cerrados recientes (para detectar completados no registrados)
gh issue list --label "phase-1" --state closed --limit 10 --json number,title \
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
|-------|--------|--------|------------|-----------|
| #38   | F1-011 | OPEN   | Pendiente  | Pendiente |
| #37   | F1-010 | CLOSED | Completado | ✅        |

**Si las tres fuentes coinciden** → continuar al siguiente paso.

**Si hay divergencias**, resolverlas con estas reglas:

| Divergencia | Fuente de verdad | Acción |
|-------------|-----------------|--------|
| Issue cerrado en GitHub pero pendiente en CLAUDE.md | GitHub | Actualizar CLAUDE.md |
| Issue abierto en GitHub pero marcado completo en CLAUDE.md | GitHub | Reabrir o investigar |
| Orden diferente entre roadmap.md y los issues de GitHub | roadmap.md | Seguir el orden del roadmap |
| Progreso total diferente (ej: GitHub dice 10 cerrados, CLAUDE.md dice 8/16) | GitHub | Actualizar contador en CLAUDE.md |

Mostrar las divergencias encontradas al usuario y proponer las correcciones antes de continuar.

#### Determinar el próximo issue a trabajar

Si no se especificó un número de issue:
1. Tomar los issues OPEN en GitHub de la fase actual
2. Ordenarlos según el orden definido en `roadmap.md`
3. Aplicar criterios de selección (en orden de prioridad):
   - Priorizar issues con label `must-have`
   - Respetar dependencias (no empezar un issue si su dependencia está OPEN)
   - Tomar el primero según el orden del roadmap
4. Presentar al usuario: _"El próximo issue según el roadmap es #XX — [título] (must-have). ¿Trabajamos con este?"_
5. Esperar confirmación antes de continuar

Si se especificó un número:
- Verificar que el issue existe y está OPEN en GitHub
- Verificar que sus dependencias están cerradas
- Si está cerrado o tiene dependencias pendientes, informar al usuario y sugerir el próximo válido

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
Backend (service):    apps/api/src/[modulo]/[modulo].service.spec.ts
Backend (controller): apps/api/src/[modulo]/[modulo].controller.spec.ts
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

  // Un describe por método público
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
    const mockFn = vi.fn();
    render(<[Componente] onAction={mockFn} />);

    await userEvent.click(screen.getByRole('button', { name: /[texto]/i }));

    expect(mockFn).toHaveBeenCalled();
  });
});
```

---

### PASO 5 — Verificar que los Tests Fallan (Confirmar RED)

```bash
# Backend
npm run test --workspace=@amauta/api -- --testPathPattern="[modulo]"

# Frontend
npm run test --workspace=@amauta/web -- --testPathPattern="[Componente]"
```

**Los tests DEBEN fallar aquí.** Si pasan sin implementación, el test está mal escrito — revisar y corregir antes de continuar.

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

---

### PASO 8 — Actualizar Documentación del Sistema

- `docs/sistema/README.md` → actualizar tabla de estado
- `docs/sistema/etapa-X-[nombre].md` → cambiar ⏳ a ✅, agregar fecha y descripción
- `docs/ai-context/modules/[modulo].md` → si se agregaron endpoints nuevos

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

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

---

### PASO 10 — Actualizar CLAUDE.md (si aplica)

Si el issue es un hito de Fase 1 (F1-0XX):
- Mover el issue de "Próximos pasos" a "Completado en Fase 1"
- Actualizar el contador: ej. `10/16` → `11/16`

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

## Checklist Final

- [ ] Tests escritos ANTES del código (RED → GREEN)
- [ ] Tests fallan antes de implementar (confirmado)
- [ ] Tests pasan después de implementar (confirmado)
- [ ] Cobertura >80% en el módulo nuevo
- [ ] Todos los items del checklist del issue cubiertos por tests
- [ ] Código usa `safeParse` para validación
- [ ] No hay deletes físicos sin justificación en el issue
- [ ] Schema de Prisma consultado antes de cada query
- [ ] Archivos de test incluidos en el commit
- [ ] Documentación del sistema actualizada
- [ ] CLAUDE.md refleja el nuevo progreso (si aplica)
- [ ] Issue cerrado con comentario descriptivo

---

## Notas

- **DB en producción**: Verificar `prisma migrate status` antes de ejecutar migraciones. Afectan producción directamente.
- **Sin contexto de módulo**: Usar `docs/ai-context/modules/cursos.md` y `apps/api/src/cursos/cursos.service.spec.ts` como referencia.
- **Si un test es imposible de hacer fallar**: El comportamiento que testea ya existe — documentarlo y seguir.
- **Ante ambigüedad en el issue**: La interpretación más conservadora, documentada en el comentario de cierre.
