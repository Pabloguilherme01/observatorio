import { test, expect } from 'playwright/test';

const destinations = [
  { name: /População estimada[\s\S]*Ver contexto/, target: 'dashboard' },
  { name: /Acesso à água[\s\S]*Ver contexto/, target: 'saude' },
  { name: /Orçamento planejado por habitante[\s\S]*Ver contexto/, target: 'orcamento' },
  { name: /Atendimento de esgoto · serviço público[\s\S]*Ver contexto/, target: 'saude' },
];

test('cartões do resumo anunciam texto visível e são alcançáveis pelo teclado', async ({ page }) => {
  await page.goto('./?leitura=summary#resumo');
  const cards = page.locator('#resumo .city-summary-card');
  await expect(cards).toHaveCount(4);

  const share = page.locator('#resumo').getByRole('button', { name: 'Compartilhar resumo do observatório' });
  await share.focus();
  for (const [index, destination] of destinations.entries()) {
    const card = cards.nth(index);
    await expect(card).not.toHaveAttribute('aria-label', /.+/);
    await expect(card).toHaveAccessibleName(destination.name);
    await page.keyboard.press('Tab');
    await expect(card).toBeFocused();
  }
  await page.keyboard.press('Shift+Tab');
  await expect(cards.nth(2)).toBeFocused();
});

for (const [index, destination] of destinations.entries()) {
  for (const key of ['Enter', 'Space']) {
    test(`cartão ${index + 1} abre ${destination.target} com ${key}`, async ({ page }) => {
      await page.goto('./?leitura=summary#resumo');
      await page.locator('#resumo .city-summary-card').nth(index).focus();
      await page.keyboard.press(key);
      await expect(page).toHaveURL(new RegExp(`#${destination.target}$`));
      await expect(page.locator('#' + destination.target)).toBeVisible();
    });
  }
}
