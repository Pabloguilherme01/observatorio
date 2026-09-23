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
    await expect(page.getByText('Dados atualizados em segundo plano', { exact: true })).toBeVisible();
  });

  test('módulos TSE comunicam honestamente seu estado de captura', async ({ page }) => {
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
});
