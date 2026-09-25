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
  });
});
