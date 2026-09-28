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
    await modeGroup.getByRole('button', { name: /^Detalhado/ }).click();
    await expect(modeGroup.getByRole('button', { name: /^Detalhado/ })).toHaveAttribute('aria-pressed', 'true');
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
    await modeGroup.getByRole('button', { name: /^Detalhado/ }).click();
    await expect(page.locator('.trust-card').filter({ hasText: 'Publicação pública' }).first()).toBeVisible();
    await expect(page.locator('.trust-card').filter({ hasText: 'Paridade de publicação' }).first()).toBeVisible();

    await openSection(page, 'acao');
    await expect(page.getByRole('heading', { name: /Encontre um serviço ou confira uma informação/i })).toBeVisible();
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
  await page.getByRole('option', { name: /Resumo principal/i }).click();
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
  await modes.getByRole('button', { name: /^Detalhado/ }).click();

  const publicationCard = page.locator('.trust-card').filter({ hasText: 'Publicação pública' }).first();
  await expect(publicationCard.getByRole('status')).toContainText(/não pôde ser concluída/i);

  const retry = publicationCard.getByRole('button', { name: 'Atualizar status' });
  await retry.click();
  await expect(publicationCard.getByRole('status')).toContainText(/healthcheck informa estado operacional/i);
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
    const serviceSearch = page.getByRole('searchbox', { name: /Buscar serviço municipal/ });
    await expect(serviceSearch).toHaveValue('CAPS');
    await expect(page.getByRole('link', { name: /CAPS/i })).toBeVisible();
  });

  test('resposta rápida oferece acesso direto à fonte oficial', async ({ page }) => {
    await page.goto('./');
    await page.getByRole('button', { name: /buscar/i }).first().click();
    const input = page.getByRole('combobox').first();
    await input.fill('população');
    const sourceLink = page.getByRole('link', { name: 'Fonte oficial', exact: true });
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
    await page.getByRole('button', { name: 'CSV', exact: true }).click();
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
  await expect(guide.getByText('Indicadores', { exact: true })).toBeVisible();
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
  await page.getByRole('option', { name: /Como sabemos/i }).click();
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

test('atalho PWA respeita a barra mobile e usa prompt nativo quando disponível', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./');

  await page.evaluate(() => {
    const event = new Event('beforeinstallprompt', { cancelable: true });
    Object.defineProperty(event, 'prompt', {
      value: async () => { window.__pwaPromptCalls = (window.__pwaPromptCalls || 0) + 1; },
    });
    Object.defineProperty(event, 'userChoice', {
      value: Promise.resolve({ outcome: 'accepted' }),
    });
    window.dispatchEvent(event);
  });

  const shortcut = page.getByRole('button', { name: 'Instalar Observatório' });
  const nav = page.locator('.mobile-bottom-nav');
  await expect(shortcut).toBeVisible();

  const geometry = await page.evaluate(() => {
    const shortcutNode = document.querySelector('.pwa-install-shortcut');
    const navNode = document.querySelector('.mobile-bottom-nav');
    if (!shortcutNode || !navNode) return null;
    const shortcutRect = shortcutNode.getBoundingClientRect();
    const navRect = navNode.getBoundingClientRect();
    return {
      shortcutBottom: shortcutRect.bottom,
      navTop: navRect.top,
      shortcutLeft: shortcutRect.left,
      shortcutRight: shortcutRect.right,
    };
  });
  expect(geometry).not.toBeNull();
  expect(geometry.shortcutBottom).toBeLessThanOrEqual(geometry.navTop - 1);
  expect(geometry.shortcutLeft).toBeGreaterThanOrEqual(0);
  expect(geometry.shortcutRight).toBeLessThanOrEqual(390);

  await shortcut.click();
  await expect.poll(() => page.evaluate(() => window.__pwaPromptCalls || 0)).toBe(1);
  await expect(shortcut).toBeHidden();
});

test('guia PWA no iPhone pode ser dispensado durante a sessão', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'userAgent', { configurable: true, get: () => 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1' });
    Object.defineProperty(navigator, 'platform', { configurable: true, get: () => 'iPhone' });
    sessionStorage.removeItem('observatorio:pwa-install-dismissed');
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./');

  const shortcut = page.getByRole('button', { name: 'Adicionar Observatório à tela inicial' });
  await expect(shortcut).toBeVisible();
  await shortcut.click();

  const guide = page.getByRole('dialog', { name: 'Instale o Observatório' });
  await expect(guide).toBeVisible();
  await expect(guide).toContainText('Adicionar à Tela de Início');

  await guide.getByRole('button', { name: 'Agora não' }).click();
  await expect(guide).toBeHidden();
  await expect(shortcut).toBeHidden();
  await expect.poll(() => page.evaluate(() => sessionStorage.getItem('observatorio:pwa-install-dismissed'))).toBe('true');
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
  await expect(page.getByText('Captura identificada e rastreável')).toBeVisible();

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
      { name: /^Explicado/, id: 'simple' },
      { name: /^Guiado/, id: 'guided' },
      { name: /^Detalhado/, id: 'technical' },
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

    expect(new Set(Object.values(signatures).map(value => value.accent)).size).toBe(4);
    expect(signatures.summary.radius).not.toBe(signatures.technical.radius);
    expect(signatures.summary.gap).not.toBe(signatures.simple.gap);
    expect(signatures.guided.accent).not.toBe(signatures.simple.accent);
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

  await modes.getByRole('button', { name: /^Explicado/ }).click();
  await openSection(page, 'fontes');
  await expect(root).toHaveAttribute('data-language-mode', 'simple');
});

test('reduzir o modo nunca deixa o usuário em uma seção invisível', async ({ page }) => {
  await page.goto('./');
  const root = page.locator('html');
  const modes = page.getByRole('group', { name: 'Escolha como você quer ler os dados' });

  await openSection(page, 'qualidade');
  await expect(root).toHaveAttribute('data-language-mode', 'technical');
  await modes.getByRole('button', { name: /^Explicado/ }).click();
  await expect(root).toHaveAttribute('data-language-mode', 'simple');
  await expect(page).toHaveURL(/#fontes$/);
  await expect(page.locator('#fontes')).toBeVisible();

  await openSection(page, 'orcamento-impacto');
  await expect(root).toHaveAttribute('data-language-mode', 'technical');
  await modes.getByRole('button', { name: /^Explicado/ }).click();
  await expect(root).toHaveAttribute('data-language-mode', 'simple');
  await expect(page).toHaveURL(/#orcamento$/);
  await expect(page.locator('#orcamento')).toBeVisible();

  await openSection(page, 'eleitoral360');
  await modes.getByRole('button', { name: /^Resumo/ }).click();
  await expect(root).toHaveAttribute('data-language-mode', 'summary');
  await expect(page).toHaveURL(/#resumo$/);
  await expect(page.locator('#resumo')).toBeVisible();
});

test('link da seção preserva modo de leitura e ignora rastreamento', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async text => { window.__lastCopiedSectionLink = text; } },
    });
  });
  await page.goto('./?utm_source=campanha#dashboard');

  await page.getByRole('button', { name: /Modo de leitura atual: Resumo/i }).click();
  await expect(page.locator('html')).toHaveAttribute('data-language-mode', 'simple');

  await openSection(page, 'acao');
  await expect(page.locator('#acao')).toBeVisible();

  await page.evaluate(() => window.history.replaceState(null, '', '#dashboard'));
  await page.getByRole('button', { name: 'Abrir menu' }).click();
  const copyButton = page.getByRole('button', { name: 'Copiar link da seção' });
  await copyButton.click();
  await expect.poll(() => page.evaluate(() => window.__lastCopiedSectionLink || '')).toContain('?leitura=simple#acao');

  const copied = await page.evaluate(() => window.__lastCopiedSectionLink);
  expect(copied).toContain('?leitura=simple#acao');
  expect(copied).not.toContain('utm_source');

  await page.goto(copied);
  await expect(page.locator('html')).toHaveAttribute('data-language-mode', 'simple');
  await expect(page).toHaveURL(/\?leitura=simple#acao$/);
  await expect(page.locator('#acao')).toBeVisible();
});

