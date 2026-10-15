# T35 : revue de code, point de contrôle C (branche feat/v1-accueil)

Verdict : **APPROUVÉ AVEC RÉSERVES, aucun bloquant.** T35 cochée.
Vérifié : `cd frontend && npm test` (12 fichiers, 36 tests verts) et `npm run lint` (propre). `npm run build` non lancé (consigne). `grep 'transition: all' src/` : aucun résultat.
Hors périmètre (déjà notés) : en-tête/pied sous le rail ≥ 1100 px, animation d'entrée, `[À FOURNIR]` de `legal.page.ts`.

Bon : SSR sûr (IntersectionObserver gardé par `typeof` et lancé dans `afterNextRender`, aucun `window`/`localStorage`), animations limitées à `transform`/`opacity`, reduced-motion respecté (global + `scroll-behavior` conditionné), portrait avec width/height, `fetchpriority="high"`, AVIF/WebP/JPG + srcset, dossard `aria-hidden`, `<dialog>` natif avec `aria-labelledby` et retour du focus, `aria-current="location"` sur les deux navs, ordre des titres h1 > h2 > h3 correct, seed sans client, classement ni lat/lon.

## Majeurs

1. `frontend/src/app/features/home-course/course-progress.ts:37-38` : `started = true` est posé une fois pour toutes sur un service `root`. Accueil > mentions légales > retour accueil : les sections sont recréées, mais `start()` sort tôt, l'observateur regarde des nœuds détachés, le rail reste figé. L'observateur n'est jamais déconnecté. Correctif : garder `io`, faire `io?.disconnect()` avant de recréer à chaque `start()` (ou un `stop()` au `ngOnDestroy` de RoadBook/ElevationProfile), avec un test « start deux fois ».
2. `frontend/src/app/features/legal/legal.page.ts:6` : `<main>` imbriqué dans le `<main id="contenu">` de `app.html:2` (landmark main dupliqué). Fera échouer l'axe de T36. Correctif : remplacer par `<div>` (ou `<article>`).
3. `frontend/src/app/features/home-course/road-book/road-book.html:1` : `aria-label` du déclencheur en dur (« Ouvrir le road book : km … sur … »), hors `$localize`. Correctif : construire la chaîne avec `$localize` dans le composant.
4. `frontend/src/app/shared/aid/aid.ts:9` : « Ravito · km {{ km() }} » sans `i18n`. Correctif : `<ng-container i18n>Ravito · km</ng-container>`.
5. `frontend/src/app/features/home-course/elevation-profile/elevation-profile.ts:6-10` et `.html:15` : libellés `'0'`, `'P1'`, `'Arr.'` en dur ; texte sr-only « km » en dur dans le template. Correctif : `$localize` pour `short` et `i18n` sur la phrase sr-only.
6. `frontend/src/app/features/contact/contact-form.ts:62` : `<form>` sans `method`/`action`. Sans JS (critère C « sans JS ») le submit natif envoie nom, e-mail et message en GET dans l'URL (logs, historique). Correctif : `method="post" action="/api/contact"` impossible en JSON ; plus simple : masquer le formulaire sans JS (`@if` en navigateur ou `hidden` retiré par script) et garder le `<noscript>` vers l'e-mail.
7. `frontend/src/styles.css` (lignes 16-20) et `road-book.css` (`:host` sticky) : aucun `scroll-margin-top` sur les sections. Sur mobile la barre sticky (`--target`) recouvre le haut de la section après un saut d'ancre (CTA « Me contacter », road book). Correctif : `section[id] { scroll-margin-top: var(--target); }` sous 1100 px.
8. `frontend/src/app/features/home-course/road-book/road-book.ts:41` : après un clic sur une étape du dialog, `restoreFocus()` renvoie le focus au bouton sticky au lieu de la section atteinte (clavier/lecteur d'écran repartent du haut). Correctif : ne pas restaurer le focus quand la fermeture vient d'un lien (ou focuser la cible `#id` avec `tabindex=-1`).

## Mineurs

9. `frontend/src/app/features/contact/contact-form.ts:168-173` : en cas d'erreur de validation le focus ne va pas sur le premier champ invalide ; les erreurs de champ ne sont pas annoncées (seul le message global est dans `role=status`). Correctif : `focus()` sur le premier champ en erreur.
10. `frontend/src/app/features/home-course/sections/p2.section.ts:16-19` : le lead (« De mars 2023 à septembre 2025… à Seclin… équipe Scrum ») diverge de `p2.lead` de `docs/content/copy-fr-v1.md:82`, et P2 est soumis à validation d'Enzo (SPEC §9). Correctif : reprendre le texte du copy ou le faire valider.
11. `frontend/src/app/features/home-course/sections/p1.section.ts:11`, `p2.section.ts:11` : `<section>` sans `aria-labelledby` alors que p3/journal/arrivée en ont. Correctif : ajouter `id` au h2 et `aria-labelledby`.
12. `frontend/src/app/shared/aid/aid.ts:8` : `<aside>` sans nom (3 landmarks complementary anonymes si les 2 ravitos + autres). Correctif : `aria-label` ou `<div role="group">`.
13. `frontend/src/app/features/home-course/sections/journal.section.ts` (`@media (max-width: 767px)`, `table, tr, td { display: block }`) : retire la sémantique de tableau dans Safari/VoiceOver. Correctif : ajouter `role` explicites ou garder `display: table*`.
14. `frontend/src/app/features/home-course/sections/journal.section.ts:5-16` : `formatDistance`/`formatDuration` produisent « km », « h », « min » en dur. Acceptable en V1 FR seul ; à passer en `$localize` au V2.
15. `frontend/src/app/features/home-course/course-progress.ts:40` : la section `#journal` n'est pas observée, le rail reste sur P3 pendant le journal. Correctif : l'ajouter à la progression ou documenter.
16. `tasks/todo.md-E` (262 lignes, suivi par git) : fichier parasite d'un `sed -i` macOS. Correctif : `git rm tasks/todo.md-E`.

## Tests

17. `frontend/src/testing/home.fixture.json` : les courses ne reflètent plus le seed (dates inventées 2025-01-01 pour Moines/Chtriman, marathon 42.195 contre 42.2, « Trail Côte d'Opale » contre « Côte d'Opale »). Les tests de journal valident donc la fixture, pas les données réelles. Correctif : aligner la fixture sur `20261015-1202-seed-races.sql` (dates NULL).
18. `journal.section.spec.ts:38` : `not.toContain('classement :')` est trop étroit (passerait avec « Classement 12e »). Correctif : `not.toMatch(/classement|rang|place/i)` en excluant le titre « pas un classement ».
19. `course-progress` : aucun test du second `start()` après destruction (cf. majeur 1) ; `road-book.spec.ts` remplace `showModal`/`close` par des simulations, donc le comportement natif (Esc, focus-trap) n'est pas testé (reste pour l'E2E T36).
20. `backend/src/test/java/dev/zofolio/content/SeedContentIT.java:19` : la propriété `it.seed=true` ne sert qu'à isoler le contexte ; le test ne vérifie ni l'absence de client Worldline, ni de lat/lon. Correctif : ajouter des `doesNotContain` sur les termes interdits du copy.

