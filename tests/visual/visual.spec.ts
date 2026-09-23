import { test, expect } from '@playwright/test';

const cases = [
  { name: 'home', path: '/' },
  { name: 'provenance', path: '/' },
  { name: 'comparador', path: '/#contexto' },
  { name: 'eleitoral360', path: '/#eleitoral360' },
] as const;

for (const item of cases) {
  test('visual · ' + item.name, async ({ page }) => {
    await page.goto(item.path);
    await page.waitForSelector('main[data-app-ready="true"]');
    await page.waitForLoadState('networkidle');

    const timer = page.locator('[role="timer"]');
    const masks = (await timer.count()) > 0 ? [timer] : [];

    if (item.name === 'provenance') {
      const trigger = page.getByTestId('provenance-trigger').first();
      await trigger.scrollIntoViewIfNeeded();
      await trigger.click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(page.getByTestId('provenance-drawer')).toHaveScreenshot('provenance.png', { maxDiffPixelRatio: 0.001, animations: 'disabled' });
      return;
    }

    await expect(page).toHaveScreenshot(item.name + '.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.001,
      animations: 'disabled',
      mask: masks,
    });
  });
}
