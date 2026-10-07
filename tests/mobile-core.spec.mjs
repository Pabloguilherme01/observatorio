import { test, expect } from 'playwright/test';

async function openSection(page, id) {
  await page.evaluate(sectionId => {
    window.location.hash = sectionId;
  }, id);
  await expect(page.locator('#' + id)).toBeVisible();
}

test.describe('mobile layout and interaction', () => {
  test.use({ viewport: { width: 360, height: 740 }, isMobile: true, hasTouch: true });

  test('não cria overflow horizontal e mantém navegação tocável', async ({ page }) => {
    await page.goto('./');
    const metrics = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth,
    }));
    expect(metrics.scroll).toBeLessThanOrEqual(metrics.viewport + 1);

    const nav = page.locator('.mobile-bottom-nav');
    await expect(nav).toBeVisible();
    const navBox = await nav.boundingBox();
    expect(navBox?.width ?? 0).toBeLessThanOrEqual(360);
    for (const button of await nav.locator('button').all()) {
      const box = await button.boundingBox();
      if (box) expect(box.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('busca mobile restaura foco e menu copia link canônico da seção', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { writeText: async text => { window.__lastCopiedSectionLink = text; } },
      });
    });

    await page.goto('./?utm_source=teste#transporte');
    const menuButton = page.getByRole('button', { name: 'Abrir menu' });
    await menuButton.click();
    await expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    const mobileTools = page.locator('#mobile-tools');
    await expect(mobileTools).toBeVisible();
    await mobileTools.getByRole('button', { name: 'Buscar áreas' }).click();

    const panel = page.locator('.search-modal-panel');
    const close = page.getByRole('button', { name: /fechar busca/i });
    const primarySearch = page.getByRole('button', { name: 'Buscar no observatório' });
    await expect(panel).toBeVisible();
    await expect(close).toBeFocused();

    const box = await panel.boundingBox();
    expect(box?.width ?? 0).toBeLessThanOrEqual(360);
    expect(box?.height ?? 0).toBeLessThanOrEqual(740);

    const input = page.getByRole('combobox').first();
    await input.fill('transporte');
    const clear = page.getByRole('button', { name: 'Limpar busca' });
    await expect(clear).toBeVisible();
    await clear.click();
    await expect(input).toHaveValue('');
    await expect(input).toBeFocused();

    await close.click();
    await expect(panel).toBeHidden();
    await expect(primarySearch).toBeFocused();

    await page.getByRole('button', { name: 'Abrir menu' }).click();
    await page.getByRole('button', { name: 'Copiar link da seção' }).click();
    await expect(page.getByRole('button', { name: 'Link copiado' })).toBeVisible();

    const copied = await page.evaluate(() => window.__lastCopiedSectionLink);
    const copiedUrl = new URL(copied);
    expect(copiedUrl.hash).toBe('#transporte');
    expect(copiedUrl.searchParams.get('leitura')).toBe('simple');
    expect(copiedUrl.searchParams.has('utm_source')).toBeFalsy();
  });

  test('gráficos estreitos renderizam sem largura ou altura zero', async ({ page }) => {
    await page.goto('./');
    await openSection(page, 'dashboard');
    const primaryChart = page.locator('.dashboard-history-chart');
    await expect(primaryChart).toBeVisible();
    const mobileCharts = primaryChart.locator('.recharts-wrapper');
    await expect(mobileCharts.first()).toBeVisible();
    const box = await mobileCharts.first().boundingBox();
    expect(box?.width ?? 0).toBeGreaterThan(100);
    expect(box?.height ?? 0).toBeGreaterThan(100);

    await openSection(page, 'saude');
    const sewerBars = page.locator('.sewer-mobile-bars');
    await expect(sewerBars).toBeVisible();
    const sewerMetrics = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth,
    }));
    expect(sewerMetrics.scroll).toBeLessThanOrEqual(sewerMetrics.viewport + 1);
  });
});
