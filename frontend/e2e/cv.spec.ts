import { expect, test } from '@playwright/test';

test('accueil -> téléchargement du CV (PDF)', async ({ page }) => {
  await page.goto('/fr/');
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('link', { name: 'Télécharger le CV' }).first().click(),
  ]);
  expect(download.suggestedFilename()).toBe('Enzo-Leveque-CV-FR.pdf');
  const res = await page.request.get('/api/fr/cv');
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toContain('application/pdf');
  expect((await res.body()).subarray(0, 4).toString()).toBe('%PDF');
});
