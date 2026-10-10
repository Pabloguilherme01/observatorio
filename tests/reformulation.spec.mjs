import { test, expect } from 'playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import AxeBuilder from '@axe-core/playwright';

const results = JSON.parse(readFileSync(new URL('../public/data/tse-results.json', import.meta.url), 'utf8'));

test('entrada oferece seis destinos reais e cabeçalho não comprime a marca', async ({ page }) => {
  await page.setViewportSize({ width: 991, height: 800 });
  await page.goto('./');
  await expect(page.locator('.civic-topic-card')).toHaveCount(6);
  const brand = await page.locator('.site-brand > span:last-child').evaluate(node => ({ width: node.clientWidth, text: node.scrollWidth }));
  expect(brand.text).toBeLessThanOrEqual(brand.width);
  await expect(page.getByRole('navigation', { name: 'Navegação principal' }).getByRole('link', { name: 'Serviços', exact: true })).toBeVisible();
  await page.locator('#descubra').getByRole('link', { name: /Pesquisar e conferir dados/ }).click();
  await expect(page.locator('#catalog-title')).toBeVisible();
});

test('catálogo busca sem acentos, preserva ano-base e exporta somente a seleção', async ({ page }) => {
  await page.goto('./#dados');
  await page.getByRole('searchbox', { name: 'Pesquisar indicadores' }).fill('acesso agua');
  await expect(page.locator('.catalog-card')).toHaveCount(4);
  const card = page.locator('.catalog-card').filter({ has: page.getByRole('heading', { name: 'Acesso à água', exact: true }) });
  await expect(card).toContainText('Acesso à água');
  await expect(card).toContainText('Ano-base 2024');
  await expect(card.getByRole('link', { name: 'Conferir na fonte' })).toHaveAttribute('href', /^https:/);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Baixar seleção CSV' }).click();
  const download = await downloadPromise;
  const content = readFileSync(await download.path(), 'utf8');
  expect(content).toContain('"water-access-2024"');
  expect(content).toContain('"Ano-base 2024"');
  expect(content).toContain('aguaesaneamento.org.br');
  expect(content).not.toContain('"population-2026"');
  await page.getByRole('searchbox', { name: 'Pesquisar indicadores' }).fill('zzzznenhumresultado');
  await expect(page.getByText('Nenhum indicador encontrado.', { exact: false })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Baixar seleção CSV' })).toBeDisabled();
  await page.getByRole('button', { name: 'Limpar filtros' }).click();
  await expect(page.locator('.catalog-card')).toHaveCount(12);
  await page.getByRole('button', { name: 'Mostrar mais 12 indicadores' }).click();
  await expect(page.locator('.catalog-card')).toHaveCount(24);
});

test('comparador apresenta a mesma referência temporal usada no alinhamento', async ({ page }) => {
  await page.goto('./#dashboard');
  await expect(page.locator('.indicator-compare-card')).toHaveCount(2);
  for (const card of await page.locator('.indicator-compare-card').all()) await expect(card).toContainText('Ano-base 2024');
  await expect(page.locator('.indicator-compare-guidance')).toContainText('Isso não garante equivalência');
  await page.getByLabel('Escolha o segundo indicador').selectOption('revenue-2025');
  await expect(page.locator('.indicator-compare-guidance')).toContainText('Confira antes de comparar');
});

test('resultados permitem consultar um nome fora dos cinco iniciais', async ({ page }) => {
  const entry = results.entries.find(item => item.items.length > 5);
  const sorted = [...entry.items].sort((a, b) => b.votes - a.votes);
  const candidate = sorted[5];
  await page.goto('./#resultados');
  await expect(page.getByRole('searchbox', { name: 'Buscar nos resultados eleitorais' })).toBeVisible();
  await page.getByLabel('Filtrar resultados por cargo').selectOption(entry.cargo);
  await expect(page.locator('.results-public-card')).toHaveCount(1);
  await expect(page.getByRole('list', { name: 'Resultados de ' + entry.cargo }).getByText(candidate.candidate, { exact: false })).toHaveCount(0);
  await page.getByRole('button', { name: 'Ver mais resultados de ' + entry.cargo }).click();
  await expect(page.getByRole('list', { name: 'Resultados de ' + entry.cargo }).getByText(candidate.candidate, { exact: false })).toBeVisible();
  await page.getByRole('searchbox', { name: 'Buscar nos resultados eleitorais' }).fill(candidate.candidate);
  await expect(page.getByRole('list', { name: 'Resultados de ' + entry.cargo }).getByText(candidate.candidate, { exact: false })).toBeVisible();
  await expect(page.locator('#resultados')).toContainText('pelo Observatório com a chave pública do TSE');
});

for (const route of ['#dados', '#resultados']) test('novos fluxos não introduzem violações graves de acessibilidade em ' + route, async ({ page }) => {
  await page.goto('./' + route);
  await expect(page.locator(route)).toBeVisible();
  const audit = await new AxeBuilder({ page }).analyze();
  const blocking = audit.violations.filter(item => ['serious', 'critical'].includes(item.impact));
  expect(blocking.map(item => ({ id: item.id, nodes: item.nodes.map(node => node.target) }))).toEqual([]);
});

for (const viewport of [{ width: 1366, height: 900 }, { width: 390, height: 844 }]) test('nova entrada permanece legível em ' + viewport.width + 'px', async ({ page }) => {
  await page.setViewportSize(viewport);
  await page.goto('./');
  await expect(page.locator('#audience-title')).toBeVisible();
  const widths = await page.evaluate(() => ({ viewport: innerWidth, page: document.documentElement.scrollWidth }));
  expect(widths.page).toBeLessThanOrEqual(widths.viewport + 1);
  if (process.env.AUDIT_OUTPUT_DIR) await page.screenshot({ path: join(process.env.AUDIT_OUTPUT_DIR, 'observatorio-' + viewport.width + '.png'), fullPage: false });
});
