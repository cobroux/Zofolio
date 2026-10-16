# Faits sourcés V2 : études de cas

Date : 2026-10-15. Brouillon interne, non publié, rien n'est validé.
Chaque puce porte sa source. `À FOURNIR` marque un manque. Rien n'est inventé.
Règles appliquées : SPEC §9 (aucun nom de client, d'architecture ou de fonctionnalité Worldline, validation d'Enzo pour tout texte sur Worldline). Aucun secret, e-mail, token, coordonnée GPS ni donnée Garmin réelle. Les fichiers `.env`, `data/` et `certs/` n'ont pas été ouverts.
Git : `git log` local sur les dépôts Oltre-backend, oltre-frontend et Zotracker (exécuté le 2026-10-15). Pour garmin-mcp, GFaim-app et GFaim-api : API GitHub `commits` (dates) et en-tête `Link` (nombre).

---

## 1. Oltre

Dépôts : `Oltre-backend` et `oltre-frontend`.

### Pitch
- Application personnelle de pilotage du quotidien (sport, dépenses, tâches, rendez-vous, repas, coach IA), avec un backend Spring Boot et un frontend Angular séparés. Source : `Oltre-backend/src/main/java/io/oltre_backend/` (packages `sport`, `expenses`, `tasks`, `appointment`, `meal`, `coach`) ; `oltre-frontend/src/app/features/` ; SPEC.md §1 (« Application personnelle de pilotage du quotidien »).

### Problème (pourquoi le projet existe)
- Centraliser dans une seule application les données du quotidien d'Enzo, dont ses activités sportives Garmin. Source : SPEC.md §1 (tag « Commencé à la main, puis IA ») ; `Oltre-backend/README.md`, « Intégration Garmin ».
- Motivation (Enzo) : organiser sa vie professionnelle et personnelle dans un agenda complet (sport, dépenses, tâches, rendez-vous). Source : Enzo.

