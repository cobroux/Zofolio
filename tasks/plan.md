# Plan d'implémentation : Zofolio V1 « Départ »

> Entrées : `docs/SPEC.md` (validé 2026-10-15), `docs/DESIGN.md`. Tâches : `tasks/todo.md`. ADR : `docs/adr/`.
> Périmètre : modules `infra`, `core-shell`, `content`, `home-course`, `contact`, `cv`. FR seul, structure i18n prête pour l'EN.
> Ce plan tient lieu de `docs/specs/SPEC-<module>.md` pour les six modules V1 (sections 3 et 4). Toute évolution de contrat se fait ici d'abord.

## 1. Décisions d'architecture

| # | Décision | Raison |
|---|---|---|
| D1 | Textes de contenu en base : une colonne `jsonb` `{"fr": "...", "en": "..."}` par champ traduisible. Textes d'interface (boutons, labels, aria, hero, titres de section, Arrivée) via `@angular/localize`, build par locale. | [ADR 0001](../docs/adr/0001-stockage-des-traductions.md). EN = ajouter une clé, sans migration de schéma. |
| D2 | Le SSR Node appelle le back en direct sur le réseau Docker (`API_INTERNAL_URL=http://backend:8080`) ; le navigateur appelle `/api` en relatif via Caddy. Transfer cache Angular pour éviter le double appel. | [ADR 0002](../docs/adr/0002-appel-api-depuis-le-ssr.md). |
| D3 | Hero (Départ) et Arrivée sont statiques côté front (i18n), jamais dépendants de l'API. | Premier écran et CTA affichés même si l'API tombe ; LCP sans attente réseau. |
| D4 | Erreurs : `ProblemDetail` (RFC 9457) natif Spring + propriété `code`. Le front traduit les `code`, le back ne renvoie aucun texte localisé. | Fonction de la plateforme, zéro dépendance. |
| D5 | `{lang}` contraint par la route (`/api/{lang:fr\|en}/...`) : toute autre valeur = 404 natif. `en` sert le FR en repli dès le V1. | Zéro code de validation ; V2 prêt. |
| D6 | V1 : seul `fr` est construit. `/` → `/fr/` (Accept-Language, FR par défaut) ; `/en/*` → 302 `/fr/*` ; bascule FR/EN masquée ; `hreflang` = `fr` + `x-default`. | Pas de page EN contenant du FR (SEO). En V2 : ajouter la locale `en` et retirer la redirection. |
| D7 | Limite contact (5/h/IP) comptée en base sur `contact_message` (hash SHA-256 de l'IP + sel en env). Pas de bibliothèque, survit au redémarrage. IP réelle via `server.forward-headers-strategy=native` ; back jamais exposé hors réseau Docker. | Le message est enregistré de toute façon (exigence « non perdu »). |
| D8 | Envoi SMTP synchrone (timeouts 5 s). Message toujours enregistré avant l'envoi, statut `SENT`/`FAILED`. | Exigence SPEC, pas de file d'attente à opérer. |
| D9 | CV : PDF public dans `backend/src/main/resources/cv/`, servi par `GET /api/{lang}/cv` (une ligne `cv_download` par téléchargement). EN absent en V1 → repli FR. Lien `<a href>` simple : marche sans JS. | Compteur côté serveur fiable. |
| D10 | Profil de dénivelé : données statiques `[km, ele]` (~200 points, sans lat/lon) dans le front, générées une fois par un script Node sans dépendance. km recalés sur 79,41 (le GPX mesure 79,08 km) ; D+ affiché = valeur officielle (~3 160 m), jamais calculé (le GPX brut donne 3 821 m, bruité). | Aucun tracé GPS commité ; pas de requête pour le geste signature. |
| D11 | Formulaire de contact dans la section Arrivée (`#arrivee`), pas de page dédiée. Le designer valide le traitement sur aplat orange (T34). | Une seule page, CTA « Me contacter » = ancre. |
| D12 | Pas de Spring Security, pas d'Actuator, pas de lib d'animation ni d'UI en V1. CSP via en-têtes Caddy uniquement (`security.autoCsp` est incompatible avec le SSR : erreur de build constatée en T6). | YAGNI ; admin = V3. |
| D13 | Liquibase en SQL formaté (`--liquibase formatted sql`), un fichier par changeset, données de contenu dans des changesets séparés du schéma. | Lisible pour le JSONB ; le seed final (T32) ne bloque pas le schéma. |

### Dépendances à faire approuver par Enzo (règle « demander d'abord »), en une fois
- Back : `spring-boot-starter-webmvc`, `-data-jpa`, `-validation`, `-mail`, `-liquibase`, `postgresql`, `spring-boot-starter-test`, `spring-boot-testcontainers`, `testcontainers-postgresql`, plugin `jacoco-maven-plugin`. Versions gérées par le parent Boot 4.1 (ne pas recopier le `testcontainers 1.20.4` d'Oltre).
- Front : socle Angular 22 + `@angular/ssr` (Express), `@angular/localize`, `vitest` + `jsdom` (comme Oltre), `angular-eslint`, `prettier`, `@playwright/test`, `@axe-core/playwright`, `@lhci/cli`.
- Image Docker : `axllent/mailpit` (SMTP de dev/CI, pas une dépendance du code).

## 2. Composants et graphe de dépendances

```
T4 racine (.gitignore) ─┬─ T5 squelette back ─┬─ T10 races ─ T11 projects ─ T12 home ─┐
                        │                     ├─ T13 contact (save) ─ T14 mail ─ T15 429│
                        │                     └─ T16 cv ◄── T1 CV public               │
                        ├─ T6 squelette front ─┬─ T17 tokens/polices ─┬─ T18 shell ─ T19 thème
                        │                      │                      └─ T20 SEO
                        │                      ├─ T21 client API SSR (contrat §4)
                        │                      ├─ T22 profil GPX
                        │                      └─ T23 images
                        └─ T7 compose ─ T8 CI ─ T9 revue A
T2 faits ─ T3 textes FR (validation Enzo) ─ T32 seed Liquibase ─ T33 mentions légales
Phase 3 : T25 hero ◄ T17,T18,T23 · T26 profil ◄ T22,T18 · T27 road book ◄ T26 · T28-T30 sections ◄ T21 · T31 Arrivée+form ◄ T18
Phase 4 : T36 E2E · T37 Lighthouse · T38 prod · T39 deploy · T40 revue infra · T41 smoke prod
```

**Chemin critique :** T4 → T6 → T17 → T18 → T26 → T27 → T35/T36 → T39 → T41, avec la branche contenu T2 → T3 (validation Enzo) → T32 qui doit converger avant T36. Le goulot réel est la validation des textes (Worldline) par Enzo.

## 3. Ordre et parallélisme

| Phase | Tâches | Parallélisable |
|---|---|---|
| 0. Contenu (démarre tout de suite) | T1, T2, T3 | T1 ∥ T2 ; T3 après T2. Tourne en fond pendant les phases 1-3. |
| 1. Fondations | T4 → T5 ∥ T6 → T7 → T8 → **T9 revue A** | T5 ∥ T6. |
| 2. Briques | Back T10→T11→T12, T13→T14→T15, T16 · Front T17→T18→T19/T20, T21, T22, T23 · **T24 revue B** | Back et front entièrement en parallèle grâce au contrat §4. Les trois chaînes back sont indépendantes (packages distincts) ; seules les numérotations de changesets se coordonnent (`content` 01xx, `contact` 02xx, `cv` 03xx). |
| 3. Accueil | T25, T26→T27, T28, T29, T30, T31, T32, T33 · **T34 revue design, T35 revue code** | Sections T28-T31 en parallèle (fichiers disjoints). |
| 4. Qualité et prod | T36 ∥ T37 ∥ T38 → T39 → **T40 revue infra** → **T41 smoke prod** | T38 peut démarrer dès T9 si Enzo a le VPS et le domaine. |

## 4. Contrats d'API V1 (figés)

Base : `/api`. JSON UTF-8. Champs absents = `null` (jamais omis). Dates ISO-8601, nombres bruts (le front formate selon la locale, DESIGN §2). Aucune authentification. Même origine en prod (Caddy) et en dev (proxy Angular `/api` → `localhost:8080`) : pas de CORS.

### 4.1 Erreurs (toutes les routes)
`Content-Type: application/problem+json`
```json
{ "type": "about:blank", "title": "Too Many Requests", "status": 429,
  "detail": "Rate limit exceeded", "instance": "/api/contact", "code": "RATE_LIMITED" }
```
| HTTP | `code` | Quand | Extra |
|---|---|---|---|
| 400 | `VALIDATION_FAILED` | Bean Validation échoue | `"errors": [{"field": "email", "code": "Email"}]` (`code` = nom de la contrainte : `NotBlank`, `Size`, `Email`, `Pattern`) |
| 400 | `MALFORMED_REQUEST` | JSON illisible, mauvais type | — |
| 404 | `NOT_FOUND` | route inconnue, `lang` hors `fr\|en`, slug inconnu ou masqué | — |
| 429 | `RATE_LIMITED` | > 5 envois/h/IP | en-tête `Retry-After: <secondes>` |
| 503 | `MAIL_DELIVERY_FAILED` | échec SMTP ; le message **est enregistré** | — |
| 500 | `INTERNAL_ERROR` | autre ; aucune trace de pile exposée | — |

### 4.2 Contenu (lecture, `content`)
Résolution de langue : `texte[lang] ?? texte["fr"]`. Ordre : `sort_order` croissant.

**`GET /api/{lang}/home` → 200**
```json
{
  "experiences": [
    { "stage": "P1", "kind": "EDUCATION", "title": "Master ILI, Université d'Artois",
      "body": "…", "period": "2023–2025", "stack": ["Java", "Angular"], "note": null },
    { "stage": "R1", "kind": "AID", "title": "Brancardier aux urgences", "body": "…",
      "period": null, "stack": null, "note": "…" },
    { "stage": "P2", "kind": "MISSION", "title": "…", "body": "…", "period": "8 mois",
      "stack": ["Java 21", "Spring Boot"], "note": "…" }
  ],
  "projects": [ ProjectSummary ],          // uniquement ceux dont stage ≠ null (P1, P3)
  "races": [ Race ]
}
```
- `stage` ∈ `P1 | R1 | P2 | R2 | P3` (R = ravitaillement placé après P du même numéro). `kind` ∈ `EDUCATION | MISSION | AID`.

**`GET /api/{lang}/projects` → 200** `ProjectSummary[]` (tier ≠ `HIDDEN`).
**`GET /api/{lang}/projects/{slug}` → 200** `ProjectSummary` | 404 `NOT_FOUND` (inconnu ou `HIDDEN`). Le V2 ajoutera un champ `caseStudy` (ajout non cassant).

```json
// ProjectSummary
{ "slug": "oltre", "tier": "CASE_STUDY", "stage": "P3", "title": "Oltre", "pitch": "…",
  "aiTag": "HAND_THEN_AI", "stack": ["Java 21", "Spring Boot", "Angular"],
  "duration": "8 mois", "commits": 412, "note": "…",
  "repoUrl": "https://github.com/cobroux/…", "demoUrl": null }
```
- `tier` ∈ `CASE_STUDY | SHORT` (`HIDDEN` jamais exposé). `aiTag` ∈ `HAND | HAND_THEN_AI | AI` (libellés FR côté front : « Écrit à la main », « Commencé à la main, puis IA », « Conçu avec IA »). `stage` ∈ `P1 | P3 | null`.

**`GET /api/{lang}/races` → 200** `Race[]`
```json
// Race (valeurs illustratives)
{ "kind": "RACE", "date": "2025-06-01", "name": "Grand Trail d'Auvergne",
  "distanceKm": 79.4, "elevationGainM": 3160, "durationS": 48953,
  "note": "…", "personalRecord": false }
```
- `kind` ∈ `RACE | INDEX | CLUB` (UTMB index 459 = `INDEX`, `name` « UTMB index 459 », chiffres `null` ; Baudets d'Hinges = `CLUB`). Jamais de classement.

Types TS miroirs : `frontend/src/app/core/api/api.models.ts` (T21), seule source côté front.

### 4.3 Contact
**`POST /api/contact`**
```json
{ "name": "Ada", "email": "ada@example.com", "company": null, "message": "…", "website": "" }
```
| Champ | Règle (client **et** serveur) |
|---|---|
| `name` | `NotBlank`, `Size(max=100)`, `Pattern` sans caractère de contrôle (pas de CR/LF : sujet d'e-mail) |
| `email` | `NotBlank`, `Email`, `Size(max=254)` |
| `company` | facultatif, `Size(max=100)` |
| `message` | `NotBlank`, `Size(max=5000)` |
| `website` | honeypot, champ caché ; non vide → **202 sans enregistrement ni envoi** |

Ordre serveur : validation (400) → honeypot (202 silencieux) → limite (429, compte des messages du même `ip_hash` sur 60 min ≥ 5) → enregistrement → SMTP → 202 vide, ou 503 `MAIL_DELIVERY_FAILED` (statut `FAILED` en base).
E-mail : à `CONTACT_TO`, depuis `SMTP_USERNAME`, `Reply-To` = visiteur, sujet `[Zofolio] Message de {name}`. Aucun e-mail au visiteur ; confirmation à l'écran.

### 4.4 CV
**`GET /api/{lang}/cv` → 200** `application/pdf`, `Content-Disposition: attachment; filename="Enzo-Leveque-CV-FR.pdf"` ; insère une ligne `cv_download(lang, downloaded_at)`. V1 : `en` → fichier FR (nom FR). Fichier absent → 404 `NOT_FOUND`.

### 4.5 Schéma (Liquibase, PostgreSQL 17)
```
project(id bigserial pk, slug varchar(64) unique not null, tier varchar(16) not null, stage varchar(4),
        title jsonb not null, pitch jsonb not null, ai_tag varchar(16) not null, stack jsonb not null,
        duration jsonb, commits int, note jsonb, repo_url varchar(255), demo_url varchar(255), sort_order int not null)
experience(id bigserial pk, stage varchar(4) not null, kind varchar(16) not null, title jsonb not null,
           body jsonb not null, period jsonb, stack jsonb, note jsonb, sort_order int not null)
race(id bigserial pk, kind varchar(8) not null, race_date date, name jsonb not null, distance_km numeric(5,1),
     elevation_gain_m int, duration_s int, note jsonb, personal_record boolean not null default false, sort_order int not null)
contact_message(id bigserial pk, name varchar(100), email varchar(254), company varchar(100), message text,
                ip_hash char(64) not null, status varchar(8) not null, created_at timestamptz not null default now())
                index (ip_hash, created_at)
cv_download(id bigserial pk, lang varchar(2) not null, downloaded_at timestamptz not null default now())
```
`jsonb` traduisible ↔ `Map<String,String>` via `@JdbcTypeCode(SqlTypes.JSON)` ; résolution par un helper unique dans `shared/` (`I18n.pick(map, lang)`).

### 4.6 Front : routes et données statiques
- Routes (base `/fr/`) : `''` accueil (ancres `#depart #p1 #p2 #p3 #journal #arrivee`), `mentions-legales`, `**` page 404 (statut HTTP 404 en SSR).
- `features/home-course/profile.data.ts` : `PROFILE: readonly (readonly [km: number, ele: number])[]` ; `CHECKPOINTS` : `depart 0`, `p1 20`, `p2 44`, `p3 58.2`, `arrivee 79.41`.
- Variables : `API_INTERNAL_URL` (SSR), back : `DB_URL`, `DB_USER`, `DB_PASSWORD`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `CONTACT_TO`, `IP_HASH_SALT`. Toutes dans `.env.example`.

## 5. Risques et parades

| Risque | Impact | Parade |
|---|---|---|
| Validation des textes par Enzo (Worldline, « demander d'abord ») tardive | Haut (chemin critique) | T2/T3 démarrent au jour 0 ; front et back développent sur fixtures ; seed séparé (T32). |
| CV avec téléphone commité | Haut | `private/` déjà ignoré ; T4 vérifie avant le 1er commit ; T1 contrôle `pdftotext` + métadonnées. |
| SSR : API lente ou en panne → page bloquée | Haut | D3 (hero/arrivée statiques), timeout 2 s côté SSR, état « contenu indisponible » par section, transfer cache. |
| Lighthouse mobile ≥ 90 avec SSR + hydratation | Moyen | Portrait AVIF + srcset + preload, polices sous-ensemble, `@defer` sous la ligne de flottaison, aucune lib d'animation, budgets dans `angular.json`. |
| Contournement du 429 par `X-Forwarded-For` forgé | Moyen | Port back non publié en prod (réseau Docker seul), Caddy seul émetteur de XFF ; test du 6e envoi. |
| Boot 4.1 / Angular 22 récents (starters renommés, Testcontainers 2, builder Vitest, redirection i18n de `@angular/ssr`) | Moyen | Versions gérées par le parent ; conventions Oltre pour `angular.json`/Vitest ; redirection `/` vérifiée en T6, sinon 5 lignes dans `server.ts`. |
| Build d'images ARM (Hetzner CAX11 = arm64) | Moyen | Runners `ubuntu-24.04-arm` (gratuits si repo public), sinon buildx QEMU. |
| Gmail SMTP (2FA requise, délivrabilité) | Moyen | Mot de passe d'application, expéditeur = compte lui-même, 503 + message en base. |
| CSP vs scripts inline (anti-flash du thème, event replay) | Faible | `security.autoCsp` Angular (hash des scripts inline), CSP vérifiée en T40. |
| Données GPX incohérentes avec les chiffres officiels | Faible | D10 : recalage km, D+ officiel en constante. |
| Logo ILI (portrait d'enseignant), photos de tiers | Faible | Logo exclu du V1 sans accord écrit ; recadrage validé par Enzo (T23). |
| `devops` (haiku) dépassé sur prod/deploy | Moyen | T38/T39 : si hors routine, l'agent le signale et la tâche passe à un modèle sonnet. |

## 6. Points de contrôle

| Point | Après | Critères (tout vert sinon pas de phase suivante) |
|---|---|---|
| **A : Fondations** (T9) | T4-T8 | `./mvnw verify`, `npm test`, `npm run lint`, `npm run build` verts ; `docker compose up --build` sert `/fr/` et le back ; CI verte sur une PR ; aucun secret ni `private/` suivi par git. |
| **B : Briques** (T24) | T10-T23 | Les 6 routes du §4 répondent comme le contrat (tests d'intégration Testcontainers) ; couverture services ≥ 80 % ; shell SSR avec thème sans flash ; client API typé ; profil généré sans lat/lon. |
| **C : Accueil** (T34, T35) | T25-T33 | 5 sections navigables clavier/souris/toucher/sans JS ; dossard sans scroll à 360×640 et 390×844 ; checklist DESIGN §9 passée en clair et sombre ; Enzo a validé les textes. |
| **D : Release** (T40, T41) | T36-T39 | E2E + axe + Lighthouse au vert en CI ; HTTPS sur le domaine ; déploiement auto depuis `main` ; e-mail de contact reçu en prod ; sauvegarde du jour présente. = critères SPEC §10. |

## 7. Questions ouvertes (Enzo)
1. Approuver la liste de dépendances (§1) en une fois ?
2. CV public : retirer téléphone et adresse postale, garder l'e-mail (recommandé) ? Décision formalisée en T1.
3. D6 : `/en` redirigé vers `/fr` et bascule FR/EN masquée jusqu'au V2 : d'accord ?
4. Repo GitHub public (preuve + runners ARM gratuits) ? Domaine et VPS achetés quand (bloquent T38) ?
5. Durée de conservation des messages de contact : 12 mois (affichée dans les mentions légales, purge manuelle en V1) ?
