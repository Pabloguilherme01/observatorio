import { test, expect } from 'playwright/test';

const sections = ['dashboard', 'eleitoral360', 'transporte', 'acao', 'quiz'];

async function navigate(page, id) {
  await page.evaluate(sectionId => {
    window.history.replaceState(null, '', '#' + sectionId);
    window.dispatchEvent(new CustomEvent('observatorio:navigate', { detail: sectionId }));
  }, id);
  await expect(page.locator('#' + id)).toBeVisible();
}

async function assertViewportIntegrity(page) {
  const result = await page.evaluate(() => {
    const viewport = document.documentElement.clientWidth;
    const offenders = [...document.querySelectorAll('main button, main a, main input, main select, main textarea, main article, main section')]
      .filter(node => {
        const style = getComputedStyle(node);
        if (style.display === 'none' || style.visibility === 'hidden') return false;
        const rect = node.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return false;
        if (node.closest('[class*="overflow-x-auto"], [class*="rail"], .sewer-mobile-bars')) return false;
        return rect.left < -1 || rect.right > viewport + 1;
      })
      .slice(0, 12)
      .map(node => ({ tag: node.tagName, cls: String(node.className).slice(0, 100) }));

    return {
      viewport,
      documentWidth: document.documentElement.scrollWidth,
      bodyWidth: document.body.scrollWidth,
      offenders,
    };
  });

  expect(result.documentWidth).toBeLessThanOrEqual(result.viewport + 1);
  expect(result.bodyWidth).toBeLessThanOrEqual(result.viewport + 1);
  expect(result.offenders).toEqual([]);
}

test.describe('bancada cross-browser de interface', () => {
  test('núcleo visual permanece íntegro entre seções e modos', async ({ page }) => {
    await page.goto('./');
    await expect(page.locator('#main-content')).toBeVisible();
    await assertViewportIntegrity(page);

    for (const id of sections) {
      await navigate(page, id);
      await assertViewportIntegrity(page);
    }

    const modes = page.getByRole('group', { name: 'Escolha como você quer ler os dados' });
    for (const label of ['Simples', 'Técnico', 'Resumo']) {
      await modes.getByRole('button', { name: new RegExp('^' + label) }).click();
      await expect(page.locator('html')).toHaveAttribute(
        'data-language-mode',
        label === 'Simples' ? 'simple' : label === 'Técnico' ? 'technical' : 'summary',
      );
      await assertViewportIntegrity(page);
    }
  });

  test('controles de toque, modais e barra inferior permanecem utilizáveis', async ({ page, isMobile }) => {
    await page.goto('./');

    const search = page.getByRole('button', { name: /Buscar no observatório/i }).first();
    await search.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    const geometry = await dialog.evaluate(node => {
      const rect = node.getBoundingClientRect();
      return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: innerWidth, height: innerHeight };
    });
    expect(geometry.left).toBeGreaterThanOrEqual(-1);
    expect(geometry.right).toBeLessThanOrEqual(geometry.width + 1);
    expect(geometry.top).toBeGreaterThanOrEqual(-1);
    expect(geometry.bottom).toBeLessThanOrEqual(geometry.height + 1);
    await page.keyboard.press('Escape');

    if (isMobile) {
      const nav = page.locator('.mobile-bottom-nav');
      await expect(nav).toBeVisible();
      const buttons = nav.locator('button');
      await expect(buttons).toHaveCount(5);
      for (const button of await buttons.all()) {
        const box = await button.boundingBox();
        if (!box) continue;
        expect(box.height).toBeGreaterThanOrEqual(44);
        expect(box.width).toBeGreaterThanOrEqual(40);
      }
    }

    await assertViewportIntegrity(page);
  });

  test('gráficos principais mantêm geometria válida', async ({ page }) => {
    await page.goto('./');
    await navigate(page, 'dashboard');
    const chart = page.locator('.dashboard-history-chart .recharts-wrapper').first();
    await expect(chart).toBeVisible();
    const box = await chart.boundingBox();
    expect(box?.width ?? 0).toBeGreaterThan(100);
    expect(box?.height ?? 0).toBeGreaterThan(100);
  });
});
