# Textes V3 : colophon et bloc stats (T20)

Statut : VALIDÉ par Enzo le 2026-10-16 (scores de prod et décompte des tests à compléter au déploiement)

Date : 2026-10-16. Rien n'est validé.
Sources : SPEC §1 (tags IA), §4 (stack), §12 (équipe d'agents), plan-v3 D48 et D49, `.github/workflows/ci.yml`, `lighthouserc.json`, `docs/reviews/V2-T34-T35-qa.md` et `T36-T37-qa.md`, `tools/clips/README.md`, DESIGN §1.
Règles appliquées : ton de `copy-fr-v1.md` (« je » sobre, phrases courtes, une touche de fun par section), chiffres au format FR, aucun fait hors dépôt.
Trous : `[À FOURNIR : ...]` (Enzo) ou `[À MESURER : ...]` (scores prod, T8). Les phrases marquées (*conditionnel*) décrivent des éléments prévus par le plan V3 mais pas encore dans le dépôt (`deploy.yml`, hébergement Oracle + Cloudflare) : à relire à la mise en ligne.
Chiffres comptés dans le repo le 2026-10-16 (grep de `@Test`, `it(`/`test(`) : ~39 tests back, ~63 tests front (Vitest), ~19 scénarios E2E. À recompter avant validation.

---

## 1. Colophon : meta et structure

| Clé | FR | EN |
|---|---|---|
| `colophon.meta.title` | Colophon : comment ce site a été construit | Colophon: how this site was built |
| `colophon.meta.description` | Stack, équipe d'agents IA, CI et scores Lighthouse : comment Enzo Leveque a construit son portfolio, sans rien cacher. | Stack, AI agent team, CI and Lighthouse scores: how Enzo Leveque built his portfolio, nothing hidden. |
| `colophon.h1` | Colophon | Colophon |
| `colophon.lead` | Ce site est aussi une preuve. Voici comment il est fait, qui a écrit quoi, et ce que j'ai décidé moi-même. | This site is also a proof. Here is how it is made, who wrote what, and what I decided myself. |
| `footer.colophon` | Colophon | Colophon |

## 2. Stack

| Clé | FR | EN |
|---|---|---|
| `colophon.stack.title` | La stack | The stack |
| `colophon.stack.back` | Back : Java 21, Spring Boot 4.1, Maven, Liquibase pour le schéma, PostgreSQL 17. | Back: Java 21, Spring Boot 4.1, Maven, Liquibase for the schema, PostgreSQL 17. |
| `colophon.stack.front` | Front : Angular 22 (composants standalone, signals), rendu côté serveur avec `@angular/ssr`, TypeScript, CSS natif sans framework. | Front: Angular 22 (standalone components, signals), server-side rendering with `@angular/ssr`, TypeScript, plain CSS with no framework. |
| `colophon.stack.infra` | Infra : Docker Compose, Caddy en frontal, GitHub Actions. | Infra: Docker Compose, Caddy in front, GitHub Actions. |
| `colophon.stack.nojs` | Le site se lit sans JavaScript. Le serveur envoie déjà le HTML complet. | The site reads fine without JavaScript. The server already sends the full HTML. |
| `colophon.stack.same` | Même famille de technos que mes projets perso (Oltre, Zotracker) et que mon travail chez Worldline : je ne change pas d'outils pour faire joli. | Same tech family as my side projects (Oltre, Zotracker) and my work at Worldline: I did not swap tools just to look good. |

## 3. Méthode : une équipe d'agents IA

| Clé | FR | EN |
|---|---|---|
| `colophon.method.title` | Une équipe d'agents, un chef d'équipe | A team of agents, one team lead |
| `colophon.method.lead` | Le code de ce site a été écrit en grande partie par des agents IA. Je les pilote, je tranche, je relis. Comme une petite équipe, avec un budget à surveiller. | Most of this site's code was written by AI agents. I steer them, decide, and review. Like a small team, with a budget to watch. |
| `colophon.method.roles` | Neuf rôles : tech lead, designer, dev back, dev front, revue de code, QA, DevOps, recherche de contenu, rédaction. Chacun a sa fiche dans `.claude/agents/`. | Nine roles: tech lead, designer, back dev, front dev, code review, QA, DevOps, content research, copywriting. Each has its own sheet in `.claude/agents/`. |
| `colophon.method.models` | Chaque rôle prend le modèle le moins coûteux qui tient la tâche : Opus pour le tech lead (specs, arbitrages), Sonnet pour la plupart des autres, Haiku pour le DevOps et la recherche de contenu. | Each role gets the cheapest model that can handle the job: Opus for the tech lead (specs, trade-offs), Sonnet for most of the others, Haiku for DevOps and content research. |
| `colophon.method.skills` | Des skills guident les agents. Pour le design, Taste (contre le look « fait par une IA ») et Emil (les détails de finition et de mouvement). | Skills guide the agents. For design, Taste (against the "made by an AI" look) and Emil (polish and motion details). |
| `colophon.method.cycle` | Le cycle d'une feature : spec, design si besoin, back et front en parallèle, revue de code, QA, déploiement. | The cycle of a feature: spec, design if needed, back and front in parallel, code review, QA, deployment. |
| `colophon.method.checkpoints` | À chaque point de contrôle, une revue de code et une passe QA (E2E, accessibilité, performance). Leurs rapports sont dans `docs/reviews/`, défauts compris. | At every checkpoint, a code review and a QA pass (E2E, accessibility, performance). Their reports are in `docs/reviews/`, flaws included. |
| `colophon.method.ponytail` | Règle commune : la plus petite modification qui résout vraiment le problème. Pas d'abstraction « au cas où ». | Common rule: the smallest change that truly solves the problem. No "just in case" abstractions. |
| `colophon.method.fun` | Oui, il y a un agent rédacteur. Non, il n'a pas écrit cette phrase sans que je la relise. | Yes, there is a copywriter agent. No, it did not write this sentence without my review. |

## 4. IA assumée

| Clé | FR | EN |
|---|---|---|
| `colophon.ai.title` | Qui a écrit quoi | Who wrote what |
| `colophon.ai.body` | Chaque projet porte un tag. « Écrit à la main » : les projets universitaires. « Commencé à la main, puis IA » : Oltre. « IA comme outil, conçu et revu par moi » : Zotracker et ce site. | Each project carries a tag. "Written by hand": the university projects. "Started by hand, then AI": Oltre. "Designed with AI": Zotracker and this site. |
| `colophon.ai.me` | Ce que j'ai décidé moi-même : le concept (le site suit mon Grand Trail d'Auvergne), tous les contenus et leur validation, les arbitrages d'architecture et de budget. Aucun texte ne part en ligne sans mon accord. | What I decided myself: the concept (the site follows my Grand Trail d'Auvergne), all the content and its sign-off, the architecture and budget trade-offs. No text goes live without my approval. |
| `colophon.ai.agents` | Ce que les agents ont fait : écrire le code, les tests et les premiers jets de textes, sur mes specs. Je relis, je corrige, je refuse parfois. | What the agents did: write the code, the tests and first drafts of texts, from my specs. I review, correct, and sometimes reject. |

