# Skill: Amauta High Value Tests

> Escribe tests de alto valor que protejan comportamiento importante del sistema sin exceso de cobertura innecesaria.

## Cuándo usarla

Usar esta skill cuando el usuario pida:

- crear tests para una feature o issue
- revisar si los tests existentes sobran o faltan
- corregir tests frágiles o que rompen CI
- mantener TDD sin inflar la suite
- mejorar calidad de tests backend/frontend en Amauta

Si también se activa `complete-issue`, esta skill manda sobre cualquier decisión de volumen, alcance y estilo de tests.

## Objetivo

Mantener TDD, pero con estas reglas:

- testear comportamiento importante, no estructura trivial
- preferir pocos tests bien elegidos
- evitar duplicación entre capas
- evitar mocks persistentes y estado compartido
- evitar suites costosas para CI

## Regla principal

No crear un test nuevo a menos que cubra al menos una de estas categorías:

- regla de negocio relevante
- permiso, ownership o seguridad
- validación con ramas reales
- transición de estado o efecto lateral importante
- regresión conocida
- caso límite con impacto real

No crear tests para:

- delegación trivial de controller
- mapeos obvios
- texto o markup sin comportamiento
- duplicar un contrato ya cubierto
- subir cobertura sin valor real

## Matriz mínima de tests

Antes de escribir tests, derivar una matriz corta:

1. Camino feliz principal
2. Falla de negocio o validación más importante
3. Permiso/ownership si aplica
4. Regresión o caso límite si existe riesgo real

Si con 2 o 3 tests queda cubierto el contrato importante, detenerse ahí.

## Backend Amauta

Prioridad:

1. `service.spec.ts`
2. utilidades críticas
3. `controller.spec.ts` solo si hay lógica propia

### Reglas obligatorias para Jest/Nest

- Usar mocks frescos por `beforeEach` o por test.
- Si el test define implementaciones, preferir `jest.resetAllMocks()`.
- Preferir `mockResolvedValueOnce(...)` en flujos secuenciales.
- No reutilizar implementaciones entre tests.
- No copiar el mismo caso en controller y service.

### Patrón recomendado

```ts
const createMockPrisma = () => ({
  curso: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
});

beforeEach(async () => {
  prisma = createMockPrisma();
  const module = await Test.createTestingModule({
    providers: [CursosService, { provide: PrismaService, useValue: prisma }],
  }).compile();

  service = module.get(CursosService);
  jest.resetAllMocks();
});
```

### Alertas

Detectar y corregir estos olores:

- `jest.clearAllMocks()` cuando hubo `mockResolvedValue` o `mockImplementation`
- mocks globales mutables compartidos
- tests que dependen del orden
- tests que cubren detalles internos en vez del contrato observable

## Frontend Amauta

Prioridad:

1. comportamiento visible importante
2. interacción de usuario relevante
3. lógica pura fuera del DOM cuando sea posible

### Reglas

- Si la lógica puede probarse sin render, preferir utilidad o hook.
- No testear estructura visual irrelevante.
- No usar snapshots grandes.
- Testear navegación, submit, errores, loading y cambios visibles importantes.

## Política de TDD

TDD sigue vigente, pero no de forma mecánica.

- RED: escribir primero los tests mínimos que describen el contrato importante
- GREEN: implementar lo mínimo para pasarlos
- REFACTOR: limpiar sin agregar tests redundantes

No traducir “cada checklist del issue” en “un test por ítem”.

## Política de CI

Si un test agrega complejidad o costo alto, preguntar:

- ¿protege un bug real?
- ¿hay una forma más simple de probarlo?
- ¿puede volver frágil la suite?
- ¿introduce riesgo de memoria, mocks persistentes o tiempos altos?

Si la respuesta no justifica el costo, no crear ese test.

## Entregable esperado

Cuando termines trabajo de testing en Amauta, el resultado debe dejar:

- tests nuevos mínimos y justificables
- sin duplicación obvia
- con aislamiento correcto entre casos
- con foco en `service` antes que `controller`
- estables para CI
