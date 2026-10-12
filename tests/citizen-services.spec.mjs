import { test, expect } from 'playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';

test('retorno por histórico respeita o toque antes do realinhamento tardio', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('./?servico=medicamentos#acao');
  await expect(page.getByRole('button', { name: 'Salvar serviço: Estoque de medicamentos', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Conferir fontes', exact: true }).click();
  await page.goBack();
  const save = page.getByRole('button', { name: 'Salvar serviço: Estoque de medicamentos', exact: true });
  await save.click();
  await expect(save).toHaveAttribute('aria-pressed', 'true');
  const position = await page.evaluate(() => scrollY);
  // Observe the complete 360/900 ms history-alignment window after the tap.
  await page.waitForTimeout(1050);
  expect(Math.abs(await page.evaluate(() => scrollY) - position)).toBeLessThan(12);
});

test('link de indicadores restaura filtros e mantém a seleção CSV', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async value => { window.__catalogCopy = value; } } }));
  await page.goto('./?leitura=technical&servico=medicamentos&protocolo=privado#dados');
  await page.getByLabel('Pesquisar indicadores').fill('água');
  await page.getByLabel('Natureza do indicador').selectOption('historical');
  const count = await page.locator('.catalog-card').count();
  expect(count).toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Copiar link da seleção', exact: true }).click();
  const url = new URL(await page.evaluate(() => window.__catalogCopy));
  expect(url.searchParams.get('indicadores')).toBe('água');
  expect(url.searchParams.get('natureza')).toBe('historical');
  expect(url.searchParams.has('protocolo')).toBe(false);
  expect(url.searchParams.has('servico')).toBe(false);
  expect(url.hash).toBe('#dados');
  await page.goto(url.toString());
  await expect(page.getByLabel('Pesquisar indicadores')).toHaveValue('água');
  await expect(page.getByLabel('Natureza do indicador')).toHaveValue('historical');
  await expect(page.locator('.catalog-card')).toHaveCount(count);
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Baixar seleção CSV', exact: true }).click();
  const download = await pending;
  const csv = await readFile(await download.path(), 'utf8');
  expect(csv).toContain('url_fonte');
  expect(csv).toContain('historical');
  expect(csv).not.toContain('LOA 2026');
});

test('catálogo restaura período ausente e descarta natureza desconhecida', async ({ page }) => {
  await page.goto('./?natureza=invalida&sem-periodo=1#dados');
  await expect(page.getByLabel('Natureza do indicador')).toHaveValue('all');
  await expect(page.getByLabel('Apenas sem referência temporal')).toBeChecked();
  await page.reload();
  await expect(page.getByLabel('Apenas sem referência temporal')).toBeChecked();
  await page.getByRole('button', { name: 'Limpar filtros', exact: true }).click();
  await expect(page.getByLabel('Apenas sem referência temporal')).not.toBeChecked();
  await expect.poll(() => new URL(page.url()).searchParams.has('sem-periodo')).toBe(false);
});

test('lista compartilhada e baixada contém somente canais salvos e link limpo', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', { configurable: true, value: undefined });
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async value => { window.__savedCopy = value; } } });
  });
  await page.goto('./?servico=medicamentos&protocolo=nao-compartilhar#acao');
  await page.getByRole('button', { name: 'Salvar serviço: Medicamentos SUS', exact: true }).click();
  await page.getByRole('button', { name: 'Compartilhar meus serviços', exact: true }).click();
  const text = await page.evaluate(() => window.__savedCopy);
  expect(text).toContain('Medicamentos SUS');
  expect(text).toContain('https://acessoainformacao.aguaslindasdegoias.go.gov.br/cidadao/outras_informacoes/medicamentos_sus');
  expect(text).not.toContain('Estoque de medicamentos');
  expect(text).not.toContain('protocolo=');
  expect(text).not.toContain('servico=');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Baixar meus serviços', exact: true }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('meus-servicos-aguas-lindas.txt');
  expect(await readFile(await download.path(), 'utf8')).toBe(text);
});