## 5. Clips automatiques

| Clé | FR | EN |
|---|---|---|
| `colophon.clips.title` | Les clips des projets | The project clips |
| `colophon.clips.body` | Les courtes vidéos de démonstration sont générées par script : Docker lance le projet, Playwright le pilote avec un faux curseur, ffmpeg encode le MP4. | The short demo videos are generated by script: Docker starts the project, Playwright drives it with a fake cursor, ffmpeg encodes the MP4. |
| `colophon.clips.data` | Données factices uniquement. Aucune donnée Garmin ni aucun compte réels ne passent devant la caméra. | Fake data only. No real Garmin data or account ever goes in front of the camera. |
| `colophon.clips.size` | Chaque clip pèse moins de 2,5 Mo, sans métadonnées, et ne se charge que lorsqu'il entre à l'écran. | Each clip weighs under 2.5 MB, has no metadata, and only loads when it scrolls into view. |

## 6. CI et déploiement

| Clé | FR | EN |
|---|---|---|
| `colophon.ci.title` | Ce que la CI vérifie | What the CI checks |
| `colophon.ci.jobs` | À chaque push, GitHub Actions lance quatre jobs : le back (build et tests, `./mvnw verify`), le front (lint, tests, build), les tests E2E Playwright sur la pile complète, et Lighthouse. | On every push, GitHub Actions runs four jobs: back (build and tests, `./mvnw verify`), front (lint, tests, build), Playwright E2E tests on the full stack, and Lighthouse. |
| `colophon.ci.axe` | Les E2E incluent axe-core : zéro violation d'accessibilité, en clair et en sombre, en FR et en EN. | The E2E tests include axe-core: zero accessibility violations, light and dark, in FR and EN. |
| `colophon.ci.gate` | Les seuils Lighthouse mobile font échouer le build : 90 en performance, 95 en accessibilité, bonnes pratiques et SEO. Une PR rouge ne se fusionne pas. | The mobile Lighthouse thresholds fail the build: 90 for performance, 95 for accessibility, best practices and SEO. A red PR does not merge. |
| `colophon.ci.tests` | Environ 120 tests au total (back, front, E2E). [À recompter avant publication] | About 120 tests in total (back, front, E2E). [Recount before publishing] |
| `colophon.deploy.body` | (*conditionnel*) Une CI verte sur `main` déclenche le déploiement : images Docker poussées sur GHCR, mises en ligne sur une VM Oracle Cloud (gratuite), derrière Cloudflare, avec retour automatique à la version précédente si le démarrage échoue. | (*conditional*) A green CI on `main` triggers the deployment: Docker images pushed to GHCR, rolled out on an Oracle Cloud VM (free tier), behind Cloudflare, with automatic rollback to the previous version if startup fails. |
| `colophon.deploy.backup` | (*conditionnel*) La base est sauvegardée chaque nuit, chiffrée, sur Cloudflare R2. | (*conditional*) The database is backed up every night, encrypted, to Cloudflare R2. |