test('ação de aprofundar percorre os quatro modos de leitura no painel mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./');
  const root = page.locator('html');

  await page.getByRole('button', { name: 'Abrir menu' }).click();
  let deepen = page.getByRole('button', { name: 'Aumentar nível de detalhe' });
  await deepen.click();
  await expect(root).toHaveAttribute('data-language-mode', 'simple');

  deepen = page.getByRole('button', { name: 'Avançar para aprendizado guiado' });
  await deepen.click();
  await expect(root).toHaveAttribute('data-language-mode', 'guided');

  deepen = page.getByRole('button', { name: 'Avançar para leitura detalhada' });
  await deepen.click();
  await expect(root).toHaveAttribute('data-language-mode', 'technical');

  await page.getByRole('button', { name: 'Voltar para leitura rápida' }).click();
  await expect(root).toHaveAttribute('data-language-mode', 'summary');
});

test('modos de leitura persistem e podem avançar por atalho', async ({ page }) => {
  await page.goto('./');
  const root = page.locator('html');
  await expect(root).toHaveAttribute('data-language-mode', 'summary');
  await page.keyboard.press('Alt+m');
  await expect(root).toHaveAttribute('data-language-mode', 'simple');
  await page.keyboard.press('Alt+m');
  await expect(root).toHaveAttribute('data-language-mode', 'guided');
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
  expect(copiedLink).toContain('?dado=');
  expect(copiedLink).toContain('leitura=summary');
  expect(copiedLink).toMatch(/#dashboard$/);
  expect(copiedLink).not.toContain('utm_source');

  await dialog.getByRole('button', { name: /Compartilhar/i }).click();
  const payload = await page.evaluate(() => window.__lastInspectorShare);
  expect(payload?.url).toContain('?dado=');
  expect(payload?.url).toMatch(/#dashboard$/);

  await page.evaluate(() => {
    delete navigator.share;
    window.__lastCopiedText = '';
  });
  await dialog.getByRole('button', { name: /Compartilhar/i }).click();
  const fallbackShare = await page.evaluate(() => window.__lastCopiedText);
  expect(fallbackShare).toContain('?dado=');
  expect(fallbackShare).toContain('#dashboard');
  expect(fallbackShare).not.toContain('utm_source');

  await dialog.getByRole('button', { name: 'Fechar', exact: true }).click();
  await page.goto(copiedLink);
  await expect(page.getByRole('dialog', { name: /Variação da população/i })).toBeVisible();
  await page.getByRole('dialog', { name: /Variação da população/i }).getByRole('button', { name: 'Fechar', exact: true }).click();
  await expect(page).not.toHaveURL(/dado=/);
  await expect(page).not.toHaveURL(/leitura=/);
  await page.keyboard.press('g');
  await page.keyboard.press('t');
  await expect(page).toHaveURL(/#transporte$/);
});

test('modo guiado pode ser aberto por link e mantém trilha neutra', async ({ page }) => {
  await page.goto('./?leitura=guided#dashboard');
  await expect(page.locator('html')).toHaveAttribute('data-language-mode', 'guided');
  const guide = page.locator('#aprendizado-guiado');
  await expect(guide).toBeVisible();
  await expect(guide).toContainText('Como ler dados públicos em etapas');
  await expect(guide).toContainText(/não recomenda candidaturas, partidos, posições políticas ou escolhas eleitorais/i);
  await expect(guide).toContainText('Próxima etapa sugerida');
  await expect(guide).toContainText('O que este número mede — e em qual unidade?');
  await expect(guide.getByText('Entenda os rótulos dos dados')).toBeVisible();
  await expect(guide.getByRole('progressbar', { name: 'Progresso da trilha guiada' })).toHaveAttribute('aria-valuenow', '0');
  await expect(guide.locator('[aria-current="step"]')).toHaveCount(1);
  await expect(guide.getByRole('button')).toHaveCount(8);

  await guide.getByRole('button', { name: /Abrir: 1. Identifique o que o número mede/i }).click();
  await expect(page).toHaveURL(/#resumo$/);
  await expect(guide.getByRole('progressbar', { name: 'Progresso da trilha guiada' })).toHaveAttribute('aria-valuenow', '1');
  await expect(guide).toContainText('2. Confira período e natureza');
});

test('âncora da trilha ativa o modo guiado e redução de modo mantém destino visível', async ({ page }) => {
  await page.goto('./#aprendizado-guiado');
  const root = page.locator('html');
  await expect(root).toHaveAttribute('data-language-mode', 'guided');
  await expect(page.locator('#aprendizado-guiado')).toBeVisible();

  const modes = page.getByRole('group', { name: 'Escolha como você quer ler os dados' });
  await modes.getByRole('button', { name: /^Resumo/ }).click();
  await expect(root).toHaveAttribute('data-language-mode', 'summary');
  await expect(page).toHaveURL(/#resumo$/);
  await expect(page.locator('#resumo')).toBeVisible();
});

test('parâmetro de leitura inválido é ignorado com segurança', async ({ page }) => {
  await page.goto('./?leitura=desconhecido#dashboard');
  await expect(page.locator('html')).toHaveAttribute('data-language-mode', 'summary');
  await expect(page.locator('#dashboard')).toBeVisible();
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

test('busca não rouba foco na carga inicial e devolve foco após uso', async ({ page }) => {
  await page.goto('./');
  const trigger = page.getByRole('button', { name: /Buscar no observatório/i });

  await expect.poll(() => page.evaluate(() => document.activeElement?.tagName)).not.toBe('BUTTON');
  await expect(trigger).not.toBeFocused();

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
  await modes.getByRole('button', { name: /^Explicado/ }).click();
  await expect(modes.getByRole('button', { name: /^Explicado/ })).toHaveAttribute('aria-pressed', 'true');

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
  await page.goto('./');
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute('type', 'image/png');
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', /pwa-192\.png$/);

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
  await page.getByRole('combobox', { name: 'Buscar dado, serviço, fonte ou seção' }).fill('quiz');
  await page.getByRole('option', { name: /Teste seus conhecimentos/ }).click();
  await expect(page.getByRole('heading', { name: 'Quiz de dados · 2026' })).toBeVisible();
});


test('comparação municipal expõe seis indicadores sem ranking', async ({ page }) => {
  await page.goto('./');
  await openSection(page, 'contexto');
  await expect(page.getByRole('heading', { name: /Compare sem transformar em ranking/i })).toBeVisible();
  const tabs = page.getByRole('tablist', { name: 'Indicador para comparação contextual' }).getByRole('tab');
  await expect(tabs).toHaveCount(6);
  await expect(page.getByRole('tab', { name: /Variação populacional 2022–2026/i })).toBeVisible();
  await expect(page.getByRole('tab', { name: /Densidade estimada 2026/i })).toBeVisible();
  await page.getByRole('tab', { name: /Densidade estimada 2026/i }).click();
  await expect(page.getByText(/cálculo derivado|calculada com a população de 2026/i).first()).toBeVisible();
});

test('comparação municipal oferece navegação completa das abas por teclado', async ({ page }) => {
  await page.goto('./');
  await openSection(page, 'contexto');

  const tablist = page.getByRole('tablist', { name: 'Indicador para comparação contextual' });
  const population = tablist.getByRole('tab', { name: /População estimada/i });
  const growth = tablist.getByRole('tab', { name: /Variação populacional 2022–2026/i });
  const gdp = tablist.getByRole('tab', { name: /PIB per capita/i });
  const panel = page.getByRole('tabpanel');

  await population.focus();
  await expect(population).toHaveAttribute('tabindex', '0');
  await page.keyboard.press('ArrowRight');
  await expect(growth).toBeFocused();
  await expect(growth).toHaveAttribute('aria-selected', 'true');
  await expect(population).toHaveAttribute('tabindex', '-1');
  await expect(panel).toHaveAttribute('aria-labelledby', 'context-metric-tab-populationGrowth');

  await page.keyboard.press('End');
  await expect(gdp).toBeFocused();
  await expect(gdp).toHaveAttribute('aria-selected', 'true');

  await page.keyboard.press('Home');
  await expect(population).toBeFocused();
  await expect(population).toHaveAttribute('aria-selected', 'true');
  await expect(population).toHaveAttribute('aria-controls', 'context-metric-panel');
});

test('comparação municipal aceita busca sem acento e não duplica sinais nas diferenças', async ({ page }) => {
  await page.goto('./');
  await openSection(page, 'contexto');

  const citySearch = page.getByRole('searchbox', { name: 'Buscar município' });
  await citySearch.fill('Aguas');
  await expect(page.getByText('Águas Lindas de Goiás', { exact: true })).toBeVisible();
  await expect(page.getByText('1 de 8 cidades', { exact: true })).toBeVisible();

  await citySearch.fill('Luziania');
  await expect(page.getByText('Luziânia', { exact: true })).toBeVisible();

  await citySearch.fill('');
  await page.getByRole('tab', { name: /Variação populacional 2022–2026/i }).click();
  await expect(page.locator('.context-comparison-cards')).not.toContainText(/\+\+|−\+/);

  const luzianiaCard = page.locator('.context-comparison-card').filter({ hasText: 'Luziânia' });
  await expect(luzianiaCard.locator('[aria-label^="Diferença descritiva"]')).toHaveAttribute('aria-label', /−[0-9]/);
});


test('dashboard mostra comparativos derivados com fonte e fórmula', async ({ page }) => {
  await page.goto('./');
  await openSection(page, 'dashboard');
  await expect(page.getByRole('heading', { name: /Comparativos com método explícito/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /Educação na LOA 2026/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /Saúde na LOA 2026/i })).toBeVisible();

  const modes = page.getByRole('group', { name: 'Escolha como você quer ler os dados' });
  await modes.getByRole('button', { name: /^Explicado/ }).click();
  await expect(page.getByRole('button', { name: /Saneamento na LOA 2026/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /Matrículas municipais na educação básica/i })).toBeVisible();
});


test('saneamento exibe coleta de resíduos a partir do dataset rastreável', async ({ page }) => {
  await page.goto('./');
  await openSection(page, 'saude');
  await expect(page.getByText(/domicílios com coleta de resíduos · SINISA 2024/i)).toBeVisible();
  await expect(page.getByText(/36\.579 pessoas sem coleta/i)).toHaveCount(0);
});

test('recorte orçamentário mostra participação na LOA e valor por habitante', async ({ page }) => {
  await page.goto('./');
  await openSection(page, 'orcamento-impacto');
  await expect(page.getByRole('heading', { name: /Recorte do orçamento por função/i })).toBeVisible();
  await expect(page.getByText(/da LOA/i).first()).toBeVisible();
  await expect(page.getByText(/por habitante/i).first()).toBeVisible();
});


test('busca responde participação orçamentária com nota metodológica', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: /buscar/i }).first().click();
  const input = page.getByRole('combobox').first();
  await input.fill('orçamento saúde');
  const answer = page.locator('.search-quick-answer');
  await expect(answer).toContainText('Saúde na LOA 2026');
  await expect(answer).toContainText(/Participação orçamentária não mede execução/i);
});

test('diferença entre receita e despesa não é apresentada como superávit', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: /buscar/i }).first().click();
  const input = page.getByRole('combobox').first();
  await input.fill('diferença receita despesa');
  const answer = page.locator('.search-quick-answer');
  await expect(answer).toContainText(/Receitas realizadas − despesas empenhadas 2025/i);
  await expect(answer).toContainText(/não deve ser interpretada automaticamente como superávit fiscal/i);
});

test('painel de atualizações informa cobertura temporal das fontes', async ({ page }) => {
  await page.goto('./');
  await openSection(page, 'dados');
  await expect(page.getByText('Cobertura temporal das fontes', { exact: true })).toBeVisible();
  await expect(page.locator('#dados').getByText(/%/).first()).toBeVisible();
});


test('busca abre comparação municipal e atualizações públicas', async ({ page }) => {
  await page.goto('./');

  await page.getByRole('button', { name: /buscar/i }).first().click();
  let input = page.getByRole('combobox').first();
  await input.fill('comparar municípios');
  await page.getByRole('option', { name: /Comparar municípios/i }).click();
  await expect(page).toHaveURL(/#contexto$/);
  await expect(page.locator('#contexto')).toBeVisible();

  await page.getByRole('button', { name: /buscar/i }).first().click();
  input = page.getByRole('combobox').first();
  await input.fill('atualizações públicas');
  await page.getByRole('option', { name: /Atualizações públicas/i }).click();
  await expect(page).toHaveURL(/#dados$/);
  await expect(page.locator('#dados')).toBeVisible();
});

test('busca responde LOA por habitante e saneamento por pessoa com contexto', async ({ page }) => {
  await page.goto('./');

  await page.getByRole('button', { name: /buscar/i }).first().click();
  let input = page.getByRole('combobox').first();
  await input.fill('orçamento por habitante');
  let answer = page.locator('.search-quick-answer');
  await expect(answer).toContainText(/LOA 2026 por habitante/i);
  await expect(answer).toContainText(/não representa gasto executado por pessoa/i);

  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: /buscar/i }).first().click();
  input = page.getByRole('combobox').first();
  await input.fill('saneamento por pessoa');
  answer = page.locator('.search-quick-answer');
  await expect(answer).toContainText(/Investimento em saneamento por pessoa/i);
});

test('painel de dados explica a natureza temporal dos indicadores', async ({ page }) => {
  await page.goto('./');
  await openSection(page, 'dados');
  await expect(page.getByLabel('Tipos de indicador publicados')).toBeVisible();
  await expect(page.getByText(/Atual:/).first()).toBeVisible();
  await expect(page.getByText(/Histórico:/).first()).toBeVisible();
  await expect(page.getByText(/Derivado:/).first()).toBeVisible();
  await expect(page.getByText(/Registro datado:/).first()).toBeVisible();
});


test('busca direciona indicadores para a seção temática correta', async ({ page }) => {
  await page.goto('./');

  await page.getByRole('button', { name: /buscar/i }).first().click();
  let input = page.getByRole('combobox').first();
  await input.fill('Perdas na distribuição de água');
  await page.getByRole('option', { name: /Perdas na distribuição de água/i }).click();
  await expect(page).toHaveURL(/#saude$/);

  await page.getByRole('button', { name: /buscar/i }).first().click();
  input = page.getByRole('combobox').first();
  await input.fill('Receitas brutas realizadas 2025');
  await page.getByRole('option', { name: /Receitas brutas realizadas 2025/i }).click();
  await expect(page).toHaveURL(/#orcamento$/);

  await page.getByRole('button', { name: /buscar/i }).first().click();
  input = page.getByRole('combobox').first();
  await input.fill('Tarifa Brasília');
  await page.getByRole('option', { name: /Tarifa Brasília/i }).click();
  await expect(page).toHaveURL(/#transporte$/);
});

test('busca prioriza orçamento por habitante quando a consulta é específica', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: /buscar/i }).first().click();
  const input = page.getByRole('combobox').first();
  await input.fill('orçamento saúde por habitante');
  const answer = page.locator('.search-quick-answer');
  await expect(answer).toContainText(/Saúde na LOA 2026 por habitante/i);
  await expect(answer).toContainText(/razão de planejamento|não execução por pessoa/i);
});

test('cards de orçamento abrem fonte e método no inspetor', async ({ page }) => {
  await page.goto('./');
  await openSection(page, 'orcamento-impacto');
  const card = page.locator('#orcamento-impacto').getByRole('button').filter({ hasText: /^Saúde/ }).first();
  await card.click();
  const inspector = page.getByRole('dialog', { name: /Saúde na LOA 2026/i });
  await expect(inspector).toBeVisible();
  await expect(inspector).toContainText(/Alocação não equivale a execução financeira/i);
  await expect(inspector.getByRole('link', { name: 'Ver fonte' })).toBeVisible();
});

test('CSV mantém colunas antigas e acrescenta identificadores e metadados', async ({ page }) => {
  await page.goto('./');
  await openSection(page, 'exportacao');

  const indicatorDownloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'CSV', exact: true }).click();
  const indicatorDownload = await indicatorDownloadPromise;
  const indicatorPath = await indicatorDownload.path();
  expect(indicatorPath).toBeTruthy();
  const indicatorCsv = readFileSync(indicatorPath, 'utf8');
  expect(indicatorCsv).toContain('"categoria";"indicador";"valor";"unidade";"status";"fonte_id";"fonte_instituicao";"data_referencia";"observacao";"indicador_id";"fonte_natureza";"status_rotulo"');
  expect(indicatorCsv).toContain('water-access-2024');
  expect(indicatorCsv).toContain('budget-health-per-capita-2026');

  const sourceDownloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Fontes CSV' }).click();
  const sourceDownload = await sourceDownloadPromise;
  const sourcePath = await sourceDownload.path();
  expect(sourcePath).toBeTruthy();
  const sourceCsv = readFileSync(sourcePath, 'utf8');
  expect(sourceCsv).toContain('"frequencia_atualizacao";"ultima_verificacao";"licenca"');

  const comparisonDownloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Comparativo CSV' }).click();
  const comparisonDownload = await comparisonDownloadPromise;
  expect(comparisonDownload.suggestedFilename()).toMatch(/comparativo-municipal.*\.csv$/);
  const comparisonPath = await comparisonDownload.path();
  expect(comparisonPath).toBeTruthy();
  const comparisonCsv = readFileSync(comparisonPath, 'utf8');
  expect(comparisonCsv).toContain('"municipio";"codigo_ibge";"referencia_local";"indicador_id";"indicador";"valor";"unidade";"ano_base";"natureza";"fonte";"url_ibge"');
  expect(comparisonCsv).toContain('"Águas Lindas de Goiás";"5200258";"sim"');
  expect(comparisonCsv).toContain('"Luziânia";"5212501";"nao"');
  expect(comparisonCsv).toContain('"populationGrowth"');
  expect(comparisonCsv).toContain('"Derivado";"IBGE"');
});


