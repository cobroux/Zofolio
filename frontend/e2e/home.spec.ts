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

  test('clavier : « Parcours » ouvre le road book (Échap rend le focus, navigation)', async ({ page }) => {
    await page.goto('/fr/');
    const bar = page.getByRole('navigation', { name: 'Parcours' }).getByRole('button', { name: 'Parcours' });
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

  test('tabulation jusqu\'au contact : le focus ne passe jamais sous le bandeau (WCAG 2.4.11)', async ({ page }) => {
    await page.goto('/fr/');
    await page.waitForLoadState('networkidle');
    for (let i = 0; i < 200; i++) {
      await page.keyboard.press('Tab');
      const f = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement;
        const r = el.getBoundingClientRect();
        // Le bandeau est fixe : ses propres contrôles ne peuvent pas être masqués par lui.
        return { id: el.id, inBand: !!el.closest('app-tracking-band'), y: r.y, h: r.height, scrolled: scrollY > 0, desc: el.outerHTML.slice(0, 80) };
      });
      if (!f.inBand) {
        // En haut de page rien n'est fixe au-dessus ; la barre de chapitre (48 px) n'existe qu'une fois la page défilée.
        if (f.scrolled) expect(f.y, f.desc).toBeGreaterThanOrEqual(48);
        expect(f.y + f.h, f.desc).toBeLessThanOrEqual(844 - 76);
      }
      if (f.id === 'c-name') return;
    }
    throw new Error('formulaire de contact jamais atteint au clavier');
  });
});

test('clavier : rail de checkpoints (desktop)', async ({ page }) => {
  await page.goto('/fr/');
  const links = page.getByRole('navigation', { name: 'Parcours' }).getByRole('link');
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

for (const motion of ['reduce', 'no-preference'] as const) {
  test(`ligne de pointage repliée : le contenu juste au-dessus du bandeau reste cliquable (${motion})`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: motion });
    await page.goto('/fr/');
    await page.waitForLoadState('networkidle');
    const top = (await page.locator('app-tracking-band .band').boundingBox())!.y;
    for (const y of [top - 2, top - 12, top - 22]) {
      expect(await page.evaluate((y) => !!document.elementFromPoint(200, y)?.closest('app-tracking-band'), y)).toBe(false);
    }
  });
}

test.describe('bandeau desktop 1440', () => {
  test.use({ viewport: { width: 1440, height: 900 } });
  test('collé en bas, 52 px, km 0,0 en haut puis 79,4 en bas de page', async ({ page }) => {
    await page.goto('/fr/');
    const band = page.locator('app-tracking-band .band');
    const km = band.locator('.values .km');
    await expect(km).toContainText('0,0');
    const b = (await band.boundingBox())!;
    expect(Math.round(b.y + b.height)).toBe(900);
    expect(Math.round(b.height)).toBe(52);
    expect(await band.locator('.values').evaluate((e) => e.scrollWidth <= e.clientWidth)).toBe(true);
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
    await expect(km).toContainText('79,4');
  });
});

for (const width of [320, 360, 390, 767, 768, 1099, 1100, 1440, 1920]) {
  test(`couverture ${width} px : nom sur deux lignes max, dossard qui chevauche le bas du portrait`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/fr/');
    await page.evaluate(() => document.fonts.ready);
    const h1 = page.locator('#depart h1');
    const lines = await h1.evaluate((e) => Math.round(e.getBoundingClientRect().height / parseFloat(getComputedStyle(e).lineHeight)));
    expect(lines).toBe(width < 768 ? 2 : 1);
    expect(await h1.evaluate((e) => e.scrollWidth <= e.clientWidth)).toBe(true);
    const img = (await page.locator('#depart picture').boundingBox())!;
    const bib = (await page.locator('#depart app-bib').boundingBox())!;
    expect(bib.y).toBeLessThan(img.y + img.height);
    expect(bib.y + bib.height).toBeGreaterThan(img.y + img.height);
    expect(bib.x).toBeGreaterThanOrEqual(0);
    expect(bib.x + bib.width).toBeLessThanOrEqual(width);
    // Objet 5:3 : si le texte force la hauteur, les trous d'épingle (en %) quittent les coins.
    expect(Math.abs(bib.width / bib.height - 5 / 3), `ratio ${bib.width}x${bib.height}`).toBeLessThan(0.03);
    const race = (await page.locator('#depart app-bib .race').boundingBox())!;
    expect(race.x).toBeGreaterThanOrEqual(bib.x);
    expect(race.y).toBeGreaterThanOrEqual(bib.y);
    expect(race.x + race.width).toBeLessThanOrEqual(bib.x + bib.width);
    expect(race.y + race.height).toBeLessThanOrEqual(bib.y + bib.height);
  });
}

test('P1 compacte : un lien par projet d’école de l’API, le badge, ni toge ni image cassée', async ({ page, request }) => {
  const home = await (await request.get('/api/fr/home')).json();
  const school: { title: string }[] = home.projects.filter((p: { stage: string }) => p.stage === 'P1');
  expect(school.length).toBeGreaterThan(0);
  await page.goto('/fr/');
  const index = page.locator('#p1 .index a');
  await expect(index).toHaveCount(school.length);
  for (const p of school) await expect(index.filter({ hasText: p.title })).toHaveCount(1);
  await expect(page.locator('#p1 .badge img[src*="badge-promo-ili"]')).toBeVisible();
  // Aucune photo de toge (retirée, spec §5 bis) et aucune image cassée une fois chargées (lazy).
  await page.locator('#p1').scrollIntoViewIfNeeded();
  const imgs = page.locator('#p1 img');
  expect(await imgs.count()).toBe(2);
  for (const img of await imgs.all()) {
    await img.scrollIntoViewIfNeeded();
    expect(await img.getAttribute('src')).not.toMatch(/toge|diplome|remise|ceremonie/i);
    await expect.poll(() => img.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
  }
});

test('P2 : la section Décision précède les plaques', async ({ page }) => {
  await page.goto('/fr/');
  await expect(page.locator('#p2 section').filter({ has: page.getByRole('heading', { level: 3, name: 'Décision' }) })).toHaveCount(1);
  const before = await page.evaluate(() => {
    const d = document.querySelector('#p2 app-decision-card section');
    const p = document.querySelector('#p2 app-photo-plates');
    return !!d && !!p && !!(d.compareDocumentPosition(p) & Node.DOCUMENT_POSITION_FOLLOWING);
  });
  expect(before).toBe(true);
});

test.describe('P2 desktop 1440', () => {
  test.use({ viewport: { width: 1440, height: 900 } });
  test('le chapitre P2 reste visible pendant qu’on scrolle dans l’étape', async ({ page }) => {
    await page.goto('/fr/');
    const p2 = page.locator('#p2');
    const pin = p2.locator('app-chapter-pin');
    const { top, height } = await p2.evaluate((e) => ({ top: e.getBoundingClientRect().top + scrollY, height: e.offsetHeight }));
    const ys: number[] = [];
    for (const f of [0.3, 0.6]) {
      await page.evaluate((y) => scrollTo(0, y), top + height * f);
      const b = (await pin.boundingBox())!;
      expect(b.y).toBeGreaterThanOrEqual(0);
      expect(b.y + b.height).toBeLessThanOrEqual(900 - 52); // au-dessus du bandeau
      ys.push(Math.round(b.y));
    }
    expect(ys[0]).toBe(ys[1]); // épinglé : même position à deux hauteurs de scroll
  });
});
