# Tâches V1 « Départ »

> Contrats, décisions (D1-D13) et risques : `tasks/plan.md`. Chaque tâche laisse le build vert. Avant tout commit : `cd backend && ./mvnw verify` et `cd frontend && npm test` (SPEC §9).
> Chemins front relatifs à `frontend/src/app/`, back à `backend/src/main/java/dev/zofolio/` (tests sous `backend/src/test/java/dev/zofolio/`), Liquibase à `backend/src/main/resources/db/changelog/`.

## Phase 0 : Contenu (démarre au jour 0, en fond)

- [x] T1 [agent: content-researcher] Décider la version publique du CV FR
  - Acceptation : `docs/content/cv-public.md` liste chaque donnée personnelle du PDF privé (téléphone, adresse, date de naissance…) avec garder/retirer **Décision d'Enzo (2026-10-15) : garder téléphone et e-mail, ajouter la localisation de recherche** ; le PDF public fourni par Enzo (export Google Docs) est placé sans métadonnées d'auteur.
  - Vérification : le PDF contient la ligne de localisation de recherche ; `exiftool backend/src/main/resources/cv/Enzo-Leveque-CV-FR.pdf | grep -i -E 'author|creator'` vide ou neutre.
  - Fichiers : `docs/content/cv-public.md`, `backend/src/main/resources/cv/Enzo-Leveque-CV-FR.pdf`
  - Dépend de : — (le PDF est commité après T4)

- [x] T2 [agent: content-researcher] Extraire les faits sourcés du V1
  - Acceptation : faits bruts avec source (document, section) pour Master ILI + projets univ (P1), Worldline anonymisé (P2, sans client ni architecture), Oltre/Zotracker/garmin-mcp/histoquiz (P3 : durée, stack, commits), ravitos (brancardier, tuteur L1), courses (SPEC §1) ; aucun fait inventé, trous marqués `À FOURNIR`.
  - Vérification : `grep -c 'Source :' docs/content/facts-v1.md` ≥ nombre de faits ; `grep -i -E 'client|banque' docs/content/facts-v1.md` relu par Enzo.
  - Fichiers : `docs/content/facts-v1.md`
  - Dépend de : —

- [x] T3 [agent: copywriter] Rédiger les textes FR du V1
  - Acceptation : hero, titres et chapôs des 5 sections + journal, contenus P1/P2/P3/R1/R2, notes des courses, Arrivée, libellés et messages d'erreur du formulaire (par `code` du §4.1), meta title/description, alt des photos, mentions légales ; DESIGN §1 (aucune phrase creuse, 1 touche de fun max par section) ; **validé par Enzo** (Worldline obligatoirement).
  - Vérification : `grep -i -E 'passionn|innovant|de l.idée à la production' docs/content/copy-fr-v1.md` ne renvoie rien ; validation d'Enzo notée en tête du fichier.
  - Fichiers : `docs/content/copy-fr-v1.md`
  - Dépend de : T2

## Phase 1 : Fondations

- [x] T4 [agent: devops] Préparer la racine du repo avant le premier commit
  - Acceptation : `.gitignore` complété (`private/`, `.env`, `*.gpx`, `target/`, `node_modules/`, `dist/`, `.angular/`, photos brutes `*.jpeg|*.JPG` hors `frontend/public/`) ; `.env.example` avec toutes les variables du plan §4.6 (valeurs factices) ; `.editorconfig`.
  - Vérification : `git add -A --dry-run | grep -E '^add .(private/|\.env$|.*\.gpx)'` ne renvoie rien.
  - Fichiers : `.gitignore`, `.env.example`, `.editorconfig`
  - Dépend de : —

