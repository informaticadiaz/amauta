import { test, expect } from '@playwright/test';
import { TEST_USERS } from '../../fixtures/auth';

test.describe('API Auth — POST /api/v1/auth/login', () => {
  test('login exitoso retorna usuario sin contraseña', async ({ request }) => {
    const response = await request.post('/api/v1/auth/login', {
      data: {
        email: TEST_USERS.superadmin.email,
        password: TEST_USERS.superadmin.password,
      },
    });

    expect(response.status()).toBe(201);
    const body = await response.json();

    expect(body.message).toBe('Login exitoso');
    expect(body.user).toBeDefined();
    expect(body.user.email).toBe(TEST_USERS.superadmin.email);
    expect(body.user.id).toBeDefined();
    expect(body.user.rol).toBeDefined();
    // nunca debe devolver la contraseña
    expect(body.user.password).toBeUndefined();
  });

  test('login con contraseña incorrecta retorna 401', async ({ request }) => {
    const response = await request.post('/api/v1/auth/login', {
      data: {
        email: TEST_USERS.superadmin.email,
        password: 'contraseña-incorrecta',
      },
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.message).toBeDefined();
  });

  test('login con email inexistente retorna 401', async ({ request }) => {
    const response = await request.post('/api/v1/auth/login', {
      data: {
        email: 'noexiste@amauta.test',
        password: 'cualquiera',
      },
    });

    expect(response.status()).toBe(401);
  });

  test('login con body vacío retorna 400', async ({ request }) => {
    const response = await request.post('/api/v1/auth/login', {
      data: {},
    });

    expect(response.status()).toBe(400);
  });

  test('usuario educador puede hacer login', async ({ request }) => {
    const response = await request.post('/api/v1/auth/login', {
      data: {
        email: TEST_USERS.educador.email,
        password: TEST_USERS.educador.password,
      },
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.user.rol).toBe('EDUCADOR');
  });

  test('usuario estudiante puede hacer login', async ({ request }) => {
    const response = await request.post('/api/v1/auth/login', {
      data: {
        email: TEST_USERS.estudiante.email,
        password: TEST_USERS.estudiante.password,
      },
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.user.rol).toBe('ESTUDIANTE');
  });
});

test.describe('API Auth — endpoint protegido sin token', () => {
  test('GET /api/v1/auth/me sin token retorna 401', async ({ request }) => {
    const response = await request.get('/api/v1/auth/me');

    expect(response.status()).toBe(401);
  });
});
