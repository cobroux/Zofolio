# Refonte v4, vague 1 : plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** livrer la vague 1 de la refonte « Grand reportage en direct » sur la branche `redesign/v4` : système visuel, bandeau de suivi, Départ, P1 compacte, P2 avec l'encadré Décision, P3 en index, « L'endurance, deux fois », Arrivée et colophon vivant.

**Architecture:** on fait évoluer les composants Angular 22 SSR existants (`features/home-course`, `shared/*`) sans nouvelle dépendance. Les données viennent de l'API existante, avec deux ajouts côté Spring Boot en lecture seule : les contributions GitHub par année et les infos de build. Chaque tâche est une PR fusionnée dans `redesign/v4`, jamais dans `main`.

**Tech Stack:** Angular 22 (SSR, signals, `$localize`, Vitest, Playwright + axe), Spring Boot 4.1 (Liquibase, Testcontainers), Caddy, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-11-02-redesign-v4-design.md` (lire en entier avant de commencer ; les § cités ci-dessous y renvoient).

## Global Constraints

- Branche `redesign/v4` (worktree `/Users/cobroux/Documents/application /Portefolio/zofolio-wt`) ; chaque tâche arrive par une PR **vers `redesign/v4`**. Jamais de PR ni de push vers `main`.
- Aucune dépendance npm ni Maven ajoutée.
- On n'anime que `transform`, `opacity` et `clip-path`. Courbes `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)` et `--ease-io: cubic-bezier(0.77, 0, 0.175, 1)`. Jamais `ease-in`, jamais `transition: all`. Chaque mouvement a son repli `prefers-reduced-motion`.
- Tout le contenu reste lisible sans JavaScript (SSR) et en mouvement réduit.
- Contraste ≥ 4,5:1 pour chaque paire texte/terrain, en clair et en sombre.
- Aucun chiffre ni fait inventé : ce qui manque est retiré ou s'affiche « non renseigné ».
- FR est la langue source. Chaque texte modifié passe par `npx ng extract-i18n --output-path src/locale`, puis la cible EN est mise à jour dans `messages.en.xlf`. Le build échoue sur une traduction manquante.
- Fichiers Angular : modifier par remplacement exact (script `python3` avec `assert s.count(old)==1`), pas avec un outil qui reformate tout le fichier : les identifiants i18n dépendent du texte exact.
- Règles anti-slop de `docs/DESIGN.md` §1 : pas de dégradé, de glow, d'eyebrow, de mono hors code, de MAJUSCULES espacées, de filet décoratif, ni de cartes identiques.
- Trois signatures seulement : le bandeau de suivi, le dossard, l'index P3.
- Commandes de vérification (dans `frontend/`) : `npm test -- --watch=false`, `npm run lint`, `npm run build`, `npx playwright test`. Dans `backend/` : `./mvnw -q -B verify`.

## Review Focus

- **Contenu absent** (API en échec, `home` à `null`, année sans total, synchro GitHub vide) : chaque nouveau composant s'affiche sans planter, avec un tiret ou sans le bloc. Tests dans les tâches 4, 9, 10 et 11.
- **Thème sombre choisi à la main** (`data-theme="dark"`) et thème système : les terrains et contrastes de la tâche 1 valent pour les deux. Test dans la tâche 1.
- **Retour en arrière au scroll** : le bandeau redescend en km, et la ligne de pointage ne rejoue pas (`sessionStorage`). Test dans la tâche 4.
- **Langue EN** : les nombres s'affichent en `en-US` (62.9, 4,748), les textes nouveaux sont traduits, le km du bandeau aussi. Test dans les tâches 4 et 10.
- **Clavier et lecteur d'écran sur mobile** : le focus n'est jamais masqué par les barres fixes, et le road book s'ouvre et se ferme au clavier. Test E2E dans la tâche 4.

---

### Task 1: Terrains des deux thèmes et test de contraste

**Files:**
- Modify: `frontend/src/styles/tokens.css`
- Create: `frontend/src/app/shared/terrain/terrain.ts`
- Test: `frontend/src/app/shared/terrain/terrain.spec.ts`

**Interfaces:**
- Produces:
  - `export type Terrain = 'night' | 'paper' | 'deep' | 'accent'` ;
  - `export const TERRAINS: Record<Terrain, { light: Pair; dark: Pair }>`, avec `interface Pair { bg: string; ink: string; ink2: string }` et les valeurs de la spec §5 ;
  - `export function contrast(a: string, b: string): number` (ratio WCAG à partir de deux couleurs `#rrggbb`) ;
  - les classes CSS globales `.terrain-night`, `.terrain-paper`, `.terrain-deep` et `.terrain-accent` dans `tokens.css`, qui posent `background`, `color`, `--ink` et `--ink-2`, pour le thème clair, le thème sombre système et `:root[data-theme="dark"]` (mêmes sélecteurs que le reste de `tokens.css`).

