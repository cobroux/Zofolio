# Refonte v4, vague 2 : plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** donner aux quatre études de cas (trading-app, Oltre, Zotracker, GFaim) le gabarit unique de la spec §6, ajouter le fondu de page de 200 ms, puis finir la vague et réécrire DESIGN.md.

**Architecture:** on garde Angular SSR, l'API Spring et le contenu en base éditable dans l'admin. Le contrat `CaseStudy` gagne deux champs traduits (`contribution`, `hindsight`) ; les autres rubriques réutilisent les champs existants. Le contenu nouveau arrive par une migration Liquibase gardée, après validation d'Enzo. Le fondu passe par `withViewTransitions()` du routeur, sans resolver ni élément partagé.

**Tech Stack:** Angular 22 (SSR, i18n `$localize`, Vitest, Playwright + axe), Spring Boot 4 / Java 21, PostgreSQL JSONB, Liquibase SQL.

**Spec:** `docs/superpowers/specs/2026-11-02-redesign-v4-design.md` (§6 « Pages projet », §7 dernière ligne, §10, §11 tranches 9 à 11).

## Global Constraints

Celles de la vague 1 s'appliquent mot pour mot : `.superpowers/sdd/2026-11-02-redesign-v4-vague-1/global-constraints.md`. Rappel des plus coûteuses :
- Worktree `/Users/cobroux/Documents/application /Portefolio/zofolio-wt`, branche `redesign/v4`. Jamais de push ni de PR vers `main`, jamais de déploiement.
- Aucune dépendance npm ou Maven ajoutée.
- Fichiers Angular modifiés par remplacement exact (script python3 avec `assert s.count(old) == 1`), jamais par un outil qui reformate tout le fichier : les id i18n dépendent du texte exact.
- FR est la langue source. Tout texte changé : `npx ng extract-i18n --output-path src/locale` dans `frontend/`, puis cible EN dans `messages.en.xlf`. Le build échoue sur une traduction manquante.
- Aucun fait inventé. Une rubrique sans fait réel est retirée (titre compris), jamais remplie par une formule générique.
- Worldline : seuls les noms publics TOM, move2cloud, Copartis, Boursorama ; rien du rapport M2 (CONFIDENTIEL) au-delà de ce que la vague 1 publie déjà ; tout texte Worldline relu mot à mot par Enzo.
- Mouvement : seulement `transform`, `opacity`, `clip-path` ; jamais `ease-in`, jamais `transition: all` ; repli en mouvement réduit.
- Vérifier : `frontend/` → `npm test -- --watch=false`, `npm run lint`, `npm run build`, `npx playwright test` ; `backend/` → `./mvnw -q -B verify`.
- iCloud : supprimer les doublons « * 2.* » avant chaque build.
- Implémenteurs en Sonnet (coût), revue indépendante avant chaque fusion de tâche.

## Décisions de ce plan

**Correspondance rubrique → champ** (spec §6, dans l'ordre d'affichage) :

