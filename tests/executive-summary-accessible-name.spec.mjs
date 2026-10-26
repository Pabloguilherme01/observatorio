import { test, expect } from 'playwright/test';

test('cartões do resumo anunciam texto visível e preservam navegação', async ({ page }) => {
  await page.goto('./#resumo');
  const cards = page.locator('#resumo .city-summary-card');
  await expect(cards).toHaveCount(4);

  const population = cards.first();
  await expect(population).not.toHaveAttribute('aria-label', /.+/);
  await expect(population).toHaveAccessibleName(/População estimada[\s\S]*Ver contexto/);
  await population.click();
  await expect(page).toHaveURL(/#dashboard$/);
});
