import { defineConfig, devices } from '@playwright/test';

// Cible la stack docker compose (Caddy). `localhost` et non 127.0.0.1 : le SSR n'autorise que cet hôte (angular.json).
export default defineConfig({
  testDir: './e2e',
  workers: 1, // la limite de débit du contact est partagée
  retries: process.env['CI'] ? 1 : 0,
  reporter: process.env['CI'] ? 'github' : 'list',
  use: { baseURL: process.env['BASE_URL'] ?? 'http://localhost:4000', trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
