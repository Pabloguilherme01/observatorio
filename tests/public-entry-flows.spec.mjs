import { test, expect } from 'playwright/test';

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
    const duplicateIds = await page.evaluate(() => {
    const counts = new Map();
    document.querySelectorAll('[id]').forEach(node => {
      const id = node.id;
      counts.set(id, (counts.get(id) ?? 0) + 1);
    });
    return [...counts.entries()].filter(([, count]) => count > 1).map(([id, count]) => ({ id, count }));
    });
    expect(duplicateIds).toEqual([]);
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
  await expect(page.locator('.trust-card').filter({ hasText: 'Paridade de publicação' }).getByText('abc1234', { exact: true })).toBeVisible();

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

  test('busca de serviços oferece atalhos úteis quando não há correspondências', async ({ page }) => {
    await page.goto('./#acao');
    const serviceSearch = page.getByRole('searchbox', { name: 'Buscar serviço municipal por necessidade' });
    await serviceSearch.fill('necessidade sem resultado');
    const noResults = page.getByRole('note').filter({ hasText: 'Nenhum serviço corresponde' });
    await expect(noResults).toBeVisible();
    await noResults.getByRole('button', { name: 'Emprego', exact: true }).click();
    await expect(serviceSearch).toHaveValue('emprego');
    await expect(page.getByRole('link', { name: /Processos seletivos/i })).toBeVisible();
  });

  test('painel de qualidade informa lacunas de referência e links de fonte', async ({ page }) => {
    await page.goto('./#qualidade');
    await expect(page.getByText(/Fonte com link:/)).toBeVisible();
    await expect(page.getByText(/sem referência temporal e .* sem link de fonte/)).toBeVisible();
    const reviewList = page.locator('#qualidade .quality-overview details');
    await reviewList.locator('summary').click();
    await expect(reviewList.getByRole('button', { name: 'Abrir ficha' }).first()).toBeVisible();
    await reviewList.getByRole('button', { name: 'Abrir ficha' }).first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('resposta rápida oferece acesso direto à fonte oficial', async ({ page }) => {
    await page.goto('./');
    await page.getByRole('button', { name: /buscar/i }).first().click();
    const input = page.getByRole('combobox').first();
    await input.fill('população');
    const sourceLink = page.getByRole('link', { name: 'Fonte oficial', exact: true });
    await expect(sourceLink).toBeVisible();
    await expect(sourceLink).toHaveAttribute('href', /^https:\/\/www\.ibge\.gov\.br\//);
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
