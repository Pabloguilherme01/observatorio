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


test.describe('bancada de robustez adicional', () => {
  test('não há módulo comercial removido nem navegação órfã', async ({ page }) => {
    await page.goto('./');
    await expect(page.locator('#negocio')).toHaveCount(0);
    await expect(page.getByText('Produto profissional', { exact: true })).toHaveCount(0);
    await expect(page.getByText('Soluções profissionais', { exact: true })).toHaveCount(0);
    await expect(page.getByText('Quero contratar', { exact: true })).toHaveCount(0);
    await expect(page.getByText('Copiar proposta', { exact: true })).toHaveCount(0);
    await expect(page.getByText(/R\\$\\s*49[,.]90|R\\$\\s*199[,.]90|R\\$\\s*799/)).toHaveCount(0);
    await expect(page.getByText(/plano profissional|plano institucional|checkout/i)).toHaveCount(0);
  });

  test('interface suporta zoom e largura compacta sem rolagem horizontal global', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('./');
    await page.evaluate(() => { document.documentElement.style.zoom = '1.25'; });
    await page.waitForTimeout(100);
    const overflow = await page.evaluate(() => ({
      root: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      body: document.body.scrollWidth - document.body.clientWidth,
    }));
    expect(overflow.root).toBeLessThanOrEqual(1);
    expect(overflow.body).toBeLessThanOrEqual(1);
  });

  test('foco de teclado permanece visível nos controles principais', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Validação de teclado é destinada aos perfis desktop.');
    await page.goto('./');
    await page.keyboard.press('Tab');
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
    const style = await focused.evaluate(node => {
      const css = getComputedStyle(node);
      return { outline: css.outlineStyle, width: css.outlineWidth, shadow: css.boxShadow };
    });
    expect(style.outline !== 'none' || style.shadow !== 'none').toBeTruthy();
  });
});
