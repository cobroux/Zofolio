import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('thème : bascule sans flash, conservée au rechargement', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  // data-theme doit être posé avant tout rendu (script inline) : on l'observe dès le premier DOMContentLoaded.
  await page.goto('/fr/');
  const toggle = page.locator('app-theme-toggle button');
  const root = page.locator('html');
  await toggle.click(); // système -> clair
  await toggle.click(); // -> sombre
  await expect(root).toHaveAttribute('data-theme', 'dark');
  const bg = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  const dark = await bg();
  await page.addInitScript(() => {
    document.addEventListener('DOMContentLoaded', () => ((window as any).__t = document.documentElement.dataset['theme']));
  });
  await page.reload();
  expect(await page.evaluate(() => (window as any).__t)).toBe('dark'); // pas de flash clair
  expect(await bg()).toBe(dark);
});

test.describe('locale', () => {
  test.use({ extraHTTPHeaders: { 'Accept-Language': 'en-US' } });
  test('/ suit Accept-Language', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/en\/$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });
});

test('bascule FR/EN : garde le chemin, /en/ est servi sans redirection', async ({ page }) => {
  await page.goto('/fr/mentions-legales');
  await page.getByRole('link', { name: /version anglaise/ }).click();
  await expect(page).toHaveURL(/\/en\/mentions-legales$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('link[hreflang="fr"]')).toHaveAttribute('href', /\/fr\/mentions-legales$/);
  await expect(page.locator('link[hreflang="x-default"]')).toHaveCount(1);
});

test('404', async ({ page }) => {
  const res = await page.goto('/fr/inexistant');
  expect(res?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/introuvable/i);
});

test.describe('mobile 390x844', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test('clavier : road book (ouverture, Échap, navigation)', async ({ page }) => {
    await page.goto('/fr/');
    const bar = page.getByRole('button', { name: /road book|km/i }).first();
    await bar.focus();
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(bar).toBeFocused();
    await page.keyboard.press('Enter');
    await dialog.getByRole('link').nth(2).focus();
    await page.keyboard.press('Enter');
    await expect(dialog).toBeHidden();
    await expect(page).toHaveURL(/#p\d|#journal|#arrivee/);
  });
});

test('clavier : rail de checkpoints (desktop)', async ({ page }) => {
  await page.goto('/fr/');
  const links = page.getByRole('navigation', { name: 'Profil de la course' }).getByRole('link');
  expect(await links.count()).toBeGreaterThanOrEqual(5);
  await links.nth(2).focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#(p\d|journal|arrivee)/);
});

test('sans JavaScript : sections lisibles', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false, baseURL: 'http://localhost:4000' });
  const page = await ctx.newPage();
  await page.goto('/fr/');
  for (const id of ['depart', 'p1', 'p2', 'p3', 'journal', 'arrivee']) await expect(page.locator(`#${id}`)).toBeVisible();
  await ctx.close();
});

for (const path of ['/fr/', '/en/', '/fr/mentions-legales']) {
  for (const scheme of ['light', 'dark'] as const) {
    test(`axe ${path} (${scheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      // reveal : forcer l'état final pour que le contraste soit mesuré sur le rendu définitif
      await page.addStyleTag({ content: '*{transition:none!important;animation:none!important}' });
      const { violations } = await new AxeBuilder({ page }).analyze();
      expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(' | ')}`)).toEqual([]);
    });
  }
}
