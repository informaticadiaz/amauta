# Guía de Testing - Amauta

## Filosofía de Testing

En Amauta, los tests son **ciudadanos de primera clase**. No son una tarea secundaria, son parte integral del desarrollo.

### Principios

1. **Test-Driven cuando tiene sentido**: Para lógica de negocio compleja, escribir tests primero
2. **Cobertura pragmática**: Objetivo >80%, pero priorizando calidad sobre cantidad
3. **Tests como documentación**: Un buen test explica qué hace el código
4. **Rápidos y confiables**: Tests que fallan aleatoriamente se eliminan o arreglan

---

## Estructura de Tests

### Pirámide de Testing

```
        /\
       /  \      E2E Tests (pocos, lentos, valiosos)
      /----\
     /      \    Integration Tests (moderados)
    /--------\
   /          \  Unit Tests (muchos, rápidos)
  --------------
```

| Tipo            | Cantidad  | Velocidad   | Qué prueban                              |
| --------------- | --------- | ----------- | ---------------------------------------- |
| **Unit**        | Muchos    | Muy rápidos | Funciones aisladas, lógica pura          |
| **Integration** | Moderados | Rápidos     | Interacción entre módulos, API endpoints |
| **E2E**         | Pocos     | Lentos      | Flujos completos de usuario              |

### Estructura de Carpetas

```
apps/
├── web/
│   ├── src/
│   │   └── components/
│   │       └── Button/
│   │           ├── Button.tsx
│   │           └── Button.test.tsx    # Test junto al componente
│   └── __tests__/
│       └── e2e/                       # Tests E2E
│
└── api/
    ├── src/
    │   └── modules/
    │       └── auth/
    │           ├── auth.service.ts
    │           └── auth.service.spec.ts  # Test junto al servicio
    └── test/
        └── app.e2e-spec.ts            # Tests E2E del API
```

---

## Stack de Testing

### Frontend (apps/web)

| Herramienta               | Propósito                               |
| ------------------------- | --------------------------------------- |
| **Vitest**                | Test runner (alternativa rápida a Jest) |
| **React Testing Library** | Testing de componentes React            |
| **MSW**                   | Mock de requests HTTP                   |
| **Playwright**            | Tests E2E                               |

### Backend (apps/api)

| Herramienta   | Propósito                 |
| ------------- | ------------------------- |
| **Jest**      | Test runner               |
| **Supertest** | Testing de HTTP endpoints |
| **Prisma**    | Testing con base de datos |

---

## Comandos de Testing

```bash
# Ejecutar todos los tests
npm run test

# Tests con watch mode (desarrollo)
npm run test:watch

# Tests con cobertura
npm run test:cov

# Solo tests del frontend
npm run test --workspace=@amauta/web

# Solo tests del backend
npm run test --workspace=@amauta/api

# Tests E2E
npm run test:e2e
```

---

## Unit Tests

### Convenciones de Naming

```typescript
// Archivo: nombreDelArchivo.test.ts o nombreDelArchivo.spec.ts

describe('NombreDelModulo', () => {
  describe('nombreDelMetodo', () => {
    it('debería [comportamiento esperado] cuando [condición]', () => {
      // ...
    });
  });
});
```

**Ejemplo:**

```typescript
describe('AuthService', () => {
  describe('validatePassword', () => {
    it('debería retornar true cuando la contraseña cumple los requisitos', () => {
      // ...
    });

    it('debería retornar false cuando la contraseña es muy corta', () => {
      // ...
    });

    it('debería retornar false cuando no tiene números', () => {
      // ...
    });
  });
});
```

### Estructura AAA (Arrange-Act-Assert)

```typescript
it('debería calcular el progreso del curso correctamente', () => {
  // Arrange (Preparar)
  const totalLecciones = 10;
  const leccionesCompletadas = 7;

  // Act (Actuar)
  const progreso = calcularProgreso(leccionesCompletadas, totalLecciones);

  // Assert (Verificar)
  expect(progreso).toBe(70);
});
```

### Testing de Funciones Puras

```typescript
// utils/formatters.ts
export function formatearNota(nota: number): string {
  if (nota >= 90) return 'Excelente';
  if (nota >= 70) return 'Bueno';
  if (nota >= 50) return 'Regular';
  return 'Insuficiente';
}

// utils/formatters.test.ts
import { formatearNota } from './formatters';

describe('formatearNota', () => {
  it('debería retornar "Excelente" para notas >= 90', () => {
    expect(formatearNota(90)).toBe('Excelente');
    expect(formatearNota(100)).toBe('Excelente');
    expect(formatearNota(95)).toBe('Excelente');
  });

  it('debería retornar "Bueno" para notas entre 70 y 89', () => {
    expect(formatearNota(70)).toBe('Bueno');
    expect(formatearNota(89)).toBe('Bueno');
  });

  it('debería retornar "Regular" para notas entre 50 y 69', () => {
    expect(formatearNota(50)).toBe('Regular');
    expect(formatearNota(69)).toBe('Regular');
  });

  it('debería retornar "Insuficiente" para notas < 50', () => {
    expect(formatearNota(49)).toBe('Insuficiente');
    expect(formatearNota(0)).toBe('Insuficiente');
  });
});
```