test('busca diferencia referências do HEAL sem misturar capacidade atual e planejamento', async ({ page }) => {
  await page.goto('./');

  await page.getByRole('button', { name: /buscar/i }).first().click();
  let input = page.getByRole('combobox').first();
  await input.fill('HEAL leitos');
  let answer = page.locator('.search-quick-answer');
  await expect(answer).toContainText(/leitos explicitados no portal atual/i);
  await expect(answer).toContainText(/85 leitos/i);

  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: /buscar/i }).first().click();
  input = page.getByRole('combobox').first();
  await input.fill('HEAL planejamento');
  answer = page.locator('.search-quick-answer');
  await expect(answer).toContainText(/leitos no planejamento registrado/i);
  await expect(answer).toContainText(/não representa capacidade já instalada/i);
});

test('CSV classifica orçamento e HEAL corretamente e expõe rótulo público de status', async ({ page }) => {
  await page.goto('./');
  await openSection(page, 'exportacao');

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'CSV', exact: true }).click();
  const download = await downloadPromise;
  const path = await download.path();
  expect(path).toBeTruthy();
  const csv = readFileSync(path, 'utf8');

  expect(csv).toContain('status_rotulo');
  expect(csv).toMatch(/"Orcamento";[^\n]*"budget-health-per-capita-2026"/);
  expect(csv).toMatch(/"Saude";[^\n]*"heal-current-stated-beds"/);
  expect(csv).toMatch(/"Educacao";[^\n]*"schooling-6-14"/);
  expect(csv).toMatch(/"Educacao";[^\n]*"ept-technical-2025"/);
  expect(csv).toContain('Registro datado');
});


