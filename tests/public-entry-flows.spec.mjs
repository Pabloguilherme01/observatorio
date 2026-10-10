import { test, expect } from 'playwright/test';

async function openSection(page, id) {
  await page.evaluate(sectionId => {
    window.location.hash = sectionId;
  }, id);
  await expect(page.locator('#' + id)).toBeVisible();
}

test.describe('Observatório smoke flows', () => {


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
