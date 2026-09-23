import { test, expect } from '@playwright/test';

test.describe('Visual regression · 5 viewports', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('main[data-app-ready="true"]');
  });

  test('home', async ({ page }) => {
    await expect(page).toHaveScreenshot('home.png', {
      maxDiffPixelRatio: 0.001,
      animations: 'disabled',
      fullPage: true,
    });
  });

  test('provenance', async ({ page }) => {
    const trigger = page.getByTestId('provenance-trigger').first();
    await trigger.scrollIntoViewIfNeeded();
    await trigger.click();

    const drawer = page.getByTestId('provenance-drawer');
    await expect(drawer).toBeVisible();
    await expect(drawer).toHaveScreenshot('provenance.png', {
      maxDiffPixelRatio: 0.001,
      animations: 'disabled',
    });
  });

  test('comparador', async ({ page }) => {
    await page.goto('/#contexto');
    await page.waitForSelector('main[data-app-ready="true"]');
    await expect(page.locator('#contexto')).toBeVisible();
    await expect(page).toHaveScreenshot('comparador.png', {
      maxDiffPixelRatio: 0.001,
      animations: 'disabled',
      fullPage: true,
    });
  });

  test('eleitoral360', async ({ page }) => {
    await page.goto('/#eleitoral360');
    await page.waitForSelector('main[data-app-ready="true"]');
    await expect(page.locator('#eleitoral360')).toBeVisible();
    await expect(page).toHaveScreenshot('eleitoral360.png', {
      maxDiffPixelRatio: 0.001,
      animations: 'disabled',
      fullPage: true,
    });
  });
});
