import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'npm --prefix .sut run server',
      url: 'http://127.0.0.1:3001/api/services',
      name: 'Reliability API',
      timeout: 120_000,
      reuseExistingServer: false,
    },
    {
      command: 'npm --prefix .sut run dev -- --strictPort',
      url: 'http://127.0.0.1:3000',
      name: 'Reliability UI',
      timeout: 120_000,
      reuseExistingServer: false,
    },
  ],
});
