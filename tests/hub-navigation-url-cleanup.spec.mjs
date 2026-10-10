import { test, expect } from 'playwright/test';

async function selectMode(page, name) {
  const group = page.getByRole('group', { name: 'Escolha como você quer ler os dados' });
  await group.getByRole('button', { name }).click();
}

test('hub inicial limpa parâmetros transitórios ao navegar sem perder o modo', async ({ page }) => {
  await page.goto('./#descubra');
  await selectMode(page, /^Explicado/);
  await page.evaluate(() => {
    window.history.replaceState(null, '', '?servico=CRAS&dado=antigo&leitura=simple#descubra');
  });

  await page.locator('#descubra').getByRole('link', { name: /Entender a cidade/i }).click();

  await expect(page).toHaveURL(/#dashboard$/);
  expect(new URL(page.url()).search).toBe('');
  await expect(page.locator('html')).toHaveAttribute('data-language-mode', 'simple');
  await expect(page.locator('#dashboard')).toBeVisible();
});

test('resumo limpa parâmetros transitórios ao abrir contexto sem perder o modo', async ({ page }) => {
  await page.goto('./#resumo');
  await selectMode(page, /^Resumo/);
  await page.evaluate(() => {
    window.history.replaceState(null, '', '?servico=despesas&dado=antigo&leitura=summary#resumo');
  });

  await page.getByRole('button', { name: /Abrir contexto de População/i }).click();

  await expect(page).toHaveURL(/#dashboard$/);
  expect(new URL(page.url()).search).toBe('');
  await expect(page.locator('html')).toHaveAttribute('data-language-mode', 'summary');
  await expect(page.locator('#dashboard')).toBeVisible();
});
