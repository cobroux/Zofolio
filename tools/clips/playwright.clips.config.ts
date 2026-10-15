import { defineConfig } from '@playwright/test';

// Hors du testDir E2E (frontend/e2e) et de la CI : lancé à la main, voir README.md.
export default defineConfig({
  testDir: '.',
  testMatch: '*.clip.ts',
  workers: 1,
  timeout: 90_000,
  reporter: 'list',
  outputDir: process.env['CLIPS_OUT'] ?? './out',
  use: {
    viewport: { width: 1280, height: 800 },
    video: { mode: 'on', size: { width: 1280, height: 800 } },
    locale: 'fr-FR',
    timezoneId: 'Europe/Paris',
  },
});
