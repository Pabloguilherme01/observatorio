import { test, expect } from 'playwright/test';

test.describe('responsividade entre breakpoints', () => {
  for (const viewport of [
    { width: 320, height: 740 },
    { width: 375, height: 812 },
    { width: 390, height: 844 },
    { width: 412, height: 915 },
    { width: 768, height: 1024 },
    { width: 1440, height: 900 },
  ]) {
    test(`não cria overflow em ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto('./');
      await expect(page.locator('#main-content')).toBeVisible();

      const layout = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        documentWidth: document.documentElement.scrollWidth,
        bodyWidth: document.body.scrollWidth,
        clipped: [...document.querySelectorAll('main h1, main h2, main h3, main p, main a, main button')]
          .filter(element => {
            const style = getComputedStyle(element);
            if (style.display === 'none' || style.visibility === 'hidden') return false;
            const rect = element.getBoundingClientRect();
            return rect.width > 0 && rect.right > window.innerWidth + 1;
          }).length,
      }));

      expect(layout.documentWidth).toBeLessThanOrEqual(layout.viewport + 1);
      expect(layout.bodyWidth).toBeLessThanOrEqual(layout.viewport + 1);
      expect(layout.clipped).toBe(0);
    });
  }
});
