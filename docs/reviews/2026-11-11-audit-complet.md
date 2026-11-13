# Audit complet de Zofolio et plan d'action (11 novembre 2026)

Base auditée : `origin/main` au commit `5d3a672` (identique à la prod) et https://zoworks.fr.
Skills utilisés : impeccable (critique et audit), design-taste-frontend (inspecteur et lint), ecc:production-audit, graphify.
Méthode dégradée : revue design et détecteurs faits dans le même contexte, sans sous-agents.

## 1. Notes

| Grille | Note | Lecture |
|---|---|---|
| Critique design (impeccable, Nielsen) | 21/32 | Acceptable, à un point et demi de « Bon ». Heuristiques 7 et 10 sans objet sur un portfolio |
| Audit technique de l'UI (impeccable) | 16/20 | Bon (accessibilité 3, performance 3, thème 4, responsive 3, intégrité 3) |
| Jury design-taste | 6,9, plafonné à 6,0 | Design 6,5 · usage 7 · créativité 8,5 · contenu 5 ; 2 FAIL de l'inspecteur |
| Production (ecc) | 78/100 | Lançable avec réserves ; plafonné à 84 tant que la CI de main est rouge |

Le concept tient : dossard 1592, profil réel du GTA 2025 et bandeau de suivi, aucun concurrent ne peut avoir ce site. Le premier écran est bon en bureau comme en mobile. Le défaut est dans la suite : le poids visuel est inversé par rapport à ce qu'un tech lead vient chercher.

### Détail Nielsen

| # | Heuristique | Note | Constat |
|---|---|---|---|
| 1 | État du système | 3 | Bandeau exemplaire ; le compteur d'endurance affiche « 0 km » pendant environ 2 s |
| 2 | Langage du lecteur | 2 | « P1 », « Ravito km 32 », « Contrôle du matériel » demandent un décodage |
| 3 | Contrôle | 3 | Ancres, road book, Échap, retour |
| 4 | Cohérence | 2 | Le site livré contredit DESIGN.md (cartes, index P3) ; 19 tailles de police |
| 5 | Prévention d'erreur | 3 | Formulaire validé, pot de miel, repli sans JS |
| 6 | Reconnaissance | 3 | Rien à mémoriser |
| 8 | Sobriété et hiérarchie | 2 | Voir les problèmes 1 à 4 |
| 9 | Récupération d'erreur | 3 | Codes d'erreur traduits, message gardé si l'e-mail échoue |

## 2. Design : les 5 problèmes, par impact

1. **[P1] Worldline est le chapitre le plus vide de la page.** Deux ans et demi de trading en production tiennent en un paragraphe, quatre mots de stack et un lien « Voir la frise et l'architecture ». Les trois missions sont dans l'API (`experiences`, étape P2) mais ne sont pas affichées. Le poste actuel chez Aubay est une note en bas du chapitre.
2. **[P1] P1 montre 8 cartes de projets d'école dont 5 sont des tuiles de remplissage** (courbes et « Java », « C », « Haskell »). DESIGN.md §1 interdit ces grilles. Elles occupent plus de place que Worldline.
3. **[P1] « Contrôle du matériel » est un mur de 12 logos de marques en couleur**, placé avant tout contenu de carrière. Il casse la règle « un seul accent » et prend un écran et demi en mobile.
4. **[P2] P3 et Endurance sont tassés à gauche, moitié droite vide en bureau.** P3 fait environ 2,5 écrans d'orange avec des titres de projet en petit. L'index géant avec aperçu (`ProjectIndex`, « signature 3 ») n'est plus monté.
5. **[P2] « L'endurance, deux fois » n'affiche plus qu'une série** depuis le retrait des contributions (PR #55). L'API renvoie aussi D+, heures et sorties par année (4 748 km et 32 931 m D+ en 2026), inutilisés.

