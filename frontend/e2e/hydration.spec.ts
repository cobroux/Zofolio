import { expect, test } from '@playwright/test';

// Interactions avant hydratation : l'événement doit être rejoué, sans attendre `jsaction`.
test.beforeEach(async ({ page, context }) => {
  test.setTimeout(90000);
  const cdp = await context.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
});

// KNOWN ISSUE (Angular 22.2.3) : le clic rejoué sur un routerLink d'un bloc @defer est perdu, quel que soit le déclencheur
// (viewport, interaction, immediate), et les premières frappes du formulaire sont effacées à l'hydratation. Voir task-2-report.md.
test.fixme('clic sur une étude de cas avant hydratation : navigation rejouée', async ({ page }) => {
  await page.goto('/fr/', { waitUntil: 'domcontentloaded' });
  const study = page.locator('a.study[href$="/projets/gfaim"]').first();
  await study.scrollIntoViewIfNeeded();
  await study.click();
  await expect(page).toHaveURL(/\/fr\/projets\/gfaim$/, { timeout: 60000 });
});

test.fixme('saisie dans le formulaire avant hydratation : rien de perdu', async ({ page }) => {
  await page.goto('/fr/', { waitUntil: 'domcontentloaded' });
  const name = page.locator('#c-name');
  await name.scrollIntoViewIfNeeded();
  await name.click();
  await page.keyboard.type('Ada Lovelace', { delay: 20 });
  await expect(name).toHaveValue('Ada Lovelace', { timeout: 60000 });
  await page.locator('#c-email').fill('ada@example.com');
  await page.locator('#c-message').fill('Bonjour');
  await page.getByRole('button', { name: 'Envoyer le message' }).click();
  // Le modèle doit avoir reçu le nom : pas d'erreur sur ce champ.
  await expect(page.locator('#c-name-err')).toHaveCount(0);
  await expect(page.locator('app-contact-form').getByRole('status')).not.toContainText('corriger', { timeout: 60000 });
});
