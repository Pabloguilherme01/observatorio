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
    const menuButton = page.getByRole('button', { name: /(?:Abrir|Fechar) menu/i });
    await expect(menuButton).toBeVisible();
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
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

/** Simula um health check que fica pendente até ser abortado; o próximo responde. */
async function simularHealthCheckInterrompido(page) {
  await page.evaluate(() => {
    const originalFetch = window.fetch.bind(window);
    let consultas = 0;
    window.fetch = (input, init) => {
      const rawUrl = typeof input === 'string' ? input : input.url;
      const url = new URL(rawUrl, window.location.href);
      if (!url.pathname.endsWith('/api/v2/health.json')) return originalFetch(input, init);

      consultas += 1;
      if (consultas > 1) return Promise.resolve(new Response(null, { status: 204 }));
      return new Promise((resolve, reject) => {
        const signal = init?.signal;
        if (!signal) {
          reject(new Error('O health check precisa aceitar cancelamento'));
          return;
        }
        const abortar = () => reject(new DOMException('Verificação interrompida', 'AbortError'));
        if (signal.aborted) abortar();
        else signal.addEventListener('abort', abortar, { once: true });
      });
    };
  });
}

test('verificação lenta libera o botão e permite tentar novamente', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('html')).toHaveAttribute('data-observatorio-mounted', 'true');
  await simularHealthCheckInterrompido(page);

  await page.evaluate(() => window.dispatchEvent(new Event('online')));
  const status = page.getByRole('status', { name: 'Status de conexão' });
  await expect(status).toContainText('Verificando conexão');
  await expect(status.getByRole('button', { name: 'Verificando…' })).toBeDisabled();
  await expect(status).toContainText('Sem conexão', { timeout: 12_000 });

  const retry = status.getByRole('button', { name: 'Verificar', exact: true });
  await expect(retry).toBeEnabled();
  await retry.click();
  await expect(status).toContainText('Conexão restabelecida');
});

test('uma verificação cancelada não substitui o estado da reconexão seguinte', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('html')).toHaveAttribute('data-observatorio-mounted', 'true');
  await simularHealthCheckInterrompido(page);

  await page.evaluate(() => window.dispatchEvent(new Event('online')));
  const status = page.getByRole('status', { name: 'Status de conexão' });
  await expect(status).toContainText('Verificando conexão');
  await page.evaluate(() => window.dispatchEvent(new Event('offline')));
  await expect(status).toContainText('Sem conexão');
  await page.evaluate(() => window.dispatchEvent(new Event('online')));
  await expect(status).toContainText('Conexão restabelecida');
});