test('cancelamento e falha do compartilhamento oferecem recuperação', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', { configurable: true, value: async () => { throw new DOMException('cancel', new URL(location.href).searchParams.get('failure') === 'cancel' ? 'AbortError' : 'NotAllowedError'); } });
    localStorage.setItem('observatorio-citizen-services-v1', JSON.stringify(['Medicamentos SUS']));
  });
  await page.goto('./?failure=cancel#acao');
  await page.getByRole('button', { name: 'Compartilhar meus serviços', exact: true }).click();
  await expect(page.getByLabel('Lista para copiar manualmente')).toHaveCount(0);
  await page.goto('./?failure=denied#acao');
  await page.getByRole('button', { name: 'Compartilhar meus serviços', exact: true }).click();
  await expect(page.getByLabel('Lista para copiar manualmente')).toHaveValue(/Medicamentos SUS/);
  const results = await new AxeBuilder({ page }).include('.citizen-saved').analyze();
  expect(results.violations.filter(item => ['serious', 'critical'].includes(item.impact))).toEqual([]);
});

test('filtro de salvos combina consulta e permite recuperar uma busca vazia', async ({ page }) => {
  await page.goto('./#acao');
  await page.getByLabel('Apenas meus serviços salvos').check();
  await expect(page.locator('#acao')).toContainText('Você ainda não salvou serviços.');
  await page.getByRole('button', { name: 'Ver serviços principais', exact: true }).click();
  await page.getByRole('button', { name: 'Salvar serviço: Medicamentos SUS', exact: true }).click();
  await page.getByLabel('Apenas meus serviços salvos').check();
  await expect(page.locator('#acao .official-resource-card')).toHaveCount(1);
  await page.getByLabel('Buscar serviço municipal por necessidade').fill('contratos');
  await expect(page.locator('#acao .official-resource-card')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Copiar link desta busca de serviços' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Ver serviços principais', exact: true }).click();
  await expect(page.getByLabel('Apenas meus serviços salvos')).not.toBeChecked();
  await expect(page.locator('#acao .official-resource-card')).toHaveCount(6);
});

test('busca inicial conduz ao canal municipal e preserva retorno', async ({ page }) => {
  await page.goto('./');
  await page.getByLabel('Digite uma necessidade').fill('medicamentos');
  await page.getByRole('button', { name: 'Encontrar canal oficial', exact: true }).click();
  await expect(page).toHaveURL(/servico=medicamentos#acao$/);
  await expect(page.getByLabel('Buscar serviço municipal por necessidade')).toHaveValue('medicamentos');
  await expect(page.locator('#acao .official-resource-card')).toHaveCount(2);
  await page.reload();
  await expect(page.getByLabel('Buscar serviço municipal por necessidade')).toHaveValue('medicamentos');
});

test('serviços salvos sobrevivem ao recarregamento sem mudar preferências ou a busca', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('observatorio-theme', 'light');
    localStorage.setItem('observatorio-contrast', 'normal');
  });
  await page.goto('./?servico=medicamentos#acao');
  const save = page.getByRole('button', { name: 'Salvar serviço: Medicamentos SUS', exact: true });
  await save.click();
  await expect(save).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.citizen-saved')).toContainText('Meus serviços (1)');
  await page.reload();
  await expect(save).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('html')).toHaveClass(/light/);
  await expect(page.getByLabel('Buscar serviço municipal por necessidade')).toHaveValue('medicamentos');
  await page.getByRole('button', { name: 'Remover serviço salvo: Medicamentos SUS' }).click();
  await expect(save).toHaveAttribute('aria-pressed', 'false');
  await page.reload();
  await expect(page.locator('.citizen-saved')).toContainText('Meus serviços (0)');
});

