# Cahier des charges : Zofolio

> Statut : **validé par Enzo le 2026-10-15**. Intention validée le 2026-10-15.
> Direction artistique et mouvement : voir [`DESIGN.md`](./DESIGN.md). Équipe d'agents : [`.claude/agents/`](../.claude/agents/).

## 1. Objectif

Zofolio est le portfolio d'Enzo Leveque, ingénieur fullstack Java/Spring Boot + Angular. Il est construit autour du concept **« La Course »** : le parcours d'Enzo suit les vrais pointages de sa course de référence, le Grand Trail d'Auvergne 2025 (dossard 1592, 79,4 km, ~3 160 m D+, 13h35'53). Le fil rouge est **le dépassement de soi et la progression**, au sport comme au travail.

- **Cible :** tech leads et recruteurs tech, pour toutes ses recherches d'emploi (France et international).
- **Parcours visé :** le visiteur comprend le profil en 10 s, se laisse captiver par le récit, puis **contacte Enzo**, **télécharge son CV** ou **ouvre ses repos**.
- **Le site lui-même est une preuve :** le repo Zofolio doit refléter le niveau de qualité d'Enzo (architecture par feature, tests, CI/CD, accessibilité, performance).

### Structure narrative (accueil)
| Pointage GTA | km | Section | Contenu |
|---|---|---|---|
| Départ, 6h30 | 0 | **Dossard 1592** | Nom, titre, stack, boutons CV + Contact (sans scroll) |
| P1 | 20 | **Fondations** | Master ILI (Univ. Artois), projets universitaires |
| P2 | 44 | **Worldline** | Étude de cas anonymisée, la plus longue étape |
| P3 | 58,2 | **Projets nés de la course** | Oltre, Zotracker, garmin-mcp, histoquiz |
| Arrivée, 20h05 | 79,4 | **Ligne d'arrivée** | Contact, CV, « Prochain objectif : 100 km… et un nouveau poste » |