- [ ] **Step 1: Write the failing test**

```ts
describe('terrains', () => {
  it('contrast() suit WCAG', () => {
    expect(contrast('#000000', '#ffffff')).toBeCloseTo(21, 0);
    expect(contrast('#ffffff', '#ffffff')).toBeCloseTo(1, 5);
  });
  it.each(Object.entries(TERRAINS))('%s : encres ≥ 4,5:1 en clair et en sombre', (_, t) => {
    for (const p of [t.light, t.dark]) {
      expect(contrast(p.bg, p.ink)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(p.bg, p.ink2)).toBeGreaterThanOrEqual(4.5);
    }
  });
  it('valeurs de la spec §5', () => {
    expect(TERRAINS.paper.light.bg).toBe('#f6f3ec');
    expect(TERRAINS.paper.dark.bg).toBe('#16203a');
    expect(TERRAINS.deep.light.bg).toBe('#0a1120');
    expect(TERRAINS.accent.light.bg).toBe('#c2410c');
    expect(TERRAINS.accent.light.ink).toBe('#ffffff');
    expect(TERRAINS.accent.dark.bg).toBe('#ff8a2b');
    expect(TERRAINS.accent.dark.ink).toBe('#0e1626');
  });
});
```

- [ ] **Step 2: Run, expect FAIL** (`Cannot find module './terrain'`) : `npm test -- --watch=false --include src/app/shared/terrain/terrain.spec.ts`.
- [ ] **Step 3: Implement** `terrain.ts` (luminance relative WCAG 2.x) and the four classes in `tokens.css`, with the same values as `TERRAINS`. Choose each `ink2` so that the test passes; it must not fall below 4.5:1 to look "soft".
- [ ] **Step 4: Run, expect PASS.** Puis `npm run lint`.
- [ ] **Step 5: Commit** `feat(redesign): terrains clair/sombre et test de contraste`

### Task 2: Hydratation incrémentale

**Files:**
- Modify: `frontend/src/app/app.config.ts`, `frontend/src/app/features/home-course/home.page.ts`
- Test: `frontend/src/app/features/home-course/home.page.spec.ts`

**Interfaces:**
- Produces: `provideClientHydration(withIncrementalHydration())`. P1, P2, P3, Journal et Arrivée sont chacune dans `@defer (hydrate on viewport) { … }`. Le Départ et le bandeau restent hors `@defer`.

- [ ] **Step 1: Mesurer avant.** Lancer un Lighthouse mobile local (`npx lhci autorun`, config `frontend/lighthouserc.json`) sur l'état actuel de la branche. Noter le TBT et la performance dans la description de PR.
- [ ] **Step 2: Mettre à jour le test.** Dans `home.page.spec.ts`, ajouter `expect((await f.getDeferBlocks()).length).toBe(5)` et rendre chaque bloc avec `render(DeferBlockState.Complete)` avant les assertions existantes. Lancer le test : il doit échouer tant que `@defer` n'existe pas.
- [ ] **Step 3: Implémenter** dans `app.config.ts` et `home.page.ts`.
- [ ] **Step 4: Vérifier.** `npm test -- --watch=false`, `npm run build`, `npx playwright test`, puis un nouveau Lighthouse : le TBT ne doit pas augmenter. Noter l'avant et l'après dans la PR.
- [ ] **Step 5: Commit** `perf(redesign): hydratation incrémentale des sections de l'accueil`

### Task 3: Pointages officiels et fonctions du parcours

**Files:**
- Modify: `frontend/src/app/features/home-course/profile.data.ts`, `frontend/src/app/features/home-course/course-progress.ts`
- Test: `frontend/src/app/features/home-course/profile.data.spec.ts`, `frontend/src/app/features/home-course/course-progress.spec.ts` (à créer)

**Interfaces:**
- Produces:
  - `export const SPLITS` dans `profile.data.ts`, de type `Record<'p1' | 'p2' | 'p3' | 'arrivee', { clock: string; raceS: number; legS: number }>`, avec les valeurs de la spec §3 : p1 `'09:23:44'` / 10424 / 10424 ; p2 `'13:32:16'` / 25336 / 14912 ; p3 `'16:18:29'` / 35309 / 9973 ; arrivee `'20:05:52'` / 48953 / 13644 ;
  - `export function altitudeAt(km: number): number` dans `course-progress.ts` : altitude en m, interpolée sur `PROFILE` avec le `lerp` existant, bornée aux extrémités ;
  - `export function gainAt(km: number): number` : D+ cumulé en m, somme des montées de `PROFILE` jusqu'à `km`, le dernier segment au prorata ;
  - `export function lastCheckpoint(km: number): CheckpointId` : dernier pointage dont le km est ≤ `km`.