test('transporte compara rotas usando o mesmo cenário sem ranking', async ({ page }) => {
  await page.goto('./');
  await openSection(page, 'transporte');

  await expect(page.getByRole('heading', { name: /Mesmo cenário, destinos diferentes/i })).toBeVisible();
  const comparison = page.getByLabel('Comparação de custo mensal entre rotas');
  await expect(comparison.getByRole('button')).toHaveCount(3);
  await expect(comparison.getByText(/Brasília|Plano Piloto/i).first()).toBeVisible();
  await expect(comparison.getByText(/Taguatinga/i)).toBeVisible();
  await expect(comparison.getByText(/Ceilândia/i)).toBeVisible();

  const taguatinga = comparison.getByRole('button').filter({ hasText: /Taguatinga/i });
  await taguatinga.click();
  await expect(taguatinga).toHaveAttribute('aria-pressed', 'true');
  await expect(taguatinga).toContainText(/Em uso|Rota selecionada/i);
});

test('busca responde custo mensal de transporte por destino com premissas explícitas', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: /buscar/i }).first().click();
  const input = page.getByRole('combobox').first();
  await input.fill('custo mensal Taguatinga');
  const answer = page.locator('.search-quick-answer');
  await expect(answer).toContainText(/Transporte mensal por pessoa · Taguatinga/i);
  await expect(answer).toContainText(/2 trechos por dia × 22 dias por mês/i);
});


