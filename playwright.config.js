import { defineConfig } from '@playwright/test';

const PORT = process.env.PORT ?? 3000;

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  reporter: [['list']],
  use: { baseURL: `http://127.0.0.1:${PORT}`, trace: 'retain-on-failure' },
  webServer: {
    command: 'node src/web.js',
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: !process.env.CI,
    env: { PORT: String(PORT) },
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
});
