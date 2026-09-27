import { test, expect } from 'playwright/test';

async function openSection(page, id) {
  await page.evaluate(sectionId => {
    window.location.hash = sectionId;
  }, id);
  await expect(page.locator('#' + id)).toBeVisible();
}

test('busca oferece áreas recentes salvas apenas no dispositivo', async ({ page }) => {
  await page.goto('./');

  await openSection(page, 'transporte');
  await openSection(page, 'acao');

  await page.getByRole('button', { name: /Buscar no observatório/i }).first().click();
  const recent = page.getByRole('region', { name: 'Áreas recentes' });
  await expect(recent).toBeVisible();

  const recentButtons = recent.getByRole('button').filter({ hasNotText: 'Limpar recentes' });
  await expect(recentButtons).toHaveCount(2);
  await expect(recentButtons.nth(0)).toContainText('Serviços públicos');
  await expect(recentButtons.nth(1)).toContainText('Transporte');

  await recent.getByRole('button', { name: /Transporte/i }).click();
  await expect(page).toHaveURL(/#transporte$/);
  await expect(page.locator('#transporte')).toBeVisible();

  await page.getByRole('button', { name: /Buscar no observatório/i }).first().click();
  const refreshedRecent = page.getByRole('region', { name: 'Áreas recentes' });
  await expect(refreshedRecent.getByRole('button', { name: /Transporte/i })).toBeVisible();
  await refreshedRecent.getByRole('button', { name: 'Limpar recentes' }).click();
  await expect(page.getByRole('region', { name: 'Áreas recentes' })).toHaveCount(0);

  await page.reload();
  await page.getByRole('button', { name: /Buscar no observatório/i }).first().click();
  await expect(page.getByRole('region', { name: 'Áreas recentes' })).toHaveCount(0);
});