Mineurs : en tablette (768 px) le portrait est coupé par le bas de l'écran ; la ligne de preuve du hero est en gris alors qu'elle porte la preuve ; les photos du Journal (selfie de nuit) sont en dessous du niveau de la typo ; 19 tailles de police.

Trois lecteurs :
- Tech lead pressé : cherche « qu'a-t-il fait chez Worldline ? », trouve un paragraphe et repart avec les projets perso comme seule preuve.
- Recruteur non technique : ne voit nulle part « Expérience » ni « Formation », seulement P1, P2, Ravito.
- Mobile à une main : trois écrans de logos et de tuiles avant Worldline. Bon point : le bandeau et le bouton Parcours sont sous le pouce.

## 3. Idées de changement de design

Toutes restent dans « La Course », que PRODUCT.md déclare contraignant.

1. P2 devient l'étape reine : les trois missions en pointages, l'encadré Décision remonté sur l'accueil.
2. Aubay devient un vrai pointage (réponse à « que fait-il aujourd'hui ? »).
3. Matériel sans logos : un tableau « techno · où elle a tourné ».
4. P1 en une ligne d'index avec les 3 vraies captures en petite plaque.
5. P3 sur toute la largeur : titres géants à gauche, aperçu collant à droite, un seul écran d'orange.
6. Endurance en plaque de données : km, D+, heures en très grand, barres pleine largeur ; le titre change.
7. Hero : la ligne grise devient trois « temps de passage » alignés comme le tableau de l'Arrivée.
8. Une vraie photo de trail en plein écran comme coupe de chapitre ; la photo finisher descendue à l'Arrivée.
9. Échelle typographique : de 19 tailles à 6 jetons.

Deux directions plus radicales, écartées pour l'instant : « Road book imprimé » (papier clair par défaut, tableaux de pointage, tampons) et « Suivi en direct » (profil d'altitude en hero plein écran).

## 4. Technique