---

## Testing de Componentes React

### Principios de React Testing Library

> "Mientras más se parezcan tus tests a la forma en que tu software es usado, más confianza te darán."

- **No testear implementación**: Testear comportamiento, no detalles internos
- **Buscar por texto/rol**: No por clases CSS o IDs
- **Simular interacciones reales**: click, type, submit

### Ejemplo Básico

```typescript
// components/Button/Button.tsx
interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

export function Button({ children, onClick, disabled }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

// components/Button/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('debería renderizar el texto del botón', () => {
    render(<Button onClick={() => {}}>Guardar</Button>);

    expect(screen.getByText('Guardar')).toBeInTheDocument();
  });

  it('debería llamar onClick cuando se hace click', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Guardar</Button>);

    fireEvent.click(screen.getByText('Guardar'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('debería estar deshabilitado cuando disabled=true', () => {
    render(<Button onClick={() => {}} disabled>Guardar</Button>);

    expect(screen.getByText('Guardar')).toBeDisabled();
  });
});
```

### Testing con Formularios

```typescript
// components/LoginForm/LoginForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('debería enviar el formulario con email y password', async () => {
    const handleSubmit = vi.fn();
    render(<LoginForm onSubmit={handleSubmit} />);

    // Simular usuario escribiendo
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'password123');

    // Enviar formulario
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('debería mostrar error cuando el email es inválido', async () => {
    render(<LoginForm onSubmit={() => {}} />);

    await userEvent.type(screen.getByLabelText(/email/i), 'email-invalido');
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(screen.getByText(/email inválido/i)).toBeInTheDocument();
    });
  });
});
```

### Queries Recomendadas (en orden de preferencia)

| Query                  | Uso                                          |
| ---------------------- | -------------------------------------------- |
| `getByRole`            | Elementos accesibles (button, link, textbox) |
| `getByLabelText`       | Inputs de formulario                         |
| `getByPlaceholderText` | Inputs sin label (evitar si es posible)      |
| `getByText`            | Texto no-interactivo                         |
| `getByTestId`          | Último recurso, usar `data-testid`           |

---

## Testing del Backend (NestJS)

### Unit Test de un Service

```typescript
// modules/cursos/cursos.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { CursosService } from './cursos.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('CursosService', () => {
  let service: CursosService;
  let prisma: PrismaService;

  // Mock de Prisma
  const mockPrisma = {
    curso: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CursosService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CursosService>(CursosService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('debería retornar todos los cursos publicados', async () => {
      const cursosMock = [
        { id: '1', titulo: 'Curso 1', publicado: true },
        { id: '2', titulo: 'Curso 2', publicado: true },
      ];
      mockPrisma.curso.findMany.mockResolvedValue(cursosMock);

      const result = await service.findAll();

      expect(result).toEqual(cursosMock);
      expect(mockPrisma.curso.findMany).toHaveBeenCalledWith({
        where: { publicado: true },
      });
    });
  });

  describe('findOne', () => {
    it('debería retornar un curso por ID', async () => {
      const cursoMock = { id: '1', titulo: 'Curso 1' };
      mockPrisma.curso.findUnique.mockResolvedValue(cursoMock);

      const result = await service.findOne('1');

      expect(result).toEqual(cursoMock);
    });

    it('debería lanzar error si el curso no existe', async () => {
      mockPrisma.curso.findUnique.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(
        'Curso no encontrado'
      );
    });
  });
});
```

### Integration Test de un Controller

```typescript
// modules/cursos/cursos.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';

describe('CursosController (Integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /cursos', () => {
    it('debería retornar lista de cursos', () => {
      return request(app.getHttpServer())
        .get('/cursos')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('GET /cursos/:id', () => {
    it('debería retornar 404 si el curso no existe', () => {
      return request(app.getHttpServer())
        .get('/cursos/id-inexistente')
        .expect(404);
    });
  });

  describe('POST /cursos', () => {
    it('debería crear un curso con datos válidos', () => {
      return request(app.getHttpServer())
        .post('/cursos')
        .send({
          titulo: 'Nuevo Curso',
          descripcion: 'Descripción del curso',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.titulo).toBe('Nuevo Curso');
          expect(res.body.id).toBeDefined();
        });
    });

    it('debería retornar 400 con datos inválidos', () => {
      return request(app.getHttpServer())
        .post('/cursos')
        .send({ titulo: '' }) // título vacío
        .expect(400);
    });
  });
});
```

---

## Mocking

### Cuándo usar Mocks

| Situación                  | Mock?                       | Razón                                 |
| -------------------------- | --------------------------- | ------------------------------------- |
| Base de datos              | Sí (unit), No (integration) | Unit tests deben ser rápidos          |
| APIs externas              | Sí                          | No depender de servicios externos     |
| Sistema de archivos        | Depende                     | Mock si es lento o tiene side effects |
| Fecha/hora                 | Sí                          | Tests deben ser determinísticos       |
| Funciones del mismo módulo | No                          | Mejor testear la integración real     |

