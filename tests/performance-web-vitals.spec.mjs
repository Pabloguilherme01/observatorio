import { test, expect } from 'playwright/test';

test.describe('performance budgets · Chrome desktop', () => {
  test('mede LCP, CLS, FCP e latência de interação em laboratório', async ({ page }) => {
    const metrics = await page.evaluate(() => {
      window.__obsPerf = { lcp: 0, cls: 0, fcp: 0, longTasks: 0 };
      try {
        new PerformanceObserver(list => {
          const entries = list.getEntries();
          const last = entries.at(-1);
          if (last) window.__obsPerf.lcp = last.startTime;
        }).observe({ type: 'largest-contentful-paint', buffered: true });
      } catch {}
      try {
        new PerformanceObserver(list => {
          window.__obsPerf.cls += list.getEntries().reduce((sum, entry) => sum + (entry.hadRecentInput ? 0 : entry.value), 0);
        }).observe({ type: 'layout-shift', buffered: true });
      } catch {}
      try {
        new PerformanceObserver(list => {
          const first = list.getEntries()[0];
          if (first) window.__obsPerf.fcp = first.startTime;
        }).observe({ type: 'paint', buffered: true });
        const paints = performance.getEntriesByName('first-contentful-paint');
        if (paints[0]) window.__obsPerf.fcp = paints[0].startTime;
      } catch {}
      try {
        new PerformanceObserver(list => {
          window.__obsPerf.longTasks += list.getEntries().length;
        }).observe({ type: 'longtask', buffered: true });
      } catch {}
    });

    const navigation = page.goto('./');
    await navigation;
    await expect(page.locator('#root')).toBeVisible();
    await page.waitForTimeout(1500);

    await page.getByRole('button', { name: 'Buscar no observatório' }).first().click();
    const input = page.getByRole('combobox').first();
    const interactionStart = Date.now();
    await input.fill('transporte');
    await expect(page.getByText(/Simulador de bolso/i).first()).toBeVisible();
    const interactionMs = Date.now() - interactionStart;

    const vitals = await page.evaluate(() => ({
      lcp: Math.round(window.__obsPerf?.lcp || 0),
      cls: Number((window.__obsPerf?.cls || 0).toFixed(3)),
      fcp: Math.round(window.__obsPerf?.fcp || 0),
      longTasks: window.__obsPerf?.longTasks || 0,
    }));

    console.log(JSON.stringify({ ...vitals, interactionMs }, null, 2));
    expect(vitals.fcp).toBeLessThan(5000);
    expect(vitals.lcp).toBeGreaterThan(0);
    expect(vitals.lcp).toBeLessThan(8000);
    expect(vitals.cls).toBeLessThan(0.25);
    expect(interactionMs).toBeLessThan(1000);
    expect(vitals.longTasks).toBeLessThan(80);
  });
});
