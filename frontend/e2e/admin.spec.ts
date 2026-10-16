import AxeBuilder from '@axe-core/playwright';
import { expect, Page, test } from '@playwright/test';

// Le mot de passe de test vient de l'environnement (jamais écrit dans un fichier) ; la CI génère son propre hash.
const PASSWORD = process.env['ADMIN_E2E_PASSWORD'] ?? '';

/** Ouvre le formulaire d'Oltre une fois ses données chargées (sinon on lirait un champ encore vide). */
async function openOltre(page: Page) {
  await page.goto('/fr/admin/projets/oltre');
  await expect(page.getByLabel('Slug')).toHaveValue('oltre');
}

async function login(page: Page) {
  await page.goto('/fr/admin/connexion');
  await page.getByLabel('Mot de passe').fill(PASSWORD);
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Projets' })).toBeVisible();
}

test('admin : sans session, la garde renvoie à la connexion ; noindex', async ({ page }) => {
  await page.goto('/fr/admin/projets');
  await expect(page).toHaveURL(/\/fr\/admin\/connexion/);
  await expect(page.getByRole('heading', { level: 1, name: 'Connexion' })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  expect(await page.locator('app-header').count()).toBe(0);
  expect((await (await page.request.get('/robots.txt')).text())).toContain('Disallow: /fr/admin');
});

test.describe('admin connecté', () => {
  test.skip(!PASSWORD, 'ADMIN_E2E_PASSWORD absent');

  test('mauvais mot de passe : erreur claire, pas de session', async ({ page }) => {
    await page.goto('/fr/admin/connexion');
    await page.getByLabel('Mot de passe').fill('pas-le-bon-mot-de-passe');
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await expect(page.getByRole('alert')).toContainText('Mot de passe incorrect.');
    await page.goto('/fr/admin/projets');
    await expect(page).toHaveURL(/\/connexion/);
  });

  test('connexion, liste des projets accessible, déconnexion', async ({ page }) => {
    await login(page);
    await expect(page.getByRole('table')).toContainText('oltre');
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await page.emulateMedia({ colorScheme: 'dark' });
    await openOltre(page);
    expect((await new AxeBuilder({ page }).analyze()).violations.map((v) => v.id)).toEqual([]);
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/fr/admin/projets');
    await page.getByRole('button', { name: 'Déconnexion' }).click();
    await expect(page).toHaveURL(/\/connexion/);
    await page.goto('/fr/admin/projets');
    await expect(page).toHaveURL(/\/connexion/);
  });

  test('modifier un projet : aperçu, enregistrer, visible sur le site (FR), puis restauré', async ({ page }) => {
    await login(page);
    await openOltre(page);
    const pitch = page.getByLabel('Accroche').first();
    const original = await pitch.inputValue();
    const marker = `${original} [e2e ${Date.now()}]`;
    try {
      await pitch.fill(marker);
      await page.getByRole('button', { name: 'Aperçu FR' }).click();
      const dialog = page.getByRole('dialog', { name: 'Aperçu du projet' });
      await expect(dialog).toContainText(marker);
      await expect(dialog).toContainText('non enregistré');
      await page.keyboard.press('Escape');
      await expect(dialog).toBeHidden();
      // avant l'enregistrement, le site public n'a pas bougé
      expect(await (await page.request.get('/api/fr/projects/oltre')).text()).not.toContain(marker);
      await page.getByRole('button', { name: /^Enregistrer/ }).click();
      await expect(page.getByRole('status').filter({ hasText: 'Enregistré' })).toBeVisible();
      await page.goto('/fr/projets/oltre');
      await expect(page.locator('.lead')).toContainText(marker);
    } finally {
      await openOltre(page);
      await page.getByLabel('Accroche').first().fill(original);
      await page.getByRole('button', { name: /^Enregistrer/ }).click();
      await expect(page.getByRole('status').filter({ hasText: 'Enregistré' })).toBeVisible();
    }
  });

  test('validation : le récapitulatif pointe le champ et le focus y va', async ({ page }) => {
    await login(page);
    await openOltre(page);
    const meta = page.getByLabel('Description de la page').first();
    const original = await meta.inputValue();
    await meta.fill('x'.repeat(161));
    await page.getByRole('button', { name: /^Enregistrer/ }).click();
    const summary = page.getByRole('alert').filter({ hasText: 'Description de la page (français) : 160 caractères maximum.' });
    await expect(summary).toBeFocused();
    await summary.getByRole('link').click();
    await expect(meta).toBeFocused();
    await expect(meta).toHaveAttribute('aria-invalid', 'true');
    await meta.fill(original);
  });

  test('upload refusé : la raison du back est expliquée', async ({ page }) => {
    await login(page);
    await page.getByRole('link', { name: 'Médias' }).click();
    await page.getByLabel('Choisir un fichier').setInputFiles({ name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('pas une image') });
    await expect(page.getByRole('alert').filter({ hasText: 'Type refusé' })).toBeVisible();
    await page.getByLabel('Choisir un fichier').setInputFiles({ name: 'faux.mp4', mimeType: 'video/mp4', buffer: Buffer.from('pas une vidéo') });
    await expect(page.getByRole('alert').filter({ hasText: 'Type refusé' })).toBeVisible();
  });

  test('stats : une année saisie apparaît dans le Journal (SSR), puis disparaît', async ({ page }) => {
    await login(page);
    await page.getByRole('link', { name: 'Stats' }).click();
    await page.getByLabel('Année', { exact: true }).fill('2001');
    await page.getByLabel('Kilomètres').fill('1234');
    await page.getByRole('button', { name: 'Enregistrer' }).click();
    await expect(page.getByRole('status').filter({ hasText: '2001 enregistrée' })).toBeVisible();
    try {
      const html = await (await page.request.get('/fr/')).text(); // rendu serveur, sans JS
      expect(html).toContain('Les années en chiffres');
      expect(html).toMatch(/1\s234/);
    } finally {
      await page.getByRole('button', { name: /^Supprimer 2001/ }).click();
      await page.getByRole('button', { name: /^Confirmer/ }).click();
      await expect(page.getByRole('status').filter({ hasText: '2001 supprimée' })).toBeVisible();
    }
    expect(await (await page.request.get('/fr/')).text()).not.toMatch(/1\s234/); // les années semées (Garmin) restent
  });
});