Solide, à garder : admin (bcrypt coût 12, CSRF, cookie `__Host-`, limite d'essais en base), en-têtes de sécurité, conteneurs non root, VM durcie par Ansible, 135 tests unitaires et 47 E2E avec axe, sauvegarde quotidienne avec script de restauration à blanc.

| Priorité | Constat | Preuve |
|---|---|---|
| P1 | CI rouge sur main : Lighthouse perf 0,79 / 0,89 / 0,89 sur `/fr/` (seuil 0,90) | run 42856480573 |
| P1 | Le déploiement n'attend pas la CI : `5d3a672` est en prod alors que sa CI a échoué | `deploy.yml` et `ci.yml` partent en parallèle sur le push |
| P1 | Sauvegardes sur la même VM uniquement, volume `media` non sauvegardé | `infra/README.md` |
| P2 | 7 PR Dependabot ouvertes, dont Spring Boot 4.1.2 et Angular SSR 22.2.6 | PR #43 à #49 |
| P2 | Aucune supervision ni alerte si le site tombe | rien dans `infra/` |
| P2 | Build sur la VM partagée, retour arrière = rebuild d'environ 10 min | `infra/README.md` |
| P2 | Code mort : `ProjectIndex` (466 lignes avec ses tests), `/api/build` et le statut CI, `contributions` dans `/api/fr/home` | aucun consommateur dans le front |
| P2 | 4 images sans `width`/`height` (décalages de mise en page) | `p3.section.ts:52`, `p1.section.ts:69`, `project-index.ts:62,79` |
| P3 | CSP avec `'unsafe-inline'` sur les scripts ; pas de JSON-LD `Person` ; pas de HTTP/3 | en-têtes et HTML de prod |
| P3 | E2E sur Chrome bureau seulement, pas de WebKit mobile | `playwright.config.ts` |
| P3 | DESIGN.md périmé et introuvable par impeccable (rangé dans `docs/`) | `designPath: null` |
| P3 | Images et polices non empreintées servies avec un cache d'un an | en-têtes de prod |

Détecteurs : impeccable a remonté 8 alertes « image cassée », toutes fausses (il ne comprend pas `[src]` d'Angular). Le lint design-taste a 1 FAIL réel (filet de 1 px, `endurance-twice.ts:119`). Le FAIL « texte couvert » de l'inspecteur vient du bandeau fixe.

## 5. Décisions d'Enzo (11 novembre 2026)

- Ordre : plan A, puis design.
- Ambition : affiner la v4 (« Grand reportage » sombre), pas de nouvelle direction.
- P3 : remonter l'index géant avec aperçu collant (`ProjectIndex`).
- Photos : faire avec l'existant.
- Tout le développement se fait hors de `main`, sur `redesign/vague-4`. **Aucun déploiement.** Fusionner une PR dans `main` déploie : les PR Dependabot attendent donc le feu vert.

## 6. Plans d'action

### A. Remise au vert (1 à 2 h)
- [x] Dimensions sur les 4 images (Lighthouse reste à relancer en CI)
- [x] Corriger le titre d'Endurance
- [ ] Fusionner les 7 PR Dependabot (déploie : sur feu vert)
- [ ] Fermer ou fusionner les PR #30 et #31 (à décider par Enzo)

### B. Vague 4 design (2 à 3 jours)
- [x] P2 en étape reine : missions en pointages, encadré Décision, Aubay en pointage
- [x] Matériel sans logos
- [x] P1 en ligne d'index et plaque des 3 vraies captures
- [x] P3 : `ProjectIndex` remonté, lien « En ligne » conservé
- [x] Endurance en plaque de données, nouveau titre
- [x] DESIGN.md réécrit sur ces sections
- [ ] Non retenus pour cette vague : hero en temps de passage, échelle typographique, photo plein écran

### C. Socle (1 jour)
- [ ] Sauvegarde chiffrée hors serveur, volume `media` compris
- [ ] Déploiement conditionné à la CI
- [ ] Sonde de disponibilité avec alerte
- [ ] Images construites en CI et étiquetées par commit (retour arrière en une minute)
- [ ] CSP sans `'unsafe-inline'`, JSON-LD `Person`, HTTP/3, WebKit mobile en E2E

### D. Ménage (1 h)
- [ ] 58 branches distantes, 9 worktrees dont 4 dans `/tmp`
- [ ] Dossier `Portefolio/Zofolio/` (restes de build) et `backend 2`
- [ ] Code mort : `/api/build` et statut CI, `contributions` dans l'API d'accueil

## 7. Non vérifié

- axe et Lighthouse non relancés pendant l'audit (résultats repris de la CI).
- Thème clair, version EN, admin et pages d'étude non regardés à l'écran.
- Surcouche visuelle d'impeccable non tentée (la CSP de prod bloque l'injection).
- Le graphe graphify date du 5 novembre et ne couvre que `home-course`.
- À relire par Enzo : le dépôt est public et `docs/content/case-studies-v4.md` mentionne un rapport « confidentiel ».

## 8. Où sont les pièces

- Captures de l'inspecteur avant travaux : `zofolio-wt/.taste-skill/before/`
- Archive de la critique impeccable : `zofolio-wt/.impeccable/critique/`
- Branche de travail : `redesign/vague-4`, worktree `Portefolio/zofolio-vague4.nosync`

## 9. État au 13 novembre 2026

Plans A et B faits sur `redesign/vague-4` (commits locaux, rien poussé, rien déployé).
Vérifié : build, 148 tests unitaires, lint, i18n FR/EN, E2E accueil, projets, bandeau et hydratation contre un aperçu local (axe compris, clair et sombre, FR et EN).
Non vérifié : Lighthouse, E2E contact et admin, test « API arrêtée » (ils demandent la pile Docker complète, donc la CI).
À savoir : P2 dense revient sur le choix du 3-4 novembre (P2 allégée) ; le graphe et les logos ne reviennent pas.
