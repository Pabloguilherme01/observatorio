import { test, expect } from 'playwright/test';
import { readFileSync } from 'node:fs';

async function openSection(page, id) {
  await page.evaluate(sectionId => {
    window.location.hash = sectionId;
  }, id);
  await expect(page.locator('#' + id)).toBeVisible();
}

test.describe('Observatório smoke flows', () => {
  test('carrega, troca modo de leitura e navega por seções principais', async ({ page }) => {
    await page.goto('./');
    await expect(page).toHaveTitle(/Observatório Eleitoral — Águas Lindas de Goiás 2026/);
    await expect(page.locator('#root')).toBeVisible();
    await expect(page.getByRole('group', { name: 'Escolha como você quer ler os dados' })).toBeVisible();

    const modeGroup = page.getByRole('group', { name: 'Escolha como você quer ler os dados' });
    await modeGroup.getByRole('button', { name: /^Técnico/ }).click();
    await expect(modeGroup.getByRole('button', { name: /^Técnico/ })).toHaveAttribute('aria-pressed', 'true');
    await modeGroup.getByRole('button', { name: /^Resumo/ }).click();
    await expect(modeGroup.getByRole('button', { name: /^Resumo/ })).toHaveAttribute('aria-pressed', 'true');

    await openSection(page, 'eleitoral360');
    await expect(page.getByRole('heading', { name: /Nomes acompanhados no recorte de Águas Lindas/i })).toBeVisible();

    await openSection(page, 'transporte');
    await expect(page.getByRole('heading', { name: /Simulador de bolso/i })).toBeVisible();
    await page.getByRole('slider', { name: /Quantidade de pessoas/i }).fill('2');

    await openSection(page, 'quiz');
    await expect(page.getByRole('heading', { name: /Quiz de dados · 2026/i })).toBeVisible();
    await expect(page.getByText(/200 perguntas · 5 fases · 40 por fase/i)).toBeVisible();
    const phaseButtons = page.locator('.quiz-phase-grid button');
    await expect(phaseButtons.first()).toHaveAttribute('type', 'button');
    await expect(phaseButtons.first()).not.toHaveAttribute('role', 'listitem');
    const quizOptions = page.locator('.quiz-options button');
    await expect(quizOptions).toHaveCount(4);
    await quizOptions.nth(0).click();
    await expect(page.getByRole('status').filter({ hasText: /Resposta correta|Resposta conferida/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Próxima|Finalizar fase/i })).toBeEnabled();
    await page.getByRole('button', { name: /Próxima|Finalizar fase/i }).click();
    await expect(page.getByText(/200 perguntas · 5 fases · 40 por fase/i)).toBeVisible();

    await openSection(page, 'transporte');
    const peopleSlider = page.getByRole('slider', { name: /Quantidade de pessoas/i });
    await peopleSlider.fill('20');
    await expect(peopleSlider).toHaveValue('20');
    await page.reload();
    await openSection(page, 'transporte');
    await expect(page.getByRole('slider', { name: /Quantidade de pessoas/i })).toHaveValue('20');

    await openSection(page, 'principios');
    await expect(page.getByRole('heading', { name: /Confiança começa pela origem/i })).toBeVisible();
    await modeGroup.getByRole('button', { name: /^Técnico/ }).click();
    await expect(page.locator('.trust-card').filter({ hasText: 'Publicação pública' }).first()).toBeVisible();
    await expect(page.locator('.trust-card').filter({ hasText: 'Paridade de publicação' }).first()).toBeVisible();

    await openSection(page, 'acao');
    await expect(page.getByRole('heading', { name: /Serviços e verificação/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Abrir Serviços da Prefeitura|Medicamentos SUS/i }).first()).toBeVisible();
  });

  test('busca abre destinos que exigem elevação de leitura', async ({ page }) => {
  await page.goto('./');
  const root = page.locator('html');

  await page.getByRole('button', { name: /buscar/i }).first().click();
  const input = page.getByRole('combobox').first();
  await input.fill('qualidade');
  await page.getByRole('option', { name: /Qualidade dos dados/i }).click();
  await expect(root).toHaveAttribute('data-language-mode', 'technical');
  await expect(page.locator('#qualidade')).toBeVisible();

  await page.getByRole('button', { name: /buscar/i }).first().click();
  await page.getByRole('combobox').first().fill('resumo executivo');
  await page.getByRole('option', { name: /Resumo executivo/i }).click();
  await expect(page.locator('#resumo')).toBeVisible();
});

test('healthcheck técnico usa base pública e permite tentar novamente', async ({ page }) => {
  let calls = 0;
  const requestedPaths = [];
  await page.route('**/api/v1/health.json', async route => {
    calls += 1;
    requestedPaths.push(new URL(route.request().url()).pathname);
    if (calls === 1) {
      await route.fulfill({ status: 503, json: { status: 'error' } });
      return;
    }
    await route.fulfill({
      json: {
        status: 'ok',
        publication: { commitShort: 'abc1234', contract: 'health-v1' },
        buildGeneratedAt: '2026-09-26T17:30:00Z',
        freshness: { tseCandidates: { capturedAt: '2026-09-26T16:30:00Z', ageHours: 1 } },
      },
    });
  });

  await page.goto('./');
  await openSection(page, 'principios');
  const modes = page.getByRole('group', { name: 'Escolha como você quer ler os dados' });
  await modes.getByRole('button', { name: /^Técnico/ }).click();

  const publicationCard = page.locator('.trust-card').filter({ hasText: 'Publicação pública' }).first();
  await expect(publicationCard.getByRole('status')).toContainText(/não pôde ser concluída/i);

  const retry = publicationCard.getByRole('button', { name: 'Atualizar status' });
  await retry.click();
  await expect(publicationCard.getByRole('status')).toContainText(/publicação está íntegra/i);
  await expect(page.getByText(/Commit publicado:.*abc1234/)).toBeVisible();

  expect(calls).toBe(2);
  expect(requestedPaths.every(path => path.endsWith('/observatorio/api/v1/health.json'))).toBeTruthy();
});

test('busca global abre o serviço municipal já filtrado', async ({ page }) => {
    await page.goto('./');
    await page.getByRole('button', { name: /buscar/i }).first().click();
    const input = page.getByRole('combobox').first();
    await input.fill('CAPS');
    await page.getByRole('option', { name: /^CAPS Serviços públicos$/ }).click();
    await expect(page).toHaveURL(/#acao$/);
    const serviceSearch = page.getByRole('searchbox', { name: 'Buscar serviço municipal' });
    await expect(serviceSearch).toHaveValue('CAPS');
    await expect(page.getByRole('link', { name: /CAPS/i })).toBeVisible();
  });

  test('resposta rápida oferece acesso direto à fonte oficial', async ({ page }) => {
    await page.goto('./');
    await page.getByRole('button', { name: /buscar/i }).first().click();
    const input = page.getByRole('combobox').first();
    await input.fill('população');
    const sourceLink = page.getByRole('link', { name: /Fonte oficial/i });
    await expect(sourceLink).toBeVisible();
    await expect(sourceLink).toHaveAttribute('href', /ibge\.gov\.br/);
  });

  test('hub prioriza serviços eleitorais oficiais de uso direto', async ({ page }) => {
    await page.goto('./');
    await openSection(page, 'acao');
    await expect(page.getByRole('link', { name: /Consultar situação eleitoral/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Candidaturas e contas/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Resultados oficiais/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Portal Eleições 2026/i })).toBeVisible();
  });

  test('mantém fluxo de busca e exportação disponível', async ({ page }) => {
    await page.goto('./');
    const searchTrigger = page.getByRole('button', { name: /buscar/i }).first();
    if (await searchTrigger.count()) {
      await searchTrigger.click();
      await expect(page.getByRole('dialog')).toBeVisible();
      const searchInput = page.getByRole('combobox').first();
      await searchInput.fill('transporte');
      await expect(page.getByText(/Simulador de bolso/i).first()).toBeVisible();
      await page.keyboard.press('Escape');
    }

    await openSection(page, 'exportacao');
    await expect(page.locator('#exportacao')).toBeVisible();
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'CSV' }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.csv$/);
  });
});



