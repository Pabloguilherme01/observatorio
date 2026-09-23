import { defineConfig, devices } from '@playwright/test';

const viewports = [
  { name: '360x800', viewport: { width: 360, height: 800 } },
  { name: '390x844', viewport: { width: 390, height: 844 } },
  { name: '430x932', viewport: { width: 430, height: 932 } },
  { name: '768x1024', viewport: { width: 768, height: 1024 } },
  { name: '1440x900', viewport: { width: 1440, height: 900 } },
] as const;

export default defineConfig({
  testDir: 'tests',
  timeout: 60_000,
  expect: {
    timeout: 10_000,
    toHaveScreenshot: { animations: 'disabled', maxDiffPixelRatio: 0.001 },
  },
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['github'], ['json', { outputFile: 'test-results/playwright-report.json' }]] : [['list']],
  outputDir: 'test-results',
  use: {
    baseURL: 'http://127.0.0.1:4173/observatorio/',
    actionTimeout: 15_000,
    navigationTimeout: 45_000,
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    ...devices['Desktop Chrome'],
  },
  projects: viewports.map(({ name, viewport }) => ({ name, use: { viewport } })),
  webServer: {
    command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173/observatorio/',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