- [ ] **Step 1: Write the failing tests**

```ts
it('SPLITS : temps officiels cohérents', () => {
  expect(SPLITS.arrivee.raceS).toBe(48953);
  const legs = (['p1', 'p2', 'p3', 'arrivee'] as const).reduce((s, id) => s + SPLITS[id].legS, 0);
  expect(legs).toBe(SPLITS.arrivee.raceS);
});
it('gainAt : 0 au départ, croissant, total au bout', () => {
  expect(gainAt(0)).toBe(0);
  expect(gainAt(44)).toBeGreaterThan(gainAt(20));
  expect(gainAt(TOTAL_KM)).toBe(gainAt(TOTAL_KM + 5));
});
it('altitudeAt : bornée aux extrémités du profil', () => {
  expect(altitudeAt(-1)).toBe(PROFILE[0][1]);
  expect(altitudeAt(999)).toBe(PROFILE.at(-1)![1]);
});
it('lastCheckpoint : jamais un pointage non atteint', () => {
  expect(lastCheckpoint(0)).toBe('depart');
  expect(lastCheckpoint(43.9)).toBe('p1');
  expect(lastCheckpoint(44)).toBe('p2');
  expect(lastCheckpoint(79.41)).toBe('arrivee');
});
```

- [ ] **Step 2: Run, expect FAIL.**
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run, expect PASS.**
- [ ] **Step 5: Commit** `feat(redesign): pointages officiels du GTA 2025 et calculs du parcours`

### Task 4: Bandeau de suivi (`TrackingBand`), signature

**Files:**
- Create: `frontend/src/app/features/home-course/tracking-band/tracking-band.ts`, `.html`, `.css`, `.spec.ts`
- Modify: `frontend/src/app/features/home-course/home.page.ts` (`<app-tracking-band />` remplace `<app-elevation-profile />`), `frontend/src/app/features/home-course/road-book/road-book.ts` et `.html` (le déclencheur passe dans le bandeau, `open()` devient public), `frontend/src/styles.css` (`scroll-padding`), `frontend/e2e/home.spec.ts`
- Delete: `frontend/src/app/features/home-course/elevation-profile/` une fois le bandeau en place. Sa logique de scroll est déplacée, pas réécrite.

**Interfaces:**
- Consumes: `CourseProgress` (`scrollKm`, `start()`), `kmAtScroll`, `profilePath(false)`, `formatKm`, `altitudeAt`, `gainAt`, `lastCheckpoint`, `SPLITS` (tâche 3).
- Produces:
  - `<app-tracking-band />` : une `nav aria-label="Parcours"` (EN « Course ») avec une liste de liens d'ancre `#depart`, `#p1`, `#p2`, `#p3`, `#arrivee`, rendue en SSR ;
  - le bloc de valeurs (km, altitude, D+, dernier temps de passage) en `aria-hidden="true"` ;
  - une région `aria-live="polite"` séparée, qui annonce « P2 atteint, km 44 » (EN « P2 reached, km 44 ») une fois par pointage ;
  - sous 768 px, un `button` « Parcours » qui appelle `RoadBook.open()` ;
  - le lien « Comment c'est calculé », qui pointe sur `https://github.com/cobroux/Zofolio/blob/main/frontend/src/app/features/home-course/course-progress.ts` ;
  - la ligne de pointage étendue pendant 2,4 s, une fois par pointage et par session : clé `sessionStorage` `zofolio:split:<id>`, lue seulement côté navigateur, état SSR replié.

- [ ] **Step 1: Write the failing tests** (`tracking-band.spec.ts`, helpers locaux `render()`, `values()`, `band()`, `announcements()`)

