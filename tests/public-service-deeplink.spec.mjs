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
});
