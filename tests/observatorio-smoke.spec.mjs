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
