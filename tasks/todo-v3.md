# Tâches V3 « Arrivée »

> Contrats (§3), décisions (D27-D51), sécurité (§4), risques et points de contrôle : `tasks/plan-v3.md`. Chaque tâche laisse le build vert. Avant tout commit : `cd backend && ./mvnw verify` et `cd frontend && npm test` (SPEC §9).
> Chemins front relatifs à `frontend/src/app/`, back à `backend/src/main/java/dev/zofolio/` (tests sous `backend/src/test/java/dev/zofolio/`), Liquibase à `backend/src/main/resources/db/changelog/changes/`. Oltre : `../../Oltre/Oltre-backend/` et `../../Oltre/oltre-frontend/` (depuis la racine Zofolio), **jamais sur `main`**.
> Les tâches **🟧 ENZO** demandent une action d'Enzo (compte, paiement, secret, validation) : aucun agent ne peut les faire. Modèle = le moins cher adapté (SPEC §12).
> Parallélisme : T9-T28 se font en local sans attendre la prod ; T26-T28 (dépôts Oltre) en parallèle de tout le reste. Seuls T29-T31 attendent le point I.

## Phase 0 : Décisions et comptes (jour 0)

- [x] V3-T1 🟧 ENZO [agent: — · Enzo] Décisions V3
  - Acceptation : questions du plan-v3 §7 tranchées et notées en §8 ; dépendances `spring-boot-starter-security` et `spring-security-test` approuvées ; modifications de déploiement (Caddy, Compose, CI) approuvées ; V2-T4 et V2-T12 cochés dans `todo-v2.md` (faits, constaté le 2026-10-16).
  - Vérification : §8 de `plan-v3.md` rempli.
  - Fichiers : `tasks/plan-v3.md`, `tasks/todo-v2.md`
  - Dépend de : —

