import { test, expect } from 'playwright/test';

test('resposta rápida pode ser copiada com fonte e URL oficial', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async text => {
          window.__lastCopiedQuickAnswer = text;
        },
      },
    });
  });

  await page.goto('./');
  await page.getByRole('button', { name: /Buscar no observatório/i }).first().click();

  const input = page.getByRole('combobox', { name: 'Buscar dado, serviço, fonte ou seção' });
  await input.fill('populacao');
  const quickAnswer = page.locator('.search-quick-answer');
  await expect(quickAnswer.getByText('População 2026', { exact: true })).toBeVisible();

  await quickAnswer.getByRole('button', { name: 'Copiar resposta' }).click();
  await expect(quickAnswer.getByRole('button', { name: 'Resposta copiada' })).toBeVisible();

  const copied = await page.evaluate(() => window.__lastCopiedQuickAnswer);
  expect(copied).toMatch(/^População 2026:/);
  expect(copied).toContain('Fonte:');
  expect(copied).toContain('URL:');
  expect(copied).not.toContain('utm_');

  await input.fill('quantas fontes');
  await expect(quickAnswer.getByRole('button', { name: 'Copiar resposta' })).toBeVisible();
});
