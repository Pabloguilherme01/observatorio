import { test, expect } from 'playwright/test';

async function assertNoHorizontalOverflow(page) {
  const metrics = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    documentWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.scrollWidth,
  }));
  expect(metrics.documentWidth).toBeLessThanOrEqual(metrics.viewport + 1);
  expect(metrics.bodyWidth).toBeLessThanOrEqual(metrics.viewport + 1);

  const overflow = await page.evaluate(() => {
    const selectors = [
      'h1','h2','h3','p','a','button',
      '.hero-shell','.hero-election-card','.audience-page-card',
      '.audience-topic','.audience-action-card','.audience-resource',
      '.official-hub','.official-resource-card','.summary-shell',
      '.trust-shell','.quiz-shell','.mobile-bottom-nav'
    ];
    const nodes = Array.from(document.querySelectorAll(selectors.join(',')));
    return nodes
      .filter(node => {
        const el = node;
        const style = getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden') return false;
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.right > window.innerWidth + 1;
      })
      .slice(0, 20)
      .map(el => ({ tag: el.tagName, cls: el.className, right: Math.round(el.getBoundingClientRect().right) }));
  });
  expect(overflow).toEqual([]);
}

test.describe('mobile repagination', () => {
  for (const viewport of [
    { width: 390, height: 844, name: '390px' },
    { width: 375, height: 812, name: '375px' },
  ]) {
    test(`layouta em ${viewport.name} sem cortes ou overflow`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('./');
      await expect(page.locator('#main-content')).toBeVisible();

      await assertNoHorizontalOverflow(page);

      const nav = page.locator('.mobile-bottom-nav');
      await expect(nav).toBeVisible();
      await expect(nav.locator('button')).toHaveCount(5);

      const clippedLabels = await nav.locator('button span').evaluateAll(spans =>
        spans.map(span => ({
          text: span.textContent?.trim() ?? '',
          scrollWidth: span.scrollWidth,
          clientWidth: span.clientWidth,
        })).filter(item => item.scrollWidth > item.clientWidth + 1),
      );
      expect(clippedLabels).toEqual([]);

      for (const hash of ['descubra', 'acao', 'quiz']) {
        await page.evaluate(id => {
          window.history.replaceState(null, '', '#' + id);
          window.dispatchEvent(new CustomEvent('observatorio:navigate', { detail: id }));
        }, hash);
        await expect(page.locator('#' + hash)).toBeVisible();
        await page.waitForTimeout(150);
        await assertNoHorizontalOverflow(page);
      }
    });
  }
});
