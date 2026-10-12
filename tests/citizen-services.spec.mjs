import { test, expect } from 'playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('busca inicial conduz ao canal municipal e preserva retorno', async ({ page }) => {
  await page.goto('./');
  await page.getByLabel('Digite uma necessidade').fill('medicamentos');
  await page.getByRole('button', { name: 'Encontrar canal oficial', exact: true }).click();
  await expect(page).toHaveURL(/servico=medicamentos#acao$/);
  await expect(page.getByLabel('Buscar serviço municipal por necessidade')).toHaveValue('medicamentos');
  await expect(page.locator('#acao .official-resource-card')).toHaveCount(2);
  await page.reload();
  await expect(page.getByLabel('Buscar serviço municipal por necessidade')).toHaveValue('medicamentos');
});

test('serviços salvos sobrevivem ao recarregamento sem mudar preferências ou a busca', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('observatorio-theme', 'light');
    localStorage.setItem('observatorio-contrast', 'normal');
  });
  await page.goto('./?servico=medicamentos#acao');
  const save = page.getByRole('button', { name: 'Salvar serviço: Medicamentos SUS', exact: true });
  await save.click();
  await expect(save).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.citizen-saved')).toContainText('Meus serviços (1)');
  await page.reload();
  await expect(save).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('html')).toHaveClass(/light/);
  await expect(page.getByLabel('Buscar serviço municipal por necessidade')).toHaveValue('medicamentos');
  await page.getByRole('button', { name: 'Remover serviço salvo: Medicamentos SUS' }).click();
  await expect(save).toHaveAttribute('aria-pressed', 'false');
  await page.reload();
  await expect(page.locator('.citizen-saved')).toContainText('Meus serviços (0)');
});

test('armazenamento inválido e bloqueado mantém serviço utilizável', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('observatorio-citizen-services-v1', JSON.stringify(['desconhecido', 42, 'Medicamentos SUS', 'Medicamentos SUS']));
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key, value) {
      if (key === 'observatorio-citizen-services-v1') throw new Error('blocked');
      return original.call(this, key, value);
    };
  });
  await page.goto('./?servico=medicamentos#acao');
  await expect(page.locator('.citizen-saved-list li')).toHaveCount(1);
  await page.getByRole('button', { name: 'Salvar serviço: Estoque de medicamentos', exact: true }).click();
  await expect(page.locator('.citizen-save-status')).toContainText('apenas nesta visita');
  await expect(page.locator('.citizen-saved-list li')).toHaveCount(2);
});

test('ferramentas cidadãs são acessíveis e cabem entre 320 e 1920 pixels', async ({ page }) => {
  for (const width of [320, 390, 768, 1280, 1920]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('./#acao');
    await expect(page.getByRole('button', { name: 'Salvar serviço: Medicamentos SUS', exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  }
  await page.locator('.citizen-preparation summary').click();
  await page.getByLabel('Conferir no canal oficial os horários e a forma de atendimento.').check();
  const results = await new AxeBuilder({ page }).include('#acao').analyze();
  expect(results.violations.filter(item => ['serious', 'critical'].includes(item.impact))).toEqual([]);
});
