# Plan d'implémentation : Zofolio V2 « Mi-course »

> Entrées : `docs/SPEC.md` §2-3 (modules `projects`, `github-sync`, `i18n-en`), `docs/DESIGN.md`, V1 fusionné sur `main` (`tasks/plan.md`, contrats §4 toujours valables). Tâches : `tasks/todo-v2.md`. ADR : 0001 (traductions), 0002 (SSR), **0003 (vidéos, nouveau)**.
> Ce plan tient lieu de `docs/specs/SPEC-projects.md`, `SPEC-github-sync.md` et `SPEC-i18n-en.md`. Toute évolution de contrat se fait ici d'abord.
> État constaté le 2026-10-15 : `ffmpeg` **absent** (`which ffmpeg` ne renvoie rien ; `brew`, `avifenc`, `cwebp` et `sips` sont présents). Les tâches V1 de production T38-T41 ne sont pas faites. La branche `fix/retours-enzo` (visuel de l'accueil) est en cours. Un brouillon `docs/content/facts-v2-case-studies.md`, non suivi par git, existe déjà.

## 1. Décisions d'Enzo intégrées

- Études de cas : **Worldline** (slug `trading-app` : anonymisé, synthétique, compréhensible par un non-initié, sans architecture, client ni nom de fonctionnalité), **Oltre**, **Zotracker** et **GFaim** (non déployé, sans lien store). garmin-mcp redevient une fiche courte. Les autres fiches courtes restent sur l'accueil, avec un lien vers le dépôt. Pas de page catalogue.
- Clips générés automatiquement pour Oltre et Zotracker (lancés en local, données factices, enregistrement Playwright, ffmpeg) ; matériel GFaim fourni par Enzo. Le mode démo d'Oltre attend le V3 (`demoUrl` reste `null`).
- EN complet : contenu (`en` dans les jsonb) et interface (locale `en` de `@angular/localize`), retrait de la redirection `/en` → `/fr`, bascule FR/EN.
- github-sync toutes les 6 h (commits, langages, dernier push) avec repli sur le cache, token en lecture seule passé en variable d'environnement. Il remplace les compteurs codés en dur (`project.commits`).

## 2. Décisions d'architecture (suite de D1-D13)

| # | Décision | Raison |
|---|---|---|
| D14 | L'étude de cas tient dans des colonnes jsonb nullables de `project` (`role`, `problem`, `decisions`, `wall`, `takeaway`, `ai_note`, `video`), sans nouvelle table. `I18n.pick` devient générique (`<T> T pick(Map<String,T>, lang)`), ce qui permet de résoudre aussi une liste (`decisions` = `{"fr":[…],"en":[…]}`). | Une ligne par projet, sans jointure. Même modèle que l'ADR 0001, éditable tel quel par l'admin V3. |
| D15 | `project.github_repos` (jsonb, liste de noms de dépôts) remplace `repo_url` et `commits`, qui sont supprimés. `repoUrl` reste dans le DTO, dérivé du premier dépôt. Un projet peut avoir plusieurs dépôts (Oltre : back + front ; GFaim : api + app) : les commits s'additionnent, les octets par langage aussi, et `lastPushAt` prend le maximum. | Les compteurs viennent tous de GitHub ; le contrat V1 n'est pas cassé. |
| D16 | **Curation** : un dépôt n'apparaît que s'il est listé dans `github_repos` d'un projet non `HIDDEN`. Le cache stocke tous les dépôts publics, mais l'API n'expose que ceux-là. Pas de flag séparé avant l'admin V3. | Un seul endroit décide de la visibilité : le `tier`. |
| D17 | github-sync : **un seul appel GraphQL** (`POST https://api.github.com/graphql`) via `RestClient` (Spring), qui renvoie dépôts, langages (octets), `pushedAt`, `history.totalCount` de la branche par défaut et le calendrier de contributions. `@Scheduled(fixedRate = PT6H, initialDelay = PT30S)` et `@EnableScheduling`, donc aussi une synchro à chaque redémarrage. | Aucune dépendance ajoutée, un seul appel au lieu de N×3 en REST, et une synchro au démarrage remplit le cache dès le premier déploiement. |
| D18 | **Repli** : la synchro écrit dans une seule transaction, uniquement si la réponse est complète (HTTP 200, sans `errors`, avec `user` non nul). Sinon, rien n'est modifié et un WARN est journalisé (statut HTTP et message, **jamais le token**). Avec `GITHUB_TOKEN` vide (dev, CI), aucun appel, un INFO, et le cache reste vide : `commits` vaut `null`, `languages` vaut `[]`, `contributions` vaut `null`. | « Dernier cache valide » sans code de versionnage ; CI sans secret. |
| D19 | Token : un PAT *fine-grained* avec seulement « Public repositories (read-only) », aucune permission de compte, et une expiration notée par Enzo. Variable `GITHUB_TOKEN` (`.env`, GitHub Secrets pour le déploiement) ; `zofolio.github.login=cobroux` est en propriété. | Moindre privilège ; à l'expiration, le site continue sur le cache (D18). |
| D20 | Route de l'étude de cas : `projets/:slug`, **identique dans les deux locales** (`/en/projets/oltre`, comme `/en/mentions-legales`). Une étude de cas existe si `caseStudy ≠ null`. Sinon (fiche courte, slug inconnu ou API en panne), la page 404 est servie avec le statut 404 en SSR. | La bascule FR/EN n'a qu'à changer le préfixe, sans table de correspondance des chemins. |
| D21 | Bascule FR/EN : un lien `<a href="/en{chemin}{#ancre active}" hreflang="en" lang="en">` dans l'en-tête, qui recharge la page (ADR 0001). Il conserve la section courante par l'ancre (DESIGN §9) et marche sans JS (sans l'ancre). `/` redirige en 302 selon `req.acceptsLanguages('fr','en')`, en FR par défaut, avec `Vary: Accept-Language`. | Une ligne Express ; pas d'état côté client. |
| D22 | Build : `localize: true`, `locales.en = {translation: src/locale/messages.en.xlf, subPath: en}`, `i18nMissingTranslation: "error"`. Un texte d'interface sans traduction EN fait échouer le build. Le XLIFF initial reprend les cibles FR marquées `state="initial"` pour que le build reste vert jusqu'à la traduction (V2-T33). | La garantie « pas de FR dans `/en` » passe par le compilateur. |
| D23 | Clips : ADR 0003 (MP4 + WebM ≤ 2,5 Mo, affiche WebP, fichiers dans `frontend/public/media/`). Composant `Clip` : `@defer (on viewport)` avec, en placeholder, l'affiche dans un `<img loading="lazy">` de même ratio ; `<video muted loop playsinline preload="none" poster>` ; lecture et pause pilotées par IntersectionObserver ; **pas de lecture automatique** si `prefers-reduced-motion`, `navigator.connection.saveData` ou `effectiveType` en `2g`/`slow-2g`, avec un bouton Lecture à la place ; un bouton Pause est toujours visible (WCAG 2.2.2) ; la légende sert de nom accessible. | SPEC §3 projects, DESIGN §7-8 ; Lighthouse épargné (rien n'est chargé hors viewport). |
| D24 | Les clips sont enregistrés **hors CI**, depuis `tools/clips/`, avec le `@playwright/test` déjà installé. Les applications tournent sous des projets Compose dédiés (`-p oltre-demo`, `-p zotracker-demo`) avec un fichier d'override (`container_name` et ports en `127.0.0.1`), puis `down -v`. **Les volumes existants `oltre-backend_mysql_data` et `zotracker-local_data` ne sont jamais montés** : ils contiennent probablement de vraies données. Données factices injectées par l'API REST de chaque appli ; **aucune modification des dépôts Oltre et Zotracker**. | Aucune donnée réelle (Garmin, GPS, personnelle) ne peut entrer dans le cadre. |
| D25 | Schémas d'architecture : un composant SVG inline par projet côté front (`features/projects/diagrams/{slug}.diagram.ts`), avec les couleurs du thème, `<title>` et `<desc>` traduits par i18n, et choisi par slug. Aucun schéma pour `trading-app`. Rien en base. | DESIGN §8 (SVG thématisé) ; l'admin V3 n'a pas à éditer du SVG. |
| D26 | Graphe de contributions (Journal, DESIGN §5) : SVG rendu en SSR depuis `home.contributions` (5 tons d'orange), avec un résumé texte (« 812 contributions sur 12 mois ») comme équivalent accessible. Section masquée si la valeur est `null`. | Pas de bibliothèque ; lisible sans JS. |

### Dépendances
Aucune nouvelle dépendance de code : `RestClient`, `@Scheduled` et `MockRestServiceServer` viennent déjà de Spring, et `@angular/localize` et Playwright sont déjà installés. Sont à approuver par Enzo (« demander d'abord ») : l'**outil local `ffmpeg`** (`brew install ffmpeg`), la **variable `GITHUB_TOKEN`** dans le déploiement et le **build CI multi-locale** (durée de build ×2).

## 3. Graphe de dépendances

```
Enzo : T1 décisions+ffmpeg+token ─┬─ T8 schéma projet ─ T9 client GitHub ─ T10 planif+exposition ─┐
                                  ├─ T13 modèles front ─┬─ T23 Clip ─ T24 page étude ─ T25 SVG    ├─ T16 revue F
                                  ├─ T14 infra i18n EN  ├─ T26 accueil (liens, clip, sync)        │
                                  ├─ T15 direction design ┘ T27 graphe contributions              │
                                  ├─ T11 GITHUB_TOKEN env/deploy                                  │
                                  └─ T17 outillage clips ─ T18 Oltre, T19 Zotracker, T20 GFaim ◄ T7 ─ T21 Enzo valide les clips
Enzo T2 ─ T3 faits ─ T4 textes FR ─ T5 Enzo valide ─ T22 seed FR ─┐
                                              └─ T30 textes EN ─ T31 Enzo valide ─ T32 seed EN
T6 CV EN (Enzo) ─ T12 CV EN back            T24-T27 gelés ─ T33 XLIFF EN ◄ T31
T28 revue design G, T29 revue code G ─ T34 E2E+axe ∥ T35 Lighthouse+break-ui ─ T36 déploiement (◄ V1 T39) ─ T37 smoke prod
```

**Chemin critique :** T2 (réponses d'Enzo) → T3 → T4 → **T5 (validation Enzo, Worldline)** → T30 → **T31 (validation EN)** → T32/T33 → T34/T35 → T36 → T37. Comme au V1, le goulot est le contenu validé par Enzo. Une autre condition bloque la mise en ligne : les tâches V1 T38/T39 (VPS, domaine, déploiement) doivent être faites avant T36. Code et clips avancent en parallèle sur des fixtures.

## 4. Contrats d'API V2

Toutes les règles du plan V1 §4 restent valables : champs absents = `null`, jamais omis ; erreurs `ProblemDetail` ; `{lang:fr|en}`. **Aucun nouveau code d'erreur.** Tous les changements sont des **ajouts** au contrat V1. Seuls `commits` et `repoUrl` changent de source (cache GitHub et `github_repos`).

### 4.1 `ProjectSummary` (listes `/home`, `/projects` et détail)
```json
{ "slug": "oltre", "tier": "CASE_STUDY", "stage": "P3", "title": "Oltre", "pitch": "…",
  "aiTag": "HAND_THEN_AI", "stack": ["Angular 22", "Java 21", "Spring Boot", "MySQL"],
  "duration": "4 mois", "commits": 355, "note": "…",
  "repoUrl": "https://github.com/cobroux/Oltre-backend", "demoUrl": null,
  "languages": ["Java", "TypeScript", "HTML"],
  "lastPushAt": "2026-10-14T09:35:08Z",
  "video": { "mp4": "media/oltre-1.mp4", "webm": "media/oltre-1.webm", "poster": "media/oltre-1.webp",
             "width": 1280, "height": 800, "caption": "Parcours dans Oltre : dépenses, tâches, repas." },
  "caseStudy": null }
```
- `commits` : somme sur les dépôts du projet d'après le cache ; `null` si le cache est vide ou si le projet n'a pas de dépôt (Worldline). `languages` : les 3 premiers par octets cumulés, `[]` sans cache. `lastPushAt` : ISO-8601 UTC, ou `null`.
- `repoUrl` : `https://github.com/cobroux/{github_repos[0]}`, ou `null`.
- `video` : `null` si le projet n'a pas de clip. URL relatives à `<base href>` (ADR 0003).
- `caseStudy` vaut **toujours `null` dans les listes** (pour garder `/home` léger).

### 4.2 `GET /api/{lang}/projects/{slug}` → 200 `ProjectSummary` avec `caseStudy`
```json
"caseStudy": {
  "role": "Seul développeur, du schéma au déploiement",
  "problem": "…",
  "decisions": [ { "title": "…", "tradeoff": "…" } ],
  "wall": "…",
  "takeaway": "…",
  "aiNote": "…",
  "repos": [ { "name": "Oltre-backend", "url": "https://github.com/cobroux/Oltre-backend" },
             { "name": "oltre-frontend", "url": "https://github.com/cobroux/oltre-frontend" } ] }
```
- `caseStudy` est non nul si et seulement si `tier = CASE_STUDY` **et** `problem` est renseigné. Pour une fiche courte, la réponse reste 200 avec `caseStudy: null` (comportement V1) ; le front affiche alors la page 404 (D20). Inconnu ou `HIDDEN` → 404 `NOT_FOUND` (inchangé).
- `decisions` : 2 ou 3 éléments, résolus en bloc par langue (si la liste EN manque, la liste FR est servie). `aiNote` : `null` autorisé. `repos` : `[]` pour Worldline.
- Ordre de la page (DESIGN §8) : pitch et split (`duration`, `role`, `stack`, `commits`, `languages`) → `problem` → schéma (front, par slug) → `decisions` → `wall` (« Le mur du 60e km ») → `takeaway` → liens (`repos`, `demoUrl`, clip).

### 4.3 `GET /api/{lang}/home` : ajout de `contributions`
```json
{ "experiences": [ … ], "projects": [ … ], "races": [ … ],
  "contributions": { "start": "2025-10-12", "counts": [0, 3, 1, 0, …], "total": 812,
                     "syncedAt": "2026-10-15T12:00:30Z" } }
```
- `start` : premier jour (dimanche) du calendrier GitHub ; `counts` : une valeur par jour (au plus 371), dans l'ordre. Vaut `null` tant qu'aucune synchro n'a réussi.

### 4.4 CV
`GET /api/en/cv` sert `Enzo-Leveque-CV-EN.pdf` (nom EN) dès que le fichier est présent, sinon le FR (repli D9 conservé).

### 4.5 Schéma (changesets à la suite de `20261015-1202`, l'ordre alphabétique fait foi)
```
-- 20261016-0100-project-v2.sql
ALTER TABLE project ADD COLUMN github_repos JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN role JSONB, ADD COLUMN problem JSONB, ADD COLUMN decisions JSONB, ADD COLUMN wall JSONB,
  ADD COLUMN takeaway JSONB, ADD COLUMN ai_note JSONB, ADD COLUMN video JSONB;
UPDATE project SET github_repos = jsonb_build_array(regexp_replace(repo_url, '^https://github\.com/cobroux/', ''))
  WHERE repo_url IS NOT NULL;
ALTER TABLE project DROP COLUMN commits, DROP COLUMN repo_url;
--   decisions : {"fr":[{"title":"…","tradeoff":"…"}],"en":[…]}
--   video     : {"name":"oltre-1","width":1280,"height":800,"caption":{"fr":"…","en":"…"}}
-- 20261016-0200-github-cache.sql
CREATE TABLE github_repo (name VARCHAR(100) PRIMARY KEY, pushed_at TIMESTAMPTZ, commits INT,
  languages JSONB NOT NULL, synced_at TIMESTAMPTZ NOT NULL);           -- languages : {"Java": 502113}
CREATE TABLE github_contributions (id SMALLINT PRIMARY KEY CHECK (id = 1), start_date DATE NOT NULL,
  counts JSONB NOT NULL, total INT NOT NULL, synced_at TIMESTAMPTZ NOT NULL);
-- 20261016-0300-seed-v2-fr.sql : études de cas FR, github_repos de tous les projets, video
-- 20261016-0400-seed-v2-en.sql : `UPDATE … SET champ = champ || '{"en":"…"}'::jsonb` sur project, experience, race
```
- Synchro réussie : upsert des dépôts reçus, suppression des autres et remplacement de la ligne `github_contributions`, dans une seule transaction.

### 4.6 Front
- Routes (dans les deux locales) : `''`, `projets/:slug` (nouvelle), `mentions-legales`, `**`. `sitemap.xml` statique : 2 locales × (accueil, 4 études, mentions), avec `xhtml:link` alternates ; `hreflang` `fr`, `en` et `x-default` (→ `/fr/`) sur chaque page.
- Variables : `GITHUB_TOKEN` (back) s'ajoute à celles du plan V1 §4.6, dans `.env.example`.
- Requête GraphQL de référence (V2-T9) :
```graphql
query($login: String!) { user(login: $login) {
  repositories(first: 100, privacy: PUBLIC, ownerAffiliations: OWNER, isFork: false) { nodes {
    name pushedAt
    languages(first: 10, orderBy: {field: SIZE, direction: DESC}) { edges { size node { name } } }
    defaultBranchRef { target { ... on Commit { history { totalCount } } } } } }
  contributionsCollection { contributionCalendar { totalContributions
    weeks { contributionDays { date contributionCount } } } } } }
```

## 5. Production des clips (D24, ADR 0003)

| Clip | Source | Données factices | Parcours (15-30 s) | À exclure du cadre |
|---|---|---|---|---|
| Oltre | `Oltre-backend/docker-compose.yaml` + override, `-p oltre-demo`, `JWT_SECRET` aléatoire, sans `GARMIN_*` ni `GEMINI_API_KEY` | Script `tools/clips/oltre-seed.mjs` : `POST /auth/register` (`demo@example.com`), puis dépenses, tâches, repas et rendez-vous via l'API REST | Connexion déjà faite → dépenses → tâches → calendrier → repas | Pages sport et coach (dépendent de Garmin et Gemini) ; aucune recherche OpenFoodFacts en direct |
| Zotracker | `Zotracker/docker-compose.yml` + override, `-p zotracker-demo`, `ADMIN_PASSWORD` factice | Course « Démo » sur le tracé **officiel public** du GTA (SPEC §11 : aucun tracé personnel ; GPX jamais commité), profil « Coureur démo » sans photo, aucun contact de sécurité | Admin : simulation ×30 → page publique : carte, chrono, ravitos, profil d'altitude | Toute instance en ligne d'Enzo ; aucun `demoUrl` vers un suivi réel |
| GFaim | Matériel d'Enzo (V2-T7) : enregistrement d'écran Android, ou 4 à 6 captures | Compte et données factices côté Enzo | Écrans principaux de l'app | E-mail, nom ou photo réels |

Enchaînement : `docker compose -p <p> -f <compose> -f tools/clips/<p>.override.yml up -d --build` → seed → `npx playwright test -c tools/clips/playwright.clips.config.ts <p>` (vidéo 1280×800) → `tools/clips/encode.sh <webm> <slug>-1 <t_affiche>` → `docker compose -p <p> down -v`. Vérification après encodage : `ffprobe` (sans audio, durée 15-30 s) et `du -k` ≤ 2560 par fichier. **Avant `brew install ffmpeg` (accord d'Enzo), T18-T20 peuvent enregistrer, mais pas encoder ni publier.**

## 6. Risques et parades

| Risque | Impact | Parade |
|---|---|---|
| Réponses et validations d'Enzo tardives (faits GFaim et Worldline, textes FR puis EN) | Haut (chemin critique) | T2 au jour 0 ; front et back sur fixtures ; seeds dans des changesets séparés (T22, T32) ; EN traduit dès la validation FR. |
| Texte Worldline trop précis (architecture, fonctionnalité, client) | Haut | Gabarit réduit (pas de schéma), relecture « non-initié » par le copywriter, validation obligatoire d'Enzo (T5, T31), `grep -i -E 'client|banque|ordre|portefeuille'` sur les seeds. |
| Donnée réelle dans un clip (volume existant monté, compte réel, position GPS) | Haut | D24 : projets Compose dédiés, `down -v`, seed factice ; vérification image par image par Enzo (T21) avant tout commit dans `public/media`. |
| `ffmpeg` absent | Moyen | Accord d'Enzo dans T1 (`brew install ffmpeg`) ; sinon pas de clip au V2 (le composant `Clip` gère `video: null`). |
| Token GitHub expiré ou révoqué | Faible | D18 : cache servi, WARN dans les logs ; date d'expiration notée par Enzo (T1). |
| Le nombre de commits du `totalCount` (branche par défaut, tous auteurs) diffère de `git rev-list` | Faible | Accepté et documenté ; la valeur affichée est celle de GitHub. |
| Build et image Docker doublés (2 locales, médias copiés deux fois) | Faible | ADR 0003 ; budgets `angular.json` vérifiés par locale ; durée CI surveillée. |
| Conflits avec `fix/retours-enzo` (en-tête, sections de l'accueil) | Moyen | Les branches V2 partent de `main` **après** la fusion de `fix/retours-enzo` pour T14, T26 et T27 ; T8-T13 et T17-T19 peuvent démarrer avant (fichiers disjoints). |
| Lighthouse ≥ 90 sur une page avec vidéo | Moyen | D23 (`@defer`, `preload="none"`, affiche ~40 Ko dimensionnée) ; T35 mesure l'accueil et une étude de cas, en FR et en EN. |
| Mise en ligne V2 bloquée par la prod V1 (T38/T39 non faites) | Moyen | T36 dépend explicitement de V1 T39 ; tout le reste avance sans. |

## 7. Points de contrôle

| Point | Après | Critères (tous verts, sinon pas de phase suivante) |
|---|---|---|
| **E : Décisions et contenu FR** (T5) | T1-T4 | Plan-v2 et ADR 0003 validés ; ffmpeg installé ; token créé ; `copy-fr-v2.md` validé par Enzo (Worldline compris). |
| **F : Briques** (T16) | T8-T14 | `./mvnw verify` vert (IT sync : succès, échec avec cache intact, token vide) ; couverture des services ≥ 80 % ; contrat §4 respecté à l'identique par le back et `api.models.ts` ; `npm run build` produit `browser/fr` et `browser/en` ; `/en/` servi, `/` + `Accept-Language: en` → `/en/`. |
| **G : Pages et clips** (T28, T29) | T15, T17-T27 | 4 études de cas rendues en SSR et lisibles sans JS ; clips ≤ 2,5 Mo validés par Enzo ; sous reduced-motion, affiche et bouton Lecture ; checklist DESIGN §9 en clair et en sombre à 360/390/768/1440. |
| **H : Release V2** (T34-T37) | T30-T33 | Aucun `state="initial"` dans le XLIFF ; tous les jsonb ont `en` ; E2E (étude de cas, bascule FR/EN, `Accept-Language`, sans JS) + axe 0 en FR et EN ; Lighthouse mobile ≥ 90/95/95/95 sur l'accueil et une étude de cas, dans les deux locales ; sync visible en prod (`commits` non nul). |

### Critères de succès V2
- [ ] Les 4 études de cas sont en ligne en FR et en EN, accessibles depuis l'accueil, et respectent le gabarit SPEC §3.
- [ ] Les commits, langages et dernier push affichés viennent de GitHub ; un échec de synchro ne change rien à l'affichage.
- [ ] `/en/` ne contient aucun texte FR ; la bascule FR/EN garde la section ; `hreflang` est complet.
- [ ] Les clips Oltre, Zotracker et GFaim ne contiennent aucune donnée réelle, ne se lancent jamais sous reduced-motion ni en Save-Data, et ont un bouton Pause.

## 8. Questions ouvertes (Enzo, dans V2-T1)
1. Valider D14-D26 et l'ADR 0003 (vidéos commitées dans le dépôt) ; autoriser `brew install ffmpeg`.
2. GFaim n'a pas d'étape sur l'accueil (`stage` nul), donc aucune entrée vers sa page. Proposition : le placer en P1 (projet universitaire, à côté de LISP, BomberStudent et DPE).
3. Cin-folie, quarkus-color, ObjVLisp2023 et LambdaCalcul (fiches courtes sans étape) n'apparaissent pas aujourd'hui sur l'accueil. Faut-il les ajouter en P1, ou les laisser hors de l'accueil ?
4. URL identiques dans les deux langues (`/en/projets/oltre`) : d'accord (D20) ?
5. Simulation Zotracker sur le tracé officiel du GTA (public, déjà validé au V1) : d'accord ? Pas de lien vers ton instance Zotracker en ligne : confirmé ?
6. Worldline : slug `trading-app` et titre « Application de trading » conservés ? Le nom de l'employeur peut-il apparaître sur la page ?

## 9. Décisions d'Enzo (2026-10-15)
1. D14-D26 et ADR 0003 validés ; ffmpeg installé (brew).
2. GFaim placé en P1 (avec les projets universitaires), avec sa page d'étude de cas.
3. Cin-folie, quarkus-color, ObjVLisp2023 et LambdaCalcul ajoutés en P1 en version compacte (une ligne chacun : nom, stack, lien vers le dépôt).
4. URL identiques FR/EN (`/fr/projets/oltre`, `/en/projets/oltre`).
5. Clip Zotracker : course simulée sur le tracé officiel du GTA, sans lien vers l'instance en ligne.
6. Page Worldline : titre « Application de trading chez Worldline » (le nom de l'employeur est autorisé), slug `trading-app` conservé.
7. Token GitHub fine-grained en lecture seule : Enzo le crée avec guidage (V2-T1).
