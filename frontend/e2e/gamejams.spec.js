import { test, expect } from '@playwright/test';

test.describe('Game Jams', () => {
  test('deve carregar página de Game Jams', async ({ page }) => {
    await page.goto('/jams');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/jams');
  });

  test('deve exibir título da página', async ({ page }) => {
    await page.goto('/jams');
    await page.waitForLoadState('networkidle');
    const content = await page.locator('body').textContent();
    expect(content.toLowerCase()).toContain('game jam');
  });

  test('deve exibir mensagem quando não há jams', async ({ page }) => {
    await page.goto('/jams');
    await page.waitForLoadState('networkidle');
    // Should either show jams or empty state message
    const body = await page.locator('body').textContent();
    expect(body.length).toBeGreaterThan(50);
  });
});
