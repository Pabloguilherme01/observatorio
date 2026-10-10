import { test, expect } from 'playwright/test';

test('acervo e quiz só carregam após navegação explícita', async ({ browser }) => {
  const context = await browser.newContext({ serviceWorkers: 'block' });
  const page = await context.newPage();
  const requests = [];
  page.on('request', request => requests.push(request.url()));
  await page.goto('./');
  await expect(page.locator('#resumo')).toContainText('Ano-base 2024');
  await page.locator('#acervo').scrollIntoViewIfNeeded();
  await expect(page.locator('#resultados')).toHaveCount(0);
  await expect(page.locator('#quiz')).toHaveCount(0);
  expect(requests.filter(url => /DeferredArchiveGroup|DeferredLearningGroup|tse-results\.json/.test(url))).toEqual([]);
  await page.locator('#acervo').getByRole('link', { name: /Registros eleitorais/ }).click();
  await expect(page.locator('#resultados')).toBeVisible();
  await expect.poll(() => requests.some(url => url.includes('tse-results.json'))).toBe(true);
  await page.locator('#acervo').getByRole('link', { name: /Praticar conhecimentos cívicos/ }).click();
  await expect(page.locator('#quiz')).toBeVisible();
  await context.close();
});

test('barra móvel prioriza a cidade e mantém acesso ao acervo', async ({ page }) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto('./');
  const nav=page.locator('.mobile-bottom-nav');
  for(const name of ['Início','Cidade','Serviços','Dados']) await expect(nav.getByRole('button',{name,exact:true})).toBeVisible();
  await nav.getByRole('button',{name:'Mais',exact:true}).click();
  await page.getByRole('menuitem',{name:/Resultados/}).click();
  await expect(page.locator('#resultados')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth+1)).toBe(true);
});

test('catálogo completo de serviços fica disponível no modo Resumo', async ({ page }) => {
  await page.goto('./#acao');
  const local = page.locator('.civic-local-hub');
  await expect(local).toBeVisible();
  await expect(page.locator('#acao .official-hub').first()).toHaveClass(/civic-local-hub/);
  const cards = local.locator('.official-resource-card');
  await expect(cards).toHaveCount(6);
  await local.getByRole('button', { name: /Ver todos os \d+ serviços municipais/ }).click();
  expect(await cards.count()).toBeGreaterThan(6);
  await expect(page.locator('html')).toHaveAttribute('data-language-mode','summary');
  await local.getByRole('button', { name:'Mostrar serviços principais' }).click();
  await expect(cards).toHaveCount(6);
});

test('compartilhar resumo preserva períodos e usa somente seu destino', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator,'share',{configurable:true,value:undefined});
    Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text => {window.__summaryCopy=text;}}});
  });
  await page.goto('./?utm_source=campanha&servico=medicamentos&leitura=simple#resumo');
  await page.getByRole('button',{name:'Compartilhar resumo do observatório'}).click();
  await expect(page.locator('#resumo').getByRole('status')).toHaveText('Resumo copiado');
  const text=await page.evaluate(() => window.__summaryCopy);
  expect(text).toContain('Ano-base 2024');
  const url=new URL(text.split('\n').at(-1));
  expect(url.hash).toBe('#resumo');
  expect([...url.searchParams.entries()]).toEqual([['leitura','simple']]);
});

test('atalho de necessidade permite voltar ao guia anterior', async ({ page }) => {
  await page.goto('./#utilidade-publica');
  await page.locator('#utilidade-publica').getByRole('button',{name:/Saúde e medicamentos/}).click();
  await expect(page.locator('#acao input[type="search"]')).toHaveValue('medicamentos');
  await page.goBack();
  await expect(page).toHaveURL(/#utilidade-publica$/);
  await expect(page.locator('#utilidade-publica')).toBeVisible();
});