## 7. Scores Lighthouse

| Clé | FR | EN |
|---|---|---|
| `colophon.lh.title` | Scores Lighthouse | Lighthouse scores |
| `colophon.lh.lead` | Mesurés sur le site en ligne, mobile, médiane de trois mesures. Pas de score arrondi à la hausse. | Measured on the live site, mobile, median of three runs. No rounding up. |
| `colophon.lh.date` | Mesure du [À MESURER : date, T8] | Measured on [À MESURER: date, T8] |
| `colophon.lh.perf` | Performance : [À MESURER : prod] | Performance: [À MESURER: prod] |
| `colophon.lh.a11y` | Accessibilité : [À MESURER : prod] | Accessibility: [À MESURER: prod] |
| `colophon.lh.bp` | Bonnes pratiques : [À MESURER : prod] | Best practices: [À MESURER: prod] |
| `colophon.lh.seo` | SEO : [À MESURER : prod] | SEO: [À MESURER: prod] |
| `colophon.lh.honest` | Pour mémoire, la dernière mesure locale (`docs/reviews/V2-T34-T35-qa.md`) donnait 90, 100, 100, 100 sur `/fr/` : la performance était juste au seuil. Je préfère l'écrire que de le cacher. | For the record, the last local run (`docs/reviews/V2-T34-T35-qa.md`) gave 90, 100, 100, 100 on `/fr/`: performance was right at the threshold. I would rather say so than hide it. |

## 8. Liens

| Clé | FR | EN |
|---|---|---|
| `colophon.links.title` | Tout est dans le dépôt | It is all in the repo |
| `colophon.links.repo` | Le code source | The source code |
| `colophon.links.tasks` | Les plans et listes de tâches (`tasks/`) | The plans and task lists (`tasks/`) |
| `colophon.links.adr` | Les décisions d'architecture (`docs/adr/`) | The architecture decisions (`docs/adr/`) |
| `colophon.links.repo.url` | https://github.com/cobroux/Zofolio | https://github.com/cobroux/Zofolio |
| `colophon.links.tasks.url` | https://github.com/cobroux/Zofolio/tree/main/tasks | https://github.com/cobroux/Zofolio/tree/main/tasks |
| `colophon.links.adr.url` | https://github.com/cobroux/Zofolio/tree/main/docs/adr | https://github.com/cobroux/Zofolio/tree/main/docs/adr |

## 9. Bloc stats (Journal)

Totaux annuels saisis dans l'admin (D48), pas dans ce fichier.

| Clé | FR | EN |
|---|---|---|
| `stats.title` | Les années en chiffres | The years in numbers |
| `stats.lead` | Totaux par année, saisis à la main. [À FOURNIR : phrase d'accroche, selon les chiffres d'Enzo] | Yearly totals, entered by hand. [À FOURNIR: tagline, depending on Enzo's numbers] |
| `stats.year` | Année | Year |
| `stats.km` | Kilomètres | Kilometres |
| `stats.elevation` | Dénivelé positif | Elevation gain |
| `stats.hours` | Heures | Hours |
| `stats.activities` | Activités | Activities |
| `stats.unit.km` | km | km |
| `stats.unit.elevation` | m D+ | m D+ |
| `stats.unit.hours` | h | h |
| `stats.empty` | Les totaux arrivent. | Totals are coming. |
| `stats.note` | Totaux annuels seulement : ni tracé, ni fréquence cardiaque, ni donnée de santé. | Yearly totals only: no route, no heart rate, no health data. |
| `stats.values` | [À FOURNIR : km, D+, heures, activités par année, et Q10] | [À FOURNIR: km, elevation, hours, activities per year, and Q10] |