- [x] T5 [agent: backend-dev] Squelette Spring Boot 4.1
  - Acceptation : Maven wrapper, Java 21, dépendances approuvées (plan §1) ; `application.properties` lu depuis l'env ; Liquibase master `db.changelog-master.yaml` (`includeAll: changes/`) ; `spring.mvc.problemdetails.enabled=true` + `shared/ApiExceptionHandler` qui ajoute `code` (400 `VALIDATION_FAILED` avec `errors`, `MALFORMED_REQUEST`, 404 `NOT_FOUND`, 500 `INTERNAL_ERROR`) ; config Testcontainers `@ServiceConnection` PostgreSQL 17 ; jacoco ≥ 80 % sur `**/*Service` ; `maven-failsafe-plugin` pour les tests `*IT` (lancés par `verify`).
  - Vérification : `cd backend && ./mvnw verify` (test de contexte + test d'un 404 au format ProblemDetail).
  - Fichiers : `backend/pom.xml`, `backend/src/main/resources/application.properties`, `backend/src/main/resources/db/changelog/db.changelog-master.yaml`, `shared/ApiExceptionHandler.java`, `backend/src/test/java/dev/zofolio/TestcontainersConfiguration.java`
  - Dépend de : T4

- [x] T6 [agent: frontend-dev] Squelette Angular 22 SSR avec i18n
  - Acceptation : app standalone + `@angular/ssr` ; `@angular/localize` avec `sourceLocale: {code: fr, subPath: fr}`, `localize: ["fr"]` (EN prêt à ajouter, D6) ; `security.autoCsp: true` ; Vitest (`npm test` = une passe, sans watch) ; ESLint (`npm run lint`) ; `proxy.conf.json` `/api` → `http://localhost:8080` ; `server.ts` : `/` → `/fr/` (vérifier la redirection native de `@angular/ssr`, sinon la coder) et `/en/*` → 302 `/fr/*`.
  - Vérification : `cd frontend && npm ci && npm test && npm run lint && npm run build && test -d dist/frontend/browser/fr`.
  - Fichiers : `frontend/package.json`, `frontend/angular.json`, `frontend/src/server.ts`, `frontend/src/app/app.config.ts`, `frontend/proxy.conf.json`
  - Dépend de : T4

- [x] T7 [agent: devops] Docker Compose local
  - Acceptation : `docker-compose.yml` avec `postgres:17` (healthcheck `pg_isready`), `backend`, `frontend` (SSR Node, port 4000, `API_INTERNAL_URL=http://backend:8080`), `mailpit` (SMTP 1025, UI 8025) ; Dockerfiles multi-étapes non-root ; variables depuis `.env`.
  - Vérification : `cp .env.example .env && docker compose up --build -d && curl -fsS http://localhost:4000/fr/ | grep -q 'lang="fr"' && docker compose ps --status running | grep -c -E 'backend|frontend|postgres|mailpit'` = 4.
  - Fichiers : `docker-compose.yml`, `backend/Dockerfile`, `frontend/Dockerfile`, `.dockerignore`
  - Dépend de : T5, T6

- [x] T8 [agent: devops] CI GitHub Actions sur PR (soumise à Enzo avant application)
  - Acceptation : jobs `backend` (`./mvnw -B verify`) et `frontend` (`npm ci`, `npm run lint`, `npm test`, `npm run build`) sur `pull_request` et `push` `main` ; jobs E2E et Lighthouse ajoutés en T36/T37 ; procédure de protection de branche (checks requis) documentée pour Enzo dans le README.
  - Vérification : `gh pr checks --watch` vert sur une PR de test ; `gh api repos/:owner/:repo/branches/main/protection` montre les checks requis.
  - Fichiers : `.github/workflows/ci.yml`, `README.md`
  - Dépend de : T7

- [x] T9 [agent: code-reviewer] Revue du point de contrôle A
  - Acceptation : critères A du plan §6 vérifiés ; problèmes listés par gravité avec fichier:ligne ; aucun bloquant ouvert.
  - Vérification : `cd backend && ./mvnw verify && cd ../frontend && npm test && npm run lint && npm run build` ; `git ls-files | grep -E 'private/|\.env$'` vide.
  - Fichiers : — (rapport dans la PR)
  - Dépend de : T8

## Phase 2 : Briques (back ∥ front, contrat = plan §4)

- [x] T10 [agent: backend-dev] Liste des courses : `GET /api/{lang}/races`
  - Acceptation : changeset `0101-race.sql` ; entité, repo, controller ; JSONB → `Map` ; `shared/I18n.pick` (repli FR) ; `{lang:fr|en}` ; DTO conforme §4.2 (champs `null` présents).
  - Vérification : `cd backend && ./mvnw verify` (IT : FR, EN en repli FR, `/api/de/races` → 404 `NOT_FOUND`).
  - Fichiers : `db/changelog/changes/0101-race.sql`, `content/Race.java`, `content/RaceRepository.java`, `content/ContentController.java`, `shared/I18n.java`
  - Dépend de : T9

- [x] T11 [agent: backend-dev] Projets : `GET /api/{lang}/projects` et `/projects/{slug}`
  - Acceptation : changeset `0102-project.sql` ; `HIDDEN` jamais exposé (liste et détail → 404) ; tri `sort_order` ; DTO `ProjectSummary` conforme.
  - Vérification : `cd backend && ./mvnw verify` (IT : liste sans masqués, slug inconnu et masqué → 404).
  - Fichiers : `db/changelog/changes/0102-project.sql`, `content/Project.java`, `content/ProjectRepository.java`, `content/ContentController.java`, `content/ContentApiIT.java`
  - Dépend de : T10

- [x] T12 [agent: backend-dev] Agrégat d'accueil : `GET /api/{lang}/home`
  - Acceptation : changeset `0103-experience.sql` ; `ContentService` assemble `experiences`, `projects` (stage ≠ null), `races` ; test unitaire du repli FR et de l'ordre.
  - Vérification : `cd backend && ./mvnw verify` (couverture `ContentService` ≥ 80 %).
  - Fichiers : `db/changelog/changes/0103-experience.sql`, `content/Experience.java`, `content/ExperienceRepository.java`, `content/ContentService.java`, `content/ContentServiceTest.java`
  - Dépend de : T11

- [x] T13 [agent: backend-dev] Contact : message validé et enregistré
  - Acceptation : changeset `0201-contact-message.sql` ; `POST /api/contact` (record dans le controller, style SPEC §7) ; règles §4.3 dont `Pattern` sans CR/LF ; honeypot → 202 sans écriture ; IP hashée SHA-256 + `IP_HASH_SALT`, `server.forward-headers-strategy=native` ; 202 sur succès.
  - Vérification : `cd backend && ./mvnw verify` (IT : 202 + ligne en base, 400 `VALIDATION_FAILED` avec `errors`, honeypot → 0 ligne).
  - Fichiers : `db/changelog/changes/0201-contact-message.sql`, `contact/ContactController.java`, `contact/ContactMessage.java`, `contact/ContactMessageRepository.java`, `contact/ContactService.java`
  - Dépend de : T9

- [x] T14 [agent: backend-dev] Contact : envoi de l'e-mail et échec SMTP
  - Acceptation : `JavaMailSender` (timeouts 5 s), destinataire `CONTACT_TO`, `Reply-To` visiteur, sujet §4.3 ; statut `SENT`/`FAILED` ; échec → 503 `MAIL_DELIVERY_FAILED` et message conservé.
  - Vérification : `cd backend && ./mvnw verify` (test unitaire avec `JavaMailSender` mocké : succès, `MailException` → `FAILED` + 503).
  - Fichiers : `contact/ContactService.java`, `contact/ContactServiceTest.java`, `shared/ApiExceptionHandler.java`, `backend/src/main/resources/application.properties`
  - Dépend de : T13

- [x] T15 [agent: backend-dev] Contact : limite de 5 envois par heure et par IP
  - Acceptation : compte en base (`ip_hash`, 60 min, index) avant enregistrement ; 6e envoi → 429 `RATE_LIMITED` + `Retry-After` ; les honeypots ne comptent pas.
  - Vérification : `cd backend && ./mvnw verify` (IT : 5 × 202 puis 429 avec `Retry-After`, autre IP (`X-Forwarded-For`) → 202).
  - Fichiers : `contact/ContactMessageRepository.java`, `contact/ContactService.java`, `contact/ContactApiIT.java`, `shared/ApiExceptionHandler.java`
  - Dépend de : T14

- [x] T16 [agent: backend-dev] CV : `GET /api/{lang}/cv` avec compteur
  - Acceptation : changeset `0301-cv-download.sql` ; PDF depuis le classpath, `Content-Disposition` §4.4 ; une ligne `cv_download` par appel ; `en` → FR ; fichier absent → 404 (PDF de test factice dans `src/test/resources`).
  - Vérification : `cd backend && ./mvnw verify` (IT : en-têtes, compteur +1, 404).
  - Fichiers : `db/changelog/changes/0301-cv-download.sql`, `cv/CvController.java`, `cv/CvDownload.java`, `cv/CvDownloadRepository.java`, `cv/CvApiIT.java`
  - Dépend de : T9

- [x] T17 [agent: frontend-dev] Tokens, polices et styles de base
  - Acceptation : tokens DESIGN §2-4 et §7 (couleurs clair/sombre via `[data-theme]` + `prefers-color-scheme`, échelle `--t-*`, espacements, easings) ; Archivo et Source Sans 3 WOFF2 variables auto-hébergées, sous-ensemble latin + latin-ext (pyftsubset), `tnum` vérifié, preload des deux romains, fallback avec `size-adjust` ; `prefers-reduced-motion` global.
  - Vérification : `cd frontend && npm run build && npm run lint` ; `for f in frontend/public/fonts/*.woff2; do python3 -c "import sys;from fontTools.ttLib import TTFont;t=TTFont(sys.argv[1]);assert any(r.FeatureTag=='tnum' for r in t['GSUB'].table.FeatureList.FeatureRecord)" $f; done` sans erreur.
  - Fichiers : `frontend/src/styles.css`, `frontend/src/styles/tokens.css`, `frontend/src/styles/fonts.css`, `frontend/public/fonts/`, `frontend/src/index.html`
  - Dépend de : T9

- [x] T18 [agent: frontend-dev] Shell : en-tête, lien d'évitement, pied, 404
  - Acceptation : wordmark « E. Leveque », emplacement du toggle thème, bascule FR/EN masquée (D6) ; « Aller au contenu » premier focusable ; footer (Phidippides) ; route `**` rendue avec statut 404 en SSR ; textes via `i18n`.
  - Vérification : `cd frontend && npm test && npm run build && node dist/frontend/server/server.mjs & sleep 2; curl -s -o /dev/null -w '%{http_code}' localhost:4000/fr/nope` = 404.
  - Fichiers : `core/layout/header.ts`, `core/layout/footer.ts`, `core/layout/not-found.page.ts`, `app.routes.ts`, `app.html`
  - Dépend de : T17

- [x] T19 [agent: frontend-dev] Bascule de thème sans flash
  - Acceptation : 3 états système/clair/sombre, `<button aria-pressed>` 44×44 ; script inline dans `index.html` appliquant `data-theme` avant rendu (hash géré par autoCsp) ; `localStorage` sous try/catch ; View Transition 200 ms sauf reduced-motion.
  - Vérification : `cd frontend && npm test` (Vitest : cycle des états, `localStorage` qui lève → pas d'erreur).
  - Fichiers : `core/theme/theme.service.ts`, `core/theme/theme-toggle.ts`, `core/theme/theme.service.spec.ts`, `frontend/src/index.html`
  - Dépend de : T18

- [x] T20 [agent: frontend-dev] SEO : title, meta, Open Graph, hreflang, robots, sitemap
  - Acceptation : service posant title, description, `og:*`, canonical, `hreflang` `fr` + `x-default` (D6) par route, présents dans le HTML SSR ; `robots.txt` et `sitemap.xml` statiques.
  - Vérification : `cd frontend && npm run build && node dist/frontend/server/server.mjs & sleep 2; curl -s localhost:4000/fr/ | grep -c -E 'og:image|hreflang="fr"|<meta name="description"'` = 3.
  - Fichiers : `core/seo/seo.service.ts`, `core/seo/seo.service.spec.ts`, `frontend/public/robots.txt`, `frontend/public/sitemap.xml`
  - Dépend de : T18

- [x] T21 [agent: frontend-dev] Client API typé et appel depuis le SSR
  - Acceptation : `api.models.ts` miroir exact du §4 ; `ContentApi` (`home`, `races`, `projects`, `project`) avec `LOCALE_ID` comme `{lang}` ; intercepteur serveur qui préfixe `/api` par `API_INTERNAL_URL`, timeout 2 s ; transfer cache actif (pas de 2e requête à l'hydratation) ; fixture `home.fixture.json` conforme au contrat pour les tests.
  - Vérification : `cd frontend && npm test` (HttpTestingController : URL relative côté navigateur, absolue côté serveur, erreur → `null`).
  - Fichiers : `core/api/api.models.ts`, `core/api/content.api.ts`, `core/api/server-api.interceptor.ts`, `core/api/content.api.spec.ts`, `frontend/src/testing/home.fixture.json`
  - Dépend de : T9

- [x] T22 [agent: frontend-dev] Profil de dénivelé simplifié depuis le GPX officiel
  - Acceptation : script Node sans dépendance qui lit le GPX en argument, calcule la distance (haversine), simplifie (Ramer-Douglas-Peucker) à 180-220 points, recale le km final sur 79,41 et écrit `profile.data.ts` (`PROFILE`, `CHECKPOINTS` §4.6) **sans lat/lon** ; le GPX n'est pas commité.
  - Vérification : `cd frontend && node scripts/gpx-to-profile.mjs ~/Downloads/grands-trails-d-auvergne-2025-x-ultra-trail-solo.gpx && ! grep -q -i -E 'lat|lon' src/app/features/home-course/profile.data.ts && npm test` (spec : 180-220 points, km croissants, dernier km 79.41, altitudes 407-1369).
  - Fichiers : `frontend/scripts/gpx-to-profile.mjs`, `features/home-course/profile.data.ts`, `features/home-course/profile.data.spec.ts`
  - Dépend de : T6

- [x] T23 [agent: frontend-dev] Images : portrait, photos de course, image Open Graph
  - Acceptation : portrait `fc5f4402…jpg` en AVIF/WebP/JPEG 480/800/1200 (4:5 mobile, 3:4 desktop) ; 3-4 photos de course (IMG_0124, IMG_7732, IMG_2506, IMG_2487 avec crédit) recadrées sans tiers identifiables, **recadrages validés par Enzo** ; OG 1200×630 ; outils locaux (sips, cwebp, avifenc), aucune dépendance npm ; originaux jamais commités.
  - Vérification : `du -ch frontend/public/img/portrait-800.avif | tail -1` < 120 Ko ; `ls frontend/public/img | grep -c -E '\.(avif|webp|jpg)$'` ≥ 12.
  - Fichiers : `frontend/public/img/` (exports), `frontend/public/og/og-fr.jpg`, `docs/content/photos.md` (alt, crédits, validation)
  - Dépend de : T6

- [x] T24 [agent: code-reviewer] Revue du point de contrôle B
  - Acceptation : critères B du plan §6 ; conformité stricte des DTO au §4 (back et `api.models.ts`) ; sécurité contact (validation, XFF, en-tête d'e-mail) ; problèmes classés avec fichier:ligne.
  - Vérification : `cd backend && ./mvnw verify` ; `cd frontend && npm test && npm run lint`.
  - Fichiers : —
  - Dépend de : T10-T23

## Phase 3 : Accueil « La Course »

- [x] T25 [agent: frontend-dev] Section Départ et composant Bib
  - Acceptation : h1 « Enzo Leveque », titre, phrase Worldline, stack, CTA « Télécharger le CV » (`<a href="/api/fr/cv">`) et « Me contacter » (`#arrivee`) visibles sans scroll à 360×640, 390×844, 1440×900 ; Bib `aria-hidden` ; portrait `fetchpriority="high"`, `width`/`height`, `min-height: 100svh` ; textes statiques i18n (D3).
  - Vérification : `cd frontend && npm test && npm run lint` ; capture Playwright à 360×640 : `npx playwright screenshot --viewport-size=360,640 http://localhost:4000/fr/ /tmp/hero.png` montrant les 2 CTA.
  - Fichiers : `features/home-course/home.page.ts`, `features/home-course/sections/start.section.ts`, `shared/bib/bib.ts`, `shared/bib/bib.css`
  - Dépend de : T18, T23

- [x] T26 [agent: frontend-dev] ElevationProfile : rail desktop et navigation
  - Acceptation : un `<path>` SVG depuis `PROFILE` + masque de progression (`animation-timeline: scroll()`, repli IntersectionObserver, côté navigateur seulement) ; `<nav aria-label="Profil de la course">` avec 5 ancres réelles, `aria-current="location"` sur l'actif ; cibles 44 px ; reduced-motion = états discrets ; km affiché en texte ; ≥ `lg` uniquement.
  - Vérification : `cd frontend && npm test` (Vitest : conversion km → coordonnée, checkpoint actif selon la section visible).
  - Fichiers : `features/home-course/elevation-profile/elevation-profile.ts`, `features/home-course/elevation-profile/elevation-profile.css`, `features/home-course/elevation-profile/elevation-profile.spec.ts`
  - Dépend de : T18, T22

- [x] T27 [agent: frontend-dev] Barre mobile et RoadBook
  - Acceptation : barre haute 4 px < `lg` (déclencheur ≥ 44 px) ; `<dialog>` modal (focus piégé natif, `Esc`, retour du focus), 5 étapes ancres, étape courante marquée, fermeture au tap puis scroll vers l'ancre ; animations DESIGN §7 et reduced-motion.
  - Vérification : `cd frontend && npm test` (Vitest : ouverture, Esc ferme, focus rendu au déclencheur).
  - Fichiers : `features/home-course/road-book/road-book.ts`, `features/home-course/road-book/road-book.css`, `features/home-course/road-book/road-book.spec.ts`
  - Dépend de : T26

- [x] T28 [agent: frontend-dev] Sections P1 et R1 (SegmentCard, AiTag, Aid)
  - Acceptation : rendu depuis `home` (`stage` P1/R1) ; Master ILI + 3 cartes de tailles inégales ; AiTag (libellés §4.2, jamais orange) ; Aid en bande basse ; état « contenu indisponible » si l'API échoue ; tout présent dans le HTML SSR.
  - Vérification : `cd frontend && npm test` (rendu depuis `home.fixture.json`, état d'erreur).
  - Fichiers : `features/home-course/sections/p1.section.ts`, `shared/segment-card/segment-card.ts`, `shared/ai-tag/ai-tag.ts`, `shared/aid/aid.ts`
  - Dépend de : T21, T25

- [x] T29 [agent: frontend-dev] Sections P2 Worldline et R2 (Split)
  - Acceptation : aplat inversé, frise des missions (`stage` P2), Split tabulaire (`tabular-nums`, aligné à droite) ; R2 réutilise Aid ; section la plus haute.
  - Vérification : `cd frontend && npm test` (Split : formatage FR des durées et nombres).
  - Fichiers : `features/home-course/sections/p2.section.ts`, `shared/split/split.ts`, `shared/split/split.spec.ts`
  - Dépend de : T21, T25

- [x] T30 [agent: frontend-dev] Sections P3 et Journal (tableau des courses)
  - Acceptation : mosaïque asymétrique 7/5, 5/7, 12 (pas 3 cartes identiques), liens repo ; Journal = vrai `<table>` (date, course, distance, temps `13 h 35 min 53 s`, note, badge PR icône + texte), cartes empilées sur mobile ; graphe GitHub absent (V2) ; aucun classement.
  - Vérification : `cd frontend && npm test` (formatage `durationS` → `13 h 35 min 53 s`, `distanceKm` → `79,4 km`).
  - Fichiers : `features/home-course/sections/p3.section.ts`, `features/home-course/sections/journal.section.ts`, `features/home-course/sections/journal.section.spec.ts`
  - Dépend de : T21, T25

- [x] T31 [agent: frontend-dev] Section Arrivée et formulaire de contact
  - Acceptation : aplat orange, titre, e-mail, GitHub, LinkedIn, CV, chronos finaux ; formulaire (labels visibles, règles §4.3 côté client, honeypot `website` caché hors accessibilité) ; états succès / 400 par champ / 429 / 503 avec messages FR par `code` et `aria-live` ; sans JS, liens e-mail et CV restent utilisables.
  - Vérification : `cd frontend && npm test` (Vitest : validation, mapping des 4 réponses, honeypot envoyé vide).
  - Fichiers : `features/home-course/sections/finish.section.ts`, `features/contact/contact-form.ts`, `features/contact/contact.api.ts`, `features/contact/contact-form.spec.ts`
  - Dépend de : T18 (contrat §4.3)

- [x] T32 [agent: backend-dev] Données de contenu FR validées (Liquibase)
  - Acceptation : changesets `0150-seed-projects.sql`, `0151-seed-experiences.sql`, `0152-seed-races.sql` depuis `copy-fr-v1.md` et `facts-v1.md` ; tiers et tags IA du SPEC §1 ; masqués en `HIDDEN` ; GTA = 79,4 km, 3 160 m, 48953 s ; aucun nom de client Worldline.
  - Vérification : `cd backend && ./mvnw verify` ; `docker compose up -d && curl -s localhost:8080/api/fr/home | jq '.experiences|length, .projects|length, .races|length'` non nuls ; `grep -i -E 'client|banque' db/changelog/changes/015*.sql` vide.
  - Fichiers : `db/changelog/changes/0150-seed-projects.sql`, `db/changelog/changes/0151-seed-experiences.sql`, `db/changelog/changes/0152-seed-races.sql`
  - Dépend de : T3, T12

- [x] T33 [agent: frontend-dev] Page mentions légales
  - Acceptation : route `mentions-legales` (éditeur, hébergeur Hetzner, données du formulaire, conservation, droits RGPD) depuis `copy-fr-v1.md` ; lien dans le footer ; title/meta.
  - Vérification : `cd frontend && npm run build && node dist/frontend/server/server.mjs & sleep 2; curl -s localhost:4000/fr/mentions-legales | grep -q Hetzner`.
  - Fichiers : `features/legal/legal.page.ts`, `app.routes.ts`, `core/layout/footer.ts`
  - Dépend de : T3, T18

- [x] T34 [agent: designer] Revue design du point de contrôle C
  - Décision d'Enzo (2026-10-15) : photo finisher (`img/finisher-*`) recadrée au choix du designer pour la meilleure composition, en retirant les passants flous ; bascule de thème système → clair → sombre validée ; domaine `enzoleveque.dev` provisoire (à confirmer à l'achat).
  - Acceptation : checklist DESIGN §9 sur captures 360, 390, 768, 1440 px en clair et sombre ; traitement du formulaire sur orange validé ou corrigé (D11) ; DESIGN.md mis à jour si une décision change.
  - Vérification : `cd e2e && npx playwright test --project=screens` hors CI, ou captures manuelles listées dans le rapport.
  - Fichiers : `docs/DESIGN.md` (si décision modifiée)
  - Dépend de : T25-T33

- [x] T35 [agent: code-reviewer] Revue de code du point de contrôle C
  - Acceptation : SSR sûr (aucun accès `window`/`localStorage` hors navigateur), a11y du code (rôles, focus, aria-live), reduced-motion, pas de `transition: all`, aucune propriété animée hors `transform`/`opacity`, surcomplexité.
  - Vérification : `cd frontend && npm test && npm run lint && npm run build && grep -rn 'transition: all' src/ ; test $? -eq 1`.
  - Fichiers : —
  - Dépend de : T25-T33

## Phase 4 : Qualité et mise en production

- [x] T36 [agent: qa-engineer] E2E Playwright + axe dans la CI
  - Acceptation : parcours SPEC §8 du V1 : accueil → CV (nom `Enzo-Leveque-CV-FR.pdf`), accueil → contact (e-mail visible dans Mailpit, 6e envoi → message 429), bascule de thème persistée sans flash, `javaScriptEnabled: false` : 5 sections lisibles, clavier : checkpoints et road book ; axe zéro violation clair et sombre ; job `e2e` ajouté à la CI (avec `docker compose`).
  - Vérification : `docker compose up --build -d && cd frontend && npx playwright test`.
  - Fichiers : `frontend/playwright.config.ts` (testDir `../e2e`), `e2e/cv.spec.ts`, `e2e/contact.spec.ts`, `e2e/home.spec.ts`, `.github/workflows/ci.yml`
  - Dépend de : T32, T34, T35

- [x] T37 [agent: qa-engineer] Lighthouse CI et passe break-ui
  - Acceptation : `lighthouserc.json` mobile, seuils perf ≥ 0,9, a11y/bp/SEO ≥ 0,95, assertions bloquantes ; job CI ; break-ui (noms longs, champs vides, API en panne) : écarts corrigés ou listés en tâches.
  - Vérification : `cd frontend && npx lhci autorun --config=lighthouserc.json`.
  - Fichiers : `frontend/lighthouserc.json`, `.github/workflows/ci.yml`
  - Dépend de : T34, T35

- [ ] T38 [agent: devops] Production : compose, Caddy, sauvegardes (soumis à Enzo)
  - Acceptation : `docker-compose.prod.yml` (images GHCR, back et Postgres sans port publié) ; `Caddyfile` : HTTPS auto sur `{$DOMAIN}`, `/api/*` → backend, reste → SSR, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `frame-ancestors 'none'`, compression ; `pg_dump` quotidien (cron), rétention 7 jours ; procédure VPS (prérequis Enzo : domaine, DNS, VPS, clé SSH) dans `docs/DEPLOY.md`.
  - Vérification : `docker compose -f docker-compose.prod.yml config -q && caddy validate --config Caddyfile` ; `bash -n scripts/backup.sh`.
  - Fichiers : `docker-compose.prod.yml`, `Caddyfile`, `scripts/backup.sh`, `docs/DEPLOY.md`
  - Note (revue T24) : Caddy doit écraser `X-Forwarded-For` (`header_up X-Forwarded-For {remote_host}`) ; le back ne fait confiance qu'au sous-réseau Docker (172.16/12) et ne publie aucun port.
  - Dépend de : T9

- [ ] T39 [agent: devops] Déploiement automatique depuis `main` (soumis à Enzo)
  - Acceptation : workflow sur push `main` après CI verte : build arm64 (`ubuntu-24.04-arm` ou buildx), push GHCR, SSH `docker compose pull && up -d` ; secrets uniquement dans GitHub Secrets ; échec = pas de bascule.
  - Vérification : `gh run watch` vert après un merge ; `curl -fsS https://$DOMAIN/fr/ | grep -q 'Enzo Leveque'`.
  - Fichiers : `.github/workflows/deploy.yml`
  - Dépend de : T36, T37, T38

- [ ] T40 [agent: code-reviewer] Revue de l'infra de production
  - Acceptation : aucun secret commité, ports exposés minimaux, XFF fiable (D7), CSP effective sans casser l'hydratation, sauvegarde restaurable (procédure testée une fois).
  - Vérification : `git grep -n -I -E '(password|secret|token)\s*[:=]\s*[^$ {]' -- . ':!*.example'` vide ; `curl -sI https://$DOMAIN/fr/ | grep -i -E 'strict-transport|content-security'`.
  - Fichiers : —
  - Dépend de : T39

- [ ] T41 [agent: qa-engineer] Smoke de production et critères V1
  - Acceptation : SPEC §10 coché un par un : HTTPS + déploiement auto, dossard sans scroll sur vrai mobile, 5 sections au clavier/souris/toucher/sans JS, e-mail réel reçu + 429 en prod, Lighthouse prod ≥ 90/95/95/95, axe 0, checklist design ; sauvegarde du jour présente.
  - Vérification : `npx lhci collect --url=https://$DOMAIN/fr/ && npx lhci assert --config=frontend/lighthouserc.json` ; `ssh $VPS 'ls -1 /var/backups/zofolio | tail -1'` daté du jour.
  - Fichiers : —
  - Dépend de : T40
