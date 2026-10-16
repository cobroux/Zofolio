# Plan d'implémentation : Zofolio V3 « Arrivée »

> Entrées : `docs/SPEC.md` §2-3 et §12 (modules `content-admin`, `sport-stats`, `colophon`, `oltre-demo`), `docs/DESIGN.md`, V1 et V2 fusionnés sur `main` (`tasks/plan.md` §4 et `tasks/plan-v2.md` §4 restent valables), ADR 0001-0003. Tâches : `tasks/todo-v3.md`.
> Ce plan tient lieu de `docs/specs/SPEC-content-admin.md`, `SPEC-sport-stats.md`, `SPEC-colophon.md` et `SPEC-oltre-demo.md`. Toute évolution de contrat se fait ici d'abord.
> Il reprend aussi la **mise en production V1/V2** jamais faite (V1 T38-T41, V2-T36/T37), adaptée à **Oracle Cloud Always Free + Cloudflare**, ainsi que les restes ouverts des revues V2.
> État constaté le 2026-10-16 : aucun `docker-compose.prod.yml`, aucun `deploy.yml` ; le `Caddyfile` de dev écrit `X-Forwarded-For {remote_host}` (deviendrait l'IP de Cloudflare en prod) ; V2-T4 et V2-T12 sont faits mais pas cochés (`copy-fr-v2.md` validé, `CvController` sert l'EN) ; V2-T11 l'est à moitié (variable posée, procédure du token absente du README) ; Oltre-backend est en MySQL + Flyway + JWT, avec un service Garmin qui renvoie une `polyline` lat/lon.

## 1. Décisions d'architecture (suite de D1-D26)

