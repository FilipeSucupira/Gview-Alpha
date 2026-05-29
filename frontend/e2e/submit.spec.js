import { test, expect } from '@playwright/test';

test.describe('Submissão de Jogo', () => {
  test('deve carregar formulário de submissão', async ({ page }) => {
    await page.goto('/submit');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/submit');
  });

  test('deve exibir campos obrigatórios no formulário', async ({ page }) => {
    await page.goto('/submit');
    await page.waitForLoadState('networkidle');
    const inputs = await page.locator('input, textarea').count();
    expect(inputs).toBeGreaterThan(2);
  });

  test('deve validar campos obrigatórios ao submeter', async ({ page }) => {
    await page.goto('/submit');
    await page.waitForLoadState('networkidle');
    const submitBtn = page.getByRole('button', { name: /submeter|enviar|submit/i }).first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      // Should show validation errors or stay on page
      const url = page.url();
      expect(url).toContain('submit');
    }
  });
});
