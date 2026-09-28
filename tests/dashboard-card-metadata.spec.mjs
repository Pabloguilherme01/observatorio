import { test, expect } from 'playwright/test';

test('dashboard mostra metadados claros e cards temáticos consistentes', async ({ page }) => {
  await page.goto('./?leitura=simple#dashboard');

  const firstKpi = page.locator('#dashboard .dashboard-kpi-card').first();
  await expect(firstKpi).toBeVisible();
  await expect(firstKpi.locator('.dashboard-card-meta')).toBeVisible();
  expect(await firstKpi.locator('.dashboard-meta-chip').count()).toBeGreaterThanOrEqual(2);

  const thematicCards = page.locator('#dashboard .dashboard-secondary-card');
  expect(await thematicCards.count()).toBeGreaterThanOrEqual(8);
  await expect(thematicCards.first().locator('.dashboard-card-meta')).toBeVisible();
  await expect(thematicCards.first().locator('.dashboard-card-action')).toContainText('Abrir fonte e contexto');
});

test('utilidade pública usa atalhos explicativos sem perder os seis destinos', async ({ page }) => {
  await page.goto('./');
  const guide = page.locator('#utilidade-publica');
  await expect(guide).toBeVisible();

  const shortcuts = guide.locator('.public-utility-shortcut');
  await expect(shortcuts).toHaveCount(6);
  await expect(shortcuts.first().locator('strong')).toContainText('Saúde e medicamentos');
  await expect(shortcuts.first().locator('small')).not.toHaveText('');
});