### Hébergement et production
| # | Décision | Raison |
|---|---|---|
| D27 | **Oracle Cloud Always Free**, une VM Ampere A1 (arm64, 2 OCPU, 12 Go, Ubuntu 24.04), Docker Compose. Remplace Hetzner (SPEC §4 et §13 à mettre à jour). Compte passé en **Pay As You Go** avec une alerte budgétaire à 1 € (§Questions Q8). | Gratuit, 12 Go suffisent pour Zofolio + démo Oltre sur la même VM. Le PAYG évite la récupération des VM « inactives » et améliore la disponibilité A1. |
| D28 | **Cloudflare** : domaine `.dev` au Registrar Cloudflare, DNS proxifié (nuage orange), SSL « Full (strict) », « Always Use HTTPS ». Certificat d'origine **Cloudflare Origin CA** (15 ans) monté dans Caddy (`tls cert key`) : aucun ACME, qui ne passerait pas proprement derrière le proxy avec le filtrage IP. Rocket Loader et Email Address Obfuscation **désactivés** (ils réécrivent le HTML et cassent l'hydratation et la CSP). | TLS bout en bout sans renouvellement ; une seule origine joignable via Cloudflare. |
| D29 | **Vraie IP** : bloc global Caddy `servers { trusted_proxies static <plages CF> ; client_ip_headers CF-Connecting-IP }` ; vers le back, `header_up X-Forwarded-For {client_ip}` (remplace `{remote_host}`, y compris dans le Caddyfile de dev, où `{client_ip}` vaut l'adresse du pair). **Caddy n'accepte que Cloudflare** : snippet `@notcf not remote_ip <plages CF>` → `abort`. Plages copiées de `https://www.cloudflare.com/ips-v4` et `/ips-v6` (commentaire `shortcut: liste figée au <date>, à revoir si Cloudflare la change`). Le back garde `internal-proxies` 172.16/12 (D7). | Limite contact et blocage admin comptés sur la vraie IP ; un accès direct à l'IP Oracle est coupé. |
| D30 | Pare-feu Oracle : liste de sécurité VCN en entrée **443/tcp** (et 22 pour SSH, clé seule) ; sur la VM, la règle `iptables` d'Oracle (REJECT par défaut) reçoit un ACCEPT 443 avant le REJECT, persisté (`netfilter-persistent save`). Port 80 fermé (Cloudflare redirige en HTTPS). | Les images Ubuntu d'Oracle bloquent tout sauf 22 ; piège classique. |
| D31 | `docker-compose.prod.yml` : images GHCR publiques `ghcr.io/cobroux/zofolio-{backend,frontend}:${IMAGE_TAG}` ; seuls les ports 443 de Caddy sont publiés ; `restart: unless-stopped` ; **attente du back** : healthcheck back (`/api/fr/races`, outil `curl` ou `wget` vérifié dans l'image temurin), healthcheck front (`node -e "fetch('http://localhost:4000/fr/').then(r=>process.exit(r.ok?0:1),()=>process.exit(1))"`), `depends_on: condition: service_healthy` en chaîne postgres → backend → frontend → caddy, et `docker compose up -d --wait` au déploiement. Réseau nommé `edge` (Caddy, front, back, démo Oltre). Volumes `pgdata`, `media`, `caddy_data`. | Pas de 503 au premier visiteur après un déploiement ; un déploiement qui ne devient pas sain échoue. |
| D32 | Déploiement (`.github/workflows/deploy.yml`, sur `workflow_run` CI verte sur `main`) : build arm64 natif sur `ubuntu-24.04-arm`, push GHCR taggé du SHA, `scp` de `docker-compose.prod.yml`, `Caddyfile`, `scripts/` vers `/opt/zofolio`, puis SSH `IMAGE_TAG=<sha> docker compose -f docker-compose.prod.yml up -d --wait`. En cas d'échec, relance immédiate avec le tag précédent (lu dans `/opt/zofolio/.last_tag`). `known_hosts` épinglé en secret. | Rollback en une commande, pas de checkout git sur le serveur. |
| D33 | **Sauvegardes** (`scripts/backup.sh`, cron 03:30) : `pg_dump -Fc` + `tar` du volume `media` dans `/var/backups/zofolio`, rétention 7 jours, puis `rclone copy` vers un remote **`crypt`** au-dessus de **Cloudflare R2** (§Questions Q7), avec purge distante au-delà de 7 jours. Restauration testée une fois (T7). `rclone` est installé sur la VM (outil serveur, pas une dépendance du projet). | Hors serveur, chez un autre fournisseur qu'Oracle, chiffré (les messages de contact contiennent des noms et des e-mails). |
| D34 | SMTP **Gmail** `smtp.gmail.com:587` STARTTLS, mot de passe d'application (2FA requise). Oracle ne bloque que le port 25 sortant. | Déjà prévu au V1 (§13.4). |

### content-admin
| # | Décision | Raison |
|---|---|---|
| D35 | **Spring Security** (dépendance prévue SPEC §4) avec deux `SecurityFilterChain` : `securityMatcher("/api/admin/**")` (authentification de session, CSRF) et une chaîne `anyRequest().permitAll()` sans CSRF pour le reste. Le contact, le CV et l'API publique ne changent pas (leurs IT restent verts). Pas de `UserDetailsService` : le contrôleur de connexion compare le mot de passe au hash, puis enregistre un `SecurityContext` (rôle `ADMIN`) via `HttpSessionSecurityContextRepository` après `request.changeSessionId()`. | Un seul utilisateur, aucune table d'utilisateurs, fixation de session impossible. |
| D36 | **Mot de passe** : **bcrypt, coût ≥ 12** (`caddy hash-password` produit du coût 14) (`BCryptPasswordEncoder`, déjà dans Spring Security ; Argon2 exigerait BouncyCastle). Hash en variable `ADMIN_PASSWORD_HASH` (généré par `docker run --rm -it caddy:2 caddy hash-password`), écrit **entre apostrophes** dans `.env` (sinon Compose interprète les `$`). Hash vide → connexion toujours refusée et WARN au démarrage. Le bcrypt est calculé même pendant un blocage pour un temps de réponse constant. | Natif ; aucun mot de passe en clair nulle part. |
| D37 | **Session** : en mémoire (une instance), cookie `__Host-zadmin` `HttpOnly; Secure; SameSite=Strict; Path=/`, expiration 2 h d'inactivité. Redémarrage = déconnexion, accepté. **CSRF** : `csrf(c -> c.spa())` (Spring Security 7), cookie `XSRF-TOKEN` lisible + en-tête `X-XSRF-TOKEN`, que l'intercepteur XSRF natif d'`HttpClient` envoie déjà. | Zéro code CSRF côté front. |
| D38 | **Blocage** : table `admin_login_failure(ip_hash, failed_at)` (même hash salé que D7). 5 échecs en 15 min depuis une IP → 429 `LOGIN_LOCKED` + `Retry-After` jusqu'à la fin de la fenêtre ; **plafond global** de 20 échecs/h toutes IP confondues (attaque distribuée). Un succès efface les échecs de l'IP. Purge des lignes > 24 h à chaque connexion. Journal INFO : succès ou échec, hash d'IP, jamais le mot de passe. | Compté en base, survit aux redémarrages, même modèle que le contact. |
| D39 | **Interface admin** dans l'app Angular existante : `features/admin/`, route `admin/**` en `RenderMode.Client` (aucun cookie de session vu par le SSR), `noindex`, `Disallow: /fr/admin` dans `robots.txt`, textes en FR sans marqueur `i18n` (aucun impact sur le XLIFF). Caddy : `redir /admin /fr/admin`. | Pas de seconde app ni de build en plus. |
| D40 | **Traductions** : chaque champ traduisible s'édite en FR et EN côte à côte et transite tel quel (`{"fr": "...", "en": "..."}`, ADR 0001). `fr` obligatoire, `en` facultatif (repli FR, D1), aucune autre clé acceptée. | Le stockage jsonb est éditable sans conversion. |
| D41 | **Aperçu avant publication, sans brouillon en base** : `POST /api/admin/preview/{lang}/project` renvoie le `ProjectSummary` (avec `caseStudy`) calculé par le **même** code que l'API publique à partir du formulaire non enregistré. Le front l'affiche dans le gabarit réel, extrait de `case-study.page.ts` en composant de présentation `CaseStudyView` (entrée : `ProjectSummary`). **Publier = enregistrer** ; un nouveau projet naît `HIDDEN` (non publié) et n'apparaît qu'au passage en `SHORT` ou `CASE_STUDY`. Courses et stats (lignes courtes) : pas d'aperçu (§Questions Q2). | Aucune colonne de brouillon, aucune logique de fusion ; le `tier` sert déjà de drapeau de publication. |
| D42 | **Curation des dépôts** : inchangée (D16), la visibilité d'un dépôt = son nom listé dans `githubRepos` d'un projet non `HIDDEN`. L'admin choisit ces noms dans la liste du cache (`GET /api/admin/github-repos`). Aucun drapeau en plus. | Un seul endroit décide de la visibilité. |
| D43 | **Médias** (§Questions Q1) = fichiers du clip d'un projet. Upload `multipart` validé par **octets magiques** (jamais l'extension ni le `Content-Type`) : **JPEG/PNG** (affiche) ≤ 5 Mo, ≤ 4096 px de côté (dimensions lues avant décodage), **décodés puis ré-encodés** par `ImageIO` (JPEG q 0,85 ou PNG), ce qui supprime toutes les métadonnées (EXIF, GPS, XMP) par construction, après application de l'orientation EXIF ; **MP4** (H.264) ≤ 2,5 Mo (ADR 0003), parcours des boîtes ISO-BMFF : **refusé** s'il contient `udta` ou `meta` (coordonnées `©xyz` des téléphones), avec le conseil de passer par `tools/clips/encode.sh` (`-map_metadata -1`). Pas de WebM uploadé (le MP4 seul est lu partout). Nom = 24 premiers hex du SHA-256 du fichier final + extension (immuable, compatible cache 1 an et cache Cloudflare). Stockage dans le volume `media`, écrit par le back (`MEDIA_DIR=/data/media`), servi **par Caddy** en lecture seule sous `/uploads/*` (`file_server`, `nosniff`, `Cache-Control: public, max-age=31536000, immutable`). Suppression refusée (409) si un projet le référence ; chemin résolu sous `MEDIA_DIR` et nom contrôlé par regex avant tout `delete`. | Le seul média du modèle de contenu est le clip (`project.video`). Ré-encoder est la seule garantie fiable de retrait des métadonnées sans dépendance ; ADR 0003 prévoyait ce volume pour l'upload. |
| D44 | `project.video` (jsonb) accepte en plus `mp4` et `poster` facultatifs (`/uploads/<fichier>`). Absents → URL dérivées de `name` (ADR 0003, inchangé). `webm` devient `null` pour un clip uploadé ; le composant `Clip` n'émet la `<source webm>` que si elle existe. | Changement additif, les 3 clips existants ne bougent pas. |
| D45 | `project.meta_title` et `project.meta_description` (jsonb, nullables), éditables dans l'admin, initialisés depuis les `meta.*` de `copy-fr-v2.md` et `copy-en-v1-v2.md` ; la page projet les utilise, avec repli sur `title` et `pitch`. | Solde le reste de la revue V2-T29 et permet de créer un projet sans redéployer. |
| D46 | **Après la mise en ligne de l'admin, la base est la source du contenu** : plus aucun changeset Liquibase de contenu, seulement du schéma. Les sauvegardes (D33) protègent ces modifications. | Un changeset `UPDATE` écraserait une modification faite dans l'admin. |
| D47 | Slug **immuable** après création (stabilité des URL et du SEO). Pas de verrou optimiste (un seul utilisateur). Pas d'admin pour les expériences (§Questions Q3). | YAGNI. |

### sport-stats, colophon, oltre-demo
| # | Décision | Raison |
|---|---|---|
| D48 | `sport_year` : une ligne par année (km, D+, heures, activités), saisie dans l'admin, exposée dans `/home.sportYears` et affichée dans le Journal (bloc conçu par le designer). Garmin agrégé **hors V3** : plus tard, un script local pourra remplir la même table à partir de garmin-mcp, avec des totaux annuels seulement (aucun tracé, aucune FC, aucune donnée de santé). | Saisie d'abord (SPEC) ; aucune migration le jour où Garmin arrive. |
| D49 | **Colophon** : page statique `colophon` dans les deux locales (textes d'interface i18n, ADR 0001), lien dans le pied de page, entrée dans `sitemap.xml`. Contenu : stack, méthode (agents et modèles de SPEC §12, skills, mode ponytail), IA assumée (tags), CI/CD (jobs, déploiement), scores Lighthouse **mesurés en prod et datés** (valeurs en dur, mises à jour à chaque release), liens vers le dépôt, `tasks/` et `docs/adr/`. Aucune API. | Rien de dynamique à servir. |
| D50 | **Oltre démo**, dans les dépôts Oltre, branches `feat/demo-profile` (back) et `feat/demo-mode` (front) : profil Spring `demo` ; `DemoDataSeeder` (`@Profile("demo")`) qui vide les tables et recrée **un faux athlète** (`demo@oltre.dev`, mot de passe public affiché sur la page de connexion) avec des données générées relatives à la date du jour, au démarrage et chaque nuit (`@Scheduled(cron = "0 0 4 * * *", zone = "Europe/Paris")`) ; `DemoGarminService` (`@Primary @Profile("demo")`) qui renvoie des activités générées avec **`polyline` vide** (aucun GPS) ; inscription et toute modification du compte (mot de passe, e-mail, suppression, connexion Garmin) → 403 en démo ; Coach IA laissé inactif (503 existant). Front : variable d'exécution `DEMO_MODE` (via `docker-entrypoint.sh`) qui affiche un bandeau « Démo : données effacées chaque nuit, n'entrez rien de personnel » et pré-remplit les identifiants. | Aucune donnée Garmin réelle (SPEC §3) ; la démo se répare seule chaque nuit. |
| D51 | **Déploiement de la démo** : `oltre.<domaine>` sur la **même VM**, `docker-compose.demo.yaml` (dans Oltre-backend) sans port publié, rattaché au réseau externe `edge`, construit sur la VM (arm64 natif), projet `-p oltre-demo` ; le Caddy de Zofolio route `oltre.{$DOMAIN}` (`/api/*` et `/auth/*` → back, reste → front), avec le même filtrage Cloudflare. `demoUrl` d'Oltre renseigné ensuite **par l'admin**. | Un seul Caddy pour un seul port 443 ; pas de CI à créer côté Oltre. |

### Dépendances (« demander d'abord », en une fois dans V3-T1)
- Back Zofolio : `spring-boot-starter-security`, `spring-security-test` (test). Rien d'autre : `ImageIO`, `MessageDigest` et le multipart viennent du JDK et de Spring.
- Front : aucune.
- Serveur : `docker`, `rclone` (paquets Ubuntu). Oltre : aucune.

## 2. Graphe de dépendances

```
T1 décisions ─┬─ T2 🟧 comptes ─ T3 🟧 secrets ─┐
              │                                 ├─ T4 prod compose/Caddy/backup ─ T5 deploy.yml ─ T6 🟧 provisionnement ─ T7 revue infra ─ T8 smoke V1/V2 ══ point I
              ├─ T9 back restes (sync, meta) ─┐
              ├─ T10 front restes ────────────┤
              ├─ T11 design admin/colophon/journal
              ├─ T12 auth admin ─ T13 CRUD projets+aperçu ─ T14 courses+stats ─ T15 médias ─ T16 revue sécurité ══ point J
              │                    T17 shell admin ◄ T12,T11 ─ T18 formulaires projets ◄ T13 ─ T19 courses/stats/médias/Journal ◄ T14,T15
              ├─ T20 textes colophon ─ T21 🟧 validation ─ T22 page colophon
              │  T23 revue design K ∥ T24 revue code K ─ T25 QA admin+colophon ══ point K
              └─ T26 Oltre back démo ∥ T27 Oltre front démo ─ T28 revue démo ══ point L
point I + K + L ─ T29 déploiement démo Oltre ─ T30 déploiement V3 ─ T31 smoke V3 ══ point M
```

**Chemin critique :** T2/T3 (comptes et secrets d'Enzo : domaine, Oracle, Cloudflare, Gmail, R2) → T4 → T5 → T6 → T8. Le code V3 (T9-T28) avance en parallèle en local ; seule la mise en ligne finale (T29-T31) attend le point I.

## 3. Contrats d'API admin (V3)

Règles du plan V1 §4 inchangées (champs absents = `null`, `ProblemDetail` + `code`, JSON UTF-8). Base `/api/admin`, même origine, aucun CORS. Toute route sauf `GET /session` exige la session admin ; toute méthode non-GET exige `X-XSRF-TOKEN` (y compris `login`). Réponses admin : `Cache-Control: no-store` (en-têtes par défaut de Spring Security).

### 3.1 Nouveaux codes d'erreur
| HTTP | `code` | Quand | Extra |
|---|---|---|---|
| 401 | `UNAUTHENTICATED` | pas de session, session expirée, mauvais mot de passe | — |
| 403 | `FORBIDDEN` | jeton CSRF absent ou faux | — |
| 429 | `LOGIN_LOCKED` | blocage D38 | `Retry-After` |
| 409 | `CONFLICT` | slug déjà pris, média encore référencé | — |
| 400 | `MEDIA_REJECTED` | fichier refusé (413 du multipart compris) | `"reason": "TYPE" \| "SIZE" \| "DIMENSIONS" \| "METADATA" \| "DECODE"` |
| 400 | `VALIDATION_FAILED` | inchangé (§4.1 V1) | `errors[]` (`field` en notation pointée : `title.fr`, `decisions.en[1].title`) |

### 3.2 Session
- `GET /api/admin/session` → 200 `{ "authenticated": false }` ou `true` ; pose toujours le cookie `XSRF-TOKEN`.
- `POST /api/admin/login` `{ "password": "…" }` (`NotBlank`, `Size(max=200)`) → 204 + `Set-Cookie: __Host-zadmin=…` (nouvel identifiant) ; 401 `UNAUTHENTICATED` ; 429 `LOGIN_LOCKED`.
- `POST /api/admin/logout` → 204, session invalidée, cookie expiré.

### 3.3 Projets
```json
// ProjectAdmin (GET, POST, PUT : même forme ; toutes langues brutes ; tous tiers y compris HIDDEN)
{ "slug": "oltre", "tier": "CASE_STUDY", "stage": "P3", "sortOrder": 10,
  "title": {"fr": "Oltre", "en": "Oltre"}, "pitch": {"fr": "…", "en": "…"},
  "aiTag": "HAND_THEN_AI", "stack": ["Angular 22", "Java 21"], "duration": {"fr": "4 mois", "en": "4 months"},
  "note": null, "githubRepos": ["Oltre-backend", "oltre-frontend"], "demoUrl": null,
  "metaTitle": {"fr": "…", "en": "…"}, "metaDescription": {"fr": "…", "en": "…"},
  "role": {"fr": "…"}, "problem": {"fr": "…"}, "decisions": {"fr": [{"title": "…", "tradeoff": "…"}], "en": []},
  "wall": {"fr": "…"}, "takeaway": {"fr": "…"}, "aiNote": null,
  "video": { "name": "oltre-1", "mp4": null, "poster": null, "width": 1280, "height": 800,
             "caption": {"fr": "…", "en": "…"} } }
```
| Champ | Règle serveur |
|---|---|
| `slug` | `^[a-z0-9-]{1,64}$`, unique (409), **ignoré au PUT** (D47) |
| `tier` / `aiTag` / `stage` | enums existants ; `stage` ∈ `P1 \| P3 \| null` |
| traduisibles | clés ⊆ {`fr`,`en`}, `fr` `NotBlank` si le champ est requis ; tailles max : `title` 120, `pitch` 300, `metaTitle` 70, `metaDescription` 160, `duration` 40, `note` 300, `role` 200, `problem`/`wall`/`takeaway`/`aiNote` 3000 |
| `stack` | ≤ 12 éléments de 1 à 40 caractères |
| `githubRepos` | ≤ 5, `^[A-Za-z0-9._-]{1,100}$` |
| `demoUrl` | `null` ou `^https://` (≤ 255) : jamais `javascript:` |
| `decisions` | par langue, 0 à 3 éléments, `title` ≤ 120, `tradeoff` ≤ 1000 |
| `video` | `null`, ou `name` `^[a-z0-9-]{1,64}$`, `width`/`height` 1-4096, `mp4` `null` ou `^/uploads/[0-9a-f]{24}\.mp4$`, `poster` `null` ou `^/uploads/[0-9a-f]{24}\.(jpg\|png)$`, fichiers existants dans `media` (sinon 400 `VALIDATION_FAILED`) |
- `GET /api/admin/projects` → `ProjectAdmin[]` (ordre `sortOrder`) ; `GET /api/admin/projects/{slug}` → `ProjectAdmin` | 404.
- `POST /api/admin/projects` → 201 + `Location` (tier forcé à `HIDDEN` si absent) ; `PUT /api/admin/projects/{slug}` → 200 `ProjectAdmin` ; `DELETE /api/admin/projects/{slug}` → 204.
- `POST /api/admin/preview/{lang:fr|en}/project` corps `ProjectAdmin` → 200 `ProjectSummary` **avec** `caseStudy` (calculé comme si `tier` était `CASE_STUDY`), aucune écriture.
- `GET /api/admin/github-repos` → `[{ "name": "Oltre-backend", "pushedAt": "…", "commits": 355, "languages": ["Java"], "projects": ["oltre"] }]` (tout le cache, `projects` = slugs qui le listent).

### 3.4 Courses et stats
- `RaceAdmin` = `Race` public + `id`, `sortOrder`, `name`/`note` en `{fr,en}` : `GET /api/admin/races`, `POST` (201), `PUT /{id}`, `DELETE /{id}`. Règles : `kind` enum, `name.fr` ≤ 120, `distanceKm` 0-1000, `elevationGainM` 0-20000, `durationS` 0-604800, `raceDate` ≤ aujourd'hui + 1 an. **Aucun champ de classement ni de tracé** (SPEC §3).
- `SportYear` `{ "year": 2025, "distanceKm": 2140, "elevationGainM": 41200, "hours": 260, "activities": 210 }` : `GET /api/admin/sport-years`, `PUT /api/admin/sport-years/{year}` (upsert, 2000 ≤ year ≤ année courante, entiers ≥ 0 et nullables), `DELETE /{year}`.
- Public : `GET /api/{lang}/home` gagne `"sportYears": [SportYear]` (année décroissante, `[]` si vide). Ajout non cassant.

### 3.5 Médias
- `POST /api/admin/media` (`multipart/form-data`, champ `file`) → 201 `{ "id": 3, "url": "/uploads/9f2c…e1.jpg", "kind": "IMAGE", "contentType": "image/jpeg", "bytes": 84213, "width": 1280, "height": 800, "createdAt": "…" }` ; 400 `MEDIA_REJECTED`. Ré-upload du même contenu → 200 avec la ligne existante.
- `GET /api/admin/media` → liste (récents d'abord, avec `usedBy: ["oltre"]`) ; `DELETE /api/admin/media/{id}` → 204 (ligne + fichier) | 409 `CONFLICT` si référencé.
- Limites : `spring.servlet.multipart.max-file-size=5MB`, Caddy `request_body { max_size 6MB }` sur `/api/admin/media`.

### 3.6 Schéma (changesets à la suite de `20261016-1910`)
```
-- 20261017-0100-admin-login.sql
CREATE TABLE admin_login_failure (id BIGSERIAL PRIMARY KEY, ip_hash CHAR(64) NOT NULL,
  failed_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE INDEX ON admin_login_failure (ip_hash, failed_at);  CREATE INDEX ON admin_login_failure (failed_at);
-- 20261017-0200-project-meta.sql (schéma + valeurs initiales FR/EN depuis les copies validées)
ALTER TABLE project ADD COLUMN meta_title JSONB, ADD COLUMN meta_description JSONB;
-- 20261017-0300-sport-year.sql
CREATE TABLE sport_year (year SMALLINT PRIMARY KEY CHECK (year BETWEEN 2000 AND 2100), distance_km INT,
  elevation_gain_m INT, hours INT, activities INT, updated_at TIMESTAMPTZ NOT NULL DEFAULT now());
-- 20261017-0400-media.sql
CREATE TABLE media (id BIGSERIAL PRIMARY KEY, file_name VARCHAR(40) UNIQUE NOT NULL, kind VARCHAR(8) NOT NULL,
  content_type VARCHAR(32) NOT NULL, bytes INT NOT NULL, width INT, height INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now());
--   project.video (jsonb) : + "mp4", "poster" facultatifs (D44), sans DDL
```
Dernier changeset de contenu : `20261017-0200` (D46).

### 3.7 Variables d'environnement (ajouts, toutes dans `.env.example`, valeurs vides ou factices)
`ADMIN_PASSWORD_HASH` (back), `MEDIA_DIR` (back, `/data/media`), `DOMAIN`, `IMAGE_TAG` (prod). GitHub Secrets : `SSH_HOST`, `SSH_USER`, `SSH_KEY`, `SSH_KNOWN_HOSTS`. Sur la VM seulement : `/opt/zofolio/.env` (600), `/opt/zofolio/certs/origin.{pem,key}` (600), configuration `rclone` (600). La CI génère un hash de test pour l'E2E (`sed` sur `.env`), jamais commité dans l'exemple.

### 3.8 Caddyfile de prod (forme de référence pour T4, T15, T29)
```
{
	servers { trusted_proxies static <plages CF v4 et v6>
	          client_ip_headers CF-Connecting-IP }
}
(cf_only) {
	@notcf not remote_ip <plages CF v4 et v6>
	abort @notcf
	tls /etc/caddy/certs/origin.pem /etc/caddy/certs/origin.key
}
www.{$DOMAIN} { import cf_only
	redir https://{$DOMAIN}{uri} 301 }
{$DOMAIN} { import cf_only
	encode zstd gzip
	header { Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"; X-Content-Type-Options nosniff
	         Referrer-Policy strict-origin-when-cross-origin; Content-Security-Policy "<CSP V1 T38/T40, hash des scripts inline>" }
	redir /admin /fr/admin 302
	handle /api/* { reverse_proxy backend:8080 { header_up X-Forwarded-For {client_ip} } }
	handle /uploads/* { root * /srv; header Cache-Control "public, max-age=31536000, immutable"; file_server }
	handle { reverse_proxy frontend:4000 }
}
oltre.{$DOMAIN} { import cf_only            # T29
	@api path /api/* /auth/*
	handle @api { reverse_proxy oltre-demo-backend:8080 { header_up X-Forwarded-For {client_ip} } }
	handle { reverse_proxy oltre-demo-frontend:80 } }
```
Le certificat Origin CA doit couvrir `domaine` et `*.domaine` (valeur par défaut de Cloudflare).

## 4. Sécurité (modèle de menace résumé)

| Frontière | Menace (STRIDE) | Parade |
|---|---|---|
| `POST /api/admin/login` | usurpation par force brute, distribuée ou non | bcrypt ≥ 12, D38 (5/IP/15 min + 20/h global), vraie IP D29, journal des échecs |
| Cookie de session | vol (XSS), fixation, CSRF | `HttpOnly`, `__Host-`, `SameSite=Strict`, `changeSessionId`, CSRF D37, aucun `innerHTML` (vérifié en revue : `grep -rn 'innerHTML\|bypassSecurity' frontend/src` vide) |
| Formulaires admin | XSS stockée, `javascript:` dans un lien, champs énormes | interpolation Angular seule, `demoUrl` `^https://`, tailles max §3.3, clés de langue sur liste blanche |
| Upload | fichier déguisé, bombe de décompression, fuite GPS/EXIF, traversée de chemin | octets magiques, plafonds de taille et de dimensions, ré-encodage, refus des MP4 avec `udta`/`meta`, nom dérivé du SHA-256, `delete` résolu sous `MEDIA_DIR`, `nosniff` |
| Origine Oracle | contournement de Cloudflare, en-tête d'IP forgé | `abort` hors plages CF, `CF-Connecting-IP` lu seulement depuis CF, XFF écrasé par Caddy, back non publié |
| Secrets | fuite dans le dépôt, les images, les logs | `.env` 600 sur la VM et GitHub Secrets, images sans `.env`, `git grep` en revue, token et mot de passe jamais journalisés |
| Sauvegardes | fuite de données personnelles (contacts) | rclone `crypt`, clé R2 limitée au bucket |
| Démo Oltre | données réelles exposées, démo cassée par un visiteur | aucune variable `GARMIN_*`/`GEMINI_*`, `polyline` vide, compte non modifiable, remise à zéro chaque nuit, bandeau |
| Dépendances | vulnérabilité connue | `npm audit --omit=dev` et revue du `pom.xml` avant la release (T25) |

## 5. Risques et parades

| Risque | Impact | Parade |
|---|---|---|
| Comptes et secrets d'Enzo tardifs (Oracle, Cloudflare, domaine, Gmail, R2) | Haut (chemin critique de la prod) | T2/T3 au jour 0, pas à pas ; tout le code V3 avance en local en parallèle. |
| Oracle « Out of capacity » pour l'A1 dans la région d'origine | Haut | PAYG (Q8), réessayer à d'autres heures ou un autre domaine de disponibilité ; la région d'origine ne se change pas : la choisir en UE avant de créer le compte. |
| `iptables` d'Oracle qui bloque 443 ou le trafic Docker (`FORWARD REJECT`) | Moyen | D30 ; vérification `curl -sI https://$DOMAIN` depuis l'extérieur dans T6 ; procédure dans `DEPLOY.md`. |
| `$` du hash bcrypt interprété par Compose | Moyen | Apostrophes (D36) ; `docker compose -f docker-compose.prod.yml config \| grep ADMIN_PASSWORD_HASH` doit montrer le hash intact. |
| Cookie `__Host-`/`Secure` refusé en E2E sur `http://localhost` | Moyen | Chromium accepte `Secure` sur localhost ; sinon propriété `server.servlet.session.cookie.name` surchargée en profil de test seulement. |
| Fonctions Cloudflare qui réécrivent le HTML (Rocket Loader, Email Obfuscation) | Moyen | Désactivées dans T2 ; T8 vérifie l'hydratation (console sans erreur) en prod. |
| Liste d'IP Cloudflare qui change | Faible | Source et date en commentaire ; T8 vérifie qu'une requête via CF passe. |
| Modification admin écrasée par un changeset | Moyen | D46 ; revue K vérifie qu'aucun changeset de contenu ne suit `20261017-0200`. |
| Photo uploadée tournée (orientation EXIF perdue au ré-encodage) | Faible | D43 applique l'orientation avant ré-encodage (test avec les orientations 1, 3, 6, 8). |
| MP4 uploadé refusé alors qu'il est sain | Faible | Message clair (`reason: METADATA`) et `encode.sh` comme voie normale (ADR 0003). |
| Démo Oltre détournée (contenu injurieux saisi par un visiteur) | Faible | Remise à zéro chaque nuit, compte verrouillé ; pas de modération (un jour maximum d'exposition). |
| Lighthouse `/fr/` à 90 pile, Cloudflare en plus en prod | Moyen | T10 vise ≥ 92 en local (médiane de 3) ; T8 et T31 mesurent en prod. |
| `devops` (haiku) dépassé par Oracle et Cloudflare | Moyen | T4 et T5 en sonnet d'emblée. |

## 6. Points de contrôle

| Point | Après | Critères (tous verts, sinon pas de phase suivante) |
|---|---|---|
| **I : V1 + V2 en production** (T8) | T2-T7 | HTTPS sur le domaine via Cloudflare ; accès direct à l'IP Oracle coupé ; 6e message de contact → 429 pour une IP et pas pour une autre (vraie IP) ; e-mail Gmail reçu ; déploiement auto depuis `main` avec rollback testé ; sauvegarde du jour présente sur R2 et restaurée une fois ; critères SPEC §10 et plan-v2 §7 cochés en prod. |
| **J : Admin côté back sûr** (T16) | T12-T15 | `./mvnw verify` vert ; IT : 401 sans session, 403 sans CSRF, 429 au 6e échec, identifiant de session changé, attributs du cookie, contact toujours sans CSRF ; upload : EXIF/GPS absents (`exiftool`), MP4 avec `©xyz` refusé, traversée impossible ; revue sécurité sans constat bloquant. |
| **K : Admin, stats, colophon** (T23-T25) | T17-T22 | Parcours E2E : connexion → modification d'un projet → aperçu → enregistrement → visible sur `/fr/projets/<slug>` et `/en/…` ; ajout d'une stat → Journal ; upload → clip affiché ; axe 0 sur l'admin et le colophon (clair et sombre) ; Lighthouse colophon ≥ 90/95/95/95 ; checklist DESIGN §9 ; `npm audit --omit=dev` sans haut ni critique atteignable. |
| **L : Démo Oltre** (T28) | T26-T27 | `SPRING_PROFILES_ACTIVE=demo` : faux athlète et données sur chaque page, aucune `polyline` non vide, inscription et modification du compte → 403, remise à zéro idempotente (IT) ; aucune variable Garmin ou Gemini dans `docker-compose.demo.yaml`. |
| **M : Release V3** (T31) | T29-T30 | Admin en prod (cookie `Secure`, blocage sur la vraie IP), une modification visible sans redéploiement, colophon en ligne avec les scores datés, `oltre.<domaine>` en ligne et remis à zéro le lendemain, `demoUrl` d'Oltre affiché. |

### Critères de succès V3
- [ ] Enzo modifie un projet, une étude de cas (FR/EN), une course, une stat ou un clip depuis `/admin`, voit un aperçu, publie, et le site public change sans déploiement.
- [ ] `/admin` résiste aux tests : force brute bloquée, CSRF refusé, session non lisible en JS, aucun média publié avec des métadonnées.
- [ ] Le colophon explique la construction du site (stack, agents, IA, CI/CD, Lighthouse) en FR et en EN.
- [ ] La démo d'Oltre tourne sur un faux athlète, sans donnée Garmin réelle, et se remet à zéro chaque nuit.
- [ ] Zofolio tourne sur Oracle + Cloudflare avec la vraie IP des visiteurs, des sauvegardes hors serveur et un déploiement automatique.

## 7. Questions

Chacune a une recommandation ; Enzo tranche dans V3-T1 (réponses notées en §8).

1. **Périmètre des médias** : seulement les fichiers du clip d'un projet (MP4 sans métadonnées + affiche JPEG/PNG ré-encodée), les photos du site restant dans le dépôt ? *Recommandation : oui.* C'est le seul média du modèle de contenu ; ajouter des photos à des courses serait une fonctionnalité nouvelle. Les MP4 ne sont pas nettoyés côté serveur (il faudrait ffmpeg dans l'image) mais refusés s'ils contiennent des métadonnées.
2. **Aperçu** : sur les projets et études de cas seulement (rendu réel de la page), pas sur les courses ni les stats (une ligne chacune) ? *Recommandation : oui.*
3. **Expériences** (P1, Worldline, ravitaillements) : hors admin au V3 ? *Recommandation : oui.* Elles changent rarement et Worldline exige une relecture ; une modification passe par une PR.
4. **Hash** : bcrypt (coût ≥ 12) plutôt qu'Argon2 ? *Recommandation : bcrypt*, natif dans Spring Security, alors qu'Argon2 ajoute BouncyCastle.
5. **Blocage** : 5 échecs par IP en 15 min, plus un plafond global de 20 échecs par heure (qui peut te bloquer 1 h en cas d'attaque distribuée) ? *Recommandation : oui.*
6. **Cloudflare Access** (gratuit, code par e-mail) devant `/fr/admin` et `/api/admin` en plus du mot de passe ? *Recommandation : pas au V3*, le mot de passe et le blocage suffisent pour un seul compte. À ajouter en 10 min plus tard si les journaux montrent des attaques.
7. **Sauvegardes hors serveur** : Cloudflare R2 (10 Go gratuits, un autre fournisseur qu'Oracle, carte bancaire à enregistrer chez Cloudflare) chiffré par rclone, plutôt que l'Object Storage d'Oracle (même compte, donc même risque) ou Google Drive ? *Recommandation : R2.*
8. **Oracle en Pay As You Go** (reste gratuit dans les limites Always Free, alerte budgétaire à 1 €) ? *Recommandation : oui*, sinon Oracle peut récupérer une VM jugée inactive et l'A1 est souvent indisponible sur les comptes gratuits.
9. **Domaine et sous-domaine** : `enzoleveque.dev` (SPEC §13) et `oltre.enzoleveque.dev` pour la démo, sur la même VM ? *Recommandation : oui.*
10. **sport-stats** : totaux par année (km, D+, heures, activités) saisis dans l'admin, Garmin reporté après le V3 ? *Recommandation : oui.* Quelles années et quels chiffres ? À fournir par Enzo (T21).
11. **Scores Lighthouse du colophon** : valeurs mesurées en prod, datées, mises à jour à la main à chaque release (plutôt qu'un appel à la CI) ? *Recommandation : oui.*
12. **Démo Oltre** : Coach IA désactivé (pas de clé Gemini publique), recherche OpenFoodFacts en direct conservée, mot de passe de démo affiché ? *Recommandation : oui aux trois.*
13. **Contenu après V3** : la base devient la source (plus de changeset de contenu, D46) ? *Recommandation : oui*, les sauvegardes R2 faisant foi.

## 8. Décisions d'Enzo
*(à remplir dans V3-T1)*

## §8. Décisions d'Enzo (2026-10-16)
- Les 8 recommandations du §7 sont acceptées.
- **Le déploiement est reporté** : les tâches V3-T2 à T8, T29, T30 et T31 sont en attente. On code et on valide tout en local d'abord.
