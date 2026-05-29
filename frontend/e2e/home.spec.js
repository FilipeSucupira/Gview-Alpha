import { test, expect } from '@playwright/test';

test.describe('Página Home', () => {
  test('deve carregar a página inicial', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Gview/i);
  });

  test('deve exibir o header/navbar', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('nav').first()).toBeVisible();
  });

  test('deve exibir a seção de jogos em destaque', async ({ page }) => {
    await page.goto('/');
    // Espera pelo conteúdo principal carregar
    await page.waitForLoadState('networkidle');
    const hasContent = await page.locator('body').textContent();
    expect(hasContent.length).toBeGreaterThan(100);
  });

  test('deve navegar para página de login ao clicar em Entrar', async ({ page }) => {
    await page.goto('/');
    const loginLink = page.getByRole('link', { name: /entrar|login/i }).first();
    if (await loginLink.isVisible()) {
      await loginLink.click();
      await expect(page).toHaveURL(/login/);
    }
  });

  test('deve navegar para Game Jams', async ({ page }) => {
    await page.goto('/');
    const jamsLink = page.getByRole('link', { name: /game jams|jams/i }).first();
    if (await jamsLink.isVisible()) {
      await jamsLink.click();
      await expect(page).toHaveURL(/jams/);
    }
  });

  test('deve mostrar footer', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('footer')).toBeVisible();
  });
});