test('demografia mostra variação percentual e absoluta sem linguagem de snapshot', async ({ page }) => {
  await page.goto('./');
  await openSection(page, 'demografia');
  await expect(page.getByText('Variação 2022 → 2026', { exact: true })).toBeVisible();
  await expect(page.getByText('Diferença entre as referências', { exact: true })).toBeVisible();
  await expect(page.getByText(/Dados locais, estrutura preservada/i)).toBeVisible();
  await expect(page.locator('#demografia').getByText(/Snapshot local/i)).toHaveCount(0);
});

test('orçamento compara receitas e despesas por habitante com ressalvas metodológicas', async ({ page }) => {
  await page.goto('./');
  await openSection(page, 'orcamento');
  await expect(page.getByRole('heading', { name: /Receitas e despesas na mesma base populacional/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /Receitas realizadas por habitante/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /Despesas empenhadas por habitante/i })).toBeVisible();
  const difference = page.getByRole('button', { name: /Diferença por habitante/i });
  await expect(difference).toBeVisible();
  await difference.click();
  const inspector = page.getByRole('dialog', { name: /Diferença por habitante/i });
  await expect(inspector).toContainText(/Não equivale automaticamente a superávit fiscal/i);
});

test('busca prioriza crescimento populacional e diferença fiscal por habitante', async ({ page }) => {
  await page.goto('./');

  await page.getByRole('button', { name: /buscar/i }).first().click();
  let input = page.getByRole('combobox').first();
  await input.fill('crescimento população');
  let answer = page.locator('.search-quick-answer');
  await expect(answer).toContainText(/Variação da população 2022–2026/i);

  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: /buscar/i }).first().click();
  input = page.getByRole('combobox').first();
  await input.fill('diferença receita despesa por habitante');
  answer = page.locator('.search-quick-answer');
  await expect(answer).toContainText(/Diferença receita–despesa por habitante 2025/i);
  await expect(answer).toContainText(/não deve ser interpretada automaticamente como superávit fiscal por habitante/i);
});

