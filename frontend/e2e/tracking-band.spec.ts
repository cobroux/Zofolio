import { expect, test } from '@playwright/test';

const KM = { p1: 20, p2: 44, p3: 58.2, arrivee: 79.41 } as const;
const PASS = { p1: 'P1', p2: 'P2', p3: 'P3', arrivee: 'Arrivée' } as const;
const SIZES = [
  { w: 1440, h: 900 },
  { w: 390, h: 844 },
];

for (const { w, h } of SIZES) {
  test(`bandeau : km affiché = pointage quand la section atteint la ligne de lecture (${w}x${h})`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await page.goto('/fr/');
    await page.waitForLoadState('networkidle');
    for (const [id, km] of Object.entries(KM)) {
      // Ligne de lecture du bandeau : un tiers du viewport. On amène le haut de la section dessus.
      await page.evaluate(([i, hh]) => {
        const top = document.getElementById(i as string)!.getBoundingClientRect().top + scrollY;
        scrollTo({ top: Math.min(top - (hh as number) / 3, document.documentElement.scrollHeight - (hh as number)), behavior: 'instant' });
      }, [id, h]);
      await page.waitForTimeout(250);
      const shown = await page.evaluate(() =>
        parseFloat(document.querySelector('.values[aria-hidden="true"] .km .v')!.textContent!.replace(',', '.')),
      );
      expect(Math.abs(shown - km), `${id}: ${shown} vs ${km}`).toBeLessThanOrEqual(0.5);
      // Dernier temps de passage cohérent avec le km, et pointage annoncé dans la région live.
      await expect(page.locator('.values[aria-hidden="true"] .stat').last().locator('.l')).toHaveText(PASS[id as keyof typeof PASS]);
      await expect(page.locator('app-tracking-band [aria-live="polite"]')).toContainText(PASS[id as keyof typeof PASS]);
    }
  });
}

for (const { w, h } of SIZES) {
  test(`bandeau : un saut d'ancre (#pN) affiche le km du pointage (${w}x${h})`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await page.goto('/fr/');
    await page.waitForLoadState('networkidle');
    for (const [id, km] of Object.entries(KM)) {
      await page.evaluate((i) => (location.hash = i), id);
      // Le défilement d'ancre peut être animé : on lit le km une fois le scroll arrêté.
      let last = -1;
      await expect.poll(async () => { const y = await page.evaluate(() => scrollY); const same = y === last; last = y; return same; }, { intervals: [200] }).toBe(true);
      const shown = await page.evaluate(() =>
        parseFloat(document.querySelector('.values[aria-hidden="true"] .km .v')!.textContent!.replace(',', '.')),
      );
      expect(Math.abs(shown - km), `${id}: ${shown} vs ${km}`).toBeLessThanOrEqual(0.5);
      // Dernier temps de passage cohérent avec le km, et pointage annoncé dans la région live.
      await expect(page.locator('.values[aria-hidden="true"] .stat').last().locator('.l')).toHaveText(PASS[id as keyof typeof PASS]);
      await expect(page.locator('app-tracking-band [aria-live="polite"]')).toContainText(PASS[id as keyof typeof PASS]);
    }
  });
}