test('armazenamento inválido e bloqueado mantém serviço utilizável', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('observatorio-citizen-services-v1', JSON.stringify(['desconhecido', 42, 'Medicamentos SUS', 'Medicamentos SUS']));
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key, value) {
      if (key === 'observatorio-citizen-services-v1') throw new Error('blocked');
      return original.call(this, key, value);
    };
  });
  await page.goto('./?servico=medicamentos#acao');
  await expect(page.locator('.citizen-saved-list li')).toHaveCount(1);
  await page.getByRole('button', { name: 'Salvar serviço: Estoque de medicamentos', exact: true }).click();
  await expect(page.locator('.citizen-save-status')).toContainText('apenas nesta visita');
  await expect(page.locator('.citizen-saved-list li')).toHaveCount(2);
});

test('ferramentas cidadãs são acessíveis e cabem entre 320 e 1920 pixels', async ({ page }) => {
  for (const width of [320, 390, 768, 1280, 1920]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('./#acao');
    const save = page.getByRole('button', { name: 'Salvar serviço: Medicamentos SUS', exact: true });
    await expect(save).toBeVisible();
    if (await save.getAttribute('aria-pressed') !== 'true') await save.click();
    await expect(page.getByRole('button', { name: 'Compartilhar meus serviços', exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  }
  await page.locator('.citizen-preparation summary').click();
  await page.getByLabel('Conferir no canal oficial os horários e a forma de atendimento.').check();
  const results = await new AxeBuilder({ page }).include('#acao').analyze();
  expect(results.violations.filter(item => ['serious', 'critical'].includes(item.impact))).toEqual([]);
});

test('ordenação por nome acompanha link, recarga e CSV', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async value => { window.__orderCopy = value; } } }));
  await page.goto('./?leitura=technical#dados');
  await page.getByLabel('Ordenar indicadores').selectOption('name');
  const labels = await page.locator('.catalog-card h4').allTextContents();
  expect(labels.length).toBe(12);
  expect(labels).toEqual([...labels].sort((a, b) => a.localeCompare(b, 'pt-BR')));
  await page.getByRole('button', { name: 'Copiar link da seleção', exact: true }).click();
  const link = await page.evaluate(() => window.__orderCopy);
  expect(new URL(link).searchParams.get('ordem')).toBe('name');
  await page.goto(link);
  await expect(page.getByLabel('Ordenar indicadores')).toHaveValue('name');
  await expect(page.locator('.catalog-card h4').first()).toHaveText(labels[0]);
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Baixar seleção CSV', exact: true }).click();
  const csv = await readFile(await (await pending).path(), 'utf8');
  expect(csv.indexOf(labels[0])).toBeLessThan(csv.indexOf(labels[1]));
  await page.getByRole('button', { name: 'Limpar filtros', exact: true }).click();
  await expect(page.getByLabel('Ordenar indicadores')).toHaveValue('catalog');
  await expect.poll(() => new URL(page.url()).searchParams.has('ordem')).toBe(false);
});

test('ordenação anual mantém referências ausentes ao final e aceita somente opções conhecidas', async ({ page }) => {
  await page.goto('./?ordem=valor#dados');
  await expect(page.getByLabel('Ordenar indicadores')).toHaveValue('catalog');
  await page.getByLabel('Ordenar indicadores').selectOption('year');
  const more = page.getByRole('button', { name: 'Mostrar mais 12 indicadores', exact: true });
  while (await more.count()) await more.click();
  const refs = await page.locator('.catalog-card dl > div:first-child dd').allTextContents();
  expect(refs.length).toBe(67);
  const years = refs.map(value => Number(value.match(/\b(20\d{2}|19\d{2})\b/)?.[1] ?? 0));
  expect(years).toEqual([...years].sort((a, b) => b - a));
  expect(years.filter(year => year === 0)).toHaveLength(12);
  await page.reload();
  await expect(page.getByLabel('Ordenar indicadores')).toHaveValue('year');
  await expect(page.locator('.catalog-card')).toHaveCount(12);
  await page.getByLabel('Apenas sem referência temporal').check();
  await expect(page.locator('.catalog-card')).toHaveCount(12);
});
