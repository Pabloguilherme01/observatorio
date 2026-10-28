import { test, expect } from 'playwright/test';

test('paradas guiadas anunciam o conteúdo visível e preservam a navegação', async ({ page }) => {
  await page.goto('./?leitura=guided#aprendizado-guiado');
  const steps = page.locator('#aprendizado-guiado .guided-learning-step');
  await expect(steps).toHaveCount(7);

  const first = steps.first();
  await expect(first).toHaveAttribute('aria-current', 'step');
  await expect(first).toHaveAccessibleName(/Abrir etapa 1\.[\s\S]*Sua próxima parada[\s\S]*Identifique o indicador[\s\S]*O que este número mede\?[\s\S]*Leia nome, valor e unidade[\s\S]*Ir ao resumo/);
  await first.click();
  await expect(page).toHaveURL(/#resumo$/);

  await page.goto('./?leitura=guided#aprendizado-guiado');
  await expect(steps.first()).toHaveAccessibleName(/Revisar etapa 1\.[\s\S]*Destino aberto[\s\S]*Identifique o indicador[\s\S]*Ir ao resumo/);
  await expect(steps.nth(1)).toHaveAttribute('aria-current', 'step');
});
