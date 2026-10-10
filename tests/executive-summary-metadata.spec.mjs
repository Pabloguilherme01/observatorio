import { test, expect } from 'playwright/test';

test('resumo executivo expõe natureza e referência sem anos fixos no componente', async ({ page }) => {
  await page.goto('./#resumo');

  const summary = page.locator('#resumo');
  await expect(summary).toBeVisible();
  await expect(summary).toContainText('Orçamento planejado por habitante');
  await expect(summary).toContainText('Derivado');
  await expect(summary).toContainText(/01\/07\/2026/i);
  await expect(summary).toContainText(/Atendimento de esgoto/i);
  await expect(summary).toContainText(/Ano-base 2024/i);
});
