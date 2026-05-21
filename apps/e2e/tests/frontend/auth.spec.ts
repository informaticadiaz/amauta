import { test, expect } from '@playwright/test';
import { TEST_USERS } from '../../fixtures/auth';

test.describe('Frontend — Flujo de autenticación', () => {
  test('la página de login carga correctamente', async ({ page }) => {
    await page.goto('/login');

    await expect(page).toHaveTitle(/Iniciar sesión|Amauta/);
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('login exitoso redirige al dashboard', async ({ page }) => {
    await page.goto('/login');

    await page.fill('#email', TEST_USERS.estudiante.email);
    await page.fill('#password', TEST_USERS.estudiante.password);
    await page.click('button[type="submit"]');

    await page.waitForURL('**/dashboard', { timeout: 10000 });
    expect(page.url()).toContain('/dashboard');
  });

  test('login con credenciales incorrectas muestra error', async ({ page }) => {
    await page.goto('/login');

    await page.fill('#email', TEST_USERS.estudiante.email);
    await page.fill('#password', 'contraseña-incorrecta');
    await page.click('button[type="submit"]');

    const error = page.locator('[class*="error"]');
    await expect(error).toBeVisible({ timeout: 5000 });
    await expect(error).toContainText(/inválid/i);
  });

  test('el botón muestra estado de carga durante el login', async ({
    page,
  }) => {
    await page.goto('/login');

    await page.fill('#email', TEST_USERS.estudiante.email);
    await page.fill('#password', TEST_USERS.estudiante.password);

    const button = page.locator('button[type="submit"]');
    await button.click();

    // El botón cambia a "Iniciando sesión..." mientras procesa
    await expect(button).toContainText(/iniciando/i, { timeout: 3000 });
  });
});

test.describe('Frontend — Protección de rutas', () => {
  test('acceder a /dashboard sin sesión redirige a login', async ({ page }) => {
    await page.goto('/dashboard');

    // Debe redirigir a login (NextAuth protection)
    await page.waitForURL(/login/, { timeout: 8000 });
    expect(page.url()).toContain('login');
  });
});
