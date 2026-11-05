# Études de cas v4 : fiche de faits et textes proposés

> Appliqué le 2026-11-03 sans les réponses d'Enzo : seuls les textes sourcés sont en base ; questions À FOURNIR ouvertes.

Date : 2026-11-03. Brouillon interne, rien n'est publié ni validé (Task 3, Step 1). Toute ligne non validée par Enzo est retirée.

Sources : `FACTS` = `docs/content/facts-v2-case-studies.md` ; `WL` = `.superpowers/sdd/2026-11-02-redesign-v4-vague-1/worldline-facts.md` ; `PROD` = `curl https://zoworks.fr/api/{fr,en}/projects/<slug>` (champ `caseStudy`, relevé le 2026-11-03) ; `PLAN` = `ZoTracker/Zotracker/docs/PLAN.md` ; `W1` = vague 1 publiée (`frontend/src/app/features/home-course/sections/p2.section.ts`, `content/decision.ts`, `frontend/src/locale/messages.xlf`).
Aucun secret, e-mail, token, coordonnée GPS ni donnée Garmin réelle. `.env`, `data/`, `certs/` non ouverts.

## Tableau de synthèse

| Étude | Contexte (problem + wall) | Décision | Ce que j'ai porté | Résultat | Ce que je referais | stage |
|---|---|---|---|---|---|---|
| trading-app | inchangé | inchangé | proposé (relecture mot à mot) | proposé partiel + 1 À FOURNIR | À FOURNIR | proposer `P2` |
| oltre | inchangé | inchangé | proposé | proposé + 1 À FOURNIR | À FOURNIR | inchangé (P3) |
| zotracker | inchangé (1 vérif. demandée) | inchangé | proposé + 1 À FOURNIR | proposé + 1 À FOURNIR | proposé (à valider) | inchangé (P3) |
| gfaim | inchangé | inchangé | proposé + 1 À FOURNIR | proposé + 1 À FOURNIR | À FOURNIR | inchangé (P1) |

Note générale : en prod, `takeaway` est partout une leçon, pas un résultat. Le texte proposé pour Résultat remplace la leçon. Les leçons actuelles ne sont reprises ailleurs que si Enzo les valide pour « Ce que je referais ».

## Points d'attention transversaux

1. Zotracker : la décision en prod dit que les statistiques sont calculées deux fois et divergent. Le dépôt récent ne le confirme plus : `computeStats` n'existe plus, `stats.js` est servi au navigateur (commit du 2026-10-17 « feat(effort-eta): servir effort.js au navigateur ») et `store.js` est asynchrone (`fs.promises`). `PLAN` §1 est donc en retard sur le code. La décision n'est pas modifiée ici (hors périmètre), mais elle est probablement périmée.
2. Oltre : la note en prod dit « Projet commencé en octobre 2025 », alors que `git log` donne un premier commit le 2026-06-22 (FACTS §1, deux dépôts). À trancher par Enzo.
3. trading-app : la durée en prod dit « mars 2023 à septembre 2025 » ; WL §1 donne le début de l'alternance au 18 septembre 2023 et le stage L3 séparément. Hors périmètre, à ne pas toucher sans Enzo.
4. W1 publie déjà, sur l'accueil, quatre puces Worldline (TOM, move2cloud, post-marché Copartis, contrôles Boursorama) plus le portail d'administration. Les textes ci-dessous ne vont pas au-delà de ces puces.

---

## 1. trading-app (Worldline)

### Valeurs actuelles en prod (verbatim)

- `stage` : `null` (fr et en).
- `problem` fr : `Une application de trading n'a pas droit à l'approximation. Quand on achète ou qu'on vend des titres, une erreur ne reste pas dans un fichier de log : elle se voit dans un ordre. Mon travail : livrer des évolutions complètes, de l'analyse du besoin à la mise en production, en équipe Scrum.`
- `problem` en : `A trading application can't afford approximation. When you buy or sell securities, a mistake doesn't stay in a log file: it shows up in an order. My job: deliver complete changes, from analysing the need to production, in a Scrum team.`
- `wall` fr : `La complexité de la solution, et le respect de la Definition of Done : une évolution n'est terminée que lorsque tout est vérifié, testé et relu.`
- `wall` en : `The complexity of the solution, and meeting the Definition of Done: a change is only finished once everything is verified, tested and reviewed.`
- `takeaway` fr : `Travailler sur un système critique m'a appris la rigueur : analyser avant de coder, tester avant de livrer, et garder la tête froide quand tout va vite.`
- `takeaway` en : `Working on a critical system taught me rigour: analyse before coding, test before shipping, and keep a cool head when everything moves fast.`
- `role` fr : `Développeur back-end, puis fullstack` ; en : `Back-end developer, then full-stack`.
- `contribution`, `hindsight` : `null`.

