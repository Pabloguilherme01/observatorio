import { test, expect } from 'playwright/test';

test('nome acessível preserva o texto visual da marca e dos modos de leitura', async ({ page }) => {
  await page.goto('./');
  const brand = page.getByRole('link', { name: 'Águas Lindas de Goiás Observatório, início' });
  await expect(brand).toBeVisible();
  await expect(brand).toHaveText(/Águas Lindas de Goiás\s+Observatório/);

  const modes = page.getByRole('group', { name: 'Escolha como você quer ler os dados' });
  const summary = modes.getByRole('button', { name: /^Resumo leitura rápida Ativo/ });
  await expect(summary).toHaveAttribute('aria-pressed', 'true');
  await expect(summary).toHaveText(/Resumo\s+leitura rápida/);
  const explained = modes.getByRole('button', { name: /^Explicado com contexto/ });
  await expect(explained).toHaveText(/Explicado\s+com contexto/);
  await explained.click();
  await expect(modes.getByRole('button', { name: /^Explicado com contexto Ativo/ })).toHaveAttribute('aria-pressed', 'true');
  await expect(modes.getByRole('button', { name: /^Resumo leitura rápida ·/ })).toHaveAttribute('aria-pressed', 'false');
});
