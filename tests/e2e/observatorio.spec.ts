import { test, expect } from '@playwright/test';

test.describe('Observatório · jornada E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('main[data-app-ready="true"]');
  });

  test('carrega o PWA e registra o service worker', async ({ page }) => {
    await expect(page.locator('link[rel="manifest"]')).toHaveCount(1);
    const registration = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return false;
      await navigator.serviceWorker.ready;
      return true;
    });
    expect(registration).toBe(true);
  });

  test('abre o ProvenanceDrawer e mantém o foco dentro dele', async ({ page }) => {
    const trigger = page.getByTestId('provenance-trigger').first();
    await trigger.scrollIntoViewIfNeeded();
    await trigger.click();
    const drawer = page.getByTestId('provenance-drawer');
    await expect(drawer).toBeVisible();
    await expect(drawer.locator('button[aria-label="Fechar"]').first()).toBeFocused();
    const count = await drawer.locator('button, a[href]').count();
    expect(count).toBeGreaterThan(1);
    for (let index = 0; index < count + 2; index += 1) {
      await page.keyboard.press('Tab');
      await expect.poll(() => page.evaluate(() => Boolean(document.activeElement?.closest('[data-testid="provenance-drawer"]')))).toBe(true);
    }
    await page.keyboard.press('Escape');
    await expect(drawer).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test('navega pelo AccessibleRegionMap por teclado', async ({ page }) => {
    await page.locator('#contexto').scrollIntoViewIfNeeded();
    await expect(page.locator('#contexto')).toBeVisible();
    const map = page.getByTestId('accessible-region-map');
    await map.scrollIntoViewIfNeeded();
    await map.getByTestId('region-option').first().focus();
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('region-card')).toBeVisible();
    await expect(page.getByTestId('region-card')).toContainText('Região Norte');
    await map.getByTestId('region-option').nth(1).focus();
    await page.keyboard.press('Space');
    await expect(page.getByTestId('region-card')).toContainText('Região Central');
  });

  test('não há overflow horizontal em nenhum viewport', async ({ page }) => {
    const result = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      bodyScrollWidth: document.body.scrollWidth,
      bodyClientWidth: document.body.clientWidth,
    }));
    expect(result.scrollWidth).toBeLessThanOrEqual(result.clientWidth + 1);
    expect(result.bodyScrollWidth).toBeLessThanOrEqual(result.bodyClientWidth + 1);
  });

  test('toast de atualização do SW responde ao contrato DATA_UPDATED', async ({ page }) => {
    await page.evaluate(() => {
      navigator.serviceWorker.dispatchEvent(new MessageEvent('message', {
        data: { type: 'DATA_UPDATED', semantics: 'background-cache-only' },
      }));
    });
    await expect(page.getByTestId('data-update-toast')).toBeVisible();
    await expect(page.getByText('Dados atualizados em segundo plano', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: /Recarregar/ })).toBeVisible();
  });

  test('módulos TSE comunicam honestamente seu estado de captura', async ({ page }) => {
    await page.locator('#eleitoral360').scrollIntoViewIfNeeded();
    await expect(page.locator('#eleitoral360')).toBeVisible();
    for (const id of ['contas', 'pesquisas', 'processual']) {
      const section = page.locator('#' + id);
      await section.scrollIntoViewIfNeeded();
      await expect(section).toContainText(/Estado:|Estado da captura/);
      const text = await section.innerText();
      expect(/not_ingested|first_capture|synced|stale|failed/i.test(text), 'estado TSE não exposto em #' + id).toBe(true);
      if (/not_ingested/i.test(text)) {
        expect(text).toMatch(/não foi materializada|captura.*ainda/i);
      }
    }
  });
  test('recorte local exibe fotos e redes declaradas sem nomes fora da cidade', async ({ page }) => {
    await page.goto('/#eleitoral360');
    await page.waitForSelector('main[data-app-ready="true"]');
    const section = page.locator('#eleitoral360');
    await section.scrollIntoViewIfNeeded();
    await expect(section).toBeVisible();

    const cards = page.getByTestId('candidate-card');
    await expect(cards).toHaveCount(7);

    for (const excluded of ['André do Premium', 'Pábio Mossoró', 'WILDE CAMBÃO']) {
      await expect(section).not.toContainText(excluded);
    }

    await expect(cards.first().locator('img[alt^="Foto oficial de"], div[aria-label^="Foto indisponível"]')).toHaveCount(1);
    const instagramLinks = cards.locator('a[href*="instagram.com/"]');
    expect(await instagramLinks.count()).toBeLessThanOrEqual(7);

    await expect(section.getByText('Instagram não informado no TSE')).toHaveCount(1);
  });

  test('busca no mobile abre sem forçar o teclado', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForSelector('main[data-app-ready="true"]');
    await page.getByRole('button', { name: 'Abrir busca' }).click();
    const input = page.getByRole('textbox', { name: 'Buscar seção, fonte ou indicador' });
    await expect(input).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.activeElement?.tagName)).not.toBe('INPUT');
  });

  test('modo rápido reduz densidade sem apagar o caminho principal', async ({ page }) => {
    await page.getByRole('group', { name: 'Modo de leitura' }).getByRole('button', { name: 'Rápido' }).click();
    await expect(page.locator('html')).toHaveClass(/mode-quick/);
    await expect(page.locator('#descubra')).toBeVisible();
    await expect(page.locator('#eleitoral360')).toBeVisible();
    await expect(page.locator('#instagram')).toBeVisible();
  });

});
