import { test, expect } from 'playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('barras respondem à seleção e unidades distintas não recebem escala comum', async ({ page }) => {
  await page.goto('./#dashboard');
  const figure = page.locator('.indicator-scale');
  await expect(figure).toContainText('0 a 100%');
  await expect(figure.locator('.indicator-scale-track')).toHaveCount(2);
  const value = await figure.locator('.indicator-scale-track span').first().evaluate(node => node.style.width);
  expect(Number.parseFloat(value)).toBeCloseTo(95.8);
  await expect(figure).toContainText('universos podem ser diferentes');
  const select = page.getByLabel('Escolha o primeiro indicador');
  await select.focus();
  await page.keyboard.press('Home');
  await page.keyboard.press('Enter');
  await expect(select).toHaveValue('population-2026');
  await expect(figure).toContainText('Leitura visual indisponível');
  await expect(figure.locator('.indicator-scale-track')).toHaveCount(0);
  await select.selectOption('water-access-2024');
  await expect(figure.locator('.indicator-scale-track')).toHaveCount(2);
});

for (const width of [390, 1366]) test('correção prepara contexto e evidência sem publicar em ' + width + 'px', async ({ page }) => {
  await page.setViewportSize({ width, height: 900 });
  await page.goto('./#dashboard');
  await page.locator('.dashboard-kpi-card').first().click();
  const dialog = page.getByRole('dialog', { name: /Variação da população/ });
  await expect(dialog).toBeVisible();
  const bounds = await dialog.locator('.data-inspector-panel').boundingBox();
  expect(bounds.y).toBeGreaterThanOrEqual(9);
  expect(bounds.y + bounds.height).toBeLessThanOrEqual(891);
  await expect(dialog.getByRole('link', { name: 'Revisar sugestão no GitHub' })).toHaveCount(0);
  await dialog.getByText('Encontrou um erro?', { exact: true }).click();
  await dialog.getByLabel('O que precisa ser corrigido?').fill('Conferir o período da população na tabela original.');
  await dialog.getByLabel('Fonte ou evidência (opcional)').fill('https://www.ibge.gov.br/');
  const review = dialog.getByRole('link', { name: 'Revisar sugestão no GitHub' });
  const url = new URL(await review.getAttribute('href'));
  expect(url.hostname).toBe('github.com');
  const body = url.searchParams.get('body');
  expect(body).toContain('Variação da população');
  expect(body).toContain('Referência:');
  expect(body).toContain('Link para o contexto:');
  expect(body).toContain('Conferir o período');
  expect(body).toContain('https://www.ibge.gov.br/');
  await expect(dialog).toContainText('antes de publicar');
  const widths = await dialog.evaluate(node => ({ visible: node.clientWidth, content: node.scrollWidth }));
  expect(widths.content).toBeLessThanOrEqual(widths.visible + 1);
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(page.locator('.dashboard-kpi-card').first()).toBeFocused();
});

for (const theme of ['dark', 'light']) test('gráfico e formulário mantêm acessibilidade em ' + theme, async ({ page }) => {
  await page.emulateMedia({ colorScheme: theme });
  await page.goto('./#dashboard');
  await expect(page.locator('.indicator-scale')).toBeVisible();
  const figureAudit = await new AxeBuilder({ page }).include('.indicator-comparator').analyze();
  expect(figureAudit.violations.filter(item => ['serious', 'critical'].includes(item.impact))).toEqual([]);
  await page.locator('.dashboard-kpi-card').first().click();
  await page.getByRole('dialog').getByText('Encontrou um erro?', { exact: true }).click();
  const dialogAudit = await new AxeBuilder({ page }).include('[role="dialog"]').analyze();
  expect(dialogAudit.violations.filter(item => ['serious', 'critical'].includes(item.impact))).toEqual([]);
});