test('atalhos configurados navegam e respeitam campos de digitação', async ({ page }) => {
  await page.goto('./');

  await page.keyboard.press('g');
  await page.keyboard.press('d');
  await expect(page).toHaveURL(/#dashboard$/);
  await expect(page.locator('#dashboard')).toBeVisible();

  await page.keyboard.press('g');
  await page.keyboard.press('t');
  await expect(page).toHaveURL(/#transporte$/);
  await expect(page.locator('#transporte')).toBeVisible();

  await page.getByRole('button', { name: /buscar/i }).first().click();
  const input = page.getByRole('combobox').first();
  await input.fill('g');
  await page.keyboard.press('d');
  await expect(input).toHaveValue('gd');
  await expect(page).toHaveURL(/#transporte$/);
  await page.keyboard.press('Escape');
});

test('busca apresenta guia descobrível dos atalhos configurados', async ({ page }) => {
  await page.goto('./');
  await page.keyboard.press('/');
  const guide = page.locator('.search-shortcut-guide');
  await expect(guide).toBeVisible();
  await guide.locator('summary').click();
  await expect(guide.locator('kbd').filter({ hasText: 'G D' })).toBeVisible();
  await expect(guide.locator('kbd').filter({ hasText: 'G T' })).toBeVisible();
  await expect(guide.getByText('Dashboard', { exact: true })).toBeVisible();
  await expect(guide.getByText('Transporte', { exact: true })).toBeVisible();
});

test('Voltar e Avançar restauram seções abertas por atalhos, busca e mobile', async ({ page }) => {
  await page.goto('./#dashboard');

  await page.keyboard.press('g');
  await page.keyboard.press('t');
  await expect(page).toHaveURL(/#transporte$/);

  await page.evaluate(() => {
    window.__historyNavigationEvents = [];
    window.addEventListener('observatorio:navigate', event => {
      window.__historyNavigationEvents.push(event.detail);
    });
  });

  await page.goBack();
  await expect(page).toHaveURL(/#dashboard$/);
  await expect(page.locator('#dashboard')).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.__historyNavigationEvents.filter(id => id === 'dashboard').length)).toBe(1);

  await page.goForward();
  await expect(page).toHaveURL(/#transporte$/);
  await expect(page.locator('#transporte')).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.__historyNavigationEvents.filter(id => id === 'transporte').length)).toBe(1);

  await page.getByRole('button', { name: /buscar/i }).first().click();
  await page.getByRole('combobox').first().fill('fontes');
  await page.getByRole('option', { name: /Fontes e metodologia/i }).click();
  await expect(page).toHaveURL(/#fontes$/);

  await page.goBack();
  await expect(page).toHaveURL(/#transporte$/);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('.mobile-bottom-nav').getByRole('button', { name: /Explorar/i }).click();
  await expect(page).toHaveURL(/#descubra$/);
  await page.goBack();
  await expect(page).toHaveURL(/#transporte$/);
});

test('atalho de ajuda abre a busca com o guia de atalhos expandido', async ({ page }) => {
  await page.goto('./');
  await page.keyboard.press('?');
  await expect(page.getByRole('dialog')).toBeVisible();
  const guide = page.locator('.search-shortcut-guide');
  await expect.poll(() => guide.evaluate(node => node.open)).toBe(true);
  await expect(guide.locator('kbd').filter({ hasText: '?' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Buscar no observatório' })).toHaveAttribute('aria-keyshortcuts', '/ Control+K');
});

test('busca preserva Home e End para edição de texto e anuncia resultados', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Buscar no observatório' }).click();

  const input = page.getByRole('combobox').first();
  const status = page.getByRole('status');
  await input.fill('transporte');

  await input.press('Home');
  await expect.poll(() => input.evaluate(node => node.selectionStart)).toBe(0);

  await input.press('End');
  await expect.poll(() => input.evaluate(node => node.selectionStart)).toBe('transporte'.length);
  await expect(status).toContainText(/resultado.*transporte/i);

  await input.fill('zzzzzz-sem-resultado');
  await expect(status).toContainText(/Nenhum resultado.*zzzzzz-sem-resultado/i);
});

test('atalho de busca por barra abre a busca global', async ({ page }) => {
  await page.goto('./');
  await page.keyboard.press('/');
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('combobox').first()).toBeVisible();
});


test('renderiza os gráficos históricos com dimensões válidas', async ({ page }) => {
  await page.goto('./');
  await openSection(page, 'dashboard');
  const history = page.locator('.dashboard-history-card');
  await expect(history).toBeVisible();
  const chart = history.locator('.recharts-wrapper').first();
  await expect(chart).toBeVisible();
  const box = await chart.boundingBox();
  expect(box?.width ?? 0).toBeGreaterThan(100);
  expect(box?.height ?? 0).toBeGreaterThan(100);
  await expect(history.locator('.recharts-line').first()).toBeVisible();

  await openSection(page, 'saude');
  const sewerChart = page.locator('#saude svg[aria-label*="Histórico do atendimento"]').first();
  await expect(sewerChart).toBeVisible();
  const sewerBox = await sewerChart.boundingBox();
  expect(sewerBox?.width ?? 0).toBeGreaterThan(100);
  expect(sewerBox?.height ?? 0).toBeGreaterThan(80);
});


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
    await page.getByRole('button', { name: 'Abrir menu' }).click();
    await page.getByRole('button', { name: 'Buscar áreas' }).click();

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
    expect(copied).toMatch(/#transporte$/);
    expect(copied).not.toContain('utm_source');
    expect(copied).not.toContain('?');
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



test('status de conexão informa offline e confirma reconexão', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./');

  const status = page.getByRole('status', { name: 'Status de conexão' });
  await expect(status).toHaveCount(0);

  await page.context().setOffline(true);
  await expect(status).toBeVisible();
  await expect(status).toContainText('Sem conexão');
  await expect(status.getByRole('button', { name: 'Verificar' })).toBeVisible();

  const offlineGeometry = await status.evaluate(node => {
    const rect = node.getBoundingClientRect();
    return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
  });
  expect(offlineGeometry.left).toBeGreaterThanOrEqual(0);
  expect(offlineGeometry.right).toBeLessThanOrEqual(390);
  expect(offlineGeometry.top).toBeGreaterThanOrEqual(0);
  expect(offlineGeometry.bottom).toBeLessThanOrEqual(844);

  await status.getByRole('button', { name: 'Verificar' }).click();
  await expect(status).toContainText('Sem conexão');

  await page.context().setOffline(false);
  await expect(status).toContainText('Conexão restabelecida');
  await expect(status).toContainText('publicação online voltou a responder');

  await expect(status).toHaveCount(0, { timeout: 5000 });
});

test('prompt PWA respeita a barra mobile, pode ser dispensado e instalar', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./');

  const dispatchInstallPrompt = async outcome => {
    await page.evaluate(nextOutcome => {
      const event = new Event('beforeinstallprompt', { cancelable: true });
      Object.defineProperty(event, 'prompt', {
        value: async () => { window.__pwaPromptCalls = (window.__pwaPromptCalls || 0) + 1; },
      });
      Object.defineProperty(event, 'userChoice', {
        value: Promise.resolve({ outcome: nextOutcome }),
      });
      window.dispatchEvent(event);
    }, outcome);
  };

  await dispatchInstallPrompt('accepted');

  const banner = page.getByRole('status', { name: 'Instalar o Observatório' });
  const nav = page.locator('.mobile-bottom-nav');
  await expect(banner).toBeVisible();

  const geometry = await page.evaluate(() => {
    const bannerNode = document.querySelector('.pwa-install-banner');
    const navNode = document.querySelector('.mobile-bottom-nav');
    if (!bannerNode || !navNode) return null;
    const bannerRect = bannerNode.getBoundingClientRect();
    const navRect = navNode.getBoundingClientRect();
    return { bannerBottom: bannerRect.bottom, navTop: navRect.top, bannerLeft: bannerRect.left, bannerRight: bannerRect.right };
  });
  expect(geometry).not.toBeNull();
  expect(geometry.bannerBottom).toBeLessThanOrEqual(geometry.navTop - 1);
  expect(geometry.bannerLeft).toBeGreaterThanOrEqual(0);
  expect(geometry.bannerRight).toBeLessThanOrEqual(390);

  await banner.getByRole('button', { name: 'Agora não' }).click();
  await expect(banner).toBeHidden();
  await expect.poll(() => page.evaluate(() => sessionStorage.getItem('observatorio:pwa-install-dismissed'))).toBe('true');

  await dispatchInstallPrompt('accepted');
  await expect(banner).toBeHidden();

  await page.evaluate(() => sessionStorage.removeItem('observatorio:pwa-install-dismissed'));
  await dispatchInstallPrompt('accepted');
  await expect(banner).toBeVisible();
  await banner.getByRole('button', { name: 'Instalar' }).click();
  await expect.poll(() => page.evaluate(() => window.__pwaPromptCalls || 0)).toBe(1);
  await expect(banner).toBeHidden();
});

test('botão Mais da navegação inferior funciona no mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./');

  const nav = page.locator('.mobile-bottom-nav');
  const more = nav.getByRole('button', { name: 'Mais', exact: true });
  await expect(nav).toBeVisible();
  await expect(more).toHaveAttribute('aria-expanded', 'false');

  await more.click();
  await expect(more).toHaveAttribute('aria-expanded', 'true');

  const layer = page.locator('[data-mobile-more-layer]');
  const menu = page.getByRole('menu', { name: 'Mais áreas do observatório' });
  await expect(layer).toBeVisible();
  await expect(menu).toBeVisible();
  await expect(menu.getByRole('menuitem')).toHaveCount(7);
  await expect(menu.getByRole('menuitem').first()).toBeFocused();

  const menuBox = await menu.evaluate(node => {
    const rect = node.getBoundingClientRect();
    return { left: rect.left, right: rect.right, bottom: rect.bottom };
  });
  const navBox = await nav.evaluate(node => {
    const rect = node.getBoundingClientRect();
    return { top: rect.top };
  });
  expect(menuBox.left).toBeGreaterThanOrEqual(0);
  expect(menuBox.right).toBeLessThanOrEqual(390);
  expect(menuBox.bottom).toBeLessThanOrEqual(navBox.top + 1);

  await menu.getByRole('menuitem', { name: /Saúde/i }).click();
  await expect(page).toHaveURL(/#saude$/);
  await expect(page.locator('#saude')).toBeVisible();
  await expect(layer).toBeHidden();
  await expect(more).toHaveAttribute('aria-expanded', 'false');

  await more.click();
  await expect(menu).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
  await expect(more).toBeFocused();

  await more.click();
  await expect(menu).toBeVisible();
  await page.mouse.click(12, 12);
  await expect(menu).toBeHidden();
  await expect(more).toBeFocused();

  await more.click();
  await expect(menu).toBeVisible();
  await page.setViewportSize({ width: 800, height: 844 });
  await expect(page.locator('[data-mobile-more-layer]')).toHaveCount(0);
  await expect(page.locator('#mobile-bottom-more-trigger')).toHaveAttribute('aria-expanded', 'false');
});

test('hero abre Fontes sem alterar o modo Resumo', async ({ page }) => {
  await page.goto('./');
  const root = page.locator('html');
  await expect(root).toHaveAttribute('data-language-mode', 'summary');
  await page.getByRole('link', { name: 'Conferir fontes' }).click();
  await expect(page).toHaveURL(/#fontes$/);
  await expect(root).toHaveAttribute('data-language-mode', 'summary');
  await expect(page.locator('#fontes')).toBeVisible();
});

test('marca mantém hierarquia visual correta no mobile e desktop', async ({ page }) => {
  for (const viewport of [{ width: 390, height: 844 }, { width: 1366, height: 768 }]) {
    await page.setViewportSize(viewport);
    await page.goto('./');
    const sizes = await page.locator('.site-brand').evaluate(node => {
      const spans = node.querySelectorAll('span');
      return {
        eyebrow: Number.parseFloat(getComputedStyle(spans[0]).fontSize),
        title: Number.parseFloat(getComputedStyle(spans[spans.length - 1]).fontSize),
      };
    });
    expect(sizes.title).toBeGreaterThan(sizes.eyebrow);
  }
});

test('menu Mais destaca visualmente uma seção secundária ativa', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto('./');
  await openSection(page, 'fontes');
  const header = page.locator('.site-header');
  const more = header.getByRole('button', { name: 'Mais', exact: true });
  await expect(more).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('.mobile-bottom-nav')).toBeHidden();
});

for (const viewport of [
  { name: 'tablet-header', width: 768, height: 1024 },
  { name: 'small-desktop-header', width: 1024, height: 768 },
  { name: 'notebook-header', width: 1366, height: 768 },
]) {
  test('header compacto sem overflow em ' + viewport.name, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('./');
    const header = page.locator('.site-header');
    await expect(header).toBeVisible();
    const headerBox = await header.boundingBox();
    expect(headerBox?.width ?? Infinity).toBeLessThanOrEqual(viewport.width);

    const reading = page.locator('.header-reading-mode');
    await expect(reading).toBeVisible();
    await expect(reading.locator('.language-toggle-options > button')).toHaveCount(3);
    await expect(reading.locator('.language-toggle-label')).toBeHidden();
    await expect(reading.locator('.language-toggle-deepen')).toBeHidden();

    const dimensions = await page.evaluate(() => ({
      client: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth,
    }));
    expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.client + 1);
  });
}

for (const viewport of [
  { name: 'phone-320', width: 320, height: 568 },
  { name: 'phone-390', width: 390, height: 844 },
  { name: 'tablet-portrait', width: 768, height: 1024 },
  { name: 'tablet-landscape', width: 1024, height: 768 },
  { name: 'notebook', width: 1366, height: 768 },
  { name: 'desktop-wide', width: 1920, height: 1080 },
]) {
  test('layout responsivo sem overflow em ' + viewport.name, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('./');
    const dimensions = await page.evaluate(() => ({
      client: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth,
    }));
    expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.client + 1);

    await openSection(page, 'dashboard');
    const chart = page.locator('.dashboard-history-chart .recharts-wrapper').first();
    await expect(chart).toBeVisible();
    const chartBox = await chart.boundingBox();
    expect(chartBox?.width ?? 0).toBeGreaterThan(100);
    expect(chartBox?.width ?? Infinity).toBeLessThanOrEqual(viewport.width);
    expect(chartBox?.height ?? 0).toBeGreaterThan(100);

    const afterChart = await page.evaluate(() => ({
      client: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth,
    }));
    expect(afterChart.scroll).toBeLessThanOrEqual(afterChart.client + 1);
  });
}