| Rubrique | Champ | Statut |
| --- | --- | --- |
| Contexte et contraintes | `problem` (1er paragraphe) + `wall` (2e paragraphe, s'il existe) | existants, sens conservé |
| Décision et alternative écartée | `decisions[]` (`title`, `tradeoff`) | existant |
| Ce que j'ai porté | `contribution` | **nouveau** |
| Résultat | `takeaway` | existant, renommé dans l'admin, contenu réécrit |
| Ce que je referais | `hindsight` | **nouveau** |
| Code | `repos` + `demoUrl` | existants |

- `aiNote` garde son sens (note sur l'IA) et n'est pas affiché par le gabarit. Raison : en prod il vaut « Conçu avec IA. » (Zotracker) et « Commencé à la main, puis poursuivi avec l'aide de l'IA. » (Oltre) ; l'afficher sous « Ce que je referais » serait faux.
- `role` reste dans le dossard de la page (court, 200 caractères) ; ce n'est pas la rubrique « Ce que j'ai porté ».
- Le contenu en prod a été modifié dans l'admin depuis les seeds : une migration n'écrase jamais un texte sans garde (Task 3).
- Le CTA « Me contacter » sort de la rubrique Code : il reste visible quand Code est retiré (trading-app n'a aucun dépôt).

## Review Focus

1. **Rubrique vide ou blanche** (`null`, `""`, `"  "`) : la section entière disparaît, aucun `<h2>` orphelin. → test Task 2 « rubriques absentes ».
2. **EN sans traduction d'une rubrique** : l'API retombe sur le FR comme les autres champs (`pick`), la page EN n'a jamais de trou. → test Task 1 `caseStudyRubricsFallBackToFrench`.
3. **Écrasement d'une édition admin par la migration de contenu** : un `UPDATE` sur un champ existant ne s'applique que si la valeur en base est encore celle relevée en prod. → garde SQL, Task 3.
4. **Retour arrière après le fondu** : le retour à l'accueil marche, sans erreur console ; en mouvement réduit, aucune animation. → E2E Task 4.
5. **Étude sans dépôt (trading-app)** : pas de rubrique Code, mais « Me contacter » reste. → test Task 2 Worldline.

---

## Task 0: Remettre le worktree au propre

Le worktree contient un diff non commité d'une session précédente (`admin.errors.ts`, `case-study-view.ts`, `case-study.page.spec.ts`) : il reformate les fichiers entiers et réaffiche `aiNote` sous « Ce que je referais ». Les Tasks 1 et 2 le remplacent.

- [ ] **Step 1:** `git stash push -m "vague2-brouillon-reformate" -- frontend/src/app/features/admin/admin.errors.ts frontend/src/app/features/projects/case-study-view.ts frontend/src/app/features/projects/case-study.page.spec.ts` (réversible).
- [ ] **Step 2:** `git status -s` ne montre plus que ce plan. `git add docs/superpowers/plans/2026-11-03-redesign-v4-vague-2.md && git commit -m "docs(redesign): plan de la vague 2"`.

## Task 1: Contrat `contribution` et `hindsight`, de la base à l'admin

**Files:**
- Create: `backend/src/main/resources/db/changelog/changes/20261103-1400-case-study-v4.sql` (déclaré dans le changelog maître comme les précédents)
- Modify: `backend/src/main/java/dev/zofolio/content/Project.java` (à côté de `aiNote`, l. 67)
- Modify: `backend/src/main/java/dev/zofolio/content/ContentDto.java:25-26`
- Modify: `backend/src/main/java/dev/zofolio/content/ContentService.java:147-155`
- Modify: `backend/src/main/java/dev/zofolio/admin/AdminDto.java:16-18`, `backend/src/main/java/dev/zofolio/admin/ProjectAdminService.java:160-164, 267-268`
- Modify: `frontend/src/app/core/api/api.models.ts:47-55`, `frontend/src/app/features/admin/admin.api.ts:16`, `frontend/src/app/features/admin/projects/project-form.page.ts:16, 66, 309, 403`, `frontend/src/app/features/admin/admin.errors.ts` (`META`)
- Modify: `frontend/src/testing/project-oltre.fixture.json`, `frontend/src/testing/project-trading-app.fixture.json`
- Test: `backend/src/test/java/dev/zofolio/content/ContentApiIT.java`, `backend/src/test/java/dev/zofolio/admin/ProjectAdminIT.java`, `frontend/src/app/features/admin/admin.spec.ts`

**Interfaces:**
- Produces (JSON public `GET /api/{lang}/projects/{slug}`) : `caseStudy.contribution: string | null`, `caseStudy.hindsight: string | null`.
- Produces (TS `api.models.ts`) : `CaseStudy = { role: string; problem: string; decisions: { title: string; tradeoff: string }[]; wall: string | null; contribution: string | null; takeaway: string | null; hindsight: string | null; aiNote: string | null; repos: { name: string; url: string }[] }`.
- Produces (Java) : `ContentDto.CaseStudy(String role, String problem, List<Decision> decisions, String wall, String contribution, String takeaway, String hindsight, String aiNote, List<RepoLink> repos)` ; `AdminDto.ProjectAdmin` gagne `Map<String,String> contribution, hindsight` ; côté admin TS `contribution: Tr | null; hindsight: Tr | null`. Validation comme `takeaway` : 3 000 caractères, facultatif.

- [ ] **Step 1: Tests back qui échouent.** `ContentApiIT.caseStudyRubricsFallBackToFrench` : un projet `CASE_STUDY` avec `contribution = {"fr":"Porté seul"}` et `hindsight` nul ; `GET /api/en/projects/{slug}` → `$.caseStudy.contribution == "Porté seul"` et `$.caseStudy.hindsight` présent et `null`. Dans `ProjectAdminIT.invalidFieldsAreRejectedWithDottedPaths`, ajouter `contribution.fr` et `hindsight.fr` de 3 001 caractères → erreurs `contribution.fr` et `hindsight.fr`, code `Size`. `seededProjectsRoundTripUnchanged` reste vert.
- [ ] **Step 2:** `cd backend && ./mvnw -q -B verify -Dit.test='ContentApiIT,ProjectAdminIT'` → FAIL (champs inconnus).
- [ ] **Step 3: Migration** `--changeset zofolio:case-study-v4` : `ALTER TABLE project ADD COLUMN contribution JSONB, ADD COLUMN hindsight JSONB;`.
- [ ] **Step 4: Propager** dans `Project` (même mapping JSONB que `aiNote`), `ContentDto.CaseStudy`, `ContentService` (`pick(p.contribution, lang)`, `pick(p.hindsight, lang)`), `AdminDto`, `ProjectAdminService` (`c.text("contribution", in.contribution(), 3000, false)`, idem `hindsight`, et la projection l. 267). Une ligne de commentaire sur `CaseStudy` : la correspondance rubrique → champ du tableau ci-dessus.
- [ ] **Step 5:** commande du Step 2 → PASS, puis `./mvnw -q -B verify` → PASS.
- [ ] **Step 6: Test front qui échoue.** Dans `admin.spec.ts` : `fieldLabel('contribution.fr')` → `Ce que j’ai porté (français)` ; `fieldLabel('hindsight.en')` → `Ce que je referais (anglais)` ; `fieldLabel('takeaway.fr')` → `Résultat (français)` ; `fieldLabel('wall.fr')` → `Contraintes (français)` ; `fieldLabel('problem.fr')` → `Contexte (français)` ; `fieldLabel('aiNote.fr')` → `Note sur l’IA (français)` (inchangé). `npm test -- --watch=false admin` → FAIL.
- [ ] **Step 7: Admin front.** `META` : `problem` « Contexte », `wall` « Contraintes », `takeaway` « Résultat », nouveaux `contribution` « Ce que j’ai porté » et `hindsight` « Ce que je referais », tous `max: 3000`. `TR_KEYS`, `TEXTS` (ordre : `role`, `problem`, `wall`, `contribution`, `takeaway`, `hindsight`, `aiNote` ; tous `area: true` sauf `role`), valeurs initiales l. 309 et `pack()` l. 403. Fixtures : `"contribution": null, "hindsight": null`. Remplacements exacts uniquement.
- [ ] **Step 8:** `npm test -- --watch=false && npm run lint && npm run build` → PASS.
- [ ] **Step 9: Commit** `feat(redesign): rubriques contribution et hindsight des études de cas`.

## Task 2: Gabarit commun de l'étude de cas

**Files:**
- Modify: `frontend/src/app/features/projects/case-study-view.ts` (sections après la couverture)
- Modify: `frontend/src/app/features/projects/case-study.page.css` (seulement ce que le retrait de `.wall` et le déplacement du CTA exigent)
- Modify: `frontend/src/locale/messages.en.xlf`
- Test: `frontend/src/app/features/projects/case-study.page.spec.ts`, `frontend/e2e/projects.spec.ts`

**Interfaces:**
- Consumes: `CaseStudy` de Task 1.
- Produces: ids de titres stables : `#h-ctx`, `#h-dec`, `#h-arch` (schéma, inchangé), `#h-own`, `#h-res`, `#h-redo`, `#h-code`.

Ordre rendu : couverture inchangée (titre, pointage du dossard, clip ou frise) → Contexte et contraintes → Décision et alternative écartée → schéma d'architecture (existant, s'il y en a un) → Ce que j'ai porté → Résultat → Ce que je referais → Code → CTA « Me contacter » (hors de Code). Titres FR / EN : « Contexte et contraintes » / « Context and constraints » ; « Décision et alternative écartée » / « Decision and the option I ruled out » ; « Ce que j'ai porté » / « What I owned » ; « Résultat » / « Outcome » ; « Ce que je referais » / « What I would do differently » ; « Code » / « Code ». La section `.wall` « km 60 » disparaît : `wall` devient le 2e paragraphe de Contexte.

- [ ] **Step 1: Tests unitaires qui échouent** dans `case-study.page.spec.ts` :
  - `gabarit : rubriques dans l'ordre de la spec` : fixture Oltre avec `wall`, `contribution`, `takeaway`, `hindsight` non nuls → `[...el.querySelectorAll('h2')].map((h) => h.id)` vaut `['h-ctx', 'h-dec', 'h-arch', 'h-own', 'h-res', 'h-redo', 'h-code']` ; la section de `#h-ctx` contient deux `<p>`.
  - `rubriques absentes : section retirée, titre compris` : `wall: null`, `contribution: null`, `takeaway: null`, `hindsight: '  '`, `decisions: []` → ni `#h-dec`, `#h-own`, `#h-res`, `#h-redo` ; la section de `#h-ctx` contient un seul `<p>`.
  - `aiNote jamais affiché` : `aiNote: 'Conçu avec IA.'` → `el.textContent` ne contient pas `Conçu avec IA.`.
  - Étendre `Worldline : …` : `#h-code` absent, un lien « Me contacter » vers `/#arrivee` présent.
  - Retirer l'assertion `#h-wall` du test Oltre existant.
- [ ] **Step 2:** `npm test -- --watch=false case-study` → FAIL.
- [ ] **Step 3: Gabarit.** Une rubrique texte s'affiche ssi `valeur?.trim()` est non vide ; Décision ssi `decisions.length` ; Code ssi `repos.length || demoUrl || video`. Chaque rubrique reprend la structure existante `<section class="blk" aria-labelledby="…" appReveal><div class="wrap grid"><h2 id="…" i18n>…</h2><div class="txt">…`. Remplacements exacts, puis `npx ng extract-i18n --output-path src/locale` et cibles EN ci-dessus.
- [ ] **Step 4:** `npm test -- --watch=false && npm run lint && npm run build` → PASS.
- [ ] **Step 5: E2E.** Dans `projects.spec.ts`, la boucle `accueil -> étude de cas ${slug} (${lang})` vérifie en plus que le premier `h2` de la page est `#h-ctx` et qu'il est visible. `sans JavaScript : étude de cas lisible` et `axe ${path} (${scheme})` restent verts. `npx playwright test projects` → PASS.
- [ ] **Step 6: Captures** 1440 et 390 px, clair et sombre, des quatre études, dans `.superpowers/sdd/2026-11-03-redesign-v4-vague-2/captures/` (git-ignoré).
- [ ] **Step 7: Commit** `feat(redesign): gabarit commun des études de cas`.

## Task 3: Contenu des quatre études (validé par Enzo)

Le contenu ne se devine pas : cette tâche s'arrête deux fois pour Enzo.

**Files:**
- Create: `docs/content/case-studies-v4.md` (faits et textes proposés)
- Create: `backend/src/main/resources/db/changelog/changes/20261103-1500-case-study-v4-content.sql`
- Test: `backend/src/test/java/dev/zofolio/content/SeedContentIT.java`

**Interfaces:**
- Consumes: colonnes `contribution`, `hindsight` (Task 1) ; omission des rubriques vides (Task 2).

Sources autorisées : `docs/content/facts-v2-case-studies.md` (§1 Oltre, §2 Zotracker, §4 GFaim ; chaque puce porte sa source) ; dépôts locaux `/Users/cobroux/Documents/application /Oltre` et `/Users/cobroux/Documents/application /ZoTracker` (README, `docs/PLAN.md`, `git log`) ; pour trading-app, uniquement `.superpowers/sdd/2026-11-02-redesign-v4-vague-1/worldline-facts.md`, dans les limites déjà publiées en vague 1 (P2, encadré Décision Gateway → RabbitMQ, « prototype move2cloud »). Textes actuels de prod : `curl -s https://zoworks.fr/api/{fr,en}/projects/{slug}` (lecture publique).

- [ ] **Step 1: Fiche.** Pour chaque étude et chaque rubrique (Contexte, Contraintes, Ce que j'ai porté, Résultat, Ce que je referais) : texte FR, texte EN, source de chaque phrase, ou `À FOURNIR` faute de fait. Pistes sourcées déjà repérées : Zotracker « Ce que je referais » ← `docs/PLAN.md` §1 (statistiques calculées deux fois, serveur et navigateur) et §3 phase 2 (store asynchrone) ; Oltre « Ce que j'ai porté » ← « construit seul, de zéro » ; GFaim ← « front et back, équipe de 4 » ; trading-app ← missions publiques de `worldline-facts.md`. Noter aussi : trading-app a `stage = null` en prod alors que l'accueil la place en P2 ; proposer `P2`.
- [ ] **Step 2: STOP 1.** Envoyer la fiche à Enzo ; il valide, corrige ou fournit chaque `À FOURNIR`. Toute ligne non validée est retirée.
- [ ] **Step 3: Test qui échoue** `SeedContentIT.caseStudiesV4ContentIsSeeded` : pour chaque slug, `contribution`, `hindsight` et `takeaway` (FR et EN) égaux aux textes validés ; les rubriques retirées restent nulles.
- [ ] **Step 4: Migration** `--changeset zofolio:case-study-v4-content`. Colonnes neuves : `UPDATE project SET contribution = '…'::jsonb WHERE slug = '…' AND contribution IS NULL`. Colonnes existantes réécrites (`takeaway`, au besoin `problem`, `wall`, `stage`) : garde sur la valeur relevée en prod au Step 1, par exemple `WHERE slug = 'gfaim' AND takeaway = '{"fr": "…", "en": "…"}'::jsonb`. Une garde qui échoue n'est pas une erreur : le texte se saisira dans l'admin. Apostrophes doublées.
- [ ] **Step 5:** `./mvnw -q -B verify` → PASS.
- [ ] **Step 6: STOP 2.** Site local, captures des quatre études FR et EN ; Enzo relit le rendu (Worldline mot à mot) avant le commit.
- [ ] **Step 7: Commit** `content(redesign): textes des études de cas v4`.

## Task 4: Fondu de page

**Files:**
- Modify: `frontend/src/app/app.config.ts:10` (`provideRouter`)
- Modify: `frontend/src/styles.css:90-94`
- Test: `frontend/e2e/projects.spec.ts`

**Interfaces:**
- Consumes: rien des tâches précédentes. Pas de resolver, donc pas de View Transition sur image partagée (abandon prévu par la spec §6).

- [ ] **Step 1: E2E qui échouent.**
  - `fondu : accueil -> étude -> retour, sans erreur console` : `page.addInitScript` enveloppe `document.startViewTransition` pour compter ses appels dans `window.__vt` ; collecter les erreurs `page.on('console')` ; depuis `/`, cliquer la ligne Oltre de l'index P3 → `/projets/oltre`, `window.__vt >= 1` ; `page.goBack()` → `/` ; aucune erreur console.
  - Dans `test.describe('reduced motion')`, `fondu : sauté en mouvement réduit` : même parcours ; `document.getAnimations().length === 0` juste après le clic.
- [ ] **Step 2:** `npx playwright test projects -g fondu` → FAIL.
- [ ] **Step 3:** `provideRouter(routes, withViewTransitions({ onViewTransitionCreated: ({ transition }) => { if (matchMedia('(prefers-reduced-motion: reduce)').matches) transition.skipTransition(); } }))`, avec `typeof matchMedia === 'function'` en garde pour le SSR. Dans `styles.css`, la règle `::view-transition-old(root), ::view-transition-new(root)` passe à `animation-timing-function: var(--ease-out)` (200 ms gardés). Le changement de thème (`theme.service.ts`) partage cette règle : vérifier qu'il reste correct.
- [ ] **Step 4:** `npm test -- --watch=false && npm run lint && npm run build && npx playwright test` → PASS.
- [ ] **Step 5: Commit** `feat(redesign): fondu de page de 200 ms`.

## Task 5: Finition de la vague 2 et DESIGN.md

**Files:**
- Modify: ce que la revue désigne, rien d'autre.
- Modify: `docs/DESIGN.md` (réécrit)

- [ ] **Step 1: Passe de finition** (skill impeccable, polish) sur les quatre études et la transition : 1440, 768, 390 px ; FR/EN ; clair/sombre ; clavier seul ; mouvement réduit. Corrections ordonnées, appliquées une à une avec leurs tests.
- [ ] **Step 2: Vérifications §10** : Vitest, lint, build, Playwright + axe (0 violation), `inspect.mjs` (0 FAIL à 1440/768/390), `impeccable detect` propre sur les fichiers modifiés, Lighthouse mobile local (performance ≥ 90 ; accessibilité, bonnes pratiques, SEO ≥ 95) sur `/` et `/projets/oltre`.
- [ ] **Step 3: DESIGN.md** réécrit par l'agent `impeccable-documenter` à partir du site construit.
- [ ] **Step 4: Commit** `docs(redesign): DESIGN.md v4`, push sur `origin/redesign/v4` ; la PR brouillon #54 relance la CI. **Ne pas fusionner.**
- [ ] **Step 5: Revue finale d'Enzo** sur captures et site local. Fusion dans `main` et déploiement seulement sur son feu vert explicite.
