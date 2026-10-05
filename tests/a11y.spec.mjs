import { test, expect } from 'playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Acessibilidade real no navegador', () => {
  test('entrada pública atende Axe sem violações críticas ou sérias', async ({ page }) => {
    await page.goto('./');
    await expect(page.locator('#main-content')).toBeVisible();

    const results = await new AxeBuilder({ page })
      .disableRules(['color-contrast'])
      .analyze();

    const severe = results.violations.filter(item => item.impact === 'critical' || item.impact === 'serious');
    expect(severe).toEqual([]);
  });

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