### stage

- Proposé : `P2`. Source : W1, `p2.section.ts` (section `#p2`, lien « Lire l'étude de cas » vers `/projets/trading-app`) ; l'accueil place déjà l'étude en P2.

### Contexte et contraintes

- Inchangé (`problem` et `wall` ci-dessus). Sources : FACTS §5 (« Difficulté principale », Définition of Done), PROD.

### Décision et alternative écartée

- Inchangé (deux décisions en prod : tests en conditions réelles, maquette validée avant de coder). Le choix Gateway ActiveMQ vs RabbitMQ reste dans l'encadré de l'accueil (W1 `decision.ts`), non repris ici.

### Ce que j'ai porté (`contribution`) — relecture mot à mot requise

- FR : `J'ai travaillé en back end, puis en full stack. Sur le prototype move2cloud, j'ai rendu l'émetteur d'ordres abstrait et ajouté une version qui envoie les ordres vers une file RabbitMQ, sérialisés en XML. Pour Copartis, j'ai refondu les batchs de fin de journée, paramétrés par place de marché. Pour Boursorama, j'ai rendu trois contrôles pré-trade désactivables par client, avec des tests JUnit.`
- EN : `I worked on the back end, then full stack. On the move2cloud prototype, I made the order sender abstract and added a version that sends orders to a RabbitMQ queue, serialised as XML. For Copartis, I reworked the end-of-day batch jobs, configured per market. For Boursorama, I made three pre-trade checks switchable per client, with JUnit tests.`
- Sources phrase par phrase :
  1. rôle : PROD `role` ; FACTS §5.
  2. move2cloud : W1 `p2.section.ts` puce 2 ; WL §2 « M1 S1 » (MarketOrderSender abstract, MarketOrderSenderMQ, XML).
  3. Copartis : W1 `p2.section.ts` puce 3 ; WL §2 « M2 S1 » (cut-off par place de marché).
  4. Boursorama : W1 `p2.section.ts` puce 4 ; WL §2 « M1 S2, sprint Salamèche ».
- Réserve : « J'ai porté » suppose que ces trois travaux sont les siens seuls ; WL ne dit pas « seul » (voir À FOURNIR T3). Les noms de clients et « move2cloud » sont déjà publiés en W1.

### Résultat (`takeaway`) — relecture mot à mot requise

- FR : `Le prototype move2cloud a routé un ordre jusqu'au marché de test. Il n'a pas été déployé.`
- EN : `The move2cloud prototype routed an order all the way to the test market. It was not deployed.`
- Sources : W1 `decision.ts` (`decision.gateway.result` : « ordre routé jusqu'au marché de test » ; commentaire « non déployé ») ; WL §2 « M1 S1 » (« Pas de déploiement »). La raison (réorganisation, projet confié à un collègue) n'est pas reprise : non publiée en W1.
- Le résultat côté production (Copartis, Boursorama) n'est pas documenté : voir À FOURNIR T2.

### Ce que je referais (`hindsight`)

- `À FOURNIR` (T1). Piste sourcée, non proposée comme texte : PROD décision « Tester en conditions réelles » (une date codée en dur a masqué un bug jusqu'en production). Ce serait la reformulation d'une décision existante, pas un nouveau fait.

### À FOURNIR (trading-app)

- T1. Ce que tu referais autrement sur Worldline, en une ou deux phrases (hors contenu confidentiel du M2) ?
- T2. Parmi les évolutions Copartis et Boursorama, lesquelles sont en production chez le client, et peux-tu le dire publiquement ? Sinon Résultat reste limité au prototype.
- T3. Pour move2cloud, le post-marché Copartis et les contrôles Boursorama : les as-tu faits seul, ou en équipe ? (Pour « J'ai porté ».)

---

## 2. oltre

### Valeurs actuelles en prod (verbatim)

- `stage` : `P3`. `note` fr : `Projet commencé en octobre 2025. Commits : backend et frontend.` ; en : `Project started in October 2025. Commits: back end and front end.` (voir point d'attention 2.)
- `role` fr : `Conception et développement, seul et de zéro : backend, frontend, et la mise en place de Spring Boot et d'Angular` ; en : `Design and development, alone and from scratch: back end, front end, and setting up Spring Boot and Angular`.
- `problem` fr : `Mon quotidien était éparpillé : les sorties dans Garmin, les dépenses d'un côté, les tâches et les rendez-vous de l'autre. Je voulais tout voir au même endroit, avec mes activités sportives dedans.`
- `problem` en : `My daily life was scattered: runs in Garmin, expenses in one place, tasks and appointments in another. I wanted to see everything in one place, with my sports activities in it.`
- `wall` fr : `Le plus dur n'était pas le code : c'était de synthétiser mon idée et de lui donner forme. Passer d'un besoin flou, organiser ma vie pro et perso, à un produit concret.`
- `wall` en : `The hardest part wasn't the code: it was pinning down my idea and giving it shape. Going from a fuzzy need, organizing my work and personal life, to a concrete product.`
- `takeaway` fr : `Dépendre d'une API non officielle, c'est prévoir dès le départ où elle casse, et le dire clairement à l'utilisateur.`
- `takeaway` en : `Depending on an unofficial API means planning from day one where it will break, and telling the user plainly.`
- `aiNote` fr : `Commencé à la main, puis poursuivi avec l'aide de l'IA.` ; en : `Started by hand, then continued with AI help.`
- `contribution`, `hindsight` : `null`.

### Contexte et contraintes

- Inchangé. Sources : FACTS §1 « Problème » et « Difficulté principale » (Enzo).

### Décision et alternative écartée

- Inchangé (Garmin séparé, Gemini plutôt qu'Anthropic, verrouillage par e-mail et IP). Sources : FACTS §1 « Décisions techniques ».

### Ce que j'ai porté (`contribution`)

- FR : `J'ai tout construit seul, de zéro : le backend Spring Boot, le frontend Angular, leur mise en place et le déploiement en conteneurs.`
- EN : `I built all of it alone, from scratch: the Spring Boot back end, the Angular front end, their setup and the container deployment.`
- Sources : « seul, de zéro » et « mise en place de Spring Boot et d'Angular » : PROD `role` ; FACTS §1 « Difficulté principale » (Enzo). Déploiement en conteneurs : FACTS §1 « Architecture » (`docker-compose.prod.yaml`, `Caddyfile`, `DEPLOY.md`) ; `git log` Oltre-backend : 655c298 « infra: bloc de site pour le proxy frontal partagé /opt/edge ».
- Le rôle de l'IA reste dit par `aiNote` ; ne pas le contredire (« construit seul » = pas d'équipe, pas « sans IA »).

### Résultat (`takeaway`)

- FR : `L'application couvre le sport, avec mes activités Garmin, les dépenses, les tâches, les rendez-vous et les repas, plus un coach IA optionnel. Une configuration de production en HTTPS est en place, avec un seul point d'entrée exposé.`
- EN : `The app covers sport, with my Garmin activities, expenses, tasks, appointments and meals, plus an optional AI coach. A production setup over HTTPS is in place, with a single exposed entry point.`
- Sources : modules `sport`, `expenses`, `tasks`, `appointment`, `meal`, `coach` : FACTS §1 « Pitch » et « Architecture » ; « optionnel » : `coach/GeminiService.java` (503 sans clé), FACTS §1 ; production HTTPS, Caddy seul exposé : FACTS §1 « Architecture » (`docker-compose.prod.yaml`, `DEPLOY.md`).
- Reste sans fait : usage réel (voir À FOURNIR O1).

### Ce que je referais (`hindsight`)

- `À FOURNIR` (O2). Piste sourcée, non proposée : le compteur de verrouillage est en mémoire (perdu au redémarrage, non partagé), voir PROD décision 3.

### À FOURNIR (oltre)

- O1. L'application est-elle en ligne et utilisée par toi au quotidien ? Une phrase factuelle d'usage (depuis quand, pour quoi) suffit.
- O2. Ce que tu referais autrement sur Oltre, en une ou deux phrases ?
- O3. Date de début : octobre 2025 (note en prod) ou juin 2026 (premier commit, `git log`) ?

---

## 3. zotracker

### Valeurs actuelles en prod (verbatim)

- `stage` : `P3`. `duration` : `Depuis octobre 2026` ; `aiNote` : `Conçu avec IA.` ; `role` fr : `Conception et développement` ; en : `Design and development`.
- `problem` fr : `Zotracker est né pour le marathon de Lille : mes parents, ma famille et mes amis voulaient me suivre en direct. Il fonctionne dans le navigateur, sans appli à installer, et je compte le réutiliser sur d'autres courses.`
- `problem` en : `Zotracker was born for the Lille marathon: my parents, family and friends wanted to follow me live. It runs in the browser, with no app to install, and I plan to reuse it on other races.`
- `wall` fr : `Le jour de la course, tout peut lâcher : le réseau se coupe, le GPS du navigateur s'éteint quand l'écran se verrouille (sur iPhone), les alertes de sécurité doivent partir quand même. Les points sont mis en attente quand le réseau tombe ; le reste de cette fiabilité est encore à construire.`
- `wall` en : `On race day, anything can give out: the network drops, the browser GPS shuts off when the screen locks (on iPhone), and safety alerts must still go out. Points are queued when the network drops; the rest of that reliability is still to be built.`
- `takeaway` fr : `Une appli utilisée le jour J ne se juge pas à sa démo : elle se juge au pire moment de la course. D'où le mode simulation, pour tester sans courir.`
- `takeaway` en : `An app used on race day isn't judged by its demo: it's judged at the worst moment of the race. Hence the simulation mode, to test without running.`
- `contribution`, `hindsight` : `null`.

### Contexte et contraintes

- Inchangé. Sources : FACTS §2 « Problème » (Enzo), « Difficulté principale ». Vérification demandée (Z4) : « le reste de cette fiabilité est encore à construire » date de la phase 2 de `PLAN` §3 (14/10) ; le dépôt a avancé depuis.

### Décision et alternative écartée

- Inchangé (voir point d'attention 1 : la décision « statistiques calculées deux fois » est probablement périmée).

### Ce que j'ai porté (`contribution`)

- FR : `J'ai conçu et développé tout le système : le serveur Node qui reçoit les positions, les projette sur le tracé GPX et les diffuse en direct, la page publique, l'espace admin, les alertes et le mode simulation, puis le déploiement en conteneur derrière Caddy.`
- EN : `I designed and built the whole system: the Node server that receives positions, projects them onto the GPX route and broadcasts them live, the public page, the admin area, the alerts and the simulation mode, then the container deployment behind Caddy.`
- Sources : conception et développement : PROD `role` ; architecture : FACTS §2 « Architecture » (`Zotracker/README.md` « Comment c'est calculé », `docs/PLAN.md` §1) ; déploiement : FACTS §2 « Stack » (`Dockerfile`, `deploy/docker-compose.yml`).
- « Seul » volontairement absent : aucune source (voir Z2). Le rôle de l'IA reste dit par `aiNote`.

### Résultat (`takeaway`)

- FR : `Les proches suivent ma position en direct sur une page publique, sans rien installer. Le serveur calcule l'allure et les heures de passage, et envoie des alertes. Le mode simulation permet de tout tester sans courir. Un fichier GPX piégé de 920 Ko, qui prenait 5,8 s à lire, se traite maintenant en 5 ms.`
- EN : `Loved ones follow my position live on a public page, with nothing to install. The server computes pace and passing times, and sends alerts. The simulation mode lets me test everything without running. A booby-trapped 920 KB GPX file that took 5.8 s to parse now takes 5 ms.`
- Sources : suivi sans appli : `Zotracker/README.md` 1er paragraphe (FACTS §2) ; allure, heures de passage, alertes, simulation : FACTS §2 « Architecture » ; GPX 920 Ko, 5,8 s vers 5 ms : `PLAN` §2 (ligne « Sécurité : ReDoS GPX »).
- Résultat le jour de la course : voir Z1.

### Ce que je referais (`hindsight`) — à valider comme jugement d'Enzo

- FR : `Je partagerais le calcul des statistiques entre le serveur et le navigateur dès le départ. Je l'ai fait après coup, une fois les deux copies divergentes.`
- EN : `I would share the statistics code between the server and the browser from the start. I only did it afterwards, once the two copies had diverged.`
- Sources : copies divergentes : `PLAN` §1 (« Code dupliqué sans lien entre les copies », statistiques calculées deux fois) et PROD décision 2 ; correction après coup : `git log` Zotracker, 2026-10-17 « feat(effort-eta): stats au km-effort (eta et etaAt) » et « feat(effort-eta): servir effort.js au navigateur » ; `computeStats` absent du code actuel, `etaAt` de `stats.js` seule source (`PLAN`, section « Estimations au km-effort »).
- Variante, si Enzo le confirme : `J'écrirais le stockage de façon asynchrone dès le début.` Sources : `PLAN` §3 phase 2 (« Store asynchrone ») ; `server/core/store.js` (en-tête : « écriture atomique, différée, asynchrone »).

### À FOURNIR (zotracker)

- Z1. Le marathon de Lille a-t-il eu lieu avec Zotracker ? Si oui, quel résultat factuel (proches connectés, incidents, ce qui a tenu) ?
- Z2. As-tu conçu et développé Zotracker seul (avec l'IA) ? Aucune source ne dit « seul ».
- Z3. Les deux pistes de « Ce que je referais » (statistiques partagées, stockage asynchrone) sont-elles bien ton avis, ou autre chose ?
- Z4. Le `wall` (« le reste de cette fiabilité est encore à construire ») est-il toujours vrai ? Les phases 1 et 2 de `PLAN` sont-elles faites (essais SOS, arrêt propre) ?

---

## 4. gfaim

### Valeurs actuelles en prod (verbatim)

- `stage` : `P1`. `duration` fr : `Janvier à mars 2025` ; en : `January to March 2025`.
- `role` fr : `Équipe de quatre. Je me suis occupé du front et du back.` ; en : `Team of four. I handled both front end and back end.`
- `problem` fr : `Un professeur voulait un planificateur de repas pour sa famille. Le cahier des charges de départ était imposé : il fallait le respecter. Ensuite, la liberté d'innover au-delà.`
- `problem` en : `A professor wanted a meal planner for his family. The starting specification was fixed: we had to follow it. After that, the freedom to innovate beyond it.`
- `wall` fr : `Faire converger les idées de quatre personnes, et tenir les délais de livraison.`
- `wall` en : `Getting four people's ideas to converge, and meeting the delivery deadlines.`
- `takeaway` fr : `Un bon résultat, et une bonne expérience d'équipe.`
- `takeaway` en : `A good result, and a good team experience.`
- `contribution`, `hindsight` : `null`.

### Contexte et contraintes

- Inchangé. Sources : FACTS §4 « Problème » et « Difficulté principale » (Enzo).

### Décision et alternative écartée

- Inchangé (RSA, truststore Spoonacular). FACTS §4 note que la raison exacte du truststore reste `À FOURNIR` ; hors périmètre de cette tâche.

### Ce que j'ai porté (`contribution`)

- FR : `Nous étions quatre. Je me suis occupé du front, l'application Android native, et du back, l'API Quarkus avec PostgreSQL.`
- EN : `We were a team of four. I worked on the front end, the native Android app, and on the back end, the Quarkus API with PostgreSQL.`
- Sources : équipe de 4, front et back : FACTS §4 « Pitch » (Enzo) ; PROD `role` ; application Android native : FACTS §4 « Architecture » (Enzo) ; API Quarkus et PostgreSQL : `GFaim-api/README.md` (FACTS §4 « Stack », « Architecture »). Le dépôt `GFaim-app` est en Java seul (FACTS §4, API GitHub), cohérent avec Android natif.
- Réserve : « front = application Android » est une lecture de FACTS (voir G2). Le détail de ce qu'il a fait dans chaque partie manque.

### Résultat (`takeaway`)

- FR : `Le projet de fin d'études a été livré : une API avec authentification par jeton, PostgreSQL et l'API Spoonacular, documentée en OpenAPI, et l'application Android native. Il n'est pas déployé.`
- EN : `The final-year project was delivered: an API with token authentication, PostgreSQL and the Spoonacular API, documented with OpenAPI, and the native Android app. It is not deployed.`
- Sources : livré, non déployé : FACTS §4 « Statut » (Enzo ; SPEC.md §13 décision 5) ; API : `GFaim-api/README.md` (JWT RSA, PostgreSQL, Spoonacular, Swagger/OpenAPI), FACTS §4 « Architecture » ; app Android : FACTS §4 (Enzo).
- Pas de note ni d'appréciation (voir G3).

### Ce que je referais (`hindsight`)

- `À FOURNIR` (G1).

### À FOURNIR (gfaim)

- G1. Ce que tu referais autrement sur GFaim, en une ou deux phrases ?
- G2. Précise ce que tu as fait : quels écrans ou fonctionnalités côté Android, quels endpoints côté API ? Et « front » veut bien dire l'application Android ?
- G3. Y a-t-il un résultat vérifiable à citer (soutenance, note, retour du professeur, fonctionnalités ajoutées au-delà du cahier des charges) ?

---

## Récapitulatif À FOURNIR : 13 questions

trading-app T1 à T3 ; oltre O1 à O3 ; zotracker Z1 à Z4 ; gfaim G1 à G3.