test('CSV exporta novos comparativos demográficos e fiscais', async ({ page }) => {
  await page.goto('./');
  await openSection(page, 'exportacao');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'CSV', exact: true }).click();
  const download = await downloadPromise;
  const path = await download.path();
  expect(path).toBeTruthy();
  const csv = readFileSync(path, 'utf8');
  expect(csv).toContain('population-growth-2022-2026');
  expect(csv).toContain('population-change-2022-2026');
  expect(csv).toContain('revenue-per-capita-2025');
  expect(csv).toContain('expenses-per-capita-2025');
  expect(csv).toContain('revenue-expense-difference-per-capita-2025');
});


test('utilidade pública oferece atalhos adicionais sem duplicar navegação', async ({ page }) => {
  await page.goto('./');
  const guide = page.locator('#utilidade-publica');
  await expect(guide.getByLabel('Atalhos por necessidade')).toBeVisible();
  await expect(guide.getByRole('button', { name: 'Trânsito e mobilidade' })).toBeVisible();
  await expect(guide.getByRole('button', { name: 'Assistência social' })).toBeVisible();
  await guide.getByRole('button', { name: 'Assistência social' }).click();
  await expect(page).toHaveURL(/#acao$/);
  await expect(page.locator('#acao')).toBeVisible();
});

test('modo explicado expõe indicadores temáticos com fonte acessível', async ({ page }) => {
  await page.goto('./');
  const modes = page.getByRole('group', { name: 'Escolha como você quer ler os dados' });
  await modes.getByRole('button', { name: /^Explicado/ }).click();
  await openSection(page, 'dashboard');
  const thematic = page.getByLabel('Indicadores por tema');
  await expect(thematic).toBeVisible();
  await expect(thematic.getByRole('button')).toHaveCount(8);
  await expect(thematic.getByRole('button', { name: /Empresas ativas/i })).toBeVisible();
  await expect(thematic.getByRole('button', { name: /Investimento em saneamento/i })).toBeVisible();
});

test('comparação municipal marca Águas Lindas como referência e mantém leitura neutra', async ({ page }) => {
  await page.goto('./');
  await openSection(page, 'contexto');
  await expect(page.getByText(/município de referência/i).first()).toBeVisible();
  await expect(page.getByText(/Diferença positiva ou negativa não significa “melhor” ou “pior”/i)).toBeVisible();
  const luziania = page.locator('.context-comparison-card').filter({ hasText: 'Luziânia' });
  await expect(luziania).toContainText(/Em relação a Águas Lindas:/i);
});

test('busca rápida cobre escolarização e arborização', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: /buscar/i }).first().click();
  let input = page.getByRole('combobox').first();
  await input.fill('escolarização');
  await expect(page.locator('.search-quick-answer')).toContainText(/Escolarização de 6 a 14 anos/i);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: /buscar/i }).first().click();
  input = page.getByRole('combobox').first();
  await input.fill('arborização');
  await expect(page.locator('.search-quick-answer')).toContainText(/Arborização de vias públicas/i);
});


