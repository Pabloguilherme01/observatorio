import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import fs from 'node:fs/promises';

const VIEWS = [
  { route: '/', hash: '' },
  { route: '/eleitorado', hash: '#eleitorado' },
  { route: '/eleicoes', hash: '#linha-do-tempo' },
  { route: '/orcamento', hash: '#orcamento' },
  { route: '/mobilidade', hash: '#transporte' },
  { route: '/saude', hash: '#saude' },
  { route: '/saneamento', hash: '#saude' },
] as const;

const ALLOWLIST = new Set<string>();

async function hydrateDeferredSections(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const step = Math.max(window.innerHeight, 700);
    for (let y = 0; y <= document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise(resolve => window.setTimeout(resolve, 70));
    }
    window.scrollTo(0, 0);
    await new Promise(resolve => window.setTimeout(resolve, 250));
  });
}

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
    test('zero violações em ' + view.route, async ({ page }) => {
      await page.goto('/' + view.hash);
      await page.waitForSelector('main[data-app-ready="true"]');
      await hydrateDeferredSections(page);

      const violations = await runAxe(page, 'body');
      expect(
        violations,
        'Violações em ' + view.route + ': ' +
          JSON.stringify(violations.map(v => ({
            id: v.id,
            impact: v.impact,
            nodes: v.nodes.length,
          })), null, 2),
      ).toEqual([]);
    });
  }

  test('ProvenanceDrawer aberto', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('main[data-app-ready="true"]');
    await hydrateDeferredSections(page);

    const trigger = page.getByTestId('provenance-trigger').first();
    await trigger.scrollIntoViewIfNeeded();
    await trigger.click();
    await expect(page.getByRole('dialog')).toBeVisible();

    const violations = await runAxe(page, '[data-testid="provenance-drawer"]');
    expect(violations).toEqual([]);
  });

  test('AccessibleRegionMap com região selecionada', async ({ page }) => {
    await page.goto('/#contexto');
    await page.waitForSelector('main[data-app-ready="true"]');
    await page.locator('#contexto').scrollIntoViewIfNeeded();
    await expect(page.locator('#contexto')).toBeVisible();

    const region = page.getByTestId('region-option').first();
    await region.focus();
    await page.keyboard.press('Enter');

    await expect(page.getByTestId('region-card')).toBeVisible();
    await expect(page.getByRole('tooltip')).toContainText('Região Norte');

    const violations = await runAxe(page, '[data-testid="accessible-region-map"]');
    expect(violations).toEqual([]);
  });

  test('tooltip ativo em runtime', async ({ page }) => {
    await page.goto('/#contexto');
    await page.waitForSelector('main[data-app-ready="true"]');
    await page.locator('#contexto').scrollIntoViewIfNeeded();
    await expect(page.locator('#contexto')).toBeVisible();

    const region = page.getByTestId('region-option').first();
    await region.focus();
    await expect(page.getByRole('tooltip')).toBeVisible();
    await expect(page.getByRole('tooltip')).toContainText('Representação esquemática');

    const violations = await runAxe(page, '[data-testid="accessible-region-map"]');
    expect(violations).toEqual([]);
  });
});
