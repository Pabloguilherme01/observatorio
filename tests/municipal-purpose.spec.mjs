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
