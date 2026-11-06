import { test, expect } from 'playwright/test';

test('cartao oficial anuncia texto visivel e botao salvo anuncia o estado', async ({ page }) => {
  await page.goto('./?servico=medicamentos#acao');

  const link = page.locator('#acao a.official-resource-card').filter({ hasText: 'Medicamentos SUS' });
  await expect(link).toHaveCount(1);
  await expect(link).not.toHaveAttribute('aria-label', /.+/);
  await expect(link).toHaveAccessibleName(/Medicamentos SUS[\s\S]*Canal oficial, abre em nova aba/);

  const save = page.locator('#acao .citizen-service-card').filter({
    has: page.locator('a.official-resource-card').filter({ hasText: 'Medicamentos SUS' }),
  }).locator('.citizen-save-button');
  await expect(save).toHaveAccessibleName('Salvar serviço: Medicamentos SUS');
  await expect(save).toHaveAttribute('aria-pressed', 'false');
  await save.click();
  await expect(save).toHaveAccessibleName('Serviço salvo: Medicamentos SUS — remover da lista');
  await expect(save).toHaveAttribute('aria-pressed', 'true');
  await save.click();
  await expect(save).toHaveAccessibleName('Salvar serviço: Medicamentos SUS');
  await expect(save).toHaveAttribute('aria-pressed', 'false');
});

test('barras do historico de esgoto preservam percentual e ano no nome acessivel', async ({ page }) => {
  await page.goto('./#saude');

  const bars = page.locator('#saude .sewer-mobile-bar');
  await expect(bars).toHaveCount(8);
  const first = bars.first();
  await expect(first).not.toHaveAttribute('aria-label', /.+/);
  await expect(first).toHaveAccessibleName(/2,9%\s+2017/);
  await first.click();
  await expect(first).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#saude .sewer-mobile-selected')).toContainText('2017');
});
