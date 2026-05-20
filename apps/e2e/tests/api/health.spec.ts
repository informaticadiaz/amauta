import { test, expect } from '@playwright/test';

test.describe('API Health', () => {
  test('GET /health retorna status ok', async ({ request }) => {
    const response = await request.get('/health');

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.status).toBe('ok');
    expect(typeof body.uptime).toBe('number');
  });

  test('GET / retorna información de la API', async ({ request }) => {
    const response = await request.get('/');

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toBeDefined();
  });

  test('GET /info retorna información detallada', async ({ request }) => {
    const response = await request.get('/info');

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toBeDefined();
  });
});
