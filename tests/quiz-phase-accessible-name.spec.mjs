import { test, expect } from 'playwright/test';

test('fases do quiz têm nome acessível com todo o texto visível', async ({ page }) => {
  await page.goto('./#quiz');

  const phases = page.locator('#quiz .quiz-phase-card');
  await expect(phases).toHaveCount(5);

  // O nome deve vir do texto da própria fase, incluindo andamento e pontuação.
  await expect(phases.first()).toHaveAccessibleName(
    /Fase 1\s+Começar\s+40 perguntas\s+Melhor marca:/,
  );

  // O estado de bloqueio continua nativo e seu motivo permanece anunciado.
  const locked = phases.nth(1);
  await expect(locked).toBeDisabled();
  await expect(locked).toHaveAccessibleName(
    /Fase 2\s+Entender\s+Bloqueada\s+Complete a fase anterior com 60% para liberar/,
  );
});