### Architecture (vue d'ensemble)
- Frontend Angular (SPA, routes chargées à la demande, garde d'authentification, intercepteur qui ajoute le JWT aux seules requêtes vers son propre backend). Source : `oltre-frontend/src/app/app.routes.ts` ; `oltre-frontend/src/app/core/interceptors/auth.interceptor.ts`.
- Frontend vers backend : API REST `/api/...` et `/auth/...`. Source : `Oltre-backend/docker-compose.prod.yaml` ; `Caddyfile`.
- Backend Spring Boot : un package par domaine (sport, dépenses, tâches, rendez-vous, repas, coach, utilisateur, auth). Sécurité Spring stateless avec JWT, 401 sur jeton absent ou expiré. Source : `Oltre-backend/src/main/java/io/oltre_backend/` ; `auth/SecurityConfig.java`.
- Backend vers MySQL 8.4, schéma versionné par Flyway. Source : `Oltre-backend/docker-compose.yaml` ; `pom.xml` ; `src/main/resources/db/migration/V1__schema.sql`.
- Backend vers le service `garmin-mcp` (sidecar REST, jeton interne `X-Internal-Token`). Source : `sport/GarminService.java` ; `Oltre-backend/README.md`, « Intégration Garmin ».
- Backend vers l'API Gemini pour le Coach IA, optionnel : sans clé, réponse 503 explicite. Source : `coach/GeminiService.java` ; `docker-compose.yaml` (`GEMINI_API_KEY`).
- Backend vers OpenFoodFacts pour la recherche d'aliments (adresse de base lue dans la configuration, à confirmer). Source : `openfoodfacts/OpenFoodFactsService.java` ; `src/main/resources/application.properties`, ligne de commentaire sur l'API.
- Lancement local : `docker-compose.yaml` (MySQL, backend, frontend nginx). Production : `docker-compose.prod.yaml` avec Caddy seul exposé, HTTPS Let's Encrypt. Source : `Oltre-backend/docker-compose.yaml`, `docker-compose.prod.yaml`, `DEPLOY.md`.

### Décisions techniques (compromis)
1. **Garmin dans un service séparé (`garmin-mcp`) plutôt que dans le backend.** Compromis : un service de plus à lancer et à protéger par jeton, en échange d'une bibliothèque Garmin non officielle isolée du backend. Les erreurs sont relayées (identifiants, indisponibilité, défi MFA ou anti-bot) au lieu d'un message générique. Source : `sport/GarminService.java` (méthode `connect`, commentaire) ; `Oltre-backend/README.md`, « Intégration Garmin » ; `garmin-mcp/README.md`, « Les comptes avec MFA activée ne sont pas supportés ».
2. **Gemini au lieu de l'API Anthropic pour le Coach IA.** Compromis : Gemini a un tier gratuit, l'API Anthropic n'en a pas ; contrepartie : le coach reste inactif sans clé et le nom de modèle a déjà dû être corrigé. Source : `coach/GeminiService.java` (commentaire de classe) ; commit du 2026-10-12 « Remplace Anthropic par Gemini pour le Coach IA (tier gratuit) » ; commit du 2026-10-12 « Corrige le nom du modèle Gemini ».
3. **Verrouillage de connexion par couple (email, IP), en mémoire.** Compromis : un tiers ne peut pas verrouiller le compte d'autrui depuis sa propre machine, mais l'état est perdu au redémarrage et n'est pas partagé entre plusieurs instances. Source : `auth/LoginAttemptService.java` (commentaire et `ConcurrentHashMap`) ; commit du 2026-10-14 « Verrouillage de connexion par couple (email, IP) ».

### Difficulté principale
- Synthétiser son idée et lui donner forme : passer d'un besoin flou (organiser vie pro et perso) à un produit concret (« mur du 60e km »). Source : Enzo. Construit seul, de zéro (Spring Boot et Angular mis en place par lui). L'intégration Garmin (API non officielle, 502 propre, commits du 2026-10-13) reste un point technique secondaire.

### Stack
- Backend : Java 21, Spring Boot 4.1.0 (Web MVC, Data JPA, Validation, Security, Flyway), JJWT 0.12.6, MySQL Connector/J, springdoc-openapi 2.5.0, Lombok, Testcontainers (MySQL) pour les tests. Source : `Oltre-backend/pom.xml`.
- Frontend : Angular 22.1 (Angular Material, CDK), RxJS, Leaflet (carte OSM pour le détail d'activité), TypeScript 6, Vitest. Source : `oltre-frontend/package.json` ; `oltre-frontend/README.md`, « Running unit tests » ; commit du 2026-10-13 « Carte réelle (OSM) pour le détail d'activité ».
- Infra : Docker Compose, MySQL 8.4, nginx (image frontend), Caddy 2 (production, HTTPS). Source : `docker-compose.yaml`, `docker-compose.prod.yaml`, `oltre-frontend/Dockerfile`, `oltre-frontend/nginx.conf`.
- Configuration du frontend au démarrage du conteneur (`API_URL` injectée dans `env.js` par `envsubst`). Source : `oltre-frontend/docker-entrypoint.sh` ; `oltre-frontend/src/app/core/config/runtime-config.ts`.

### Dates et volume
- Premier commit : 2026-06-22 (« Initial commit ») pour les deux dépôts. Source : `git log` des deux dépôts.
- Dernier commit : 2026-10-14 pour les deux dépôts. Source : `git log` des deux dépôts.
- Nombre de commits : backend 145, frontend 210. Source : `git rev-list --count HEAD`.
- Date de début : aucune affichée, seulement « en cours » (décision d'Enzo). Les dates Git ci-dessus restent internes. Source : Enzo.

### Statut
- En cours. Source : Enzo ; `git log` (commits actifs jusqu'au 2026-10-14).

---

## 2. Zotracker

Dépôt : `ZoTracker/Zotracker`.

### Pitch
- Suivi GPS en direct pour courses à pied : les proches suivent le coureur sur une page publique, avec alertes et alertes de sécurité privées pour les contacts de confiance. Source : `Zotracker/README.md`, premier paragraphe et section « Sécurité : alertes privées en cas de problème ».

### Problème (pourquoi le projet existe)
- Permettre aux proches de suivre une course en direct sans appli à installer. Source : `Zotracker/README.md`, premier paragraphe (« Tout fonctionne dans le navigateur du téléphone, sans appli à installer »).
- Motivation (Enzo) : permettre à ses parents, sa famille et ses amis de suivre sa position pendant le marathon de Lille. Né pour cette course, il compte le réutiliser sur d'autres. Source : Enzo.

### Architecture (vue d'ensemble)
- Position GPS : depuis le navigateur de l'admin (page ouverte, écran allumé) ou depuis une appli externe (OsmAnd, GPSLogger, Traccar Client), envoyée à `/api/ingest` avec une clé traceur. Source : `Zotracker/README.md`, « Envoyer sa position : navigateur ou appli dédiée » ; `docs/PLAN.md`, diagramme de la section 1.
- Le serveur projette chaque position sur le parcours GPX, calcule allure et heures de passage, puis diffuse en temps réel (SSE) vers la page publique et l'admin. Source : `Zotracker/README.md`, « Comment c'est calculé » ; `docs/PLAN.md`, section 1.
- Alertes : règles d'alerte puis notifications Web Push (service worker `sw.js`). Alertes de sécurité privées (SOS, immobilité, hors parcours, batterie) envoyées aux contacts via ntfy. Source : `docs/PLAN.md`, section 1 ; `Zotracker/README.md`, « Alertes » et « Sécurité ».
- Mode simulation qui réinjecte un coureur virtuel dans le même flux, pour tester sans courir. Source : `Zotracker/README.md`, « Tester sans courir » ; `docs/PLAN.md`, diagramme (`SIM --> SIMM --> ING`).
- Stockage : fichiers JSON `state.json` et `secrets.json`, sans base de données. Source : `CLAUDE.md`, ligne 3 ; `SECURITY.md`, tableau des données.
- Production : conteneur Node 22 non root, système de fichiers en lecture seule, derrière Caddy (HTTPS automatique). Source : `Zotracker/Dockerfile` ; `deploy/docker-compose.yml`.
- Découpage du serveur par fonctionnalité (`server/core`, `server/features/{tracking,auth,sos,races,alerts,simulation,admin,share}`). Source : `docs/PLAN.md`, « Structure » (dans `Zotracker/README.md`, section « Développement »).

### Décisions techniques (compromis)
1. **Stockage JSON sans base de données.** Compromis : aucun service à lancer ni à sauvegarder autrement, mais écriture disque à gérer soi-même. Le projet a déjà corrigé les écritures en échec (nouvel essai, refus de démarrer si le JSON est corrompu) et prévoit un stockage asynchrone. Source : `CLAUDE.md`, ligne 3 ; `docs/PLAN.md`, section 2 (fiabilité) et section 3, phase 2 (« Store asynchrone »).
2. **Front en JavaScript natif, sans bundler, espaces de noms `ZTP` et `ZTA`.** Compromis : aucune étape de build, mais du code dupliqué entre serveur et client : les statistiques sont calculées deux fois et divergent déjà sur l'heure d'arrivée estimée avant le départ. Source : `CLAUDE.md`, ligne 3 ; `docs/PLAN.md`, section 1 (« Code dupliqué sans lien entre les copies »).
3. **Distance projetée sur le tracé GPX.** Compromis : la distance suit le tracé officiel sans le zigzag du GPS, mais sans GPX le serveur cumule les points GPS bruts. Les points à plus de 100 m sont ignorés et un écart de plus de 150 m affiche « hors parcours ». Source : `Zotracker/README.md`, « Comment c'est calculé ».

### Difficulté principale
- Fiabilité le jour de la course : réseau coupé (points mis en attente), GPS du navigateur coupé quand l'écran se verrouille (iPhone), notifications SOS à rendre fiables. Source : `Zotracker/README.md`, « Le jour de la course » et « Envoyer sa position » ; `docs/PLAN.md`, section 3, phase 2.

### Stack
- Serveur : Node.js 22+ (CommonJS), Express 4, web-push, qrcode-generator, tests avec `node:test`, ESLint 9. Source : `Zotracker/package.json` ; `Zotracker/README.md`, « Développement ».
- Front : JavaScript natif, Leaflet, polices Fontsource (Barlow Semi Condensed, Manrope). Source : `Zotracker/package.json` ; `CLAUDE.md`, ligne 3.
- Infra : Docker (image Node 22 alpine, utilisateur `node`, lecture seule), Docker Compose, Caddy 2, GitHub Actions (CI, CodeQL, déploiement, Dependabot). Source : `Zotracker/Dockerfile` ; `deploy/docker-compose.yml` ; `Zotracker/README.md`, « Mise en ligne et sécurité » ; `Zotracker/.github/`.

### Dates et volume
- Premier commit : 2026-10-12 (« Application de suivi GPS en direct pour courses à pied »). Source : `git log`.
- Dernier commit : 2026-10-15 (« Outillage : chemins ESLint alignés sur la nouvelle structure »). Source : `git log`.
- Nombre de commits : 34. Source : `git rev-list --count HEAD`.

### Statut
- En cours. Les phases 1 et 2 du plan (sécurité restante, fiabilité du jour J) sont à faire. Source : `docs/PLAN.md`, section 3.

---

## 3. garmin-mcp (fiche courte, hors études de cas, décision plan-v2 §1)

Dépôt : `cobroux/garmin-mcp` (lien avec Oltre).

### Pitch
- Serveur MCP qui expose les données Garmin Connect (activités, sommeil, fréquence cardiaque, Body Battery...) comme outils utilisables par Claude ou un autre client MCP. Source : `https://raw.githubusercontent.com/cobroux/garmin-mcp/HEAD/README.md`, premier paragraphe.

### Problème (pourquoi le projet existe)
- Donner à un assistant IA l'accès aux données sportives de l'utilisateur. Source : README (premier paragraphe).
- Pourquoi un service séparé pour Oltre : le même service expose une API REST multi-utilisateur pour le backend Oltre. Source : README, section « Héberger le serveur pour l'utiliser dans claude.ai » ; `Oltre-backend/README.md`, « Intégration Garmin ».
- Motivation (Enzo) : exporter ses données Garmin vers Claude (serveur MCP) et les exposer en API à Oltre. Source : Enzo.

### Architecture (vue d'ensemble)
- Client MCP (Claude Desktop, Claude Code, ou claude.ai via un connecteur) vers le serveur garmin-mcp, avec OAuth 2.1 mono-utilisateur pour claude.ai. Source : README, sections « Config Claude Desktop / Claude Code avec Docker » et « Héberger le serveur ».
- Serveur vers Garmin Connect via la bibliothèque `python-garminconnect` (API interne, non officielle). La session est mise en cache dans un volume. Source : README, en-tête et « Configuration ».
- Backend Oltre vers les routes REST `/users/...` du même service, avec le jeton `X-Internal-Token`. Source : `Oltre-backend/src/main/java/io/oltre_backend/sport/GarminService.java` ; README, section « Héberger le serveur » (variable `GARMIN_API_TOKEN`).
- Déploiement en production sur Railway. Source : README, « Déploiement sur Railway » ; `Oltre-backend/README.md`, « Intégration Garmin ».

### Décisions techniques (compromis)
1. **Session Garmin mise en cache dans un volume plutôt qu'une reconnexion à chaque lancement.** Compromis : moins de connexions Garmin, donc moins de risque de défi anti-bot ; contrepartie : un jeton de session stocké sur disque. Source : README, « Configuration » et « Lancer avec Docker ».
2. **Un seul service pour le MCP (OAuth) et l'API REST.** Compromis : un seul déploiement, mais l'API REST et le serveur MCP partagent le même port et la même configuration ; avant, ils étaient deux applications séparées. Source : README, section « Héberger le serveur pour l'utiliser dans claude.ai ».
3. **Jetons OAuth en mémoire.** Compromis : pas de base à gérer, mais un redéploiement invalide toutes les connexions actives et il faut reconnecter le connecteur. Source : README, section « Héberger le serveur » (« Les tokens émis vivent en mémoire »).

### Difficulté principale
- Dépendre d'une API interne non officielle de Garmin, sans prise en charge de la MFA dans le flux automatique. Source : README, « Configuration » et section « Héberger le serveur ».

### Stack
- Python (langage du dépôt), bibliothèque `python-garminconnect`, serveur MCP, OAuth 2.1, Docker, Railway. Source : API GitHub (`language: Python`) ; README.

### Dates et volume
- Premier commit : 2026-09-22. Dernier commit : 2026-10-13. Source : API GitHub, `repos/cobroux/garmin-mcp/commits`.
- Date de création du dépôt : 2026-09-22. Source : API GitHub, `repos/cobroux/garmin-mcp`.
- Nombre de commits : 29. Source : API GitHub, en-tête `Link` (`page=29` sur `per_page=1`).

### Statut
- En cours de développement, mais stable. Source : Enzo.

Fiche courte : pas de page d'étude de cas ; les sections Décisions et Difficulté ci-dessus restent en réserve.

---

## 4. GFaim (app et API)

Dépôts : `cobroux/GFaim-app` et `cobroux/GFaim-api`. Non déployé. Source : SPEC.md §13, décision 5.

### Pitch
- API de gestion de repas (« meal management ») qui s'appuie sur l'API externe Spoonacular. Source : `GFaim-api/README.md`, en-tête et section « Initial setup » (image Docker `api-meal-management`, base `meal_management_db`).
- Application Android native (`GFaim-app`). Équipe de 4 ; rôle d'Enzo : front et back. Source : Enzo.

### Problème (pourquoi le projet existe)
- Projet de fin d'études. Le professeur voulait un planificateur de repas pour sa famille ; cahier des charges initial à respecter, puis liberté d'innover au-delà. Source : Enzo. Innovations : seulement « des fonctionnalités proposées par l'équipe au-delà du cahier des charges » (rien de plus précis).

### Architecture (vue d'ensemble)
- Application cliente : Android native. Source : Enzo.
- Client vers l'API GFaim : authentification par jeton JWT signé en RSA. Source : `GFaim-api/README.md`, « Generating auth keys ».
- API GFaim vers PostgreSQL (base lancée par Docker Compose). Source : `GFaim-api/README.md`, « Containerized » et « Database ».
- API GFaim vers Spoonacular (HTTPS avec un truststore dédié). Source : `GFaim-api/README.md`, « Generate Spoonacular certificate ».
- Documentation de l'API : OpenAPI servi par l'application en développement, fichier `swagger.yaml`. Source : `GFaim-api/README.md`, section « Swagger ».

### Décisions techniques (compromis)
1. **JWT signés en RSA (paire de clés générée à la main).** Compromis : une signature à vérifier avec la clé publique et une clé privée à protéger ; contrepartie : la génération et la distribution des clés sont manuelles. Source : `GFaim-api/README.md`, « Generating auth keys ».
2. **Truststore dédié pour l'API Spoonacular.** Compromis : la connexion HTTPS passe par un certificat importé à la main dans un fichier JKS ; contrepartie : étape manuelle à refaire sur chaque machine. Raison exacte (proxy ou choix) : `À FOURNIR`. Source : `GFaim-api/README.md`, « Generate Spoonacular certificate » et « IntelliJ ».

### Difficulté principale
- Faire converger les idées de 4 personnes et tenir les délais de livraison. Ce qu'il en retire : un bon résultat et une bonne expérience d'équipe. Source : Enzo.

### Stack
- API : Java 21 (`GFaim-api/README.md`, « Requirements »), Quarkus (`mvn quarkus:dev`), PostgreSQL, Docker Compose, Swagger/OpenAPI. Source : `GFaim-api/README.md`.
- Langages du dépôt (API GitHub) : `GFaim-api` Java (502 Ko), Dockerfile (5 Ko), Smarty (4 Ko, rôle à confirmer) ; `GFaim-app` Java uniquement. Source : `https://api.github.com/repos/cobroux/GFaim-api/languages` et `.../GFaim-app/languages`.
- Application : Android natif, Java (seul langage du dépôt `GFaim-app`). Source : Enzo ; API GitHub.

### Dates et volume
- `GFaim-api` : premier commit 2025-01-14, dernier commit 2025-03-28, 43 commits. Source : API GitHub, `repos/cobroux/GFaim-api/commits` (en-tête `Link` et liste des commits).
- `GFaim-app` : premier commit 2025-01-08, dernier commit 2025-03-24, 29 commits. Source : API GitHub, `repos/cobroux/GFaim-app/commits`.
- Dépôts créés sur GitHub le 2025-04-25 (après les premiers commits, import probable). Source : API GitHub, `created_at`.

### Statut
- Terminé : projet de fin d'études livré ; non déployé. Source : Enzo ; SPEC.md §13, décision 5.

---

## 5. Worldline (anonymisée)

Règle absolue : aucun nom de client, d'architecture ni de fonctionnalité. Seuls les faits déjà présents dans `facts-v1.md` et `copy-fr-v1.md` (section P2) sont repris, au niveau d'une vue d'ensemble. Le nom de l'employeur reste à valider par Enzo (SPEC §9).

### Pitch
- 2,5 ans d'expérience professionnelle en développement back-end puis full stack, dans une application de trading utilisée par des professionnels de la finance, où une erreur se voit dans un ordre. Source : `copy-fr-v1.md`, `p2.lead` et `p2.lesson` ; `facts-v1.md`, section 2 (« Domaine », « Criticité »).

### Problème (pourquoi le projet existe)
- L'application permet à des professionnels de la finance de passer des ordres, de consulter des portefeuilles et d'administrer des comptes. Source : `facts-v1.md`, section 2 (« Domaine »). Périmètre public : vue d'ensemble uniquement.

### Architecture
- Non publiée. Règle absolue de SPEC §9 : aucune architecture Worldline ne figure dans ce document. Source : SPEC.md §9.

### Décisions techniques
- Aucune décision publiable. Source : SPEC.md §9.

### Difficulté principale
- Complexité de la solution et respect de la Definition of Done, selon le bilan. Source : `facts-v1.md`, section 2 (« Difficultés (bilan) ») ; soutenance M2, « Bilan ».

### Stack (niveau public)
- Java, Spring Boot, SQL, Git. Source : `copy-fr-v1.md`, `p2.stack` et `p2.m1.split` (les autres technologies sont exclues de ce niveau public).

### Dates
- Alternance de septembre 2023 à septembre 2025. Source : `copy-fr-v1.md`, `p2.m2.dates` ; `facts-v1.md`, section 1 (début le 18 septembre 2023) et section 7 (contradictions : à confirmer).
- Stage L3 (4 mois environ, mars à août 2023) : dates à confirmer. Source : `copy-fr-v1.md`, `p2.m1.dates` ; `facts-v1.md`, section 7.

### Volume de commits
- Non applicable : code interne à l'employeur, aucune source publiable.

### Statut
- Terminé : pas de renouvellement de l'alternance. Ne pas publier sans accord d'Enzo. Source : `facts-v1.md`, section 2 (« Fin de l'alternance »).

---

## 6. À FOURNIR (synthèse, mise à jour après les réponses d'Enzo)

- **Oltre** : rien (mur confirmé, aucune date de début affichée, « en cours »).
- **Zotracker** : rien de bloquant (motivation reçue, source Enzo).
- **garmin-mcp** : rien (en cours, stable).
- **GFaim** : raison du truststore Spoonacular ; légende et description du clip.
- **Worldline** : dates exactes de l'alternance et du stage L3 ; validation mot à mot d'Enzo. Le nom de l'employeur est autorisé (plan-v2 §9, décision 6).

## 7. Dépôts par projet

Vérifiés par `gh repo view cobroux/<nom>` le 2026-10-15 : tous publics.

| Projet | Niveau | Dépôts | Langage principal |
|---|---|---|---|
| Oltre | étude de cas | `Oltre-backend`, `oltre-frontend` | Java, TypeScript |
| Zotracker | étude de cas | `Zotracker` | JavaScript |
| GFaim | étude de cas (P1) | `GFaim-api`, `GFaim-app` | Java |
| Worldline | étude de cas | aucun (code interne) | sans objet |
| garmin-mcp | fiche courte | `garmin-mcp` | Python |
| HistoQuiz | fiche courte | `histoquiz` | Java |
| LISP-Interpretor, BomberStudent | fiche courte (P1) | `LISP-Interpretor`, `BomberStudent` | voir V1 |
| Calculateur DPE | fiche courte (P1) | `Projet-JAI-Devops-DPE-calculator` | Java |
| Cin-folie | fiche compacte (P1) | `Cin-folie-website` | PHP (27 Ko), CSS |
| quarkus-color | fiche compacte (P1) | `quarkus-color` | HTML (245 Ko), Java (1 Ko) |
| ObjVLisp2023 | fiche compacte (P1) | `ObjVLisp2023` | Java |
| LambdaCalcul | fiche compacte (P1) | `LambdalCalcul-project` | Haskell |

Fiches compactes, faits des README : Cin-folie (projet PHP de L3, avec Maxime De Sainte Maresville ; recherche de films via TMDB, comptes, avis et notes ; SQLite via PDO), quarkus-color (gabarit Quarkus : ressource REST `/colors` renvoyant un texte, test `@QuarkusTest`, Dockerfiles, workflow `build-and-push` ; pas d'application au-delà), ObjVLisp2023 (projet ObjVLisp de L3 informatique, rendu du 31 janvier 2023 ; objet : modèle objet ObjVLisp en Java, en TDD avec des tests fournis, source Enzo ; commits « Bootstrap de :message et :accept »), LambdaCalcul (nom du projet « LCPF », avec Ugo Couché ; logique propositionnelle en Haskell : `genAllWorlds`, `sat`, `findWorlds`, puis `epiSat` et `update` ; problème 4 non résolu, source : `Episode_2/READ_ME.txt` et commits). Le README raw de `Cin-folie` et `LambdaCalcul` renvoie 404 sous ces noms : les dépôts réels sont `Cin-folie-website` et `LambdalCalcul-project`.

## Réponses d'Enzo (2026-10-15)
- Oltre : organiser sa vie pro et perso dans un agenda complet (sport, dépenses, tâches, rendez-vous). Statut : en cours. Source : Enzo
- Zotracker : permettre à ses parents, sa famille et ses amis de suivre sa position pendant le marathon de Lille ; il prévoit de réutiliser l'appli sur d'autres courses. Source : Enzo
- garmin-mcp : exporter ses données Garmin vers Claude (serveur MCP) et les exposer en API à Oltre. Source : Enzo
- GFaim : projet de fin d'études. Le professeur voulait un planificateur de repas pour sa famille, avec un cahier des charges initial à respecter, puis une liberté d'innover au-delà. Source : Enzo
- Oltre : construit seul, de zéro (Spring Boot et Angular mis en place par lui). Mur : synthétiser son idée et lui donner forme. Pas de date de début : « en cours ». Source : Enzo
- GFaim : application Android native ; équipe de 4, Enzo en front et back ; difficultés : faire converger les idées, tenir les délais ; bilan : bon résultat, bonne expérience d'équipe ; terminé (projet de fin d'études livré). Source : Enzo
- garmin-mcp : en cours de développement, mais stable. Source : Enzo
- ObjVLisp2023 : TDD, tests fournis à faire passer. Source : Enzo
- Restent à fournir : raison du truststore Spoonacular, clip GFaim, Worldline (relecture d'Enzo).
- Fiches P1 confirmées par Enzo (2026-10-15) : quarkus-color (gabarit Quarkus de TP), ObjVLisp2023 (modèle objet en Java, développé en TDD), LambdalCalcul-project (logique propositionnelle et épistémique en Haskell).
