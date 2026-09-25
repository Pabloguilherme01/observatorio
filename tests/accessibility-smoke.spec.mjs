import { test, expect } from 'playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('não possui violações críticas ou graves de acessibilidade na experiência inicial', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('#root')).toBeVisible();

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