```ts
it('SSR : nav « Parcours » avec un lien par pointage', () => {
  const nav = render().querySelector('nav[aria-label="Parcours"]')!;
  expect([...nav.querySelectorAll('a[href^="#"]')].map((a) => a.getAttribute('href')))
    .toEqual(['#depart', '#p1', '#p2', '#p3', '#arrivee']);
});
it('à km 44 : km, D+ et dernier passage 13:32:16', () => {
  progress.scrollKm.set(44);
  expect(values()).toContain('44');
  expect(values()).toContain('13:32:16');
  expect(values()).toContain(String(Math.round(gainAt(44))));
});
it('entre P1 et P2 : passage P1, jamais un temps interpolé', () => {
  progress.scrollKm.set(30);
  expect(values()).toContain('09:23:44');
  expect(values()).not.toContain('13:32:16');
});
it('ligne de pointage : une fois par session, pas au retour', () => {
  progress.scrollKm.set(44); flush();
  expect(band().classList).toContain('split');
  progress.scrollKm.set(20); flush(); progress.scrollKm.set(44); flush();
  expect(sessionStorage.getItem('zofolio:split:p2')).toBe('1');
  expect(announcements()).toEqual(['P2 atteint, km 44']);
});
```

   Dans `e2e/home.spec.ts`, en 390 × 844 :
   - tabuler du haut jusqu'au formulaire de contact, et vérifier pour chaque élément focalisé `box.y >= 48 && box.y + box.height <= 844 - 76` ;
   - vérifier que « Parcours » ouvre le road book, et qu'Échap le referme en rendant le focus au bouton ;
   - garder les vérifications axe existantes.
- [ ] **Step 2: Run, expect FAIL.**
- [ ] **Step 3: Implement.**
  - **Scroll et affichage :** déplacer la boucle scroll/rAF de `elevation-profile.ts`. Elle écrit `transform: scaleX(p)` sur le masque de la trace, et ne réécrit les textes que quand le dixième de km change.
  - **Hauteurs :** 52 px replié, 76 px étendu. Sous 768 px, `scroll-padding-top: 64px` et `scroll-padding-bottom: 92px` sur `html`.
  - **Ligne de pointage :** entrée 320 ms `--ease-out`, sortie 180 ms. En mouvement réduit, elle s'affiche sans déplacement.
  - **Infobulles :** seulement en `@media (hover:hover) and (pointer:fine)`. Délai de 300 ms au premier survol, 0 ms ensuite entre voisins, 150 ms `--ease-out`, départ à `scale(0.97)`.
- [ ] **Step 4: Run** les tests unitaires, `npx playwright test` et `npm run build` : **PASS**.
- [ ] **Step 5: Commit** `feat(redesign): bandeau de suivi en direct (km, altitude, D+, pointages officiels)`

### Task 5: Fond de courbes de niveau (`ContourField`)

**Files:**
- Create: `frontend/src/app/shared/contour-field/contour-field.ts`, `contours.ts`, `contours.spec.ts`
- Modify: `frontend/src/app/features/home-course/sections/start.section.ts`, `finish.section.ts`

**Interfaces:**
- Consumes: `PROFILE`.
- Produces:
  - `export function contourPaths(levels: number, width: number, height: number): string[]` : un chemin SVG par niveau, dérivé du profil (profil décalé verticalement niveau par niveau), sans aléatoire ;
  - `<app-contour-field [levels]="12" />` : un SVG `aria-hidden`, statique, rendu côté serveur, en `opacity` 0,06 en clair et 0,08 en sombre.

- [ ] **Step 1: Write the failing test**

```ts
it('déterministe, un chemin par niveau, dans la boîte', () => {
  const a = contourPaths(12, 1000, 600);
  expect(a).toHaveLength(12);
  expect(contourPaths(12, 1000, 600)).toEqual(a);
  const n = a.join(' ').match(/-?\d+(\.\d+)?/g)!.map(Number);
  expect(Math.min(...n)).toBeGreaterThanOrEqual(0);
  expect(Math.max(...n)).toBeLessThanOrEqual(1000);
});
```

- [ ] **Step 2: Run, expect FAIL.**
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run, expect PASS**, puis `npm run build`.
- [ ] **Step 5: Commit** `feat(redesign): fond de courbes de niveau tiré du profil`

### Task 6: Départ, dossard objet et ligne de preuve

**Files:**
- Modify: `frontend/src/app/features/home-course/sections/start.section.ts`, `start.section.css`, `frontend/src/app/shared/bib/bib.ts`, `bib.css`, `frontend/src/locale/*.xlf`, `frontend/e2e/home.spec.ts`
- Test: `frontend/src/app/features/home-course/sections/start.section.spec.ts` (à créer)

**Interfaces:**
- Consumes: `.terrain-night` (tâche 1), `<app-contour-field>` (tâche 5).
- Produces:
  - `<app-bib [face]="'front' | 'back'" />` :
    - face avant : format 5:3, quatre trous d'épingle en `clip-path`, « 1592 » en Archivo condensé, et le texte « Grand Trail d'Auvergne · 79,4 km · départ 6 h 30 » ;
    - face arrière : `<ng-content />`, utilisée par la tâche 11.
  - Le portrait en plaque, avec le dossard qui chevauche son bas.

- [ ] **Step 1: Write the failing test**

