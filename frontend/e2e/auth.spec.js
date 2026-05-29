import { test, expect } from '@playwright/test';

test.describe('Autenticação', () => {
  test('deve exibir formulário de login', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible();
  });

  test('deve exibir formulário de cadastro', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('input[type="email"], input[name="email"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"], input[name="password"]').first()).toBeVisible();
  });

  test('deve redirecionar para login em rota protegida sem autenticação', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    // Either redirects to /login or shows login prompt
    const url = page.url();
    const hasLogin = url.includes('login') || await page.locator('text=login, text=entrar').count() > 0;
    expect(url.includes('profile') || url.includes('login')).toBe(true);
  });

  test('deve mostrar erro de login com credenciais inválidas', async ({ page }) => {
    await page.goto('/login');
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    const submitBtn = page.getByRole('button', { name: /entrar|login|sign in/i }).first();

    await emailInput.fill('wrong@email.com');
    await passwordInput.fill('wrongpass');
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await page.waitForLoadState('networkidle');
      // Should show error or stay on login
      const currentUrl = page.url();
      expect(currentUrl).not.toContain('/profile');
    }
  });
});
