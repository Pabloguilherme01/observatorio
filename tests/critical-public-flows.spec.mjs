import { test, expect } from 'playwright/test';

test.describe('Fluxos públicos críticos', () => {
  test('entrada pública carrega e expõe o controle de leitura adequado ao dispositivo', async ({ page, isMobile }) => {
    await page.goto('./');
    await expect(page).toHaveTitle(/Observatório Eleitoral — Águas Lindas de Goiás 2026/);
    await expect(page.locator('#root')).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-language-mode', 'summary');

    if (isMobile) {
      await page.getByRole('button', { name: 'Abrir menu' }).click();
    }

    const modes = page.getByRole('group', { name: 'Escolha como você quer ler os dados' });
    await expect(modes).toBeVisible();
    await expect(modes.getByRole('button', { name: /^Resumo/ })).toBeVisible();
    await expect(modes.getByRole('button', { name: /^Explicado/ })).toBeVisible();
    await expect(modes.getByRole('button', { name: /^Guiado/ })).toBeVisible();
    await expect(modes.getByRole('button', { name: /^Detalhado/ })).toBeVisible();
  });

  test('link direto de serviço municipal preserva o filtro e o destino oficial', async ({ page }) => {
    await page.goto('./?servico=CAPS#acao');
    await expect(page.getByRole('heading', { name: /Encontre um serviço ou confira uma informação/i })).toBeVisible();

    const search = page.getByRole('searchbox', { name: /Buscar serviço municipal/i });
    await expect(search).toHaveValue('CAPS');

    const caps = page.getByRole('link', { name: /CAPS/i }).first();
    await expect(caps).toBeVisible();
    await expect(caps).toHaveAttribute('href', /^https:\/\/aguaslindasdegoias\.go\.gov\.br\/estrutura\/secretaria-de-saude-2\/caps-centro-de-atencao-psicossocial\/?$/i);
  });

  test('recorte eleitoral deixa explícito que não é uma lista municipal completa', async ({ page }) => {
    await page.goto('./#eleitoral360');
    await expect(page.getByRole('heading', { name: /Nomes acompanhados no recorte de Águas Lindas/i })).toBeVisible();
    await expect(page.getByText(/não representa uma lista completa de candidaturas de Águas Lindas/i)).toBeVisible();
    await expect(page.getByText(/fonte oficial/i).first()).toBeVisible();
  });

  test('troca de modo de leitura é funcional e reversível', async ({ page, isMobile }) => {
    await page.goto('./');
    const root = page.locator('html');

    if (isMobile) {
      await page.getByRole('button', { name: 'Abrir menu' }).click();
    }

    const modes = page.getByRole('group', { name: 'Escolha como você quer ler os dados' });
    const guided = modes.getByRole('button', { name: /^Guiado/ });
    await guided.click();
    await expect(guided).toHaveAttribute('aria-pressed', 'true');

    const summary = modes.getByRole('button', { name: /^Resumo/ });
    await summary.click();
    await expect(summary).toHaveAttribute('aria-pressed', 'true');
  });

  test('healthcheck público mantém contrato operacional legível', async ({ request }) => {
    const response = await request.get('./api/v1/health.json');
    expect(response.ok()).toBeTruthy();
    const health = await response.json();
    expect(['ok', 'degraded']).toContain(health.status);
    expect(health.publication).toBeTruthy();
    expect(health.freshness?.tseCandidates).toBeTruthy();
  });
});
