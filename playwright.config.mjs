import { defineConfig, devices } from 'playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 8_000 },
  fullyParallel: true,
  workers: process.env.CI ? 2 : undefined,
  reporter: 'line',
  use: {
    baseURL: 'http://127.0.0.1:4173/observatorio/',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    {
      name: 'chrome-desktop',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'chrome-a11y',
      testMatch: /a11y\.spec\.mjs/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox-desktop',
      testMatch: /(cross-browser-ui|critical-public-flows)\.spec\.mjs/,
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'safari-desktop',
      testMatch: /(cross-browser-ui|critical-public-flows)\.spec\.mjs/,
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'chrome-android',
      testMatch: /(cross-browser-ui|mobile-repagination|critical-public-flows)\.spec\.mjs/,
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'safari-iphone',
      testMatch: /(cross-browser-ui|mobile-repagination|critical-public-flows)\.spec\.mjs/,
      use: { ...devices['iPhone 14'] },
    },
    {
      name: 'safari-iphone-se',
      testMatch: /(cross-browser-ui|critical-public-flows)\.spec\.mjs/,
      use: { ...devices['iPhone SE'] },
    },
  ],
  webServer: {
    command: 'vite --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173/observatorio/',
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
