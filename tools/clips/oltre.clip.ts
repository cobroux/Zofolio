import { test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { showCursor, glideClick } from './cursor';

// Pré-requis : stack oltre-demo démarrée, puis `node oltre-seed.mjs $OLTRE_AUTH` (voir README.md).
const base = process.env['OLTRE_URL'] ?? 'http://localhost:4210';
const auth = readFileSync(process.env['OLTRE_AUTH'] ?? '/dev/null', 'utf8');

test('clip oltre', async ({ page }) => {
  await page.addInitScript((a) => localStorage.setItem('oltre_token', a), auth);
  await showCursor(page);
  await page.goto(`${base}/expenses`);
  await page.waitForLoadState('networkidle');
  await page.mouse.move(640, 400);
  await page.waitForTimeout(3500); // dépenses
  await page.mouse.wheel(0, 500);
  await page.waitForTimeout(2000);
  for (const [href, ms] of [['/tasks', 4500], ['/calendar', 5000], ['/food', 5000]] as const) {
    await glideClick(page, `a.nav-item[href="${href}"]`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(ms);
  }
});
