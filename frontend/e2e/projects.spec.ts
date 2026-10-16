import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { execSync } from 'node:child_process';

const SLUGS = ['oltre', 'zotracker', 'gfaim', 'trading-app'];
const LANGS = ['fr', 'en'] as const;

for (const lang of LANGS) {
  for (const slug of SLUGS) {
    test(`accueil -> étude de cas ${slug} (${lang})`, async ({ page }) => {
      await page.goto(`/${lang}/`);
      await page.locator(`a.study[href$="/projets/${slug}"]`).first().click();
      await expect(page).toHaveURL(new RegExp(`/${lang}/projets/${slug}$`));
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(page.locator('html')).toHaveAttribute('lang', lang);
    });
  }
}

test('bascule FR/EN sur une étude de cas : garde le chemin', async ({ page }) => {
  await page.goto('/fr/projets/oltre');
  await page.getByRole('link', { name: /version anglaise/ }).click();
  await expect(page).toHaveURL(/\/en\/projets\/oltre$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('slug inconnu : 404 noindex', async ({ page }) => {
  const res = await page.goto('/fr/projets/inconnu');
  expect(res?.status()).toBe(404);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
});

test('CV EN : servi par /api/en/cv, téléchargé sous le nom EN', async ({ page }) => {
  const res = await page.request.get('/api/en/cv');
  expect(res.status()).toBe(200);
  expect(res.headers()['content-disposition']).toContain('Enzo-Leveque-CV-EN.pdf');
  await page.goto('/en/');
  const [download] = await Promise.all([page.waitForEvent('download'), page.locator('a[href$="/api/en/cv"]').first().click()]);
  expect(download.suggestedFilename()).toBe('Enzo-Leveque-CV-EN.pdf');
});

test('clip : affiche, lecture dans le viewport, Pause puis Lecture au clic', async ({ page }) => {
  await page.goto('/fr/projets/oltre');
  const clip = page.locator('app-clip');
  // l'affiche est soit l'img placeholder, soit la <video> si le @defer s'est déjà déclenché (viewport)
  await expect(clip.locator('img, video').first()).toBeVisible();
  await clip.scrollIntoViewIfNeeded();
  const video = clip.locator('video');
  const playing = () => video.evaluate((v: HTMLVideoElement) => !v.paused);
  await expect.poll(playing).toBe(true); // lecture auto (play) au passage dans le viewport
  await clip.getByRole('button', { name: 'Pause' }).click();
  await expect.poll(playing).toBe(false);
  await clip.getByRole('button', { name: 'Lecture' }).click();
  await expect.poll(playing).toBe(true);
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('clip : pas de lecture automatique, bouton Lecture présent', async ({ page }) => {
    await page.goto('/fr/projets/oltre');
    await page.locator('app-clip').scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);
    const playing = await page.locator('app-clip video').evaluateAll((vs) => vs.some((v) => !(v as HTMLVideoElement).paused));
    expect(playing).toBe(false);
    await expect(page.locator('app-clip').getByRole('button', { name: 'Lecture' })).toBeVisible();
  });
});

test('sans JavaScript : étude de cas lisible', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false, baseURL: 'http://localhost:4000' });
  const page = await ctx.newPage();
  await page.goto('/fr/projets/oltre');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Oltre');
  await expect(page.locator('#h-pb')).toBeVisible();
  await expect(page.locator('#h-dec')).toBeVisible();
  await ctx.close();
});

const paths = LANGS.flatMap((l) => [`/${l}/`, ...SLUGS.map((s) => `/${l}/projets/${s}`)]);
for (const path of paths) {
  for (const scheme of ['light', 'dark'] as const) {
    test(`axe ${path} (${scheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      await page.addStyleTag({ content: '*{transition:none!important;animation:none!important}' });
      const { violations } = await new AxeBuilder({ page }).analyze();
      expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(' | ')}`)).toEqual([]);
    });
  }
}

// Dernier du fichier : arrête puis relance le back (docker compose à la racine).
test('API arrêtée : 503 + Retry-After, pas de noindex', async ({ page }) => {
  test.setTimeout(180_000);
  const dc = (cmd: string) => execSync(`docker compose ${cmd}`, { cwd: '..', stdio: 'ignore' });
  dc('stop backend');
  try {
    for (const [lang, msg] of [['fr', 'Contenu momentanément indisponible'], ['en', 'Content temporarily unavailable']]) {
      const res = await page.goto(`/${lang}/projets/oltre`);
      expect(res?.status()).toBe(503);
      expect(res?.headers()['retry-after']).toBeTruthy();
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(msg);
      await expect(page.locator('meta[name="robots"]')).not.toHaveAttribute('content', /noindex/);
    }
  } finally {
    dc('start backend');
    await expect.poll(async () => (await page.request.get('/api/fr/home')).status(), { timeout: 120_000, intervals: [2000] }).toBe(200);
  }
});