En plus : des **ravitaillements** (soft skills discrets : brancardier aux urgences, tuteur L1), un **journal sport** (UTMB index 459, marathons de Paris et du Louvre-Lens, 2 × Côte d'Opale 62 km avec une progression de 7h37 à 7h32, GTA 80 km, triathlon M de Fourmies, Ch'ti Trail S, club des Baudets d'Hinges) et un **carnet d'entraînement** (le graphe de contributions GitHub).

### Hiérarchie des projets
- **Études de cas :** Worldline (anonymisée), Oltre, Zotracker, GFaim (app + API).
- **Fiches courtes :** garmin-mcp, histoquiz, BomberStudent, Cin-folie, calculateur DPE, quarkus-color, LISP-Interpretor, ObjVLisp2023, LambdaCalcul.
- **Masqués :** File-name-changer, Root-ME, `cobroux`, GFaim-politique-confidentialite (lien seulement).

### Tags IA (transparence)
- `Écrit à la main` : les projets universitaires. Leur statut inachevé est assumé : « livré dans le temps imparti ».
- `Commencé à la main, puis IA` : Oltre.
- `Conçu avec IA` : Zotracker et Zofolio, avec la méthode expliquée dans le colophon.

## 2. Carte des capacités (modules)

| Module id | Responsabilité | Dépend de | Jalon |
|---|---|---|---|
| `infra` | Docker Compose, CI/CD, VPS, HTTPS, sauvegardes | — | V1 |
| `core-shell` | Layout, routage `/fr` `/en`, thèmes, SEO/SSR, i18n | infra | V1 |
| `content` | Modèle de données (projets, expériences, courses, traductions), API publique en lecture, données initiales via Liquibase | infra | V1 |
| `home-course` | Scroll narratif, profil de dénivelé, sections, ravitaillements | core-shell, content | V1 |
| `contact` | Formulaire, envoi d'e-mail, anti-spam, limitation de débit | core-shell | V1 |
| `cv` | Téléchargement du CV en PDF FR/EN, compteur | content | V1 |
| `projects` | Catalogue et pages d'étude de cas, clips vidéo | content | V2 |
| `github-sync` | Job planifié : repos, langages, commits, contributions, mis en cache en base | content | V2 |
| `i18n-en` | Traduction EN de tous les contenus | content, core-shell | V2 |
| `content-admin` | Back-office authentifié : CRUD des contenus et traductions, curation des repos, upload de médias | content | V3 |
| `sport-stats` | Stats sport agrégées (saisie admin, puis Garmin agrégé sans GPS) | content | V3 |
| `colophon` | « Comment ce site a été construit » : stack, IA, CI, Lighthouse | projects | V3 |
| `oltre-demo` | *(repo Oltre)* mode démo avec un faux athlète et une démo en ligne | infra | V3 |

**Ordre de construction :** infra → core-shell + content → home-course, contact, cv → **V1 « Départ »** → projects, github-sync, i18n-en → **V2 « Mi-course »** → content-admin, sport-stats, colophon, oltre-demo → **V3 « Arrivée »**.

Chaque module aura sa propre spécification détaillée (`docs/specs/SPEC-<module>.md`), rédigée par le tech lead avant son implémentation.

## 3. Exigences par module (critères d'acceptation)

### infra
- `docker compose up` lance le front, le back et PostgreSQL en local.
- Un pipeline CI (GitHub Actions) exécute le build, les tests, le lint, les tests E2E et Lighthouse à chaque PR. Une PR qui échoue ne peut pas être fusionnée.
- Le déploiement se fait automatiquement depuis `main` vers le VPS : images Docker, HTTPS via Caddy, sauvegarde PostgreSQL quotidienne avec 7 jours de rétention.
- Les secrets sont gérés par variables d'environnement, avec un `.env.example` commité et aucun secret dans le repo.

### core-shell
- Les routes `/fr/...` et `/en/...` sont servies, `/` redirige selon `Accept-Language` (français par défaut), et `hreflang` est déclaré.
- Le thème clair « Jour de course » et le thème sombre « Départ 6h30 » suivent `prefers-color-scheme`, avec un bouton pour basculer et un choix mémorisé (`localStorage` protégé par try/catch). La page ne doit pas clignoter au chargement.
- Le rendu se fait en SSR, de sorte que chaque page publique contient son contenu dans le HTML initial. Chaque page a sa balise title, sa meta description et son image Open Graph.
- Accessibilité WCAG 2.2 AA : navigation au clavier complète, focus visible, lien d'évitement, respect de `prefers-reduced-motion`.

### content
- Une API REST publique en lecture seule : `GET /api/{lang}/home`, `/projects`, `/projects/{slug}`, `/races`.
- Chaque texte traduisible est stocké par langue. Si la traduction EN manque, le texte FR est servi.
- Les données initiales (projets, expériences, courses) sont versionnées dans des changesets Liquibase.

### home-course
- Le dossard tient dans le premier écran, de 360×640 jusqu'au desktop, avec le nom, le titre, la stack et les boutons CV et Contact.
- Le profil de dénivelé, construit à partir du vrai GPX du GTA, sert de barre de progression. Le point avance avec le scroll et chaque checkpoint est cliquable. Sur mobile, il devient une barre horizontale en haut d'écran, avec un sommaire « road book » plein écran au tap.
- Le contenu reste entièrement lisible sans JavaScript ni animation.
- La course n'expose ni classement ni tracé GPS.

### contact
- Les champs sont le nom, l'e-mail, l'entreprise (facultative) et le message, validés côté client **et** côté serveur.
- Les protections anti-spam sont un champ piège invisible (honeypot) et une limite de 5 envois par heure et par IP. En cas de dépassement, le serveur répond 429 avec un message clair.
- Un e-mail est envoyé à Enzo et le visiteur reçoit une confirmation à l'écran. En cas d'échec SMTP, une erreur explicite est affichée et le message n'est pas perdu (il est enregistré en base).

### cv
- Un CV PDF en FR et un en EN, servis avec un nom de fichier propre (`Enzo-Leveque-CV-FR.pdf`) et un compteur de téléchargements en base.

### projects (V2)
- Le gabarit d'une étude de cas : pitch et split (durée, rôle, stack, commits) → problème → schéma d'architecture en SVG → 2 ou 3 décisions et leurs compromis → difficulté (« le mur du 60e km ») → ce que j'en retire → liens (repo, démo, vidéo).
- Les clips vidéo sont des boucles muettes de 15 à 30 s, avec une affiche (poster) et un chargement différé. Ils ne se lancent pas automatiquement sur une connexion lente ou avec `reduced-motion`.
- Worldline n'affiche aucun nom de client ni aucune architecture : seulement une vue d'ensemble compréhensible par quelqu'un d'extérieur au projet.

### github-sync (V2)
- Un job planifié (toutes les 6 h) récupère via l'API GitHub les repos publics de `cobroux` : langages, dernier push, nombre de commits, contributions.
- Le résultat est mis en cache en base. En cas d'échec, l'API continue de servir le dernier cache valide. Le token GitHub est en lecture seule et stocké en variable d'environnement.
- Seuls les repos curés (dont le flag de visibilité est activé) apparaissent sur le site.

### content-admin (V3)
- `/admin` est protégé par une authentification unique (Enzo), avec un cookie de session `HttpOnly` et `Secure`, une protection CSRF et un blocage après 5 échecs de connexion.
- CRUD des projets, études de cas, traductions, courses et médias, avec un aperçu avant publication.

### oltre-demo (V3, repo Oltre)
- Un profil `demo` avec un faux athlète, des données générées et une remise à zéro quotidienne. **Aucune donnée Garmin réelle.**

## 4. Stack technique (alignée sur Oltre)

| Couche | Choix |
|---|---|
| Back | Java 21, Spring Boot 4.1, Maven, Spring Web, Data JPA, Validation, Mail, Security (pour l'admin), Liquibase |
| Base de données | PostgreSQL 17 |
| Front | Angular 22 (standalone, signals), `@angular/ssr`, TypeScript 6, CSS natif avec custom properties |
| Tests | JUnit 5 + Testcontainers, Vitest (front), Playwright (E2E), axe-core, Lighthouse CI |
| Infra | Docker Compose, Caddy, GitHub Actions, VPS (Hetzner ou OVH, ~5 €/mois) |

## 5. Commandes

```bash
# Tout lancer en local
docker compose up --build
# Back
cd backend && ./mvnw verify            # build + tests unitaires et d'intégration
cd backend && ./mvnw spring-boot:run
# Front
cd frontend && npm ci && npm start     # http://localhost:4200
cd frontend && npm test                # Vitest
cd frontend && npm run lint
cd frontend && npm run build           # build SSR de production
cd frontend && npx playwright test     # E2E
```

## 6. Structure du projet

```
Zofolio/
├── backend/src/main/java/dev/zofolio/
│   ├── content/      # un package par feature : entité, repo, service, controller, DTO
│   ├── contact/
│   ├── cv/
│   ├── githubsync/
│   ├── admin/
│   └── shared/       # config, erreurs, i18n
├── frontend/src/app/
│   ├── core/         # layout, thème, i18n, interceptors
│   ├── features/     # home-course/, projects/, contact/, admin/
│   └── shared/       # composants UI (dossard, split, tag IA...)
├── e2e/              # Playwright
├── docs/             # SPEC.md, DESIGN.md, specs/, adr/
├── docker-compose.yml
└── .github/workflows/
```

## 7. Style de code

```java
// backend/.../contact/ContactController.java : une feature = un package, des DTO en record
@RestController
@RequestMapping("/api/contact")
class ContactController {
    private final ContactService service;
    ContactController(ContactService service) { this.service = service; }

    @PostMapping
    ResponseEntity<Void> send(@Valid @RequestBody ContactRequest request, HttpServletRequest http) {
        service.send(request, http.getRemoteAddr());
        return ResponseEntity.accepted().build();
    }
}
record ContactRequest(@NotBlank @Size(max = 100) String name, @Email String email,
                      @Size(max = 100) String company, @NotBlank @Size(max = 5000) String message) {}
```

- **Java :** visibilité au niveau du package par défaut, injection par constructeur, pas de Lombok, `record` pour les DTO, noms de classes en PascalCase (le style d'Oltre, `appointmentController`, n'est pas repris).
- **Angular :** composants standalone, `signal`/`computed`, `inject()`, contrôle de flux `@if` et `@for`, un dossier par feature, pas de NgModule.
- **Commits :** Conventional Commits (`feat(contact): ...`).

## 8. Stratégie de test

- **Back :** tests unitaires des services, tests d'intégration des controllers avec Testcontainers PostgreSQL. Au moins 80 % de couverture sur les services.
- **Front :** Vitest sur les composants à logique (profil de dénivelé, bascule de thème, formulaire).
- **E2E :** Playwright sur les parcours critiques (accueil → CV, accueil → contact, bascule FR/EN, bascule de thème, accueil → étude de cas).
- **Qualité :** axe sans violation ; en CI, Lighthouse mobile ≥ 90 en performance, ≥ 95 en accessibilité, bonnes pratiques et SEO.

## 9. Règles pour les agents

- **Toujours :** lancer `./mvnw verify` et `npm test` avant un commit, suivre DESIGN.md, valider les entrées côté serveur, respecter `reduced-motion`, écrire les textes en FR et prévoir les clés EN.
- **Demander d'abord :** pour tout changement de schéma de base hors Liquibase, l'ajout d'une dépendance, une modification de la CI ou du déploiement, la publication d'une photo ou d'un contenu personnel, et tout texte sur Worldline.
- **Jamais :** commiter un secret ou un fichier `.env`, exposer des tracés GPS, des classements ou des données Garmin réelles, nommer un client Worldline, commiter les photos brutes du Desktop, ni supprimer un test qui échoue.

## 10. Critères de succès (V1)

- [ ] Le site est déployé en HTTPS sur un domaine, avec un déploiement automatique depuis `main`.
- [ ] Un tech lead sur mobile voit son nom, son titre, sa stack, le bouton CV et le bouton Contact **sans scroller**.
- [ ] Les cinq sections de la course sont navigables au clavier, à la souris, au toucher, et sans animation.
- [ ] Le formulaire de contact délivre l'e-mail, et le spam est bloqué (honeypot et limite de débit testés).
- [ ] Lighthouse mobile ≥ 90/95/95/95, aucune violation axe.
- [ ] Le design passe la checklist de revue de DESIGN.md.

## 11. Contenus à fournir (par Enzo)

| Élément | Statut |
|---|---|
| Portrait hero (`fc5f4402…jpg`, 1200×1600) | ✅ (une version HD serait mieux) |
| Photos de course (`IMG_0124`, `IMG_7732`, `IMG_2506`) | ✅ (recadrage des tiers) |
| `IMG_2487` (filigrane du photographe) | ✅ accord obtenu |
| GPX du GTA 2025 (tracé officiel Trace de Trail, 7 613 points, aucun tracé personnel) | ✅ `~/Downloads/grands-trails-d-auvergne-2025-x-ultra-trail-solo.gpx` |
| Logo de la promo ILI (`~/Desktop/image.png`, « meilleure promo ILI 2024-2025 ») | ✅ ⚠️ contient le portrait dessiné d'un enseignant : obtenir son accord avant publication |
| CV PDF FR + EN | ❌ (la version Google Docs existe) |
| Clips vidéo des projets (liste de plans fournie en V2) | ❌ |
| Relecture des textes de chaque étude de cas | V2 |

## 12. Équipe d'agents

Voir `.claude/agents/`. Les rôles sont calqués sur une équipe de développement, et chaque agent utilise le modèle le moins coûteux adapté à sa tâche.

| Rôle | Agent | Modèle | Skills |
|---|---|---|---|
| Tech lead : specs par module, ADR, arbitrages | `tech-lead` | opus | spec-driven-development, planning-and-task-breakdown, api-and-interface-design |
| Designer : direction artistique, revue UI | `designer` | sonnet | design-taste-frontend, emil-design-eng, animate, review-animations |
| Dev back | `backend-dev` | sonnet | incremental-implementation, test-driven-development, security-and-hardening |
| Dev front | `frontend-dev` | sonnet | frontend-ui-engineering, animate, emil-design-eng |
| Revue de code | `code-reviewer` | sonnet | code-review-and-quality, ponytail-review |
| QA : E2E, accessibilité, performance | `qa-engineer` | sonnet | browser-testing-with-devtools, break-ui, performance-optimization |
| DevOps : Docker, CI, déploiement | `devops` | haiku | ci-cd-and-automation, shipping-and-launch |
| Recherche de contenu : Drive, rapports, CV | `content-researcher` | haiku | — |
| Rédaction FR/EN : textes du storytelling | `copywriter` | sonnet | — |

**Cycle d'une feature :** tech-lead (spec du module) → designer (si UI) → backend-dev et frontend-dev (en parallèle quand l'API est fixée) → code-reviewer → qa-engineer → devops (déploiement). Le mode ponytail est appliqué partout : la plus petite modification qui résout entièrement le problème.

## 13. Décisions (ex-questions ouvertes)

1. **Domaine :** un `.dev` (par exemple `enzoleveque.dev`, environ 12 €/an, HTTPS obligatoire, ce qui tombe bien avec Caddy). À acheter par Enzo avant la fin du V1.
2. **Hébergeur :** Hetzner Cloud CAX11 (ARM, 2 vCPU, 4 Go, environ 4 €/mois, datacenter UE). C'est le meilleur rapport prix/RAM pour la JVM, PostgreSQL et le SSR Node. On passera à CAX21 quand la démo d'Oltre arrivera (V3).
3. **Rendu :** SSR Angular avec un conteneur Node.
4. **SMTP :** Gmail, avec un mot de passe d'application en variable d'environnement.
5. **GFaim :** non déployé, donc pas de lien vers un store.
6. **Java :** 21.
