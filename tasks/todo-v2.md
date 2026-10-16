# Tâches V2 « Mi-course »

> Contrats, décisions (D14-D26), risques et points de contrôle : `tasks/plan-v2.md`. ADR 0003 (vidéos). Chaque tâche laisse le build vert. Avant tout commit : `cd backend && ./mvnw verify` et `cd frontend && npm test` (SPEC §9).
> Chemins front relatifs à `frontend/src/app/`, back à `backend/src/main/java/dev/zofolio/` (tests sous `backend/src/test/java/dev/zofolio/`), Liquibase à `backend/src/main/resources/db/changelog/changes/`.
> Les tâches **🟧 ENZO** sont du contenu ou des décisions à fournir par Enzo : aucun agent ne peut les faire à sa place. Modèle = le moins cher adapté (SPEC §12).
> Branches : partir de `main` **après** la fusion de `fix/retours-enzo` pour T14, T26 et T27 (en-tête et sections de l'accueil).

## Phase 0 : Décisions et contenu (démarre au jour 0, en fond)

- [x] V2-T1 🟧 ENZO [agent: — · Enzo] Décisions, ffmpeg et token GitHub
  - Acceptation : questions du plan-v2 §8 tranchées (notées en tête de `plan-v2.md`) ; ADR 0003 accepté ; `brew install ffmpeg` fait ; PAT *fine-grained* créé (« Public repositories (read-only) », sans permission de compte, expiration notée), posé dans `.env` local (jamais commité) et, au moment de T36, dans GitHub Secrets.
  - Vérification : `which ffmpeg` ; `curl -s -H "Authorization: Bearer $GITHUB_TOKEN" -d '{"query":"{viewer{login}}"}' https://api.github.com/graphql` → `cobroux`.
  - Fichiers : `tasks/plan-v2.md` (réponses), `docs/adr/0003-format-et-hebergement-des-videos.md` (statut)
  - Dépend de : —

- [x] V2-T2 🟧 ENZO [agent: — · Enzo] Compléter les « À FOURNIR » des études de cas
  - Acceptation : réponses à `docs/content/facts-v2-case-studies.md` §6 : motivation de chaque projet, rôle et durée, statut ; GFaim (pitch, problème, description et frameworks de l'app Android, difficulté) ; Worldline (nom de l'employeur publiable ou non, dates, ce qui peut être dit à un non-initié).
  - Vérification : chaque puce `À FOURNIR` de la §6 a une réponse (dans le fichier ou en message).
  - Fichiers : `docs/content/facts-v2-case-studies.md`
  - Dépend de : —

- [x] V2-T3 [agent: content-researcher · haiku] Consolider les faits V2
  - Acceptation : réponses de T2 intégrées avec leur source (« Source : Enzo ») ; garmin-mcp sorti des études de cas (fiche courte) ; nouvelle section « Dépôts par projet » : chaque projet non masqué → liste de dépôts GitHub `cobroux/*` (Oltre : `Oltre-backend`, `oltre-frontend` ; GFaim : `GFaim-api`, `GFaim-app` ; Cin-folie : `Cin-folie-website` ; LambdaCalcul : `LambdalCalcul-project` ; DPE : `Projet-JAI-Devops-DPE-calculator`…) ; aucun fait inventé.
  - Vérification : `grep -c 'À FOURNIR' docs/content/facts-v2-case-studies.md` = 0, ou chaque reste justifié ; `gh repo view cobroux/<nom>` répond pour chaque dépôt listé.
  - Fichiers : `docs/content/facts-v2-case-studies.md`
  - Dépend de : T2

- [ ] V2-T4 [agent: copywriter · sonnet] Rédiger les textes FR du V2
  - Acceptation : pour Oltre, Zotracker, GFaim et Worldline : `pitch`, `role`, `duration`, `problem`, 2 ou 3 `decisions` (titre et compromis), `wall`, `takeaway`, `aiNote`, selon le gabarit plan-v2 §4.2. **Worldline** : vue d'ensemble compréhensible par un non-initié, sans architecture, client ni nom de fonctionnalité, pas de `decisions` techniques internes (des leçons de métier à la place) ; légendes des 3 clips ; textes `title`/`desc` des 3 schémas ; textes d'interface V2 (titres de la page projet, « Le mur du 60e km », boutons Lecture/Pause, bascule de langue, graphe de contributions, 404 projet) ; meta title et description des 4 pages ; DESIGN §1 respecté.
  - Vérification : `grep -i -E 'passionn|innovant|de l.idée à la production|client|banque' docs/content/copy-fr-v2.md` vide.
  - Fichiers : `docs/content/copy-fr-v2.md`
  - Dépend de : T3

- [x] V2-T5 🟧 ENZO [agent: — · Enzo] Valider les textes FR du V2 (point de contrôle E)
  - Acceptation : `copy-fr-v2.md` relu ; Worldline validé mot à mot (SPEC §9) ; validation datée en tête du fichier.
  - Vérification : ligne « Validé par Enzo le … » en tête de `copy-fr-v2.md`.
  - Fichiers : `docs/content/copy-fr-v2.md`
  - Dépend de : T4

- [x] V2-T6 🟧 ENZO [agent: — · Enzo] Fournir le CV EN en PDF
  - Acceptation : même contenu public que le CV FR (V1 T1 : téléphone, e-mail, localisation de recherche), exporté depuis Google Docs.
  - Vérification : `exiftool Enzo-Leveque-CV-EN.pdf | grep -i -E 'author|creator'` vide ou neutre (fait par T12).
  - Fichiers : —
  - Dépend de : —

- [x] V2-T7 (SANS OBJET : aucun média GFaim, page sans clip) 🟧 ENZO [agent: — · Enzo] Fournir le matériel vidéo de GFaim
  - Acceptation : un enregistrement d'écran Android de 15 à 30 s (enregistreur intégré ou `adb shell screenrecord`) **ou** 4 à 6 captures PNG, avec un compte et des données factices (aucun e-mail, nom ni photo réels), déposés hors du dépôt (par exemple `~/Desktop/gfaim-clip/`).
  - Vérification : relecture image par image dans T21.
  - Fichiers : —
  - Dépend de : —

## Phase 1 : Briques (back ∥ front, contrat = plan-v2 §4)

- [x] V2-T8 [agent: backend-dev · sonnet] Schéma projet V2 et DTO d'étude de cas
  - Acceptation : changeset `20261016-0100-project-v2.sql` (plan-v2 §4.5 : migration `repo_url` → `github_repos`, suppression de `commits` et `repo_url`) ; entité `Project` à jour ; `I18n.pick` générique (D14) ; `ProjectSummary` étendu (`languages`, `lastPushAt`, `video`, `caseStudy`) et `CaseStudy`, `Decision`, `Video`, `RepoLink` en records ; `repoUrl` dérivé ; `caseStudy` à `null` dans les listes et pour un `SHORT` ; en attendant T10, `commits`/`languages`/`lastPushAt` valent `null`/`[]`/`null`.
  - Vérification : `cd backend && ./mvnw verify` (IT : détail d'une étude de cas sur des données de test, `decisions` EN absentes → liste FR, `video` → 3 URL, fiche courte → `caseStudy: null`, `HIDDEN` → 404 ; `SeedContentIT` toujours vert).
  - Fichiers : `db/changelog/changes/20261016-0100-project-v2.sql`, `content/Project.java`, `content/ContentDto.java`, `content/ContentService.java`, `shared/I18n.java`, `content/ContentApiIT.java`, `content/ContentServiceTest.java`
  - Dépend de : T1

- [x] V2-T9 [agent: backend-dev · sonnet] github-sync : client GraphQL et cache en base
  - Acceptation : package `githubsync/` : `GithubClient` (`RestClient`, timeouts 10 s, `Authorization: Bearer`, requête plan-v2 §4.6), `GithubSyncService.sync()` transactionnel (D18), entités `GithubRepo` et `GithubContributions`, changeset `20261016-0200-github-cache.sql` ; réponse validée (HTTP 200, pas de `errors`, `user` non nul ; noms ≤ 100 caractères, nombres ≥ 0) ; token vide → aucun appel ; le token n'apparaît dans aucun log.
  - Vérification : `cd backend && ./mvnw verify` (`MockRestServiceServer` : succès → lignes écrites ; 401, 500, `errors` GraphQL, `user: null`, timeout → cache précédent intact ; token vide → 0 requête).
  - Fichiers : `githubsync/GithubClient.java`, `githubsync/GithubSyncService.java`, `githubsync/GithubRepo.java`, `githubsync/GithubRepoRepository.java`, `githubsync/GithubContributions.java`, `githubsync/GithubContributionsRepository.java`, `db/changelog/changes/20261016-0200-github-cache.sql`, `githubsync/GithubSyncServiceTest.java`, `githubsync/GithubSyncIT.java`, `backend/src/test/resources/github/graphql-ok.json`, `backend/src/main/resources/application.properties`
  - Dépend de : T8

- [x] V2-T10 [agent: backend-dev · sonnet] github-sync : planification et exposition dans l'API
  - Acceptation : `@EnableScheduling` ; `@Scheduled(fixedRateString = "PT6H", initialDelayString = "PT30S")` ; `ProjectSummary.commits` = somme, `languages` = 3 premiers par octets cumulés, `lastPushAt` = maximum, sur les seuls `github_repos` du projet (D15, D16) ; `home.contributions` (plan-v2 §4.3) ou `null`. Aucun dépôt hors `github_repos` exposé.
  - Vérification : `cd backend && ./mvnw verify` (tests : agrégation sur 2 dépôts, cache vide → `null`/`[]`, dépôt non curé jamais exposé ; couverture `ContentService` et `GithubSyncService` ≥ 80 %).
  - Fichiers : `ZofolioApplication.java`, `githubsync/GithubSyncJob.java`, `content/ContentService.java`, `content/ContentDto.java`, `content/ContentServiceTest.java`, `content/ContentApiIT.java`
  - Dépend de : T9

- [ ] V2-T11 [agent: devops · haiku] Variable `GITHUB_TOKEN` (soumis à Enzo)
  - Acceptation : `GITHUB_TOKEN=` (vide) dans `.env.example` ; transmis au `backend` dans `docker-compose.yml` (et `docker-compose.prod.yml` s'il existe) ; CI sans token (D18) ; procédure de création et de rotation du token dans le README (droits exacts, expiration). Si la tâche sort de la routine, la signaler et la passer à sonnet.
  - Vérification : `docker compose config | grep -c GITHUB_TOKEN` ≥ 1 ; `git grep -n -E 'gh[pousr]_[A-Za-z0-9]{20,}|github_pat_'` vide.
  - Fichiers : `.env.example`, `docker-compose.yml`, `README.md`
  - Dépend de : T1

- [ ] V2-T12 [agent: backend-dev · sonnet] CV EN
  - Acceptation : `Enzo-Leveque-CV-EN.pdf` (T6) placé sans métadonnées d'auteur ; `GET /api/en/cv` → fichier EN, nom `Enzo-Leveque-CV-EN.pdf` ; fichier EN absent → repli FR (D9) ; compteur inchangé.
  - Vérification : `cd backend && ./mvnw verify` (IT : en-tête `filename` EN, repli FR quand le fichier EN manque) ; `exiftool backend/src/main/resources/cv/Enzo-Leveque-CV-EN.pdf | grep -i -E 'author|creator'` vide ou neutre.
  - Fichiers : `cv/CvController.java`, `cv/CvApiIT.java`, `backend/src/main/resources/cv/Enzo-Leveque-CV-EN.pdf`, `backend/src/test/resources/cv/Enzo-Leveque-CV-EN.pdf`
  - Dépend de : T6

- [x] V2-T13 [agent: frontend-dev · sonnet] Modèles et client API V2
  - Acceptation : `api.models.ts` miroir exact de plan-v2 §4 (`ProjectSummary` étendu, `CaseStudy`, `Video`, `Contributions`) ; `ContentApi.project()` inchangé côté appel ; fixtures `project-oltre.fixture.json`, `project-trading-app.fixture.json` (`repos: []`, sans vidéo) et `home.fixture.json` complété (`contributions`, `video`, `languages`).
  - Vérification : `cd frontend && npm test && npm run lint`.
  - Fichiers : `core/api/api.models.ts`, `core/api/content.api.spec.ts`, `frontend/src/testing/home.fixture.json`, `frontend/src/testing/project-oltre.fixture.json`, `frontend/src/testing/project-trading-app.fixture.json`
  - Dépend de : T1

- [x] V2-T14 [agent: frontend-dev · sonnet] Infra i18n EN, redirection et bascule FR/EN
  - Acceptation : `angular.json` (D22 : `localize: true`, locale `en`, `i18nMissingTranslation: "error"`) ; `ng extract-i18n` → `src/locale/messages.xlf` et `messages.en.xlf` (cibles FR en `state="initial"`) ; `server.ts` : redirection `/en` → `/fr` supprimée, `/` → `/fr/` ou `/en/` par `req.acceptsLanguages` + `Vary: Accept-Language` (D21), `robots.txt`/`sitemap.xml` toujours à la racine ; SEO : `hreflang` `fr`, `en`, `x-default` ; `sitemap.xml` (plan-v2 §4.6) ; bascule dans l'en-tête (D21 : ancre active conservée, `lang`/`hreflang`, cible 44 px) ; `og-en.jpg` si l'image OG contient du texte FR ; formats de dates et de nombres suivant `LOCALE_ID`.
  - Vérification : `cd frontend && npm test && npm run build && test -d dist/frontend/browser/en && node dist/frontend/server/server.mjs & sleep 2; curl -s -o /dev/null -w '%{redirect_url}' -H 'Accept-Language: en-US' localhost:4000/` → `/en/` ; `curl -s localhost:4000/en/ | grep -c -E 'lang="en"|hreflang="fr"|hreflang="en"'` = 3.
  - Fichiers : `frontend/angular.json`, `frontend/src/locale/messages.xlf`, `frontend/src/locale/messages.en.xlf`, `frontend/src/server.ts`, `core/seo/seo.service.ts`, `core/seo/seo.service.spec.ts`, `core/layout/header.ts`, `frontend/public/sitemap.xml`, `frontend/public/og/og-en.jpg`
  - Dépend de : T1 (fusion de `fix/retours-enzo`)

- [x] V2-T15 [agent: designer · sonnet] Direction V2 : page projet, clip, graphe, bascule
  - Acceptation : DESIGN.md complété : mise en page de l'étude de cas (gabarit §8, variante Worldline sans schéma), composant Clip (ratio : trancher entre le 16:9 de §5 et le 16:10 de §8 ; portrait GFaim ; boutons Lecture/Pause ; affiche WebP de l'ADR 0003), graphe de contributions (5 tons, légende), bascule FR/EN dans l'en-tête, place de GFaim et des fiches courtes sur l'accueil (selon les réponses de T1).
  - Vérification : diff de `docs/DESIGN.md` relu par le tech lead ; aucune décision contraire à D20-D26 sans ADR.
  - Fichiers : `docs/DESIGN.md`
  - Dépend de : T1

- [x] V2-T16 [agent: code-reviewer · sonnet] Revue du point de contrôle F
  - Acceptation : critères F du plan-v2 §7 ; DTO identiques au contrat (back et `api.models.ts`) ; sécurité de la synchro (token absent des logs et des erreurs, réponse externe validée, timeouts, aucun dépôt non curé exposé) ; redirection `Accept-Language` sans redirection ouverte ; problèmes classés par gravité avec fichier:ligne.
  - Vérification : `cd backend && ./mvnw verify` ; `cd frontend && npm test && npm run lint && npm run build`.
  - Fichiers : —
  - Dépend de : T8-T14

## Phase 2 : Clips vidéo (en parallèle de la phase 1)

- [x] V2-T17 [agent: qa-engineer · sonnet] Outillage d'enregistrement des clips
  - Acceptation : `tools/clips/` : `playwright.clips.config.ts` (vidéo `on`, 1280×800, hors du `testDir` E2E et de la CI), `oltre.override.yml` et `zotracker.override.yml` (`container_name` suffixés `-demo`, ports liés à `127.0.0.1`, `ports: !override`), `encode.sh` (ADR 0003 : H.264 et VP9 sans audio ni métadonnées, `+faststart`, affiche WebP via `cwebp`, échec si un fichier dépasse 2,5 Mo), `README.md` (procédure plan-v2 §5). **Interdit** : monter `oltre-backend_mysql_data` ou `zotracker-local_data`, ou modifier les dépôts Oltre et Zotracker.
  - Vérification : `bash -n tools/clips/encode.sh` ; `docker compose -p oltre-demo -f "../../Oltre/Oltre-backend/docker-compose.yaml" -f tools/clips/oltre.override.yml config | grep -E 'oltre-demo_mysql_data|container_name'` (volume `oltre-demo_*` uniquement).
  - Fichiers : `tools/clips/playwright.clips.config.ts`, `tools/clips/oltre.override.yml`, `tools/clips/zotracker.override.yml`, `tools/clips/encode.sh`, `tools/clips/README.md`
  - Dépend de : T1

- [x] V2-T18 [agent: qa-engineer · sonnet] Clip Oltre sur données factices
  - Acceptation : `oltre-seed.mjs` (Node sans dépendance) : utilisateur `demo@example.com`, environ 20 dépenses sur 3 mois, tâches, repas et rendez-vous inventés, via l'API REST ; `oltre.clip.ts` : parcours 15-30 s (plan-v2 §5) sans pages sport ni coach ; encodage `oltre-1.{mp4,webm,webp}` ; `docker compose -p oltre-demo down -v` en fin de tâche.
  - Vérification : `ffprobe -v error -show_entries format=duration -of csv=p=0 frontend/public/media/oltre-1.mp4` entre 15 et 30 ; `ffprobe … -select_streams a` vide ; `du -k frontend/public/media/oltre-1.*` ≤ 2560 chacun ; `docker volume ls | grep oltre-demo` vide.
  - Fichiers : `tools/clips/oltre-seed.mjs`, `tools/clips/oltre.clip.ts`, `frontend/public/media/oltre-1.mp4`, `frontend/public/media/oltre-1.webm`, `frontend/public/media/oltre-1.webp`
  - Dépend de : T17

- [x] V2-T19 [agent: qa-engineer · sonnet] Clip Zotracker en simulation
  - Acceptation : `zotracker.clip.ts` : `ADMIN_PASSWORD` factice, course « Démo » créée dans l'admin avec le GPX officiel du GTA (lu depuis `~/Downloads`, jamais copié dans le dépôt), profil « Coureur démo » sans photo, aucun contact de sécurité, simulation ×30, puis page publique (carte, chrono, ravitos, profil) ; encodage `zotracker-1.*` ; `down -v`.
  - Vérification : mêmes contrôles `ffprobe`/`du` que T18 ; `git ls-files | grep -i '\.gpx$'` vide ; `docker volume ls | grep zotracker-demo` vide.
  - Fichiers : `tools/clips/zotracker.clip.ts`, `frontend/public/media/zotracker-1.mp4`, `frontend/public/media/zotracker-1.webm`, `frontend/public/media/zotracker-1.webp`
  - Dépend de : T17

- [x] V2-T20 (SANS OBJET) [agent: devops · haiku] Clip GFaim depuis le matériel d'Enzo
  - Acceptation : à partir de T7, `encode.sh` sur l'enregistrement (portrait, 720 px de haut) ou, avec des captures, diaporama ffmpeg (environ 4 s par capture, sans transition), produisant `gfaim-1.*` ; métadonnées retirées ; originaux jamais commités.
  - Vérification : contrôles `ffprobe`/`du` de T18 ; `exiftool frontend/public/media/gfaim-1.mp4 | grep -i -E 'gps|author|location'` vide.
  - Fichiers : `frontend/public/media/gfaim-1.mp4`, `frontend/public/media/gfaim-1.webm`, `frontend/public/media/gfaim-1.webp`
  - Dépend de : T7, T17

- [x] V2-T21 🟧 ENZO [agent: — · Enzo] Valider les 3 clips avant publication
  - Acceptation : chaque clip et son affiche visionnés : aucune donnée réelle (nom, e-mail, position, donnée Garmin), cadrage et durée acceptés ; décision notée dans `tools/clips/README.md`.
  - Vérification : ligne « Clips validés par Enzo le … » dans `tools/clips/README.md`.
  - Fichiers : `tools/clips/README.md`
  - Dépend de : T18, T19, T20

## Phase 3 : Pages, accueil et contenu FR

- [x] V2-T22 [agent: backend-dev · sonnet] Données FR du V2 (Liquibase)
  - Acceptation : changeset `20261016-0300-seed-v2-fr.sql` depuis `copy-fr-v2.md` et `facts-v2-case-studies.md` : champs d'étude de cas des 4 projets ; `github_repos` de tous les projets non masqués (T3) ; `video` des 3 clips (noms, tailles, légendes) ; `stage` de GFaim et des fiches courtes selon T1 ; garmin-mcp en `SHORT`.
  - Vérification : `cd backend && ./mvnw verify` ; `curl -s localhost:8080/api/fr/projects/oltre | jq '.caseStudy.decisions|length'` ∈ {2, 3} ; `grep -i -E 'client|banque' db/changelog/changes/20261016-03*.sql` vide.
  - Fichiers : `db/changelog/changes/20261016-0300-seed-v2-fr.sql`, `content/SeedContentIT.java`
  - Dépend de : T5, T8, T21

- [x] V2-T23 [agent: frontend-dev · sonnet] Composant Clip
  - Acceptation : `shared/clip/clip.ts` selon D23 et T15 : `@defer (on viewport)` avec affiche en placeholder, `preload="none"`, `<source>` WebM puis MP4, lecture et pause par IntersectionObserver côté navigateur seulement, pas de lecture automatique sous reduced-motion, Save-Data ou 2G (bouton Lecture), bouton Pause toujours présent, `width`/`height` posés, légende en nom accessible ; rien si `video` est `null`.
  - Vérification : `cd frontend && npm test` (Vitest : reduced-motion → pas de `play()`, sortie du viewport → `pause()`, `saveData` → bouton Lecture, rendu serveur sans accès à `window`).
  - Fichiers : `shared/clip/clip.ts`, `shared/clip/clip.css`, `shared/clip/clip.spec.ts`
  - Dépend de : T13, T15

- [x] V2-T24 [agent: frontend-dev · sonnet] Page d'étude de cas
  - Acceptation : route `projets/:slug` (D20) ; gabarit plan-v2 §4.2 (Split avec `role` et `languages`, sections, bloc « Le mur du 60e km », liens vers dépôts, démo, clip) ; `caseStudy` nul ou API en échec → page 404 avec statut 404 en SSR ; title, description et canonical par projet ; contenu complet dans le HTML SSR, lisible sans JS.
  - Vérification : `cd frontend && npm test` (rendu depuis les fixtures Oltre et Worldline : pas de schéma ni de dépôt pour Worldline) ; `npm run build && node dist/frontend/server/server.mjs & sleep 2; curl -s -o /dev/null -w '%{http_code}' localhost:4000/fr/projets/histoquiz` = 404.
  - Fichiers : `features/projects/case-study.page.ts`, `features/projects/case-study.page.css`, `features/projects/case-study.page.spec.ts`, `app.routes.ts`, `shared/split/split.ts`
  - Dépend de : T13, T15, T23

- [x] V2-T25 [agent: frontend-dev · sonnet] Schémas d'architecture SVG
  - Acceptation : `oltre`, `zotracker` et `gfaim` (D25), d'après la section « Architecture » de `facts-v2` et les textes de T4 : SVG inline, couleurs par tokens (clair et sombre), `<title>` et `<desc>` traduits, lisibles à 360 px (empilement vertical sur mobile), aucun texte en image ; registre par slug, rien pour `trading-app`.
  - Vérification : `cd frontend && npm test` (chaque schéma a un `<title>` et un `<desc>` non vides ; slug sans schéma → rien).
  - Fichiers : `features/projects/diagrams/oltre.diagram.ts`, `features/projects/diagrams/zotracker.diagram.ts`, `features/projects/diagrams/gfaim.diagram.ts`, `features/projects/diagrams/diagrams.ts`, `features/projects/diagrams/diagrams.spec.ts`
  - Dépend de : T4, T15, T24

- [x] V2-T26 [agent: frontend-dev · sonnet] Accueil : liens vers les études, clip, données GitHub
  - Acceptation : carte `CASE_STUDY` → `routerLink` vers `projets/:slug`, sinon lien vers le dépôt (`repoUrl`) ; P2 → page `trading-app` ; clip sur la carte Oltre (Clip en tête de carte sur mobile, DESIGN §5) ; Split avec `commits` et `languages` issus de la synchro (rien si `null`) ; GFaim et fiches courtes placées selon T1/T15.
  - Vérification : `cd frontend && npm test` (rendu depuis `home.fixture.json` : lien interne pour Oltre, lien externe pour histoquiz, aucun `commits` affiché quand il est `null`).
  - Fichiers : `features/home-course/sections/p3.section.ts`, `features/home-course/sections/p2.section.ts`, `features/home-course/sections/p1.section.ts`, `shared/segment-card/segment-card.ts`
  - Dépend de : T13, T23 (fusion de `fix/retours-enzo`)

- [x] V2-T27 [agent: frontend-dev · sonnet] Journal : graphe de contributions GitHub
  - Acceptation : `shared/contributions/contributions.ts` (D26) : grille SVG 53×7 depuis `start` + `counts`, 5 tons d'orange (seuils par quantiles, 0 = ton vide), résumé texte localisé (« N contributions sur 12 mois »), `aria-hidden` sur le SVG, rendu en SSR ; colonne gauche du Journal (DESIGN §5) ; rien si `contributions` est `null`.
  - Vérification : `cd frontend && npm test` (mapping jour → colonne et ligne, seuils, `null` → rien).
  - Fichiers : `shared/contributions/contributions.ts`, `shared/contributions/contributions.spec.ts`, `features/home-course/sections/journal.section.ts`
  - Dépend de : T13, T15 (fusion de `fix/retours-enzo`)

- [x] V2-T28 [agent: designer · sonnet] Revue design du point de contrôle G
  - Acceptation : checklist DESIGN §9 sur l'accueil et les 4 études de cas, à 360, 390, 768 et 1440 px, en clair et en sombre ; clip : affiche, contrôles, reduced-motion ; graphe ; bascule FR/EN ; DESIGN.md mis à jour si une décision change.
  - Vérification : captures listées dans `docs/reviews/V2-T28-design-G.md`.
  - Fichiers : `docs/reviews/V2-T28-design-G.md`, `docs/DESIGN.md` (si décision modifiée)
  - Dépend de : T22-T27

- [x] V2-T29 [agent: code-reviewer · sonnet] Revue de code du point de contrôle G
  - Acceptation : SSR sûr (Clip et graphe sans `window` côté serveur), 404 SSR effective, a11y (nom des vidéos, Pause, `<title>`/`<desc>` des SVG), reduced-motion, aucune propriété animée hors `transform`/`opacity`, aucune complexité inutile (ponytail-review).
  - Vérification : `cd frontend && npm test && npm run lint && npm run build` ; `grep -rn 'transition: all' frontend/src/ ; test $? -eq 1`.
  - Fichiers : `docs/reviews/V2-T29-code-G.md`
  - Dépend de : T22-T27

## Phase 4 : Anglais

- [x] V2-T30 [agent: copywriter · sonnet] Traduire le contenu en EN
  - Acceptation : `copy-en-v2.md` : chaque champ jsonb FR du V1 (projets, expériences, courses) et du V2 (études de cas, légendes), plus les textes d'interface de `copy-fr-v1.md` et `copy-fr-v2.md` (glossaire pour le XLIFF : dossard → bib, ravitaillement → aid station, « Le mur du 60e km » → …) ; anglais naturel pour un recruteur international, pas de calque ; Worldline : aucune information de plus que la version FR.
  - Vérification : chaque clé de `copy-fr-v1.md` et `copy-fr-v2.md` a sa clé dans `copy-en-v2.md` (diff des listes de clés vide).
  - Fichiers : `docs/content/copy-en-v2.md`
  - Dépend de : T5

- [x] V2-T31 🟧 ENZO [agent: — · Enzo] Valider l'anglais
  - Acceptation : `copy-en-v2.md` relu, Worldline validé ; validation datée en tête du fichier.
  - Vérification : ligne « Validé par Enzo le … » en tête de `copy-en-v2.md`.
  - Fichiers : `docs/content/copy-en-v2.md`
  - Dépend de : T30

- [x] V2-T32 [agent: backend-dev · sonnet] Données EN (Liquibase)
  - Acceptation : changeset `20261016-0400-seed-v2-en.sql` (`champ = champ || '{"en":"…"}'::jsonb`, et listes `decisions` EN) pour `project`, `experience` et `race`, depuis `copy-en-v2.md`.
  - Vérification : `cd backend && ./mvnw verify` (IT : aucune ligne non masquée dont un champ traduisible non nul n'a pas de clé `en`, via une requête SQL `jsonb ? 'en'`).
  - Fichiers : `db/changelog/changes/20261016-0400-seed-v2-en.sql`, `content/SeedContentIT.java`
  - Dépend de : T22, T31

- [x] V2-T33 [agent: copywriter · sonnet] Traduire l'interface (XLIFF EN)
  - Acceptation : `ng extract-i18n` relancé après T24-T27 ; chaque unité de `messages.en.xlf` traduite d'après le glossaire de T30 (y compris title, meta, aria, alt, erreurs du formulaire, mentions légales, page 404) ; aucune cible restée en `state="initial"`.
  - Vérification : `grep -c 'state="initial"' frontend/src/locale/messages.en.xlf` = 0 ; `cd frontend && npm run build` (D22 : une traduction manquante fait échouer le build).
  - Fichiers : `frontend/src/locale/messages.xlf`, `frontend/src/locale/messages.en.xlf`
  - Dépend de : T14, T24-T27, T31

## Phase 5 : Qualité et mise en production

- [ ] V2-T34 [agent: qa-engineer · sonnet] E2E et axe V2
  - Acceptation : parcours SPEC §8 ajoutés : accueil → étude de cas (les 4 slugs), fiche courte et slug inconnu → 404 ; bascule FR/EN (section conservée, `lang="en"`, CV EN téléchargé sous le bon nom) ; `/` avec `Accept-Language: en` → `/en/` ; `javaScriptEnabled: false` : page d'étude lisible ; `reducedMotion: 'reduce'` : vidéo non lue, bouton Lecture présent ; axe à zéro violation sur l'accueil et une étude de cas, en FR et en EN, en clair et en sombre ; job CI à jour.
  - Vérification : `docker compose up --build -d && cd frontend && npx playwright test`.
  - Fichiers : `e2e/projects.spec.ts`, `e2e/i18n.spec.ts`, `e2e/home.spec.ts`, `.github/workflows/ci.yml`
  - Dépend de : T28, T29, T32, T33

- [ ] V2-T35 [agent: qa-engineer · sonnet] Lighthouse FR/EN et passe break-ui
  - Acceptation : `lighthouserc.json` étendu à `/fr/`, `/en/`, `/fr/projets/oltre` et `/en/projets/oltre` (seuils V1 bloquants) ; break-ui : cache GitHub vide, clip absent, textes EN longs, titres de décision longs, API en panne sur la page projet ; écarts corrigés ou listés en tâches.
  - Vérification : `cd frontend && npx lhci autorun --config=lighthouserc.json`.
  - Fichiers : `frontend/lighthouserc.json`, `docs/reviews/V2-T35-qa.md`
  - Dépend de : T28, T29, T32, T33

- [ ] V2-T36 [agent: devops · haiku] Déploiement du V2 (soumis à Enzo)
  - Acceptation : `GITHUB_TOKEN` dans GitHub Secrets puis dans l'environnement du back en prod ; image multi-locale déployée par le workflow V1 ; première synchro visible dans les logs (`docker compose logs backend | grep -i github`, sans token). Si la tâche sort de la routine, la passer à sonnet.
  - Vérification : `curl -fsS https://$DOMAIN/api/fr/projects/oltre | jq '.commits'` non nul ; `curl -fsS https://$DOMAIN/en/ | grep -q 'lang="en"'`.
  - Fichiers : `docker-compose.prod.yml`, `.github/workflows/deploy.yml` (si la variable doit y être ajoutée)
  - Dépend de : T34, T35, **V1 T39**

- [ ] V2-T37 [agent: qa-engineer · sonnet] Smoke de production et critères V2
  - Acceptation : critères de succès du plan-v2 §7 cochés un par un en prod (4 études en FR et en EN, sync, bascule, clips sur un vrai mobile en Save-Data et en reduced-motion) ; Lighthouse en prod ≥ 90/95/95/95 sur `/en/` et sur une étude de cas.
  - Vérification : `npx lhci collect --url=https://$DOMAIN/en/ --url=https://$DOMAIN/fr/projets/oltre && npx lhci assert --config=frontend/lighthouserc.json`.
  - Fichiers : `docs/reviews/V2-T37-smoke.md`
  - Dépend de : T36
