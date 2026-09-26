import { test, expect } from 'playwright/test';

test.describe('responsividade entre breakpoints', () => {
  for (const viewport of [
    { width: 320, height: 740 },
    { width: 375, height: 812 },
    { width: 390, height: 844 },
    { width: 412, height: 915 },
    { width: 768, height: 1024 },
    { width: 1024, height: 768 },
    { width: 1366, height: 768 },
    { width: 1440, height: 900 },
    { width: 1920, height: 1080 },
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

      for (const mode of ['summary', 'simple', 'technical']) {
        await page.evaluate(nextMode => {
          document.documentElement.dataset.languageMode = nextMode;
        }, mode);
        const modeLayout = await page.evaluate(() => ({
          viewport: document.documentElement.clientWidth,
          documentWidth: document.documentElement.scrollWidth,
          mainWidth: document.getElementById('main-content')?.scrollWidth ?? 0,
        }));
        expect(modeLayout.documentWidth).toBeLessThanOrEqual(modeLayout.viewport + 1);
        expect(modeLayout.mainWidth).toBeLessThanOrEqual(modeLayout.viewport + 1);
      }
    });
  }
});


test.describe('header mobile e modos de leitura', () => {
  for (const viewport of [
    { width: 320, height: 740 },
    { width: 375, height: 812 },
    { width: 430, height: 932 },
  ]) {
    test(`troca modos no topo sem cortar controles em ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto('./');
      await expect(page.locator('#main-content')).toBeVisible();

      const headerFit = await page.evaluate(() => {
        const header = document.querySelector('.site-header-inner');
        const controls = [...document.querySelectorAll('.site-header-actions button')]
          .map(element => {
            const rect = element.getBoundingClientRect();
            const style = getComputedStyle(element);
            return {
              left: Math.round(rect.left),
              right: Math.round(rect.right),
              width: Math.round(rect.width),
              height: Math.round(rect.height),
              visible: style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0,
            };
          })
          .filter(control => control.visible);
        const rect = header?.getBoundingClientRect();
        return {
          headerLeft: rect ? Math.round(rect.left) : -1,
          headerRight: rect ? Math.round(rect.right) : -1,
          viewport: window.innerWidth,
          controls,
        };
      });

      expect(headerFit.headerLeft).toBeGreaterThanOrEqual(-1);
      expect(headerFit.headerRight).toBeLessThanOrEqual(headerFit.viewport + 1);
      expect(headerFit.controls.length).toBeGreaterThanOrEqual(3);
      for (const control of headerFit.controls) {
        expect(control.left).toBeGreaterThanOrEqual(-1);
        expect(control.right).toBeLessThanOrEqual(headerFit.viewport + 1);
        expect(control.width).toBeGreaterThanOrEqual(40);
        expect(control.height).toBeGreaterThanOrEqual(40);
      }

      const shortcut = page.locator('.site-mode-shortcut');
      await expect(shortcut).toBeVisible();
      await expect(page.locator('html')).toHaveAttribute('data-language-mode', 'summary');

      await shortcut.click();
      await expect(page.locator('html')).toHaveAttribute('data-language-mode', 'simple');
      await shortcut.click();
      await expect(page.locator('html')).toHaveAttribute('data-language-mode', 'technical');
      await shortcut.click();
      await expect(page.locator('html')).toHaveAttribute('data-language-mode', 'summary');

      const toolsButton = page.locator('.site-tools-button');
      await toolsButton.click();
      await expect(page.locator('#mobile-tools')).toBeVisible();

      const modeButtons = page.locator('#mobile-tools .language-toggle-options button');
      await expect(modeButtons).toHaveCount(3);

      await modeButtons.nth(1).click();
      await expect(page.locator('html')).toHaveAttribute('data-language-mode', 'simple');
      await modeButtons.nth(2).click();
      await expect(page.locator('html')).toHaveAttribute('data-language-mode', 'technical');
      await modeButtons.nth(0).click();
      await expect(page.locator('html')).toHaveAttribute('data-language-mode', 'summary');

      const panelMetrics = await page.evaluate(() => {
        const panel = document.querySelector('#mobile-tools');
        const rect = panel?.getBoundingClientRect();
        return rect ? {
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          bottom: Math.round(rect.bottom),
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight,
          scrollHeight: panel.scrollHeight,
          clientHeight: panel.clientHeight,
        } : null;
      });

      expect(panelMetrics).not.toBeNull();
      expect(panelMetrics.left).toBeGreaterThanOrEqual(-1);
      expect(panelMetrics.right).toBeLessThanOrEqual(panelMetrics.viewportWidth + 1);
      expect(panelMetrics.clientHeight).toBeLessThanOrEqual(panelMetrics.viewportHeight);
      expect(panelMetrics.scrollHeight).toBeGreaterThanOrEqual(panelMetrics.clientHeight);
    });
  }
});