test('painel de dados mostra cobertura dos indicadores e notas metodológicas', async ({ page }) => {
  await page.goto('./');
  await openSection(page, 'dados');
  const summary = page.getByLabel('Resumo do conjunto de dados');
  await expect(summary.getByText('Indicadores com data de referência', { exact: true })).toBeVisible();
  await expect(summary.getByText('Indicadores com nota metodológica', { exact: true })).toBeVisible();
  await expect(summary.getByText('Cobertura temporal das fontes', { exact: true })).toBeVisible();
});

test('busca responde indicadores públicos adicionais com fonte e contexto', async ({ page }) => {
  await page.goto('./');

  const searchFor = async (term) => {
    await page.getByRole('button', { name: /buscar/i }).first().click();
    const input = page.getByRole('combobox').first();
    await input.fill(term);
    return input;
  };

  await searchFor('empresas novas');
  let answer = page.locator('.search-quick-answer');
  await expect(answer).toContainText(/Empresas novas no recorte/i);
  await page.keyboard.press('Escape');

  await searchFor('educação técnica matrículas');
  answer = page.locator('.search-quick-answer');
  await expect(answer).toContainText(/EPT técnica articulada ao Ensino Médio/i);
  await page.keyboard.press('Escape');

  await searchFor('esgotamento adequado');
  answer = page.locator('.search-quick-answer');
  await expect(answer).toContainText(/Esgotamento sanitário adequado/i);
  await page.keyboard.press('Escape');

  await searchFor('internações água');
  answer = page.locator('.search-quick-answer');
  await expect(answer).toContainText(/Internações por doenças relacionadas à água/i);
  await page.keyboard.press('Escape');

  await searchFor('óbitos água');
  answer = page.locator('.search-quick-answer');
  await expect(answer).toContainText(/Óbitos por doenças relacionadas à água/i);
});