```ts
it('h1 = le nom, puis phrase métier, ligne de preuve, CV, contact', () => {
  const el = render();
  expect(el.querySelector('h1')!.textContent!.trim()).toBe('Enzo Leveque');
  expect(el.textContent).toContain('Java/Spring + Angular');
  expect(el.querySelector('.proof')!.textContent).toContain('move2cloud');
  expect(el.querySelector('a[href$="/cv"]')).toBeTruthy();
  expect(el.querySelector('app-bib')!.textContent).toContain('1592');
});
```

   Copie exacte de la ligne de preuve :
   - FR : « 2,5 ans sur une plateforme d'ordres de bourse en production · migration move2cloud vers RabbitMQ · Angular SSR et Spring Boot 4 en production ici même » ;
   - EN : « 2.5 years on a production stock-order platform · move2cloud migration to RabbitMQ · Angular SSR and Spring Boot 4 in production right here ».
- [ ] **Step 2: Run, expect FAIL.**
- [ ] **Step 3: Implement** la spec §6, Départ. Le nom fait environ 10vw sur une ligne, et passe sur deux lignes à environ 15vw sous 768 px. Le titre ne dépasse jamais deux lignes, quelle que soit la largeur.
- [ ] **Step 4:** tests, extraction i18n et cible EN, `npm run build`, `npx playwright test` : **PASS**.
- [ ] **Step 5: Commit** `feat(redesign): couverture avec dossard objet et ligne de preuve`

### Task 7: Plaques photo et chapitre épinglé

**Files:**
- Create: `frontend/src/app/shared/photo-plates/photo-plates.ts` (+ `.spec.ts`), `frontend/src/app/shared/chapter-pin/chapter-pin.ts` (+ `.spec.ts`)
- Add assets: dans `frontend/public/img/`, en AVIF, WebP et JPEG, à 640 et 1280 px, sans métadonnées EXIF, comme les images existantes : `promo-ili`, `badge-promo-ili`, `baudets-nuit`, `en-course-passerelle`, `logo-baudets`. Sources : `~/Desktop/20250327_164816.jpg`, `~/Desktop/image.png`, `~/Desktop/IMG_9851.jpeg`, `~/Desktop/IMG_9240.jpg`, `~/Downloads/images.jpeg` (voir spec §5 bis).

**Interfaces:**
- Produces:
  - `export interface Plate { src: string; alt: string; caption: string; width: number; height: number; ui?: boolean }` ;
  - `<app-photo-plates [main]="Plate" [inset]="Plate | null" />`. Avec `ui: true`, il projette `<ng-content select="[plate-ui]">` (capture ou schéma) et pose `data-ui` sur ce bloc. Révélation en `clip-path`, une fois, 80 ms de décalage pour l'encart, 600 ms `--ease-io`. En mouvement réduit, fondu de 160 ms. Sans JS, l'image est visible.
  - `<app-chapter-pin [mark]="'P2'" [title]="string" [meta]="string" [sticky]="boolean" />` : sticky sur ordinateur, barre sticky de 48 px sous 768 px, jamais sticky quand `sticky` vaut `false`.

- [ ] **Step 1: Write the failing tests**

```ts
it('plaque sans JS : image visible, alt et taille posés', () => {
  const img = render({ main: plate, inset: null }).querySelector('img')!;
  expect(img.getAttribute('alt')).toBe(plate.alt);
  expect(img.getAttribute('width')).toBe(String(plate.width));
  expect(img.closest('figure')!.classList).not.toContain('hidden');
});
it('ui : projette le schéma et pose data-ui', () => {
  expect(renderUi().querySelector('[data-ui]')).toBeTruthy();
});
it('chapter-pin sticky=false : pas de classe sticky', () => {
  expect(renderPin({ sticky: false }).querySelector('.sticky')).toBeNull();
});
```

- [ ] **Step 2: Run, expect FAIL.**
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run, expect PASS.**
- [ ] **Step 5: Commit** `feat(redesign): plaques photo et chapitre épinglé`

### Task 8: P1 compacte et P2 avec l'encadré Décision

**Files:**
- Create: `frontend/src/app/features/home-course/content/decision.ts`, `frontend/src/app/shared/decision-card/decision-card.ts` (+ `.spec.ts`)
- Modify: `frontend/src/app/features/home-course/sections/p1.section.ts`, `p2.section.ts`, `frontend/src/locale/*.xlf`, `frontend/e2e/home.spec.ts`

