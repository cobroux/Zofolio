import { execSync } from 'node:child_process';
import { expect, test } from '@playwright/test';

const MAILPIT = 'http://localhost:8025/api/v1/messages';
const body = (n: number) => ({ name: 'Ada E2E', email: `ada${n}@example.com`, company: '', message: `Bonjour ${n}`, website: '' });

// Remet le quota à zéro (relances locales) ; nécessite docker compose.
test.beforeAll(() => {
  execSync(`docker compose exec -T postgres sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "TRUNCATE contact_message"'`, { cwd: '..' });
});

test('contact : e-mail reçu dans Mailpit, puis 6e envoi refusé (429)', async ({ page, request }) => {
  await request.delete(MAILPIT);
  await page.goto('/fr/');
  const form = page.locator('app-contact-form');
  await form.locator('#c-name').fill('Ada E2E');
  await form.locator('#c-email').fill('ada0@example.com');
  await form.locator('#c-message').fill('Message de test E2E');
  await form.getByRole('button', { name: 'Envoyer le message' }).click();
  await expect(form.getByRole('status')).toContainText('Message envoyé');
  await expect.poll(async () => JSON.stringify(await (await request.get(MAILPIT)).json())).toContain('Ada E2E');

  // On consomme le quota (5 envois par IP et par heure) via l'API.
  for (let i = 1; i <= 4; i++) expect((await request.post('/api/contact', { data: body(i) })).status()).toBeLessThan(300);

  await form.locator('#c-name').fill('Ada E2E');
  await form.locator('#c-email').fill('ada5@example.com');
  await form.locator('#c-message').fill('6e message');
  const [res] = await Promise.all([
    page.waitForResponse((r) => r.url().includes('/api/contact')),
    form.getByRole('button', { name: 'Envoyer le message' }).click(),
  ]);
  expect(res.status()).toBe(429);
  await expect(form.getByRole('status')).toContainText('Trop de messages');
});
