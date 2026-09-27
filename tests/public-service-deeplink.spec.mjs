import { test, expect } from 'playwright/test';

test.describe('links diretos de serviços públicos', () => {
  test('restaura o filtro pela URL e o mantém ao editar', async ({ page }) => {
    await page.goto('./?servico=medicamentos#acao');

    const input = page.getByRole('searchbox', { name: 'Buscar serviço municipal por necessidade' });
    await expect(input).toBeVisible();
    await expect(input).toHaveValue('medicamentos');
    await expect(page.getByRole('link', { name: /Medicamentos SUS/i })).toBeVisible();

    await input.fill('creches');
    await expect(page).toHaveURL(/\?servico=creches#acao$/);
    await expect(page.getByRole('link', { name: /Lista de espera em creches/i })).toBeVisible();

    await page.reload();
    await expect(page.getByRole('searchbox', { name: 'Buscar serviço municipal por necessidade' })).toHaveValue('creches');

    await page.getByRole('button', { name: 'Limpar' }).click();
    await expect(page).not.toHaveURL(/servico=/);
  });

  test('busca global abre serviço com URL compartilhável', async ({ page }) => {
    await page.goto('./');

    await page.getByRole('button', { name: /Buscar no observatório/i }).first().click();
    const search = page.getByRole('combobox', { name: 'Buscar dado, serviço, fonte ou seção' });
    await search.fill('medicamentos');
    await page.getByRole('option', { name: /Medicamentos SUS/i }).first().click();

    await expect(page).toHaveURL(/\?servico=medicamentos#acao$/);
    await expect(page.getByRole('searchbox', { name: 'Buscar serviço municipal por necessidade' })).toHaveValue('medicamentos');
    await expect(page.getByRole('button', { name: 'Copiar link desta busca de serviços' })).toBeVisible();
  });


  test('link compartilhado da busca é canônico e remove rastreamento', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { writeText: async text => { window.__lastCopiedServiceLink = text; } },
      });
    });
    await page.goto('./?utm_source=campanha&servico=medicamentos#acao');

    const input = page.getByRole('searchbox', { name: 'Buscar serviço municipal por necessidade' });
    await expect(input).toHaveValue('medicamentos');
    const copyButton = page.getByRole('button', { name: 'Copiar link desta busca de serviços' });
    await copyButton.click();
    await expect(copyButton).toContainText('Link copiado');

    const copied = await page.evaluate(() => window.__lastCopiedServiceLink);
    expect(copied).toContain('?servico=medicamentos#acao');
    expect(copied).not.toContain('utm_source');
  });
});
