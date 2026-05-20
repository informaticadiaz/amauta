import { test, expect } from '@playwright/test';

test.describe('Frontend — Navegación pública', () => {
  test('la home page carga sin errores', async ({ page }) => {
    const response = await page.goto('/');

    // Acepta redirección a login si la home está protegida
    const status = response?.status() ?? 200;
    expect([200, 302, 307, 308]).toContain(status);
    await expect(page).not.toHaveTitle(/error|404|500/i);
  });

  test('la página de login es accesible', async ({ page }) => {
    await page.goto('/login');

    await expect(page).not.toHaveTitle(/404|500|error/i);
    await expect(page.locator('form')).toBeVisible();
  });

  test('la página de registro es accesible', async ({ page }) => {
    await page.goto('/register');

    await expect(page).not.toHaveTitle(/404|500|error/i);
    await expect(page.locator('form')).toBeVisible();
  });

  test('una ruta inexistente muestra página 404', async ({ page }) => {
    const response = await page.goto('/ruta-que-no-existe-xyz');

    // Next.js puede retornar 404 o redirigir a login si la ruta está protegida
    const status = response?.status() ?? 404;
    expect([404, 302, 307]).toContain(status);
  });
});
