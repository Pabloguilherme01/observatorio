import { test, expect } from 'playwright/test';

test.describe('Acessibilidade real no navegador', () => {
  test('fluxos principais continuam acessíveis por teclado', async ({ page }) => {
    await page.goto('./');

    const search = page.getByRole('button', { name: /Buscar no observatório/i }).first();
    await search.focus();
    await expect(search).toBeFocused();
    await page.keyboard.press('Enter');

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    const input = dialog.getByRole('combobox').first();
    await expect(input).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();

    const modes = page.getByRole('group', { name: 'Escolha como você quer ler os dados' });
    const summary = modes.getByRole('button', { name: /^Resumo/ });
    await summary.focus();
    await expect(summary).toBeFocused();
  });
});