**Interfaces:**
- Consumes: `ChapterPin` et `PhotoPlates` (tâche 7), `.terrain-paper` et `.terrain-deep` (tâche 1), le schéma `trading-app` et la frise Worldline existants.
- Produces:
  - `export interface Decision { problem: string; options: string[]; choice: string; result: string }` ;
  - `export const WORLDLINE_ALERTS: Decision` dans `content/decision.ts`, en `$localize`, avec le texte tiré **uniquement** du CV :
    - problème : « Propager les changements de configuration des alertes sans redémarrer le service » ;
    - options : « ActiveMQ », « Kafka », « RabbitMQ » ;
    - choix : « ActiveMQ / JMS, après une étude comparative » ;
    - résultat : « Module producer/consumer testé en JUnit, changements propagés en temps réel » ;
  - `<app-decision-card [decision]="Decision" />` : une `section` avec `h3` « Décision » et une `dl` Problème / Options / Choix / Résultat. Une rubrique vide n'est pas rendue.

- [ ] **Step 1: Write the failing tests**

```ts
it('decision-card : quatre rubriques dans l’ordre', () => {
  const dts = [...render(WORLDLINE_ALERTS).querySelectorAll('dt')].map((d) => d.textContent!.trim());
  expect(dts).toEqual(['Problème', 'Options', 'Choix', 'Résultat']);
});
it('decision-card : une rubrique vide est retirée', () => {
  expect(render({ ...WORLDLINE_ALERTS, result: '' }).querySelectorAll('dt')).toHaveLength(3);
});
```

   E2E (`home.spec.ts`) :
   - `#p1` contient un lien par projet d'école de l'API (index en une ligne) et le badge, et aucune image de toge ;
   - dans `#p2`, la `section` Décision précède les plaques ;
   - à 1440 px, le chapitre P2 reste visible pendant qu'on scrolle dans l'étape.
- [ ] **Step 2: Run, expect FAIL.**
- [ ] **Step 3: Implement** la spec §6, P1 et P2.
  - P1 : une bande non sticky ; le ravitaillement R1 garde le contenu `R1` de l'API, en ligne de transition.
  - P2 : sticky, faits du CV, encadré Décision, plaques (photo si elle existe, sinon le schéma `trading-app` en `ui`), lien vers l'étude.
- [ ] **Step 4:** tests, i18n, build, E2E : **PASS**.
- [ ] **Step 5: Commit** `feat(redesign): P1 compacte et P2 avec la décision ActiveMQ`

### Task 9: P3 en index avec aperçu (`ProjectIndex`)

**Files:**
- Create: `frontend/src/app/features/home-course/project-index/project-index.ts` (+ `.spec.ts`)
- Modify: `frontend/src/app/features/home-course/sections/p3.section.ts`, `frontend/e2e/projects.spec.ts`

**Interfaces:**
- Consumes: `ProjectSummary[]` (`core/api/api.models.ts`), `.terrain-accent`, les médias existants des projets (`video.mp4`, `video.poster`).
- Produces: `<app-project-index [projects]="ProjectSummary[] | null" />`.
  - Chaque ligne est un lien vers l'étude (`routerLink`), ou vers le dépôt s'il n'y a pas d'étude, plus un lien « code » si un dépôt existe.
  - Le cadre d'aperçu est fixe et montre la vidéo de la ligne active (muette, en boucle, en pause hors écran), ou seulement le poster en mouvement réduit.
  - Les lignes inactives restent lisibles : contraste ≥ 4,5:1, aucune opacité qui le fasse passer dessous.

- [ ] **Step 1: Write the failing tests**

```ts
it('null : message d’indisponibilité, rien de cassé', () => {
  expect(render(null).textContent).toContain('indisponible');
});
it('focus clavier = même aperçu que le survol', () => {
  focusRow(1);
  expect(preview().getAttribute('data-slug')).toBe(projects[1].slug);
});
it('sans vidéo : poster ou capture, jamais un cadre vide', () => {
  expect(previewFor({ ...projects[0], video: null }).querySelector('img, video')).toBeTruthy();
});
```

- [ ] **Step 2: Run, expect FAIL.**
- [ ] **Step 3: Implement.**
  - Fondu enchaîné de 240 ms `ease`, seulement en `@media (hover:hover) and (pointer:fine)`.
  - Sous 768 px, chaque ligne affiche son poster en ligne, et la vidéo ne se lance qu'au toucher.
- [ ] **Step 4: PASS** sur les tests, le build et l'E2E.
- [ ] **Step 5: Commit** `feat(redesign): P3 en index avec aperçu vidéo`

### Task 10: « L'endurance, deux fois » (contributions par année)

