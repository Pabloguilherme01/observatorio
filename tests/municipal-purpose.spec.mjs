import { test, expect } from 'playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('serviços e seletor móvel mantêm acessibilidade nos dois temas', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  for (const theme of ['light', 'dark']) {
    await page.addInitScript(value => localStorage.setItem('observatorio-theme', value), theme);
    await page.goto('./#acao');
    await page.locator('#service-topic').selectOption('Saúde');
    const results = await new AxeBuilder({ page }).include('#acao').analyze();
    expect(results.violations.filter(item => ['serious', 'critical'].includes(item.impact))).toEqual([]);
  }
});

test('serviços entendem necessidades comuns e combinam assunto sem perder o link', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async text => { window.__serviceLink = text; } } });
  });
  await page.goto('./#acao');
  const hub = page.locator('#acao');
  const chooseTopic = async value => {
    const select = hub.getByRole('combobox', { name: 'Assunto dos serviços' });
    if (await select.isVisible()) await select.selectOption(value);
    else await hub.getByRole('button', { name: value, exact: true }).click();
  };
  const search = hub.getByRole('searchbox', { name: 'Buscar serviço municipal por necessidade' });
  await search.fill('preciso de remédio');
  await expect(hub.locator('.official-resource-card')).toHaveCount(2);
  await chooseTopic('Educação');
  await expect(hub.getByRole('note').filter({ hasText: 'Nenhum serviço corresponde' })).toBeVisible();
  await hub.getByRole('button', { name: 'Ver serviços principais', exact: true }).click();
  await search.fill('vaga na creche');
  await expect(hub.locator('.official-resource-card')).toHaveCount(1);
  await expect(hub.locator('.official-resource-card')).toContainText('Lista de espera em creches');
  await chooseTopic('Educação');
  await hub.getByRole('button', { name: 'Copiar link desta busca de serviços' }).click();
  await expect.poll(() => page.evaluate(() => window.__serviceLink)).toBeTruthy();
  const shared = await page.evaluate(() => window.__serviceLink);
  const url = new URL(shared);
  expect(url.searchParams.get('assunto')).toBe('Educação');
  expect(url.searchParams.get('servico')).toBe('vaga na creche');
  await page.goto(shared);
  const restoredTopic = hub.getByRole('combobox', { name: 'Assunto dos serviços' });
  if (await restoredTopic.isVisible()) await expect(restoredTopic).toHaveValue('Educação');
  else await expect(hub.getByRole('button', { name: 'Educação', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(hub.locator('.official-resource-card')).toHaveCount(1);
});

test('filtros de serviços são utilizáveis a 320 px e não escondem canais de atendimento', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('./#acao');
  const hub = page.locator('#acao');
  const filter = hub.getByRole('combobox', { name: 'Assunto dos serviços' });
  await filter.focus();
  await expect(filter).toBeFocused();
  await filter.selectOption('Saúde');
  await expect(filter).toHaveValue('Saúde');
  await expect(hub.locator('.official-resource-grid')).toContainText('CAPS');
  await expect(hub.locator('.official-resource-grid')).toContainText('SAMU');
  await expect(hub.locator('.official-resource-grid')).not.toContainText('Contratos');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await filter.selectOption('Todos');
  await expect(hub.locator('.official-resource-card')).toHaveCount(6);
});



test('barra móvel prioriza a cidade e mantém acesso ao aprendizado', async ({ page }) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto('./');
  const nav=page.locator('.mobile-bottom-nav');
  for(const name of ['Início','Cidade','Serviços','Dados']) await expect(nav.getByRole('button',{name,exact:true})).toBeVisible();
  await nav.getByRole('button',{name:'Mais',exact:true}).click();
  await page.getByRole('menuitem',{name:/Quiz/}).click();
  await expect(page.locator('#quiz')).toBeVisible();
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