test('cards premium organizam notas soltas sem overflow no mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./');

  await openSection(page, 'demografia');
  await expect(page.locator('#demografia .premium-info-card')).toHaveCount(3);
  await expect(page.getByText('Escala populacional com contexto')).toBeVisible();
  await expect(page.getByText('Estimativa e censo permanecem separados')).toBeVisible();

  await openSection(page, 'orcamento');
  await expect(page.getByText('Camadas orçamentárias não são somadas entre si')).toBeVisible();

  await openSection(page, 'contexto');
  await expect(page.getByText('Comparação oferece contexto — não ranking')).toBeVisible();

  await openSection(page, 'mudancas-snapshot');
  await expect(page.locator('#mudancas-snapshot .premium-info-card')).toHaveCount(2);
  await expect(page.getByText('Snapshot identificado e rastreável')).toBeVisible();

  const dimensions = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.client + 1);

  const cardWidths = await page.locator('.premium-info-card:visible').evaluateAll(nodes =>
    nodes.map(node => node.getBoundingClientRect().right - document.documentElement.clientWidth)
  );
  expect(cardWidths.every(overflow => overflow <= 1)).toBeTruthy();
});

test('modos de leitura possuem identidades visuais distintas em mobile e desktop', async ({ page }) => {
  for (const viewport of [
    { width: 390, height: 844, mobile: true },
    { width: 1366, height: 768, mobile: false },
  ]) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('./');

    if (viewport.mobile) await page.getByRole('button', { name: 'Abrir menu' }).click();

    const group = viewport.mobile
      ? page.locator('.mobile-tools-sheet').getByRole('group', { name: 'Escolha como você quer ler os dados' })
      : page.locator('.header-reading-mode').getByRole('group', { name: 'Escolha como você quer ler os dados' });
    const root = page.locator('html');
    const main = page.locator('#main-content');

    const signatures = {};
    for (const mode of [
      { name: /^Resumo/, id: 'summary' },
      { name: /^Simples/, id: 'simple' },
      { name: /^Técnico/, id: 'technical' },
    ]) {
      await group.getByRole('button', { name: mode.name }).click();
      await expect(root).toHaveAttribute('data-language-mode', mode.id);
      signatures[mode.id] = await main.evaluate(node => {
        const rootStyle = getComputedStyle(document.documentElement);
        const style = getComputedStyle(node);
        return {
          accent: rootStyle.getPropertyValue('--reading-accent-rgb').trim(),
          radius: rootStyle.getPropertyValue('--reading-radius').trim(),
          gap: rootStyle.getPropertyValue('--reading-section-gap').trim(),
          backgroundImage: style.backgroundImage,
        };
      });
    }

    expect(new Set(Object.values(signatures).map(value => value.accent)).size).toBe(3);
    expect(signatures.summary.radius).not.toBe(signatures.technical.radius);
    expect(signatures.summary.gap).not.toBe(signatures.simple.gap);
    expect(signatures.technical.backgroundImage).toContain('linear-gradient');

    const dimensions = await page.evaluate(() => ({
      client: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth,
    }));
    expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.client + 1);
  }
});