## Corrections (2026-10-15)

- 1 CourseProgress : corrigé (déconnexion et réobservation à chaque `start()`, test « start deux fois »).
- 2 `<main>` imbriqué : corrigé (`<div>`). 3 aria-label road book : corrigé (`$localize`). 4 Ravito : corrigé (i18n, `<section>` à la place de `<aside>`, ce qui règle aussi le 12). 5 profil : corrigé (`$localize` sur les libellés et le « km » sr-only).
- 6 formulaire sans JS : corrigé (`method="post"`, champs masqués sans `html.js`, seul le `<noscript>` reste ; le message ne passe jamais dans l'URL).
- 7 scroll-margin-top : corrigé (< 1100 px). 8 focus après lien d'étape : corrigé (focus sur la section visée, test).
- Mineurs : 9 focus premier champ invalide, 10 texte P2 aligné sur `p2.lead`, 11 aria-labelledby P1/P2, 12, 16 `tasks/todo.md-E` supprimé (`git rm`), 17 fixture alignée sur le seed, 18 assertion renforcée : corrigés. Mentions légales : `[À FOURNIR]` remplacés par `legal.*` (l'e-mail de `legal.rights.body` repris de `legal.editor.body`) ; test ajouté.
- Non traités : 13 (rôles de tableau), 14 ($localize des unités, V2), 15 (#journal dans la progression), 19 (E2E T36), 20 (SeedContentIT, back non touché).
