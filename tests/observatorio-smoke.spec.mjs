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
    await expect(page.getByRole('heading', { name: /Como conferir os dados/i })).toBeVisible();
    await expect(page.locator('.trust-card').filter({ hasText: 'Publicação pública' }).first()).toBeVisible();
    await expect(page.locator('.trust-card').filter({ hasText: 'Paridade de publicação' }).first()).toBeVisible();

    await openSection(page, 'acao');
    await expect(page.getByRole('heading', { name: /Como usar o dado/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Abrir Serviços da Prefeitura|Medicamentos SUS/i }).first()).toBeVisible();
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

  test('busca cabe na viewport e pode ser fechada', async ({ page }) => {
    await page.goto('./');
    await page.getByRole('button', { name: /buscar/i }).first().click();
    const panel = page.locator('.search-modal-panel');
    await expect(panel).toBeVisible();
    const box = await panel.boundingBox();
    expect(box?.width ?? 0).toBeLessThanOrEqual(360);
    expect(box?.height ?? 0).toBeLessThanOrEqual(740);
    await page.getByRole('button', { name: /fechar busca/i }).click();
    await expect(panel).toBeHidden();
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

test('modos de leitura respeitam a escolha durante a navegação comum', async ({ page }) => {
  await page.goto('./');
  const root = page.locator('html');
  const modes = page.getByRole('group', { name: 'Escolha como você quer ler os dados' });

  await modes.getByRole('button', { name: /^Simples/ }).click();
  await openSection(page, 'eleitoral360');
  await expect(root).toHaveAttribute('data-language-mode', 'simple');

  await openSection(page, 'quiz');
  await expect(root).toHaveAttribute('data-language-mode', 'simple');

  await openSection(page, 'fontes');
  await expect(root).toHaveAttribute('data-language-mode', 'technical');
});

test('ação de aprofundar percorre os três níveis de leitura', async ({ page }) => {
  await page.goto('./');
  const root = page.locator('html');
  const deepen = page.getByRole('button', { name: 'Aprofundar leitura' });
  await deepen.click();
  await expect(root).toHaveAttribute('data-language-mode', 'simple');
  await deepen.click();
  await expect(root).toHaveAttribute('data-language-mode', 'technical');
  await page.getByRole('button', { name: 'Voltar para leitura resumida' }).click();
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


test('quiz não duplica a pontuação da última resposta', async ({ page }) => {
  await page.goto('./');
  await openSection(page, 'quiz');
  await page.evaluate(() => {
    localStorage.removeItem('observatorio-v44-quiz-best-scores');
  });
  await page.reload();
  await openSection(page, 'quiz');
  const options = page.locator('.quiz-options button');
  await options.first().click();
  await page.getByRole('button', { name: /Próxima|Finalizar fase/i }).click();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('observatorio-v44-quiz-best-scores') || '[0,0,0,0,0]'));
  expect(saved[0]).toBeLessThanOrEqual(1);
});

test('compartilhamento do transporte mantém um único hash', async ({ page }) => {
  await page.goto('./#transporte');
  await openSection(page, 'transporte');
  await page.addInitScript(() => {});
  const share = page.getByRole('button', { name: /compartilhar/i }).filter({ has: page.locator('svg') }).first();
  if (await share.count()) {
    await share.click();
    const body = await page.locator('body').innerText();
    expect(body).not.toContain('#transporte#transporte');
  }
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