test('busca responde contagem de indicadores, fontes e cobertura temporal', async ({ page }) => {
  await page.goto('./');

  await page.getByRole('button', { name: /buscar/i }).first().click();
  let input = page.getByRole('combobox').first();
  await input.fill('quantos indicadores');
  await expect(page.locator('.search-quick-answer')).toContainText(/Indicadores publicados/i);

  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: /buscar/i }).first().click();
  input = page.getByRole('combobox').first();
  await input.fill('quantas fontes');
  await expect(page.locator('.search-quick-answer')).toContainText(/Fontes registradas/i);

  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: /buscar/i }).first().click();
  input = page.getByRole('combobox').first();
  await input.fill('cobertura fontes');
  const answer = page.locator('.search-quick-answer');
  await expect(answer).toContainText(/Cobertura temporal das fontes/i);
  await expect(answer).toContainText(/%/);
});


test('saneamento mostra lacunas complementares sem converter percentuais em pessoas', async ({ page }) => {
  await page.goto('./');
  await openSection(page, 'saude');

  const gaps = page.getByLabel('Lacunas complementares de saneamento');
  await expect(gaps).toBeVisible();
  await expect(gaps.getByRole('button')).toHaveCount(4);
  await expect(gaps.getByRole('button', { name: /Sem acesso à água/i })).toBeVisible();
  await expect(gaps.getByRole('button', { name: /Esgoto gerado sem coleta/i })).toBeVisible();
  await expect(gaps).not.toContainText(/pessoas sem/i);
});

test('lacuna de saneamento abre fonte e fórmula no inspetor', async ({ page }) => {
  await page.goto('./');
  await openSection(page, 'saude');

  const gaps = page.getByLabel('Lacunas complementares de saneamento');
  await gaps.getByRole('button', { name: /Sem acesso à água/i }).click();

  const inspector = page.getByRole('dialog', { name: /Parcela sem acesso à água/i });
  await expect(inspector).toBeVisible();
  await expect(inspector).toContainText(/100% menos o indicador correspondente/i);
  await expect(inspector).toContainText(/Não representa contagem de pessoas/i);
});

test('busca responde lacunas de água, coleta e tratamento com contexto', async ({ page }) => {
  await page.goto('./');

  await page.getByRole('button', { name: /buscar/i }).first().click();
  let input = page.getByRole('combobox').first();
  await input.fill('sem água');
  await expect(page.locator('.search-quick-answer')).toContainText(/Parcela sem acesso à água/i);

  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: /buscar/i }).first().click();
  input = page.getByRole('combobox').first();
  await input.fill('esgoto sem coleta');
  await expect(page.locator('.search-quick-answer')).toContainText(/Esgoto gerado sem coleta/i);

  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: /buscar/i }).first().click();
  input = page.getByRole('combobox').first();
  await input.fill('esgoto sem tratamento');
  await expect(page.locator('.search-quick-answer')).toContainText(/Esgoto gerado sem tratamento/i);
});


test('metadados internos da busca não são atribuídos indevidamente a uma fonte externa', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: /buscar/i }).first().click();
  const input = page.getByRole('combobox').first();
  await input.fill('quantos indicadores');

  const answer = page.locator('.search-quick-answer');
  await expect(answer).toContainText(/Fonte: Conjunto publicado pelo Observatório/i);
  await expect(answer.getByRole('link', { name: /Fonte oficial/i })).toHaveCount(0);
});


test('atalhos globais de serviços usam termos canônicos e não deixam catálogo vazio', async ({ page }) => {
  await page.goto('./');

  await page.getByRole('button', { name: /buscar/i }).first().click();
  let input = page.getByRole('combobox').first();
  await input.fill('remédios');
  await page.getByRole('option', { name: /Remédios e medicamentos/i }).click();
  await expect(page).toHaveURL(/#acao$/);
  await expect(page.locator('#acao')).toContainText(/Medicamentos SUS/i);

  await page.getByRole('button', { name: /buscar/i }).first().click();
  input = page.getByRole('combobox').first();
  await input.fill('pedido de informação');
  await page.getByRole('option', { name: /SIC \/ pedido de informação/i }).click();
  await expect(page).toHaveURL(/#acao$/);
  await expect(page.locator('#acao')).toContainText(/SIC direto/i);
});

test('busca de serviços remove atalhos sem destino real e expõe serviços existentes', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: /buscar/i }).first().click();
  const input = page.getByRole('combobox').first();

  await input.fill('Escalas de saúde');
  await expect(page.getByRole('option', { name: /Escalas de saúde/i })).toHaveCount(0);

  await input.fill('Renúncias fiscais');
  await expect(page.getByRole('option', { name: /Renúncias fiscais/i })).toBeVisible();
});


test('histórico do navegador restaura seções carregadas sob demanda', async ({ page }) => {
  await page.goto('./#dashboard');
  await openSection(page, 'acao');
  await expect(page).toHaveURL(/#acao$/);
  await expect(page.locator('#acao')).toBeVisible();

  await openSection(page, 'dados');
  await expect(page).toHaveURL(/#dados$/);
  await expect(page.locator('#dados')).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL(/#acao$/);
  await expect(page.locator('#acao')).toBeVisible();
  await expect(page.locator('#acao')).toBeInViewport({ timeout: 15_000 });

  await page.goForward();
  await expect(page).toHaveURL(/#dados$/);
  await expect(page.locator('#dados')).toBeVisible();
  await expect(page.locator('#dados')).toBeInViewport({ timeout: 15_000 });
});
