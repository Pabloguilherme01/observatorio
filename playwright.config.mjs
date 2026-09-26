import { defineConfig, devices } from 'playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,
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
      name: 'firefox-desktop',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'safari-desktop',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'chrome-android',
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'safari-iphone',
      use: { ...devices['iPhone 14'] },
    },
    {
      name: 'safari-iphone-se',
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
