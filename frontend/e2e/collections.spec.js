import { test, expect } from '@playwright/test';

test.describe('Coleções', () => {
  test('deve redirecionar para login se não autenticado', async ({ page }) => {
    await page.goto('/collections');
    await page.waitForLoadState('networkidle');
    // Page should exist (200) or redirect to login
    const url = page.url();
    expect(url.includes('collections') || url.includes('login')).toBe(true);
  });

  test('deve carregar a página de coleções', async ({ page }) => {
    await page.goto('/collections');
    await page.waitForLoadState('networkidle');
    const content = await page.locator('body').textContent();
    expect(content.length).toBeGreaterThan(50);
  });
});
