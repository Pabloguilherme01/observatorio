import { test, expect } from 'playwright/test';

test('orçamento mostra natureza e referência nos cards por habitante', async ({ page }) => {
  await page.goto('./#orcamento');

  const cards = page.locator('#orcamento .dashboard-secondary-card');
  await expect(cards).toHaveCount(3);
  const first = cards.first();
  await expect(first.locator('.dashboard-meta-chip')).toHaveCount(2);
  await expect(first).toContainText('Derivado');
  await expect(first).toContainText(/ref\. 31\/12\/2025/i);
});

test('simulador distingue renda padrão de valor ajustado', async ({ page }) => {
  await page.goto('./#transporte');

  await expect(page.locator('#transporte')).toContainText('padrão · salário mínimo 2026');
  await page.locator('#transporte details summary').click();
  const income = page.locator('#transporte label').filter({ hasText: 'Renda de referência' }).getByRole('spinbutton');
  await income.fill('3000');
  await expect(page.locator('#transporte')).toContainText('valor ajustado pelo usuário');
  await expect(page.locator('#transporte')).toContainText(/O campo de renda é ajustável: o padrão é R\$\s?1\.621,00/i);
});

test('saneamento expõe data-base e deriva anos dos indicadores', async ({ page }) => {
  await page.goto('./#saude');

  const sanitation = page.locator('#saude').getByRole('heading', { name: 'Acesso, serviço, coleta e tratamento' }).locator('..').locator('..');
  await expect(page.locator('#saude')).toContainText('Base SINISA');
  await expect(page.locator('#saude')).toContainText(/ref\. 01\/01\/2024/i);
  await expect(page.locator('#saude')).toContainText('esgotamento sanitário adequado · IBGE · 2022');
  await expect(page.locator('#saude')).toContainText('domicílios com coleta de resíduos · SINISA 2024');
  await expect(sanitation).toBeVisible();
});