test('modos de leitura só avançam quando a seção realmente exige mais detalhe', async ({ page }) => {
  await page.goto('./');
  const root = page.locator('html');
  const modes = page.getByRole('group', { name: 'Escolha como você quer ler os dados' });

  await expect(root).toHaveAttribute('data-language-mode', 'summary');
  await openSection(page, 'fontes');
  await expect(root).toHaveAttribute('data-language-mode', 'summary');

  await openSection(page, 'exportacao');
  await expect(root).toHaveAttribute('data-language-mode', 'summary');

  await openSection(page, 'eleitoral360');
  await expect(root).toHaveAttribute('data-language-mode', 'simple');

  await openSection(page, 'eleitorado');
  await expect(root).toHaveAttribute('data-language-mode', 'simple');

  await openSection(page, 'qualidade');
  await expect(root).toHaveAttribute('data-language-mode', 'technical');

  await modes.getByRole('button', { name: /^Simples/ }).click();
  await openSection(page, 'fontes');
  await expect(root).toHaveAttribute('data-language-mode', 'simple');
});

test('reduzir o modo nunca deixa o usuário em uma seção invisível', async ({ page }) => {
  await page.goto('./');
  const root = page.locator('html');
  const modes = page.getByRole('group', { name: 'Escolha como você quer ler os dados' });

  await openSection(page, 'qualidade');
  await expect(root).toHaveAttribute('data-language-mode', 'technical');
  await modes.getByRole('button', { name: /^Simples/ }).click();
  await expect(root).toHaveAttribute('data-language-mode', 'simple');
  await expect(page).toHaveURL(/#fontes$/);
  await expect(page.locator('#fontes')).toBeVisible();

  await openSection(page, 'orcamento-impacto');
  await expect(root).toHaveAttribute('data-language-mode', 'technical');
  await modes.getByRole('button', { name: /^Simples/ }).click();
  await expect(root).toHaveAttribute('data-language-mode', 'simple');
  await expect(page).toHaveURL(/#orcamento$/);
  await expect(page.locator('#orcamento')).toBeVisible();

  await openSection(page, 'eleitoral360');
  await modes.getByRole('button', { name: /^Resumo/ }).click();
  await expect(root).toHaveAttribute('data-language-mode', 'summary');
  await expect(page).toHaveURL(/#resumo$/);
  await expect(page.locator('#resumo')).toBeVisible();
});

test('ação de aprofundar percorre os três níveis de leitura no painel mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./');
  const root = page.locator('html');

  await page.getByRole('button', { name: 'Abrir menu' }).click();
  let deepen = page.getByRole('button', { name: 'Aprofundar leitura' });
  await deepen.click();
  await expect(root).toHaveAttribute('data-language-mode', 'simple');

  deepen = page.getByRole('button', { name: 'Aprofundar leitura' });
  await deepen.click();
  await expect(root).toHaveAttribute('data-language-mode', 'technical');

  await page.getByRole('button', { name: 'Voltar para visão executiva' }).click();
  await expect(root).toHaveAttribute('data-language-mode', 'summary');
});

test('modos de leitura persistem e podem avançar por atalho', async ({ page }) => {
  await page.goto('./');
  const root = page.locator('html');
  await expect(root).toHaveAttribute('data-language-mode', 'summary');
  await page.keyboard.press('Alt+m');
  await expect(root).toHaveAttribute('data-language-mode', 'simple');
  await page.keyboard.press('Alt+m');
  await expect(root).toHaveAttribute('data-language-mode', 'technical');
  await page.reload();
  await expect(root).toHaveAttribute('data-language-mode', 'technical');
});

test('persiste melhor marca e desbloqueio do quiz após recarregar', async ({ page }) => {
  await page.goto('./');
  await page.evaluate(() => {
    localStorage.setItem('observatorio-v44-quiz-best-scores', JSON.stringify([24, 0, 0, 0, 0]));
  });
  await page.reload();
  await openSection(page, 'quiz');
  const phases = page.locator('.quiz-phase-grid button');
  await expect(phases.nth(1)).toBeEnabled();
  await expect(phases.nth(1)).toContainText('Melhor marca');
});


test('quiz contabiliza corretamente as 40 respostas, incluindo a última', async ({ page }) => {
  test.setTimeout(90_000);
  const quizSource = readFileSync('src/data/quiz/questionBank.ts', 'utf8');
  const answerIndexes = [...quizSource.matchAll(/difficulty:'Fácil'[\s\S]*?answerIndex:\s*(\d+)/g)]
    .slice(0, 40)
    .map(match => Number(match[1]));
  expect(answerIndexes).toHaveLength(40);

  await page.goto('./');
  await page.evaluate(() => {
    localStorage.removeItem('observatorio-v44-quiz-best-scores');
  });
  await page.reload();
  await openSection(page, 'quiz');

  for (let index = 0; index < answerIndexes.length; index += 1) {
    await page.locator('.quiz-options button').nth(answerIndexes[index]).click();
    await page.getByRole('button', { name: index === answerIndexes.length - 1 ? /Finalizar fase/i : /^Próxima/ }).click();
  }

  await expect(page.locator('.quiz-result-score')).toContainText('40 de 40 acertos');
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('observatorio-v44-quiz-best-scores') || '[0,0,0,0,0]'));
  expect(saved[0]).toBe(40);
});

