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
  test('núcleo visual permanece íntegro entre seções e modos', async ({ page, isMobile }) => {
    await page.goto('./');
    await expect(page.locator('#main-content')).toBeVisible();
    await assertViewportIntegrity(page);

    for (const id of sections) {
      await navigate(page, id);
      await assertViewportIntegrity(page);
    }

    if (isMobile) {
      const shortcut = page.locator('.site-mode-shortcut');
      const root = page.locator('html');
      await expect(shortcut).toBeVisible();
      for (let step = 0; step < 3; step += 1) {
        const current = await root.getAttribute('data-language-mode');
        const next = current === 'summary' ? 'simple' : current === 'simple' ? 'technical' : 'summary';
        await shortcut.click();
        await expect(root).toHaveAttribute('data-language-mode', next);
        await assertViewportIntegrity(page);
      }
    } else {
      const modes = page.getByRole('group', { name: 'Escolha como você quer ler os dados' });
      for (const label of ['Simples', 'Técnico', 'Resumo']) {
        await modes.getByRole('button', { name: new RegExp('^' + label) }).click();
        await expect(page.locator('html')).toHaveAttribute(
          'data-language-mode',
          label === 'Simples' ? 'simple' : label === 'Técnico' ? 'technical' : 'summary',
        );
        await assertViewportIntegrity(page);
      }
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

  test('botão Mais abre, gerencia foco, fecha com Escape e navega no mobile', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Fluxo pertence à navegação inferior mobile.');
    await page.goto('./');

    const trigger = page.locator('#mobile-bottom-more-trigger');
    await expect(trigger).toBeVisible();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const menu = page.locator('#mobile-bottom-more');
    await expect(menu).toBeVisible();

    const firstItem = menu.getByRole('menuitem').first();
    await expect(firstItem).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(menu).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await trigger.click();
    const target = menu.getByRole('menuitem').first();
    const targetText = (await target.locator('span').textContent())?.trim();
    await target.click();
    await expect(menu).toHaveCount(0);
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(targetText).toBeTruthy();
    const hash = await page.evaluate(() => window.location.hash);
    expect(hash).not.toBe('');
    await expect(page.locator(hash)).toBeVisible();
    await assertViewportIntegrity(page);
  });


  test('header premium não quebra em larguras de notebook e desktop', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Contrato destinado a larguras desktop.');
    for (const width of [1024, 1280, 1366, 1440]) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('./');
      const header = page.locator('.site-header');
      await expect(header).toBeVisible();
      const integrity = await header.evaluate(node => {
        const viewport = document.documentElement.clientWidth;
        const offenders = [...node.querySelectorAll('a,button,[role="group"]')]
          .filter(el => {
            const style = getComputedStyle(el);
            const rect = el.getBoundingClientRect();
            return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0
              && (rect.left < -1 || rect.right > viewport + 1);
          })
          .map(el => ({ tag: el.tagName, text: el.textContent?.trim().slice(0, 40) }));
        return { width: node.scrollWidth, viewport, offenders };
      });
      expect(integrity.width).toBeLessThanOrEqual(integrity.viewport + 1);
      expect(integrity.offenders).toEqual([]);
    }
  });



  test('busca global de serviço abre um card existente', async ({ page }) => {
    await page.goto('./');
    const searchTrigger = page.getByRole('button', { name: /Buscar no observatório/i }).first();
    await searchTrigger.click();
    const search = page.getByRole('combobox', { name: /Buscar serviço, seção, fonte ou indicador/i });
    await search.fill('SAMU');
    const result = page.getByRole('option', { name: /SAMU/i }).first();
    await expect(result).toBeVisible();
    await result.click();
    await expect(page.locator('#acao')).toBeVisible();
    await expect(page.getByRole('link', { name: /SAMU/i })).toBeVisible();
    await assertViewportIntegrity(page);
  });

  test('entrada principal prioriza utilidade pública e leva ao serviço', async ({ page }) => {
    await page.goto('./');
    await navigate(page, 'descubra');

    const serviceAction = page.getByRole('button', { name: /Encontrar um serviço público/i });
    await expect(serviceAction).toBeVisible();
    await serviceAction.click();
    await expect(page.locator('#acao')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Serviços públicos e fontes oficiais' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Encontre um serviço municipal' })).toBeVisible();
    await assertViewportIntegrity(page);
  });

  test('utilidade pública permite chegar ao serviço pela necessidade', async ({ page }) => {
    await page.goto('./');
    await navigate(page, 'acao');
    const needs = page.getByLabel('Atalhos por necessidade');
    await expect(needs).toBeVisible();

    await needs.getByRole('button', { name: 'Medicamentos', exact: true }).click();
    await expect(page.getByRole('link', { name: /Medicamentos SUS/i })).toBeVisible();

    const search = page.getByRole('searchbox', { name: 'Buscar serviço municipal' });
    await search.fill('preciso de remédio');
    await expect(page.getByRole('link', { name: /Medicamentos SUS/i })).toBeVisible();

    await search.fill('ouvidoria');
    await expect(page.getByRole('link', { name: /Denúncias à Ouvidoria/i })).toBeVisible();

    await search.fill('emprego');
    await expect(page.getByRole('link', { name: /Processos seletivos/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Lista de espera em creches/i })).toHaveCount(0);

    await search.fill('emergência');
    await expect(page.getByRole('link', { name: /SAMU/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Defesa Civil/i })).toBeVisible();

    await search.fill('termo sem correspondência 987');
    await expect(page.getByText('Não encontramos um serviço com esse termo.')).toBeVisible();

    await search.fill('');
    await expect(page.getByRole('link', { name: /SAMU/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Defesa Civil/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Medicamentos SUS/i })).toBeVisible();
    const catalogue = page.locator('.official-more').filter({ hasText: /catálogo completo|Mais serviços oficiais/i }).first();
    await expect(catalogue).toBeVisible();
    await catalogue.locator('summary').click();
    await expect(catalogue.getByRole('link', { name: /Processos seletivos/i })).toBeVisible();
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
    let focused = page.locator(':focus');
    for (let attempt = 0; attempt < 12; attempt += 1) {
      await page.keyboard.press('Tab');
      focused = page.locator(':focus');
      const interactive = await focused.evaluate(node =>
        node.matches('button,a,input,select,textarea,summary,[role="button"]'),
      ).catch(() => false);
      if (interactive) break;
    }
    await expect(focused).toBeVisible();
    const style = await focused.evaluate(node => {
      const css = getComputedStyle(node);
      return {
        interactive: node.matches('button,a,input,select,textarea,summary,[role="button"]'),
        outline: css.outlineStyle,
        width: css.outlineWidth,
        shadow: css.boxShadow,
      };
    });
    expect(style.interactive).toBeTruthy();
    expect(
      (style.outline !== 'none' && style.width !== '0px') || style.shadow !== 'none',
    ).toBeTruthy();
  });
});