**Files:**
- Create: `backend/src/main/resources/db/changelog/changes/20261103-1000-github-contribution-years.sql`, `backend/src/main/java/dev/zofolio/githubsync/GithubContributionYear.java`, `GithubContributionYearRepository.java`, `frontend/src/app/features/home-course/endurance/endurance-twice.ts` (+ `.spec.ts`)
- Modify: `backend/src/main/java/dev/zofolio/githubsync/GithubClient.java` et le service de synchro qui l'appelle, `backend/src/main/java/dev/zofolio/content/ContentDto.java`, `ContentService.java`, `frontend/src/app/core/api/api.models.ts`, `frontend/src/app/features/home-course/sections/journal.section.ts` (+ `.spec.ts`), `frontend/src/app/features/home-course/home.page.ts`
- Test: tests `githubsync` existants comme modèle, avec les stubs de `src/test/resources/github/` ; test d'API de `/api/fr/home`.

**Interfaces:**
- Produces:
  - **Base :** une table `github_contribution_year(year INT PRIMARY KEY, total INT NOT NULL, synced_at TIMESTAMPTZ NOT NULL)`.
  - **`GithubClient.contributionYears(int fromYear, int toYear): Map<Integer, Integer>`** :
    - une requête GraphQL par année, `contributionsCollection(from, to) { contributionCalendar { totalContributions } }`, de 2023 à l'année courante ;
    - une année en erreur est absente de la map, et sa valeur stockée ne change pas.
  - **`/api/{lang}/home`** gagne le champ `contributionYears: { year: number; total: number }[]`, trié par année croissante (côté front : `Home.contributionYears`).
  - **`<app-endurance-twice [sportYears]="SportYear[]" [contributionYears]="ContributionYear[]" />`** :
    - une ligne par année, de 2023 à l'année courante, dans l'ordre chronologique ;
    - deux barres par ligne, km et commits, animées ensemble par `CountUp` ;
    - « non renseigné » pour une valeur absente, jamais 0 ;
    - un `h2` « L'endurance, deux fois » (EN « Endurance, twice ») ;
    - la phrase « Les deux courbes montent. Ce n'est pas une coïncidence, c'est une méthode. » (EN « Both lines climb. It isn't a coincidence, it's a method. »).
  - **Dans `journal.section.ts` :**
    - le bloc « Les années en chiffres » est remplacé par `<app-endurance-twice>`, en tête du Journal ;
    - ensuite viennent les dernières courses, la photo `baudets-nuit` en plaque, `logo-baudets` en petit à côté du nom du club, et l'arrivée Côte d'Opale ;
    - les autres courses et le graphe de contributions restent repliés.

- [ ] **Step 1: Write the failing tests**
  - Back :
    - la synchro demande 2023, 2024, 2025 et 2026, et stocke 4 lignes ;
    - une année qui renvoie une erreur garde sa valeur précédente ;
    - `GET /api/fr/home` contient `contributionYears`, trié.
  - Front :

```ts
it('ordre chronologique et appariement par année', () => {
  const rows = render([y(2026, 4748), y(2023, 347)], [c(2023, 120), c(2026, 900)]);
  expect(rows.map((r) => r.year)).toEqual(['2023', '2026']);
  expect(rows[0].commits).toBe('120');
});
it('commits absents pour une année : « non renseigné », pas de zéro', () => {
  expect(render([y(2024, 2191)], [])[0].commits).toContain('non renseigné');
});
```

- [ ] **Step 2: Run, expect FAIL** (`./mvnw -q -B verify` ; `npm test -- --watch=false`).
- [ ] **Step 3: Implement** en suivant les motifs existants de `githubsync` (client, entité, dépôt, synchro planifiée). Le token GitHub ne reçoit aucune nouvelle permission.
- [ ] **Step 4: PASS** côté back, front, build et E2E.
- [ ] **Step 5: Commit** `feat(redesign): l'endurance, deux fois (km et commits par année)`

### Task 11: Arrivée et dos du dossard (colophon vivant)

**Files:**
- Create: `backend/src/main/java/dev/zofolio/build/BuildController.java`, `BuildInfo.java`, `backend/src/test/java/dev/zofolio/build/BuildApiIT.java`, `frontend/src/app/features/home-course/live-colophon/live-colophon.ts` (+ `.spec.ts`)
- Modify:
  - back : `backend/src/main/java/dev/zofolio/githubsync/GithubClient.java` (dernière exécution du workflow `CI` sur `main`, mise en cache par la synchro existante) ;
  - déploiement : `docker-compose.prod.yml` (variables `GIT_SHA` et `DEPLOYED_AT` pour le backend), `.github/workflows/deploy.yml` ;
  - front : `frontend/src/app/core/api/content.api.ts`, `frontend/src/app/features/home-course/sections/finish.section.ts`, `frontend/src/locale/*.xlf` ;
  - tests : `frontend/e2e/contact.spec.ts`.