test('inspetor bloqueia atalhos globais e usa links canônicos', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async text => { window.__lastCopiedText = text; } },
    });
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: async payload => { window.__lastInspectorShare = payload; },
    });
  });

  await page.goto('./?utm_source=teste');
  await openSection(page, 'dashboard');
  await page.locator('.dashboard-kpi-card').first().click();

  const dialog = page.getByRole('dialog', { name: /Variação da população/i });
  await expect(dialog).toBeVisible();

  await page.keyboard.press('g');
  await page.keyboard.press('t');
  await expect(page).toHaveURL(/#dashboard$/);

  await dialog.getByRole('button', { name: /Copiar referência/i }).click();
  const copied = await page.evaluate(() => window.__lastCopiedText);
  expect(copied).toContain('Variação da população');
  expect(copied).toContain('Fonte:');
  expect(copied).toContain('URL:');

  await dialog.getByRole('button', { name: 'Copiar link' }).click();
  await expect(dialog.getByRole('button', { name: 'Link copiado' })).toBeVisible();
  const copiedLink = await page.evaluate(() => window.__lastCopiedText);
  expect(copiedLink).toMatch(/#dashboard$/);
  expect(copiedLink).not.toContain('?');
  expect(copiedLink).not.toContain('utm_source');

  await dialog.getByRole('button', { name: /Compartilhar/i }).click();
  const payload = await page.evaluate(() => window.__lastInspectorShare);
  expect(payload?.url).toMatch(/#dashboard$/);
  expect(payload?.url).not.toContain('?');

  await page.evaluate(() => {
    delete navigator.share;
    window.__lastCopiedText = '';
  });
  await dialog.getByRole('button', { name: /Compartilhar/i }).click();
  const fallbackShare = await page.evaluate(() => window.__lastCopiedText);
  expect(fallbackShare).toContain('#dashboard');
  expect(fallbackShare).not.toContain('utm_source');

  await dialog.getByRole('button', { name: 'Fechar', exact: true }).click();
  await page.keyboard.press('g');
  await page.keyboard.press('t');
  await expect(page).toHaveURL(/#transporte$/);
});

test('simulador restaura o cenário padrão e persiste a redefinição', async ({ page }) => {
  await page.goto('./');
  await openSection(page, 'transporte');

  const people = page.getByRole('slider', { name: /Quantidade de pessoas/i });
  await people.fill('6');
  await page.getByText('Ajustar premissas do cálculo').click();
  await page.getByLabel('Dias por semana').fill('7');
  await page.getByRole('button', { name: /Restaurar padrão/i }).click();

  await expect(people).toHaveValue('1');
  await expect(page.getByLabel('Dias por semana')).toHaveValue('5');
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('observatorio:transport-preferences:v1') || '{}').people)).toBe(1);
});

