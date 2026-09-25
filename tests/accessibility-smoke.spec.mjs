import { test, expect } from 'playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes = [
  { hash: '', marker: '#main-content' },
  { hash: '#quiz', marker: '#quiz' },
  { hash: '#eleitoral360', marker: '#eleitoral360' },
  { hash: '#acao', marker: '#acao' },
  { hash: '#transporte', marker: '#transporte' },
  { hash: '#exportacao', marker: '#exportacao' },
];

for (const route of routes) {
  test('acessibilidade crítica em ' + (route.hash || 'entrada'), async ({ page }) => {
    await page.goto('./');
    if (route.hash) {
      await page.evaluate(hash => {
        const id = hash.slice(1);
        window.history.replaceState(null, '', '#' + id);
        window.dispatchEvent(new CustomEvent('observatorio:navigate', { detail: id }));
      }, route.hash);
    }
    await expect(page.locator(route.marker)).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();
    const blockingViolations = results.violations.filter(
      violation => violation.impact === 'critical' || violation.impact === 'serious',
    );

    expect(
      blockingViolations,
      blockingViolations.map(violation => ({
        id: violation.id,
        impact: violation.impact,
        help: violation.help,
        nodes: violation.nodes.map(node => node.target),
      })),
    ).toEqual([]);
  });
}
