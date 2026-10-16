import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

for (const path of ['/fr/colophon', '/en/colophon']) {
  for (const scheme of ['light', 'dark'] as const) {
    test(`axe ${path} (${scheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      const { violations } = await new AxeBuilder({ page }).analyze();
      expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(' | ')}`)).toEqual([]);
    });
  }
}

test('colophon mobile : scores en 3 blocs, pas de tableau des scores (DESIGN §11.2)', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await page.goto('/fr/colophon');
  await expect(page.locator('.lh-block')).toHaveCount(3);
  await expect(page.locator('.lh-block').first()).toBeVisible();
  await expect(page.locator('table.lh-table')).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await ctx.close();
});