### Mock con Vitest/Jest

```typescript
// Mock de una función
vi.mock('./emailService', () => ({
  sendEmail: vi.fn().mockResolvedValue({ success: true }),
}));

// Mock de Date
vi.useFakeTimers();
vi.setSystemTime(new Date('2025-01-15'));

// Restaurar
vi.useRealTimers();
```

### Mock Service Worker (MSW) para HTTP

```typescript
// mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/cursos', () => {
    return HttpResponse.json([{ id: '1', titulo: 'Curso Mock' }]);
  }),

  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json();

    if (body.email === 'test@example.com') {
      return HttpResponse.json({ token: 'mock-token' });
    }

    return HttpResponse.json(
      { message: 'Credenciales inválidas' },
      { status: 401 }
    );
  }),
];

// mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);

// setupTests.ts
import { server } from './mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

---

## Testing con Base de Datos

### Estrategias

| Estrategia        | Pros                   | Contras                     |
| ----------------- | ---------------------- | --------------------------- |
| **Mock Prisma**   | Rápido, aislado        | No prueba queries reales    |
| **DB en memoria** | Rápido, queries reales | Puede diferir de PostgreSQL |
| **DB de test**    | Más realista           | Más lento, requiere setup   |
| **Transacciones** | Aislado, limpio        | Requiere setup especial     |

### Recomendación para Amauta

- **Unit tests**: Mock de Prisma
- **Integration tests**: Base de datos de test real con transacciones

### Setup con Transacciones

```typescript
// test/setup.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

beforeEach(async () => {
  // Iniciar transacción
  await prisma.$executeRaw`BEGIN`;
});

afterEach(async () => {
  // Rollback - no persiste cambios
  await prisma.$executeRaw`ROLLBACK`;
});

afterAll(async () => {
  await prisma.$disconnect();
});
```

---

## Cobertura de Código

### Métricas de Cobertura

| Métrica        | Descripción                     | Objetivo |
| -------------- | ------------------------------- | -------- |
| **Statements** | % de sentencias ejecutadas      | >80%     |
| **Branches**   | % de ramas (if/else) ejecutadas | >75%     |
| **Functions**  | % de funciones llamadas         | >80%     |
| **Lines**      | % de líneas ejecutadas          | >80%     |

### Ejecutar con Cobertura

```bash
npm run test:cov
```

Genera reporte en `coverage/lcov-report/index.html`

### Qué NO cubrir

Excluir de la cobertura:

```typescript
// jest.config.js o vitest.config.ts
export default {
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/',
    '/test/',
    '.dto.ts', // DTOs son solo tipos
    '.entity.ts', // Entities son solo tipos
    '.module.ts', // Módulos de NestJS
    'main.ts', // Entry point
  ],
};
```

---

## Tests E2E

### Cuándo escribir E2E

- Flujos críticos de usuario (registro, login, compra)
- Integraciones complejas
- Después de bugs en producción

### Setup con Playwright (Frontend)

```typescript
// e2e/login.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Login', () => {
  test('usuario puede iniciar sesión con credenciales válidas', async ({
    page,
  }) => {
    await page.goto('/login');

    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Verificar redirección al dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Bienvenido');
  });

  test('muestra error con credenciales inválidas', async ({ page }) => {
    await page.goto('/login');

    await page.fill('[name="email"]', 'wrong@example.com');
    await page.fill('[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    await expect(page.locator('.error')).toContainText(
      'Credenciales inválidas'
    );
  });
});
```

---

## Checklist de Testing

### Antes de cada PR

- [ ] Todos los tests pasan (`npm run test`)
- [ ] Cobertura no disminuyó
- [ ] Tests nuevos para código nuevo
- [ ] Tests actualizados si cambió comportamiento

### Para código crítico

- [ ] Tests de casos límite (edge cases)
- [ ] Tests de errores esperados
- [ ] Tests de concurrencia si aplica
- [ ] Tests de performance si es crítico

---

## Anti-Patrones a Evitar

| Anti-Patrón                      | Problema                | Solución                         |
| -------------------------------- | ----------------------- | -------------------------------- |
| Tests que dependen del orden     | Fallan aleatoriamente   | Cada test debe ser independiente |
| Tests que prueban implementación | Frágiles ante refactors | Probar comportamiento            |
| Tests sin assertions             | No verifican nada       | Siempre tener expect()           |
| Tests muy grandes                | Difíciles de debuggear  | Dividir en tests pequeños        |
| Ignorar tests fallidos           | Deuda técnica           | Arreglar o eliminar              |
| Cobertura por cobertura          | Tests sin valor         | Priorizar tests útiles           |

---

## Recursos

- [Testing Library Docs](https://testing-library.com/docs/)
- [Vitest Docs](https://vitest.dev/)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Playwright Docs](https://playwright.dev/docs/intro)
- [MSW Docs](https://mswjs.io/docs/)

---

**Última actualización**: 2025-12-23
**Versión**: 1.0.0