- [ ] V3-T2 🟧 ENZO [agent: — · Enzo, guidé par devops] Comptes : domaine, Cloudflare, Oracle
  - Pas à pas :
    1. **Cloudflare** : créer un compte sur dash.cloudflare.com (2FA activée). *Domain Registration → Register Domains*, chercher `enzoleveque.dev` (ou le nom retenu en Q9), payer (~12 €/an). Le domaine arrive directement dans le DNS Cloudflare.
    2. Dans le domaine : *SSL/TLS → Overview* = **Full (strict)** ; *Edge Certificates* : « Always Use HTTPS » activé ; *Speed → Optimization* : **Rocket Loader désactivé** ; *Scrape Shield* : **Email Address Obfuscation désactivé**.
    3. **Oracle Cloud** : créer un compte sur cloud.oracle.com en choisissant une **région d'origine en UE** (Paris ou Francfort ; elle ne se change plus). Carte bancaire demandée pour la vérification. Puis *Billing → Upgrade to Pay As You Go* (Q8) et *Budgets → Create Budget* : 1 €, alerte par e-mail.
    4. *Compute → Instances → Create* : image **Ubuntu 24.04 (aarch64)**, forme **VM.Standard.A1.Flex**, 2 OCPU, 12 Go ; « Generate a key pair » ou coller ta clé publique `~/.ssh/id_ed25519.pub` ; IP publique attribuée. Si « Out of capacity » : réessayer plus tard ou changer d'Availability Domain.
    5. *Networking → VCN → Security List* de l'instance : ajouter une règle d'entrée TCP **443** depuis `0.0.0.0/0` (le 22 est déjà là).
    6. Noter l'IP publique ; tester `ssh ubuntu@<IP>`.
    7. Dans Cloudflare *DNS* : `A @ <IP>` **proxifié** (nuage orange) et `CNAME www @` proxifié (`oltre` sera ajouté en T29).
  - Acceptation : domaine à toi, DNS proxifié, VM joignable en SSH par clé.
  - Vérification : `dig +short enzoleveque.dev` renvoie des IP Cloudflare (pas l'IP Oracle) ; `ssh ubuntu@<IP> uname -m` → `aarch64`.
  - Fichiers : —
  - Dépend de : T1

- [ ] V3-T3 🟧 ENZO [agent: — · Enzo, guidé par devops] Secrets de production
  - Pas à pas :
    1. **Gmail** : compte Google → *Sécurité* → validation en deux étapes activée → *Mots de passe des applications* → créer « Zofolio » → copier les 16 caractères (= `SMTP_PASSWORD`, `SMTP_USERNAME` = ton adresse Gmail, `CONTACT_TO` = l'adresse de réception).
    2. **Certificat d'origine** : Cloudflare *SSL/TLS → Origin Server → Create Certificate* (RSA, `enzoleveque.dev` et `*.enzoleveque.dev`, 15 ans) → copier le certificat dans `origin.pem` et la clé privée dans `origin.key` (la clé n'est affichée qu'une fois).
    3. **R2** (Q7) : Cloudflare *R2* → activer (carte demandée, 10 Go gratuits) → créer le bucket `zofolio-backups` → *Manage R2 API Tokens* → jeton « Object Read & Write » **limité à ce bucket** → noter Access Key ID, Secret et l'endpoint `https://<id>.r2.cloudflarestorage.com`. Choisir une **phrase de chiffrement** rclone et la garder dans ton gestionnaire de mots de passe (sans elle, les sauvegardes sont illisibles).
    4. **Mot de passe admin** : choisir un mot de passe long (≥ 16 caractères, gestionnaire de mots de passe), puis `docker run --rm -it caddy:2 caddy hash-password` → copier le hash `$2a$14$…` (= `ADMIN_PASSWORD_HASH`, à écrire **entre apostrophes** dans `.env`).
    5. **Autres** : `openssl rand -hex 24` pour `DB_PASSWORD`, `openssl rand -hex 32` pour `IP_HASH_SALT` ; le `GITHUB_TOKEN` existant (V2-T1).
    6. **Clé de déploiement** : `ssh-keygen -t ed25519 -f zofolio-deploy -N ''`, ajouter `zofolio-deploy.pub` à `~/.ssh/authorized_keys` de la VM ; dans GitHub *Settings → Secrets and variables → Actions* : `SSH_HOST` (IP), `SSH_USER` (`ubuntu`), `SSH_KEY` (contenu de `zofolio-deploy`), `SSH_KNOWN_HOSTS` (sortie de `ssh-keyscan <IP>`). Supprimer ensuite le fichier `zofolio-deploy` local.
  - Acceptation : tous les secrets existent, **aucun** n'est commité ni collé dans une conversation d'agent ; ils seront posés sur la VM en T6.
  - Vérification : `gh secret list` montre les 4 secrets SSH.
  - Fichiers : —
  - Dépend de : T2

## Phase 1 : Mise en production V1 + V2 (= V1 T38-T41, V2-T36/T37)

- [ ] V3-T4 [agent: devops · sonnet] Compose de prod, Caddy Cloudflare, sauvegardes
  - Acceptation : `docker-compose.prod.yml` conforme à D31 (images GHCR `${IMAGE_TAG}`, healthchecks, `depends_on: service_healthy` en chaîne, réseau `edge`, volumes `pgdata`/`media`/`caddy_data`, seul Caddy publie `443`, `GITHUB_TOKEN`, `ADMIN_PASSWORD_HASH` et `MEDIA_DIR` transmis au back) ; `Caddyfile.prod` selon plan-v3 §3.8 (sans le bloc `oltre`, avec `/uploads` et `/admin` déjà présents) et plages CF copiées des URL officielles ; `Caddyfile` de dev : `header_up X-Forwarded-For {client_ip}` ; `scripts/backup.sh` (D33) et `scripts/restore.sh` ; `docs/DEPLOY.md` (installation Docker et rclone sur Ubuntu arm64, `iptables` D30, `/opt/zofolio`, `.env` en 600 avec le hash entre apostrophes, certificats, cron, restauration) ; `.env.example` complété (§3.7) ; SPEC §4 et §13 mis à jour (Oracle + Cloudflare) ; procédure du `GITHUB_TOKEN` dans le README (reste de V2-T11).
  - Vérification : `docker compose -f docker-compose.prod.yml config -q` ; `docker run --rm -v $PWD:/w caddy:2 caddy validate --config /w/Caddyfile.prod --adapter caddyfile` (avec des certificats factices) ; `bash -n scripts/*.sh` ; `docker run --rm eclipse-temurin:21-jre sh -c 'command -v curl || command -v wget'` non vide ; `ForwardedForIT` toujours vert.
  - Fichiers : `docker-compose.prod.yml`, `Caddyfile.prod`, `Caddyfile`, `scripts/backup.sh`, `scripts/restore.sh`, `docs/DEPLOY.md`, `.env.example`, `README.md`, `docs/SPEC.md`
  - Dépend de : T1

- [ ] V3-T5 [agent: devops · sonnet] Déploiement automatique depuis `main`
  - Acceptation : `.github/workflows/deploy.yml` selon D32 (`workflow_run` sur CI verte de `main`, `ubuntu-24.04-arm`, GHCR tags `<sha>` et `latest`, `permissions: packages: write` seulement ici, `scp` + SSH avec `SSH_KNOWN_HOSTS`, `up -d --wait`, rollback automatique vers `.last_tag`, `.last_tag` écrit seulement après succès) ; images publiques ; aucun secret dans les logs.
  - Vérification : `actionlint .github/workflows/deploy.yml` (ou `gh workflow view`) ; premier `gh run watch` vert en T6.
  - Fichiers : `.github/workflows/deploy.yml`
  - Dépend de : T4

- [ ] V3-T6 🟧 ENZO [agent: devops · sonnet, avec Enzo au clavier] Premier provisionnement de la VM
  - Pas à pas (Enzo exécute `docs/DEPLOY.md`, l'agent guide sans voir les secrets) : installer Docker et rclone ; règle `iptables` 443 ; créer `/opt/zofolio/.env` (secrets de T3, `chmod 600`) et `/opt/zofolio/certs/origin.{pem,key}` ; `rclone config` (remote `r2` S3 Cloudflare, puis remote `r2crypt` de type `crypt` avec la phrase de T3) ; cron `30 3 * * * /opt/zofolio/scripts/backup.sh` ; rendre publics les deux paquets GHCR après le premier push ; fusionner T4/T5 sur `main` pour déclencher le premier déploiement.
  - Acceptation : site servi en HTTPS via Cloudflare, déploiement vert.
  - Vérification : `curl -fsS https://enzoleveque.dev/fr/ | grep -q 'Enzo Leveque'` ; `curl -sk --max-time 5 https://<IP Oracle>/fr/` échoue (connexion coupée) ; `ssh ubuntu@<IP> sudo /opt/zofolio/scripts/backup.sh && rclone ls r2crypt:` liste le dump du jour.
  - Fichiers : —
  - Dépend de : T3, T5

- [ ] V3-T7 [agent: code-reviewer · sonnet] Revue de l'infra de production
  - Acceptation : checklist du plan-v3 §4 (lignes origine, secrets, sauvegardes) vérifiée ; ports exposés minimaux ; XFF = vraie IP (D29) ; CSP effective sans erreur d'hydratation ; restauration **testée une fois** dans un conteneur jetable ; rollback testé (tag volontairement cassé) ; constats en tâches ou corrigés.
  - Vérification : `git grep -n -I -E '(password|secret|token)\s*[:=]\s*[^$ {]' -- . ':!*.example'` vide ; `curl -sI https://$DOMAIN/fr/ | grep -i -E 'strict-transport|content-security'` ; `scripts/restore.sh` sur une copie, puis `SELECT count(*) FROM project`.
  - Fichiers : `docs/reviews/V3-T7-infra.md`
  - Dépend de : T6

- [ ] V3-T8 [agent: qa-engineer · sonnet] Smoke de production V1 + V2 (point de contrôle I)
  - Acceptation : SPEC §10 et plan-v2 §7 cochés un par un en prod (dossard sans scroll sur vrai mobile, sections au clavier/toucher/sans JS, 4 études FR/EN, sync GitHub visible, clips en Save-Data et reduced-motion) ; e-mail Gmail reçu ; 6e envoi → 429 depuis une connexion, envoi accepté depuis une autre (4G) ; console sans erreur d'hydratation ; Lighthouse prod ≥ 90/95/95/95 sur `/fr/`, `/en/`, `/fr/projets/oltre`.
  - Vérification : `npx lhci collect --url=https://$DOMAIN/fr/ --url=https://$DOMAIN/en/ --url=https://$DOMAIN/fr/projets/oltre && npx lhci assert --config=frontend/lighthouserc.json` ; `curl -fsS https://$DOMAIN/api/fr/projects/oltre | jq '.commits'` non nul.
  - Fichiers : `docs/reviews/V3-T8-smoke.md`, `tasks/todo.md` et `tasks/todo-v2.md` (T38-T41 et V2-T11, T36, T37 cochés avec renvoi vers V3)
  - Dépend de : T7

## Phase 2 : Restes V2 (en parallèle de la phase 1)

- [x] V3-T9 [agent: backend-dev · sonnet] github-sync paginé et meta des projets
  - Acceptation : requête GraphQL avec `pageInfo { hasNextPage }` ; si `hasNextPage` ou si `nodes` est vide alors que le cache ne l'est pas : upsert seulement, **aucune suppression**, WARN ; changeset `20261017-0200-project-meta.sql` (D45, valeurs FR/EN reprises des `meta.*` validés) ; `ProjectSummary` gagne `metaTitle` et `metaDescription` (nullables, résolus par langue).
  - Vérification : `cd backend && ./mvnw verify` (tests : `hasNextPage=true` → dépôts absents conservés ; liste vide → cache intact ; `metaTitle` EN servi, repli FR).
  - Fichiers : `githubsync/GithubClient.java`, `githubsync/GithubSyncService.java`, `githubsync/GithubSyncServiceTest.java`, `content/Project.java`, `content/ContentDto.java`, `content/ContentService.java`, `20261017-0200-project-meta.sql`
  - Dépend de : T1

- [ ] V3-T10 [agent: frontend-dev · sonnet] Front : schémas 15 px, course du clip, meta, marge Lighthouse
  - Acceptation : texte des schémas ≥ 15 px affichés à 900-1440 px (viewBox ou largeur du conteneur, revues V2-T28 n° 2 et V2-T29 n° 4) ; `Clip` : un clic de l'utilisateur fige le mode manuel (l'IntersectionObserver ne relance ni ne met plus en pause), et `<source webm>` seulement si `webm` non nul (D44) ; page projet : `metaTitle`/`metaDescription` avec repli `title, Enzo Leveque`/`pitch` ; `api.models.ts` à jour (`metaTitle`, `metaDescription`, `sportYears`, `webm` nullable) ; `/fr/` ≥ 92 en performance (médiane de 3 runs locaux), cause notée.
  - Vérification : `cd frontend && npm test` (test du Clip : clic pendant l'entrée dans le viewport → reste en lecture) ; `npx lhci autorun --config=lighthouserc.json` ; capture du schéma Oltre à 1000 px.
  - Fichiers : `features/projects/diagrams/diagram.css`, `shared/clip/clip.ts`, `shared/clip/clip.spec.ts`, `features/projects/case-study.page.ts`, `core/api/api.models.ts`
  - Dépend de : T9 (contrat seulement : peut démarrer sur fixtures)

## Phase 3 : Admin côté back

- [ ] V3-T11 [agent: designer · sonnet] Direction : admin, colophon, stats du Journal
  - Acceptation : `DESIGN.md` §11 : admin sobre avec les tokens existants (liste, formulaire FR/EN côte à côte, bouton Aperçu, états d'erreur par `code`, zone d'upload) sans aucune nouvelle couleur ni police ; colophon (blueprint de section, traitement des scores Lighthouse comme des « splits ») ; bloc `sportYears` dans le Journal (tableau en `tnum`, équivalent texte) ; checklist §11 ajoutée.
  - Vérification : relecture par le tech-lead : aucun élément de la liste anti-slop (§1).
  - Fichiers : `docs/DESIGN.md`
  - Dépend de : T1

- [x] V3-T12 [agent: backend-dev · sonnet] Authentification admin (session, CSRF, blocage)
  - Acceptation : D35-D38 et plan-v3 §3.1-3.2 ; dépendances T1 ; `admin/` (config de sécurité à deux chaînes, `AdminAuthController`, `LoginThrottle` sur `admin_login_failure`) ; changeset `20261017-0100-admin-login.sql` ; propriétés de cookie de session ; nouveaux `code` dans `ApiExceptionHandler` (401, 403, 429, 409) ; hash vide → 401 et WARN.
  - Vérification : `cd backend && ./mvnw verify` avec IT : `GET /api/admin/projects` sans session → 401 ; `POST login` sans en-tête CSRF → 403 ; bon mot de passe → 204, identifiant de session différent de celui d'avant, cookie `HttpOnly; Secure; SameSite=Strict` ; 5 échecs puis 6e essai (même bon) → 429 + `Retry-After` ; une autre IP passe ; 20 échecs globaux → 429 ; logout → 401 ensuite ; `ContactApiIT`, `ForwardedForIT` et `CvApiIT` inchangés et verts.
  - Fichiers : `admin/AdminSecurityConfig.java`, `admin/AdminAuthController.java`, `admin/LoginThrottle.java`, `admin/AdminLoginFailureRepository.java`, `admin/AdminAuthIT.java`, `shared/ApiExceptionHandler.java`, `application.properties`, `pom.xml`, `20261017-0100-admin-login.sql`
  - Dépend de : T1

- [x] V3-T13 [agent: backend-dev · sonnet] CRUD des projets, aperçu, dépôts du cache
  - Acceptation : plan-v3 §3.3 à l'identique (validation de chaque champ, clés de langue sur liste blanche, slug immuable, 409 si pris, nouveau projet `HIDDEN`) ; l'aperçu réutilise la conversion de `ContentService` (aucune duplication du mapping) ; `GET /api/admin/github-repos` ; journal INFO de chaque écriture (slug, action).
  - Vérification : `cd backend && ./mvnw verify` (IT : création → absent de `/api/fr/projects` tant que `HIDDEN` ; PUT → visible avec `en` et repli FR ; `demoUrl: "javascript:alert(1)"` → 400 `VALIDATION_FAILED` ; clé `de` → 400 ; aperçu sans écriture en base ; 401 sans session) ; couverture des services ≥ 80 %.
  - Fichiers : `admin/ProjectAdminController.java`, `admin/ProjectAdminService.java`, `admin/AdminDto.java`, `content/ContentService.java`, `admin/ProjectAdminIT.java`, `admin/ProjectAdminServiceTest.java`
  - Dépend de : T9, T12

- [ ] V3-T14 [agent: backend-dev · sonnet] Courses et stats sport (admin + public)
  - Acceptation : plan-v3 §3.4 (CRUD `races`, upsert `sport-years`, `sportYears` dans `/home`) ; changeset `20261017-0300-sport-year.sql` ; aucun champ de classement ni de tracé.
  - Vérification : `cd backend && ./mvnw verify` (IT : PUT 2025 → `/api/fr/home` contient `sportYears[0].year = 2025` ; année future → 400 ; course modifiée visible dans `/races`).
  - Fichiers : `admin/RaceAdminController.java`, `admin/SportYearController.java`, `content/SportYear.java`, `content/SportYearRepository.java`, `content/ContentDto.java`, `content/ContentService.java`, `admin/RaceSportAdminIT.java`, `20261017-0300-sport-year.sql`
  - Dépend de : T12

- [ ] V3-T15 [agent: backend-dev · sonnet] Upload de médias validé
  - Acceptation : D43-D44 et plan-v3 §3.5 ; changeset `20261017-0400-media.sql` ; ré-encodage `ImageIO` avec application de l'orientation EXIF ; parcours des boîtes MP4 (refus `udta`/`meta`) ; écriture atomique (fichier temporaire puis `move`) ; `delete` résolu sous `MEDIA_DIR` après contrôle du nom ; URL `mp4`/`poster` du `ProjectSummary` dérivées selon D44 ; volume `media` monté dans `docker-compose.yml` (back en écriture, Caddy en lecture) et route `/uploads/*` dans le `Caddyfile` de dev.
  - Vérification : `cd backend && ./mvnw verify` avec fixtures : JPEG avec GPS → sortie sans EXIF (`exiftool` vide en IT ou lecture des segments APP1) ; orientation 6 → largeur et hauteur inversées ; PNG renommé `.mp4` → `TYPE` ; 6 Mo → `SIZE` ; 5000 px → `DIMENSIONS` ; MP4 avec `©xyz` → `METADATA` ; sortie de `encode.sh` acceptée ; `DELETE` d'un média référencé → 409 ; nom `../x` impossible à atteindre.
  - Fichiers : `admin/MediaController.java`, `admin/MediaService.java`, `admin/ImageSanitizer.java`, `admin/Mp4Check.java`, `admin/MediaIT.java`, `admin/ImageSanitizerTest.java`, `admin/Mp4CheckTest.java`, `20261017-0400-media.sql`, `docker-compose.yml`, `Caddyfile`
  - Dépend de : T13

- [ ] V3-T16 [agent: code-reviewer · sonnet] Revue sécurité de l'admin (point de contrôle J)
  - Acceptation : diff T9, T12-T15 revu avec `security-and-hardening` et `code-review-and-quality` : plan-v3 §4 point par point, OWASP A01 (toutes les routes `/api/admin/**` couvertes, y compris `preview`), A03, A05, A07 ; aucune fuite du hash ou du mot de passe dans les logs ; critères J du plan-v3 §6 ; constats bloquants corrigés avant la phase 4.
  - Vérification : `cd backend && ./mvnw verify` ; `grep -rn -i 'password' backend/src/main | grep -i log` vide.
  - Fichiers : `docs/reviews/V3-T16-securite-J.md`
  - Dépend de : T13, T14, T15

## Phase 4 : Admin côté front, stats, colophon

- [ ] V3-T17 [agent: frontend-dev · sonnet] Coquille admin : connexion, garde, routes
  - Acceptation : D39 (route `admin/**` en `RenderMode.Client`, `noindex`, `robots.txt`) ; page de connexion (erreurs `UNAUTHENTICATED` et `LOGIN_LOCKED` avec la durée), garde de route via `GET /session`, déconnexion, navigation Projets / Courses / Stats / Médias ; XSRF par l'intercepteur natif (aucun code maison) ; tout l'admin utilisable au clavier, focus visible, libellés liés aux champs.
  - Vérification : `cd frontend && npm test` (garde : redirige vers la connexion si `authenticated: false`) ; `npm run build` (aucune erreur XLIFF) ; `curl -s localhost:4000/fr/admin | grep -c 'noindex'` ≥ 1.
  - Fichiers : `features/admin/admin.routes.ts`, `features/admin/admin.api.ts`, `features/admin/login.page.ts`, `features/admin/admin-shell.ts`, `app.routes.ts`, `app.routes.server.ts`, `public/robots.txt`
  - Dépend de : T11, T12

- [ ] V3-T18 [agent: frontend-dev · sonnet] Formulaires des projets et aperçu
  - Acceptation : liste des projets (tier, étape, ordre) ; formulaire réactif typé : champs FR/EN côte à côte, `decisions` (0 à 3 par langue), dépôts choisis dans `GET /github-repos`, clip (nom, dimensions, légende, `mp4`/`poster` choisis parmi les médias) ; erreurs `VALIDATION_FAILED` affichées sous le champ (`field` pointé) ; **Aperçu** FR et EN via `POST /preview` rendu par `CaseStudyView`, extrait de `case-study.page.ts` sans changer le rendu public ; Enregistrer = publier.
  - Vérification : `cd frontend && npm test` (mapping des erreurs pointées) ; E2E publics inchangés (`npx playwright test e2e/projects.spec.ts`).
  - Fichiers : `features/admin/projects/project-list.page.ts`, `features/admin/projects/project-form.page.ts`, `features/admin/projects/project-preview.ts`, `features/projects/case-study-view.ts`, `features/projects/case-study.page.ts`
  - Dépend de : T13, T17

- [ ] V3-T19 [agent: frontend-dev · sonnet] Courses, stats, médias (admin) et stats du Journal
  - Acceptation : écrans CRUD des courses et des années de stats ; page Médias (upload avec la raison du refus traduite en clair, liste avec `usedBy`, suppression avec confirmation, 409 expliqué) ; bloc `sportYears` du Journal selon DESIGN §11, masqué si `[]`, avec textes i18n FR/EN (cibles EN fournies par T20).
  - Vérification : `cd frontend && npm test` ; `npm run build` ; Journal rendu en SSR avec et sans `sportYears`.
  - Fichiers : `features/admin/races/race-admin.page.ts`, `features/admin/stats/sport-year-admin.page.ts`, `features/admin/media/media.page.ts`, `features/home-course/sections/journal.section.ts`, `src/locale/messages.en.xlf`
  - Dépend de : T14, T15, T17

- [ ] V3-T20 [agent: copywriter · sonnet] Textes du colophon et des stats (FR + EN)
  - Acceptation : colophon selon D49 : stack réelle (SPEC §4), méthode (agents, modèles et skills de SPEC §12, mode ponytail, cycle d'une feature), IA assumée (tags de SPEC §1, sans fausse modestie ni emphase), CI/CD (jobs de `ci.yml`, `deploy.yml`, Oracle + Cloudflare), emplacement des scores Lighthouse, liens (dépôt, `tasks/`, `docs/adr/`) ; libellés du bloc stats ; meta title et description ; DESIGN §1 ; versions FR et EN ; aucun fait inventé (chaque fait renvoie à un fichier du dépôt).
  - Vérification : `grep -i -E 'passionn|innovant|de l.idée à la production|révolution' docs/content/copy-v3.md` vide.
  - Fichiers : `docs/content/copy-v3.md`
  - Dépend de : T1

- [ ] V3-T21 🟧 ENZO [agent: — · Enzo] Valider le colophon et fournir les stats
  - Acceptation : `copy-v3.md` validé (noté en tête) ; totaux par année fournis (km, D+, heures, activités, Q10), saisis plus tard dans l'admin en prod (T30), pas commités.
  - Vérification : mention « VALIDÉ par Enzo le … » en tête de `copy-v3.md`.
  - Fichiers : `docs/content/copy-v3.md`
  - Dépend de : T20

- [ ] V3-T22 [agent: frontend-dev · sonnet] Page colophon
  - Acceptation : route `colophon` dans les deux locales, rendue en SSR, textes de T20 (`i18n` + XLIFF EN, aucune cible `state="initial"`), scores Lighthouse datés en constantes (mesure de T8), lien dans le pied de page, `sitemap.xml` (2 entrées + alternates), `hreflang`, meta ; lisible sans JS.
  - Vérification : `cd frontend && npm test && npm run build` ; `curl -s localhost:4000/en/colophon | grep -q 'lang="en"'`.
  - Fichiers : `features/colophon/colophon.page.ts`, `app.routes.ts`, `core/layout/footer.ts`, `public/sitemap.xml`, `src/locale/messages.en.xlf`
  - Dépend de : T11, T21

- [ ] V3-T23 [agent: designer · sonnet] Revue design K
  - Acceptation : admin, colophon et Journal à 360/390/768/1440, clair et sombre, contre DESIGN §9 et §11 ; captures dans `docs/reviews/V3-T23/` ; écarts corrigés ou listés en tâches.
  - Vérification : rapport avec captures.
  - Fichiers : `docs/reviews/V3-T23-design-K.md`
  - Dépend de : T18, T19, T22

- [ ] V3-T24 [agent: code-reviewer · sonnet] Revue de code K
  - Acceptation : diff T10, T17-T19, T22 : aucun `innerHTML` ni `bypassSecurity`, aucune donnée admin en `localStorage`, `CaseStudyView` sans régression du rendu public, aucun changeset de contenu après `20261017-0200` (D46), ponytail (pas d'abstraction inutile).
  - Vérification : `grep -rn 'innerHTML\|bypassSecurity\|localStorage' frontend/src/app/features/admin` vide ; `cd frontend && npm run lint && npm test`.
  - Fichiers : `docs/reviews/V3-T24-code-K.md`
  - Dépend de : T18, T19, T22

- [ ] V3-T25 [agent: qa-engineer · sonnet] E2E admin, axe, Lighthouse, audit (point de contrôle K)
  - Acceptation : E2E (hash de test injecté par la CI) : connexion ratée puis réussie, 6e échec → message de blocage, modification FR/EN d'un projet → aperçu → enregistrement → visible sur `/fr/projets/<slug>` et `/en/…`, ajout d'une année → Journal, upload d'une affiche → clip affiché, déconnexion ; axe 0 sur la connexion, un formulaire, le colophon (clair et sombre) ; `lighthouserc.json` étendu à `/fr/colophon` ; break-ui sur l'admin (textes longs, 0 projet, API en 500) ; `npm audit --omit=dev` et dépendances Maven triés ; job CI à jour.
  - Vérification : `docker compose up --build -d && cd frontend && npx playwright test` ; `npx lhci autorun --config=lighthouserc.json`.
  - Fichiers : `frontend/e2e/admin.spec.ts`, `frontend/e2e/colophon.spec.ts`, `frontend/lighthouserc.json`, `.github/workflows/ci.yml`, `docs/reviews/V3-T25-qa.md`
  - Dépend de : T23, T24

## Phase 5 : Démo Oltre (dépôts Oltre, en parallèle des phases 1-4)

- [ ] V3-T26 [agent: backend-dev · sonnet] Oltre-backend : profil `demo` (branche `feat/demo-profile`)
  - Acceptation : D50 côté back : `application-demo.properties` (Swagger coupé, aucune variable Garmin ou Gemini lue) ; `DemoDataSeeder` (vide puis recrée, au démarrage et à 4 h, dans une transaction ; dates relatives au jour ; un faux athlète ; dépenses sur 6 mois, tâches, repas de la semaine, rendez-vous à venir, 2 objectifs sport) ; `DemoGarminService` (`@Primary @Profile("demo")`, ~30 activités sur 8 semaines, records, détails avec `polyline` vide) ; inscription, modification ou suppression du compte et connexion Garmin → 403 en démo ; `docker-compose.demo.yaml` (projet `oltre-demo`, aucun port publié, réseau externe `edge`, alias `oltre-demo-backend` et `oltre-demo-frontend`, `SPRING_PROFILES_ACTIVE=demo`, `DEMO_MODE=true` pour le front, `JWT_SECRET` et mots de passe MySQL lus dans `.env.demo`) ; aucun fichier de `main` cassé hors profil.
  - Vérification : `./mvnw verify` dans Oltre-backend (IT `@ActiveProfiles("demo")` : athlète présent, deux remises à zéro donnent les mêmes comptes, `polyline` vide, `POST /auth/register` → 403 ; IT sans profil inchangés) ; `docker compose -f docker-compose.demo.yaml config -q` ; `grep -n -E 'GARMIN|GEMINI' docker-compose.demo.yaml` vide.
  - Fichiers : `src/main/resources/application-demo.properties`, `src/main/java/io/oltre_backend/demo/DemoDataSeeder.java`, `src/main/java/io/oltre_backend/demo/DemoGarminService.java`, `src/main/java/io/oltre_backend/demo/DemoGuard.java`, `src/test/java/io/oltre_backend/demo/DemoProfileIT.java`, `docker-compose.demo.yaml`
  - Dépend de : T1

- [ ] V3-T27 [agent: frontend-dev · sonnet] oltre-frontend : bandeau de démo (branche `feat/demo-mode`)
  - Acceptation : `DEMO_MODE` lu à l'exécution comme `API_URL` (`docker-entrypoint.sh`) ; bandeau accessible sur toutes les pages (« Démo : données effacées chaque nuit, n'entrez rien de personnel ») ; identifiants de démo pré-remplis sur la connexion ; lien d'inscription masqué ; rien ne change sans `DEMO_MODE`.
  - Vérification : `npm test` dans oltre-frontend ; `docker build` puis `docker run -e DEMO_MODE=true` : bandeau visible.
  - Fichiers : `docker-entrypoint.sh`, `src/app/...` (composant racine, page de connexion, configuration d'environnement)
  - Dépend de : T1

- [ ] V3-T28 [agent: code-reviewer · sonnet] Revue de la démo Oltre (point de contrôle L)
  - Acceptation : critères L du plan-v3 §6 ; aucune donnée réelle (e-mails, noms, coordonnées) dans les générateurs ; profil `demo` impossible à activer par erreur en prod normale (activé seulement par la variable du compose de démo) ; ponytail.
  - Vérification : `grep -rn -i -E '@gmail|leveque|lat|lon' src/main/java/io/oltre_backend/demo` relu ; `./mvnw verify`.
  - Fichiers : `docs/reviews/V3-T28-demo-L.md` (dans Zofolio)
  - Dépend de : T26, T27

## Phase 6 : Mise en ligne V3

- [ ] V3-T29 [agent: devops · haiku] Déploiement de la démo Oltre (soumis à Enzo)
  - Acceptation : 🟧 Enzo ajoute `CNAME oltre @` proxifié dans Cloudflare ; bloc `oltre.{$DOMAIN}` (plan-v3 §3.8) ajouté à `Caddyfile.prod` ; sur la VM, clones des deux branches de démo dans `/opt/oltre-demo`, `.env.demo` en 600, `docker compose -p oltre-demo -f docker-compose.demo.yaml up -d --build --wait` ; procédure (mise à jour, arrêt) dans `docs/DEPLOY.md`. Si la tâche sort de la routine, la passer à sonnet.
  - Vérification : `curl -fsS https://oltre.$DOMAIN/ | grep -qi oltre` ; connexion avec les identifiants de démo ; le lendemain, une donnée ajoutée la veille a disparu.
  - Fichiers : `Caddyfile.prod`, `docs/DEPLOY.md`
  - Dépend de : T8, T28

- [ ] V3-T30 [agent: devops · haiku] Déploiement du V3 (soumis à Enzo)
  - Acceptation : fusion sur `main` → déploiement automatique ; `ADMIN_PASSWORD_HASH` présent et intact dans le conteneur ; volume `media` monté et inclus dans la sauvegarde ; 🟧 Enzo se connecte à `https://$DOMAIN/admin`, saisit les stats de T21 et le `demoUrl` d'Oltre. Si la tâche sort de la routine, la passer à sonnet.
  - Vérification : `ssh $VPS 'docker compose -f /opt/zofolio/docker-compose.prod.yml exec backend printenv ADMIN_PASSWORD_HASH | cut -c1-4'` → `$2a$` ; `curl -fsS https://$DOMAIN/api/fr/home | jq '.sportYears | length'` ≥ 1.
  - Fichiers : —
  - Dépend de : T25, T29

- [ ] V3-T31 [agent: qa-engineer · sonnet] Smoke de production V3 (point de contrôle M)
  - Acceptation : critères M et critères de succès du plan-v3 §6 cochés en prod : cookie `__Host-zadmin` `Secure; HttpOnly; SameSite=Strict` (DevTools), blocage au 6e échec sur la vraie IP sans bloquer une autre connexion, modification visible sans déploiement, upload d'une photo de téléphone → servie sans EXIF (`exiftool` sur le fichier téléchargé), colophon FR/EN, démo Oltre ; Lighthouse prod ≥ 90/95/95/95 sur `/fr/` et `/fr/colophon` ; scores du colophon mis à jour avec ces mesures datées (petite PR).
  - Vérification : `npx lhci collect --url=https://$DOMAIN/fr/ --url=https://$DOMAIN/fr/colophon && npx lhci assert --config=frontend/lighthouserc.json` ; `curl -s https://$DOMAIN/uploads/<fichier>.jpg | exiftool - | grep -i -E 'gps|make|model'` vide.
  - Fichiers : `docs/reviews/V3-T31-smoke.md`, `features/colophon/colophon.page.ts`
  - Dépend de : T30