test('compartilhamento do transporte usa URL canônica com um único hash', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: async payload => { window.__lastSharePayload = payload; },
    });
  });
  await page.goto('./#transporte');
  await openSection(page, 'transporte');
  await page.getByRole('button', { name: /compartilhar cenário/i }).click();

  const payload = await page.evaluate(() => window.__lastSharePayload);
  expect(payload?.url).toMatch(/#transporte$/);
  expect((payload?.url.match(/#transporte/g) || []).length).toBe(1);
  expect(payload?.text).toContain(payload?.url);
});


test('tema e contraste persistem após recarregar', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./');

  await page.getByRole('button', { name: 'Abrir menu' }).click();
  await page.getByRole('button', { name: /Tema claro|Tema escuro/ }).click();
  const storedTheme = await page.evaluate(() => localStorage.getItem('observatorio-theme'));
  expect(['light', 'dark']).toContain(storedTheme);

  await page.getByRole('button', { name: 'Abrir menu' }).click();
  const contrast = page.getByRole('group', { name: 'Contraste da interface' });
  await contrast.getByRole('button', { name: /Alto contraste/ }).click();
  await expect(page.locator('html')).toHaveAttribute('data-contrast', 'high');
  await expect.poll(() => page.evaluate(() => localStorage.getItem('observatorio-contrast'))).toBe('high');

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-contrast', 'high');
  expect(await page.evaluate(() => localStorage.getItem('observatorio-theme'))).toBe(storedTheme);
});

test('busca fecha com Escape e devolve foco ao acionador', async ({ page }) => {
  await page.goto('./');
  const trigger = page.getByRole('button', { name: /Buscar no observatório/i });
  await trigger.focus();
  await trigger.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('controles principais executam suas ações', async ({ page }) => {
  await page.goto('./');

  const modes = page.getByRole('group', { name: 'Escolha como você quer ler os dados' });
  await modes.getByRole('button', { name: /^Simples/ }).click();
  await expect(modes.getByRole('button', { name: /^Simples/ })).toHaveAttribute('aria-pressed', 'true');

  await openSection(page, 'exportacao');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'JSON' }).click();
  expect((await downloadPromise).suggestedFilename()).toMatch(/\.json$/);

  await openSection(page, 'transporte');
  const slider = page.getByRole('slider', { name: /Quantidade de pessoas/i });
  await slider.fill('3');
  await expect(slider).toHaveValue('3');

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  const top = page.getByRole('button', { name: 'Voltar ao topo' });
  await expect(top).toBeVisible();
  await top.click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(50);
});

test('mostra resultado completo após o encerramento da janela', async ({ page }) => {
  const feed = JSON.parse(readFileSync('scripts/fixtures/tse-results.valid.synthetic.json', 'utf8'));
  feed.state = 'complete';
  feed.capturedAt = '2026-10-26T22:00:00-03:00';
  feed.turn = 2;
  feed.entries[0].electionCode = 7001;
  feed.entries[0].sourceFile = 'go93343-c0003-e007001-u.json';
  feed.integrity.files[0].sourceFile = feed.entries[0].sourceFile;
  await page.clock.install({ time: new Date('2026-10-27T12:00:00-03:00') });
  await page.route('**/data/tse-results.json', route => route.fulfill({ json: feed }));
  await page.goto('./');
  await expect(page.getByText('FEED COMPLETO · TSE')).toBeVisible();
  await expect(page.getByText('CANDIDATO DE TESTE')).toBeVisible();
  await expect(page.getByText('10 de 10 seções · 100%')).toBeVisible();
});

test('mantém resultado parcial visível após a janela sem chamá-lo de ao vivo', async ({ page }) => {
  const feed = JSON.parse(readFileSync('scripts/fixtures/tse-results.valid.synthetic.json', 'utf8'));
  feed.state = 'live';
  feed.capturedAt = '2026-10-26T22:00:00-03:00';
  await page.clock.install({ time: new Date('2026-10-27T12:00:00-03:00') });
  await page.route('**/data/tse-results.json', route => route.fulfill({ json: feed }));
  await page.goto('./');
  await expect(page.getByText('RESULTADO PARCIAL ARQUIVADO · TSE')).toBeVisible();
  await expect(page.getByText('CANDIDATO DE TESTE')).toBeVisible();
  await expect(page.getByText(/estes números não são uma atualização ao vivo/i)).toBeVisible();
});

test('serve os ícones PNG nos tamanhos corretos', async ({ page }) => {
  for (const [name, size] of [['pwa-192.png', 192], ['pwa-512.png', 512], ['apple-touch-icon.png', 180]]) {
    const response = await page.request.get(`http://127.0.0.1:4173/observatorio/${name}`);
    expect(response.ok()).toBeTruthy();
    const bytes = await response.body();
    expect(bytes.subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    expect(bytes.readUInt32BE(16)).toBe(size);
    expect(bytes.readUInt32BE(20)).toBe(size);
  }
});

test('busca leva ao quiz de educação cívica', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Buscar no observatório' }).click();
  await page.getByRole('combobox', { name: 'Buscar seção, fonte ou indicador' }).fill('quiz');
  await page.getByRole('option', { name: /Quiz de dados · 200 perguntas/ }).click();
  await expect(page.getByRole('heading', { name: 'Quiz de dados · 2026' })).toBeVisible();
});
