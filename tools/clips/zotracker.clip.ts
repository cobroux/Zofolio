import { test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { showCursor, glideClick } from './cursor';

// Pré-requis : stack zotracker-demo démarrée (voir README.md). Env : ADMIN_PASSWORD, GPX (tracé officiel du GTA,
// lu hors dépôt), CLIPS_OUT. Course et profil « Démo » créés par l'API admin avant l'enregistrement.
const base = process.env['ZOTRACKER_URL'] ?? 'http://127.0.0.1:3010';
const gpxPath = process.env['GPX'] ?? `${homedir()}/Downloads/grands-trails-d-auvergne-2025-x-ultra-trail-solo.gpx`;
const out = process.env['CLIPS_OUT'] ?? './out';

test('clip zotracker', async ({ browser }) => {
  // 1. préparation, sans enregistrement
  const setup = await browser.newContext({ extraHTTPHeaders: { Origin: base } });
  const api = setup.request;
  const ok = async (r: Awaited<ReturnType<typeof api.post>>) => { if (!r.ok()) throw new Error(`${r.url()} -> ${r.status()}`); return r.json(); };
  await ok(await api.post(`${base}/api/login`, { data: { password: process.env['ADMIN_PASSWORD'] } }));
  await ok(await api.put(`${base}/api/admin/runner`, { data: {
    name: 'Coureur démo', bib: '1234', club: 'Club Démo', goal: 'Finir la course', bio: 'Profil factice pour la démonstration.',
    facts: [{ label: 'Objectif', value: 'Boucler le tracé' }], photo: '', marker: { style: 'emoji', emoji: '🏃', color: '#ea580c', size: 'l', pulse: true },
  } }));
  const created = await ok(await api.post(`${base}/api/admin/races`, { data: {
    name: 'Démo', location: 'Clermont-Ferrand', plannedStart: new Date(Date.now() + 36e5).toISOString().slice(0, 16), targetPace: '6:00',
    description: 'Course de démonstration sur le tracé public du Grands Trails d\'Auvergne.',
  } }));
  const id = created.races.at(-1).id;
  const imp = await ok(await api.post(`${base}/api/admin/races/${id}/course`, { data: { gpx: readFileSync(gpxPath, 'utf8') } }));
  const km = imp.imported.length / 1000;
  const aid = ['Ravito La Font', 'Ravito Le Col', 'Ravito Le Lac', 'Ravito Les Bois'].map((name, i) => ({ name, km: Math.round(km * (i + 1) / 5), info: 'Eau, fruits, soupe' }));
  await ok(await api.put(`${base}/api/admin/races/${id}`, { data: { name: 'Démo', location: 'Clermont-Ferrand', targetPace: '6:00', aidStations: aid, distanceKm: km,
    plannedStart: new Date(Date.now() + 36e5).toISOString().slice(0, 16) } }));
  const state = await setup.storageState();
  await setup.close();

  // 2. enregistrement
  const ctx = await browser.newContext({ storageState: state, viewport: { width: 1280, height: 800 }, recordVideo: { dir: out, size: { width: 1280, height: 800 } } });
  const page = await ctx.newPage();
  await showCursor(page);
  await page.goto(`${base}/admin#/direct`);
  await page.waitForSelector('#simForm');
  await page.mouse.move(640, 300);
  await page.waitForTimeout(2000);
  await page.locator('#simCard').scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  await page.fill('#simForm [name=pace]', '5:00');
  await page.fill('#simForm [name=startKm]', '14'); // juste avant le premier ravito
  await page.selectOption('#simForm select[name=speed]', '30');
  await glideClick(page, '#simForm button[type=submit]');
  await page.waitForTimeout(3000);
  await page.goto(base);
  await page.waitForTimeout(1500); // pas de networkidle : le flux SSE reste ouvert
  await page.mouse.move(900, 400);
  await page.waitForTimeout(5000);
  // scrollBy et non mouse.wheel, qui se bloque sur la carte Leaflet
  for (let i = 0; i < 5; i++) { await page.evaluate(() => scrollBy({ top: 350, behavior: 'smooth' })); await page.waitForTimeout(1800); }
  const video = page.video()!;
  await ctx.close();
  await video.saveAs(`${out}/zotracker.webm`);
});