**Interfaces:**
- Produces:
  - **`GET /api/build`**, qui renvoie `{ commit: string | null; deployedAt: string | null; ci: { conclusion: 'success' | 'failure' | null; url: string | null } }`.
    - `commit` : les 7 premiers caractères de `GIT_SHA`.
    - `deployedAt` : `DEPLOYED_AT`, au format ISO.
    - Une donnée absente vaut `null`.
  - **`deploy.yml`** : dans la commande distante, juste après le `git checkout`, préfixer `docker compose … up` par `GIT_SHA=$(git rev-parse HEAD) DEPLOYED_AT=$(date -u +%FT%TZ)`. Ce fichier n'atteint `main` qu'avec la fusion finale de la refonte.
  - **`<app-live-colophon />`**, projeté dans `<app-bib face="back">`. Il affiche :
    - `[data-row="commit"]`, avec un lien vers `https://github.com/cobroux/Zofolio/commit/<sha>` ;
    - `[data-row="deployed"]`, la date selon la langue ;
    - `[data-row="ci"]`, « CI verte » ou « CI rouge » avec le lien vers l'exécution ;
    - la stack et le lien vers le dépôt ;
    - email, GitHub, LinkedIn et CV.

    Chaque ligne n'existe que si sa donnée existe.
  - **Arrivée** :
    - « 13 h 35 min 53 s » en monumental ;
    - un tableau `.splits` avec les quatre pointages (`SPLITS`) ;
    - « Prochain objectif : 100 km » en petit ;
    - `mailto`, CV et LinkedIn **avant** le formulaire existant, restylé sans coupon ;
    - Phidippides conservé.

- [ ] **Step 1: Write the failing tests**
  - Back :
    - sans variable d'env, `commit`, `deployedAt` et `ci.conclusion` valent `null` ;
    - avec `GIT_SHA=abcdef1234`, `commit` vaut `"abcdef1"`.
  - Front :

```ts
it('données absentes : lignes retirées, contact toujours là', () => {
  const el = render({ commit: null, deployedAt: null, ci: { conclusion: null, url: null } });
  expect(el.querySelector('[data-row="commit"]')).toBeNull();
  expect(el.querySelector('[data-row="ci"]')).toBeNull();
  expect(el.querySelector('a[href^="mailto:"]')).toBeTruthy();
});
it('commit présent : lien vers le commit GitHub', () => {
  expect(render(full).querySelector('a[href="https://github.com/cobroux/Zofolio/commit/abcdef1"]')).toBeTruthy();
});
it('arrivée : chrono officiel et 4 pointages', () => {
  expect(finish().textContent).toContain('13 h 35 min 53 s');
  expect(finish().querySelectorAll('.splits tbody tr')).toHaveLength(4);
});
```

   E2E `contact.spec.ts` : les tests d'envoi existants passent sans changement, et le `mailto` est visible au premier écran de la section Arrivée.
- [ ] **Step 2: Run, expect FAIL.**
- [ ] **Step 3: Implement.**
- [ ] **Step 4: PASS** côté back, front, build et E2E.
- [ ] **Step 5: Commit** `feat(redesign): arrivée avec pointages officiels et dos du dossard en colophon vivant`

### Task 12: Finition de la vague 1

**Files:**
- Modify: tout ce que les contrôles signalent ; `frontend/src/app/features/colophon/colophon.page.ts` (les textes sur la CI et le mouvement doivent décrire la réalité, sans affirmation fausse).

- [ ] **Step 1:** lancer la pile locale avec `docker compose -p zofolio-wt up -d --build`. Passer les outils de taste-skill (`lint.mjs`, `inspect.mjs`, `scenes.mjs`) sur `http://localhost:4000/fr/` à 1440, 768 et 390 px. Corriger chaque FAIL et relire toutes les captures.
- [ ] **Step 2:** lancer `impeccable detect --json` sur les fichiers modifiés pendant la vague, et corriger.
- [ ] **Step 3:** Lighthouse mobile en local. Seuils : performance ≥ 90 ; accessibilité, bonnes pratiques et SEO ≥ 95. Si un seuil n'est pas atteint, retirer un effet avant d'optimiser (spec §14).
- [ ] **Step 4:** `npx playwright test` complet (axe, clair et sombre, FR et EN) : **PASS**.
- [ ] **Step 5:** envoyer à Enzo les captures (ordinateur et téléphone, FR et EN, chaque section) et deux GIF : le bandeau et l'index P3. Demander sa revue. **Ne rien fusionner dans `main`.**
- [ ] **Step 6: Commit** `chore(redesign): finition de la vague 1`
