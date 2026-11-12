import { test, expect } from '@playwright/test';

test.describe('Frontend — Catálogo público', () => {
  test('permite buscar un curso y abrir su detalle', async ({ page }) => {
    await page.goto('/cursos');

    const search = page.getByPlaceholder(
      'Buscar cursos por título o descripción...'
    );
    await expect(search).toBeVisible();

    await search.fill('Álgebra');
    await expect(page).toHaveURL(/\/cursos\?buscar=%C3%81lgebra/);
    await page.waitForTimeout(600);
    const courseLink = page
      .locator('a[href^="/cursos/"]')
      .filter({ hasText: 'Álgebra' })
      .first();
    await expect(courseLink).toBeVisible();

    await courseLink.click();
    await expect(page).toHaveURL(/\/cursos\/[^/]+/);
    await expect(page).not.toHaveTitle(/404|500|error/i);
  });

  test('muestra un estado vacío para una búsqueda sin resultados', async ({
    page,
  }) => {
    await page.goto('/cursos?buscar=termino-que-no-existe-xyz');

    await expect(page.getByText('No se encontraron cursos')).toBeVisible();
  });
});
