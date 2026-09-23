import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import fs from 'node:fs/promises';

const VIEWS = [
  { name: 'home', hash: '' },
  { name: 'eleitorado', hash: '#eleitorado' },
  { name: 'eleicoes', hash: '#linha-do-tempo' },
  { name: 'orcamento', hash: '#orcamento' },
  { name: 'mobilidade', hash: '#transporte' },
  { name: 'saude', hash: '#saude' },
  { name: 'saneamento', hash: '#saude' },
] as const;

const ALLOWLIST = new Set<string>();

async function runAxe(page: Page, scope: string) {
  const results = await new AxeBuilder({ page })
    .include(scope)
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  await fs.mkdir('test-results', { recursive: true });
  const safeScope = scope.replace(/[^a-z0-9]+/gi, '-');
  const report = 'test-results/axe-' + safeScope + '-' + Date.now() + '.json';
  await fs.writeFile(report, JSON.stringify(results, null, 2), 'utf8');
  return results.violations.filter(item => !ALLOWLIST.has(item.id));
}

test.describe('WCAG 2.2 AA · axe-core runtime', () => {
  for (const view of VIEWS) {
    test('zero violações em ' + view.name, async ({ page }) => {
      await page.goto('/' + view.hash);
      await page.waitForSelector('main[data-app-ready="true"]');
      const violations = await runAxe(page, 'body');
      expect(violations, 'Violações em ' + view.name + ': ' + JSON.stringify(violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.length })), null, 2)).toEqual([]);
    });
  }

  test('ProvenanceDrawer aberto', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('main[data-app-ready="true"]');
    const trigger = page.getByTestId('provenance-trigger').first();
    await trigger.scrollIntoViewIfNeeded();
    await trigger.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    expect(await runAxe(page, '[data-testid="provenance-drawer"]')).toEqual([]);
  });

  test('AccessibleRegionMap com região selecionada', async ({ page }) => {
    await page.goto('/#contexto');
    await page.waitForSelector('main[data-app-ready="true"]');
    const region = page.getByTestId('region-option').first();
    await region.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('region-card')).toBeVisible();
    expect(await runAxe(page, '[data-testid="accessible-region-map"]')).toEqual([]);
  });

  test('tooltip ativo em runtime', async ({ page }) => {
    await page.goto('/#saude');
    await page.waitForSelector('main[data-app-ready="true"]');
    const metric = page.locator('[role="img"][aria-label*="Acesso à água"]').first();
    await metric.focus();
    await expect(metric).toBeFocused();
    expect(await runAxe(page, '#saude')).toEqual([]);
  });
});
