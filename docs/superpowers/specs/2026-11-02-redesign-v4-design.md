# Refonte v4 « Grand reportage en direct » : spec de design

Date : 2026-11-02, révisée après le conseil du même jour · Branche : `redesign/v4` (jamais déployée sans le feu vert d'Enzo) · Produit : [PRODUCT.md](../../../PRODUCT.md)

## 1. But

Faire de zoworks.fr un site qui donne à un tech lead fullstack Java/Angular l'effet « il me le faut dans mon équipe ». Il doit accrocher dès le premier écran, donner envie d'aller jusqu'à l'Arrivée, et paraître l'œuvre d'un développeur confirmé, pas d'un portfolio de fin d'études. Il garde le concept « La Course » et tous les faits du site actuel.

**Réussite** : le visiteur écrit, garde le CV et se souvient « du dev traileur au dossard 1592 ». La mise en scène obtient le clic ; la preuve d'ingénierie obtient l'appel. La spec doit garantir les deux.

**Critères mesurables :**
- Lighthouse mobile : performance ≥ 90 ; accessibilité, bonnes pratiques et SEO ≥ 95.
- axe : 0 violation, en clair et en sombre, en FR et en EN.
- Aucun contenu caché sans JavaScript ni en mouvement réduit.
- `inspect.mjs` (taste-skill) : 0 FAIL à 1440, 768 et 390 px.
- `impeccable detect` : propre.
- **Preuve visible** : au moins une décision technique lisible en 30 s sur l'accueil (P2), le colophon vivant au pied de page, et un lien vers le code depuis le bandeau et depuis chaque étude de cas.

## 2. Principe directeur

**La beauté au maximum, la complexité maîtrisée, et la preuve aussi mise en scène que la course.** Un seul système de mouvement exécuté au millimètre plutôt qu'une collection d'effets. Il y a **trois signatures** et pas plus : le bandeau de suivi, le dossard, l'index P3 avec aperçu. Le premium vient des détails : typographie réglée, photos mises en scène, rythme, états soignés, thème sombre aussi abouti que le clair, et performance. Le texte ne bouge jamais pendant qu'on le lit ; il peut seulement faire une entrée unique et courte quand son bloc arrive à l'écran.

## 3. L'idée

> Sur ce site, **le road book et le suivi en direct du Grand Trail d'Auvergne 2025 (dossard 1592, profil réel de 79,4 km)** deviennent **la mise en page et la navigation**. Le dossard est la couverture, chaque étape de carrière est une page du road book, et un bandeau de suivi en direct accompagne la lecture jusqu'à l'Arrivée.

Test du concurrent : un autre dev traileur n'a ni ce profil, ni ce dossard, ni ces pointages ; la phrase ne marche que pour Enzo.

**L'élément vivant.** Le bandeau de suivi affiche en direct le km, l'altitude et le D+ cumulé à la position de lecture. Ces chiffres sont calculés à partir du vrai profil (`profile.data.ts`) par des fonctions pures testées, pas inventés. Survoler un pointage affiche un aperçu de l'étape, cliquer dessus y mène. Un lien discret « Comment c'est calculé » mène à la fonction dans le dépôt public. Au toucher, le bandeau ouvre le road book. Sans JavaScript, le bandeau est une liste de liens d'ancre.

**Chrono : les vrais pointages officiels** (chrono-start, GTA 2025, X Ultra Trail 80 km, 11/10/2025, départ 06:30:00) :

| Pointage | km | Heure de passage | Temps de course | Étape |
| --- | --- | --- | --- | --- |
| P1 | 20,0 | 09:23:44 | 2 h 53 min 44 s | 2 h 53 min 44 s |
| P2 | 44,0 | 13:32:16 | 7 h 02 min 16 s | 4 h 08 min 32 s |
| P3 | 58,2 | 16:18:29 | 9 h 48 min 29 s | 2 h 46 min 13 s |
| Arrivée | 79,41 | 20:05:52 | 13 h 35 min 53 s | 3 h 47 min 23 s |

Ces temps vont dans `profile.data.ts`, à côté de `CHECKPOINTS`. Entre deux pointages, le bandeau affiche le **dernier temps de passage atteint**, jamais un temps interpolé. Les places et classements (456ᵉ, etc.) ne sont pas affichés, comme le prévoit déjà la règle du site.

## 4. Ce qui reste, ce qui change

| Reste (vérité produit) | Change (monde visuel) |
| --- | --- |
| Faits, textes FR/EN, CV, routes, admin, API, SSR, i18n | Composition de chaque section : magazine, couches, champs de couleur |
| Concept : dossard 1592, profil, P1-P2-P3, Arrivée | Le profil vertical discret devient le **bandeau de suivi** en bas |
| Palette : encre nuit `#0e1626` / papier `#f6f3ec`, un seul accent orange (sombre `#ff8a2b`, clair `#c2410c`) | La palette s'emploie en **champs pleins** par chapitre, avec un jeu de terrains défini pour chaque thème (§5) |
| Polices : Archivo (titres condensés), Source Sans 3 (texte) | Échelle plus contrastée : titres jusqu'à ~10vw, chiffres monumentaux réservés aux preuves (pointages, km et commits, décision) |
| Règles anti-slop de DESIGN.md §1 : pas de dégradé, pas de glow, pas d'eyebrow, pas de mono hors code | §7 « Mouvement » de DESIGN.md réécrit (voir §7) ; DESIGN.md est réécrit à la fin, à partir du site construit |

Le `docs/DESIGN.md` actuel reste la référence de la prod jusqu'à la fusion. Sur la branche, il sera remplacé à la fin par le documenteur d'impeccable, à partir du site construit.

## 5. Matière du monde

- **Courbes de niveau** : fond SVG statique généré à partir du relief du profil (et non un motif générique), à très faible opacité. Il ne bouge pas.
- **Terrains de chapitre**, une coupe franche au bord de chaque section, jamais de fondu :

  | Section | Thème clair | Thème sombre |
  | --- | --- | --- |
  | Départ, Arrivée | nuit `#0e1626` | nuit `#0e1626` |
  | P1, Journal | papier `#f6f3ec` | nuit relevée `#16203a` |
  | P2 | nuit profonde `#0a1120` | nuit profonde `#0a1120` |
  | P3 | accent clair `#c2410c` sur lequel le texte est **blanc** | accent `#ff8a2b` sur lequel le texte est **nuit** |

  Chaque paire texte/terrain est vérifiée ≥ 4,5:1 (AA texte courant) avant le code, par un test qui calcule les contrastes à partir des jetons.
- **Le dossard** : un objet imprimé réel. Rectangle 5:3, quatre trous d'épingle découpés en `clip-path`, numéro 1592 en Archivo condensé noir. C'est l'objet de la couverture, et son **dos** est le pied de page, qui sert de colophon vivant (§6, Arrivée).
- **Photos** : celles d'Enzo, en grand, à angles droits, avec un traitement unique. Elles sont posées en **plaques superposées** : une grande, une petite qui chevauche avec une marge couleur du terrain, une légende en Source Sans à 14 px. Elles se révèlent une fois au scroll par `clip-path: inset()`.
- **Repli sans photo**, tranché maintenant : là où une photo manque, la plaque prend une capture d'interface réelle (`data-ui`) ou un schéma d'architecture existant, jamais un aplat vide ni une image d'illustration générique.
- **Chiffres** : tabulaires, toujours en texte réel (SSR). Pas de chiffre décoratif inventé.

## 5 bis. Inventaire des médias (réels, à placer)

**Vidéos de projets** (déjà dans `frontend/public/media/`, en MP4, WebM et poster WebP) : `oltre-1`, `zotracker-1`, `gfaim-1`, plus les captures `gfaim-shot-1..3`. Elles alimentent l'aperçu de l'index P3 (boucle muette quand la ligne est active, poster sinon) et la couverture de chaque étude de cas. Elles se mettent en pause hors écran, et en mouvement réduit seul le poster s'affiche.

**Schémas d'architecture** (`features/projects/diagrams/` : trading-app, oltre, zotracker, gfaim) et **frise Worldline** (`worldline-timeline.ts`). Ce sont des plaques `data-ui` dans P2 et dans les études de cas, redessinées dans le nouveau monde (terrains, encre, accent).

**Photos fournies par Enzo le 2026-11-02** :

| Photo | Place |
| --- | --- |
| Badge « Certifiée meilleure promo ILI 2024-2025 » | P1, petit tampon : la touche d'humour de l'étape. Publication validée par Enzo. |
| Promo ILI en sweats bleus | P1, petite plaque (cadrage serré si les camarades ne sont pas d'accord) |
| Remise de diplôme, en toge (360×480 px) | Retirée (signal « fin d'études », trop petite) |
| Cérémonie du Master (320×240 px) | Retirée (trop petite, nom d'une enseignante lisible) |
| Arrivée du Trail Côte d'Opale, médaille | Journal |
| Sortie de nuit du club Les Baudets | Journal, grande plaque |
| En course sous la passerelle | Journal ou appui du Départ |
| Logo du club Les Baudets Dhinges | Journal, en petit, à côté du nom du club ; son rose ne devient jamais un accent |

Déjà en ligne : portrait, finisher Côte d'Opale, en course (`frontend/public/img/`). Encore souhaitées (non bloquantes) : une photo du GTA 2025 avec le dossard 1592, et une photo d'Enzo au travail.

**Maquettes de cadrage** : [`2026-11-02-redesign-v4-maquettes/`](2026-11-02-redesign-v4-maquettes/) (directions, étape P2 sur ordinateur et sur mobile). Ce sont des repères de composition, pas des maquettes finales. Depuis le conseil, le pointage ne se superpose plus au contenu (voir §6, P2).

## 6. Composition, section par section

Chaque section a une composition différente de ses voisines, et aucune n'est une grille de cartes. Les marges extérieures sont égales, et l'espace entre sections va de 160 à 240 px sur ordinateur.

### Départ (couverture)
- **Ordinateur.** Terrain nuit et courbes de niveau. À gauche, le nom « Enzo Leveque » en Archivo condensé à environ 10vw, sur une ligne, `h1`. Dessous, la phrase métier : « Ingénieur fullstack Java/Spring + Angular, chez Aubay après 2,5 ans de trading chez Worldline ». Puis **une ligne de preuve chiffrée** issue du CV, par exemple : « 2,5 ans sur une plateforme d'ordres de bourse en production · migration move2cloud vers RabbitMQ · Angular SSR et Spring Boot 4 en prod ici même ». Puis le bouton « Télécharger le CV » et le lien « Me contacter ». À droite, le portrait en plaque, avec le **dossard 1592** épinglé qui chevauche son bas. Le dossard porte « Grand Trail d'Auvergne · 79,4 km · départ 6 h 30 ». Le bandeau de suivi apparaît à km 0.
- **Mobile.** Nom sur deux lignes à environ 15vw, phrase, ligne de preuve, bouton pleine largeur, puis le portrait et le dossard.

### P1 · Fondations (km 20), compacte
- **Ordinateur.** Terrain papier. **Une seule bande dense**, pas une étape monumentale. À gauche, « P1 » en accent à taille moyenne, avec le titre et « km 20 · 2020 → 2025 ». Au centre, formation et alternance en deux à trois lignes. À droite, le **badge « meilleure promo »** en tampon et une petite plaque de la promo. Sous la bande, l'**index des projets d'école** : une ligne dense de liens (nom et langage), sans cartes ni images. La note GR3 et voies romaines reste en note de bas de page.
- **Ravitaillement R1** : il garde le contenu existant de l'admin (expérience `R1`), sous forme de simple ligne de transition. Aucun nouveau chiffre.
- **Mobile.** Même ordre sur une colonne ; l'index devient un paragraphe de liens.

### P2 · Worldline, la plus longue étape (km 44), l'étape qui porte le poids
- **Ordinateur.** Terrain nuit profonde. Chapitre épinglé à gauche (sticky pendant l'étape) : « P2 » monumental en accent, le titre et « km 44 · 2023 → 2025 ». La colonne de droite défile :
  1. les faits du CV : TOM, move2cloud vers RabbitMQ, batchs Copartis, contrôles pré-trade Boursorama, portail multi-clients, puis Aubay (Java/Spring Boot et Python) ;
  2. **l'encadré Décision**, lisible en 30 s, sur un terrain d'un ton plus clair : *Problème* (propager les changements de configuration des alertes sans redémarrer le service) · *Options* (ActiveMQ, Kafka, RabbitMQ, étude comparative) · *Choix* (ActiveMQ / JMS, et pourquoi, d'après le CV) · *Résultat* (module producer/consumer testé en JUnit). Seuls les faits du CV y figurent ; si un détail manque, la ligne est retirée plutôt qu'inventée ;
  3. les plaques : photo ou, à défaut, le schéma d'architecture `trading-app` et la frise Worldline, en `data-ui` ;
  4. le lien vers l'étude de cas.
- **Pointage P2** : il ne se superpose pas au contenu. À l'entrée de l'étape, le bandeau s'étend d'une ligne pendant 2,4 s : « P2 · km 44 · 13:32:16 · 4 h 08 de la plus longue étape ». Puis il revient à sa hauteur.
- **Ravitaillement R2** : comme R1.
- **Mobile.** Le chapitre devient une fine barre sticky (budget de hauteur, §9). L'encadré Décision passe en pleine largeur, avant les plaques.

### P3 · Projets nés de la course (km 58,2)
- **Ordinateur.** Terrain accent. **Index avec aperçu** (signature) : les projets (Oltre, Zotracker, garmin-mcp, GFaim…) en lignes de titres très grands, avec stack et commits sur la même ligne. Au survol ou au focus, le clip ou la capture de la ligne active apparaît dans **un cadre fixe** (fondu enchaîné de 240 ms). Chaque ligne mène à son étude de cas, et un lien « code » mène au dépôt.
- **Mobile.** Chaque ligne affiche son poster en ligne, sans survol ; la vidéo ne se lance qu'au toucher.

### L'endurance, deux fois (Journal, ouverture)
- **Le moment « woaw ».** Terrain papier. Titre : « L'endurance, deux fois ». Pour chaque année de 2023 à 2026, deux barres côte à côte qui se remplissent ensemble avec leur compteur (`CountUp`) : **km courus** (totaux annuels de l'admin) et **commits** (synchro GitHub existante, contributions agrégées par année). Ce sont deux vraies séries, et l'année en cours est marquée. Une phrase sèche en dessous, par exemple : « Les deux courbes montent. Ce n'est pas une coïncidence, c'est une méthode. »
- Si l'une des deux séries manque pour une année, sa barre affiche un tiret et la mention « non renseigné », jamais une valeur estimée.
- **Mobile.** Paires de barres empilées par année, chiffres à environ 13vw.

### Journal · carnet d'entraînement
- Les dernières courses en tableau, la photo de la sortie de nuit des Baudets en grande plaque, le logo du club en petit, l'arrivée Côte d'Opale. Les autres courses et le graphe de contributions sont repliés. « Les années en chiffres » est absorbé par « L'endurance, deux fois ».

### Arrivée · contact (km 79,41)
- **Ordinateur.** Terrain nuit. La **ligne d'arrivée** : « 13 h 35 min 53 s » en chiffres monumentaux, avec les quatre pointages en tableau compact dessous, et « Prochain objectif : 100 km » en petit. Puis le contact, directement visible : email (`mailto`), bouton CV et LinkedIn en tête, puis le formulaire existant, restylé dans le monde (champs pleins, sans coupon). Phidippides reste sous le formulaire.
- **Pied de page, « le dos du dossard », le colophon vivant.** Le dossard retourné porte :
  - le **commit en ligne** (hash court lié au commit sur GitHub) et la **date du dernier déploiement**, injectés au build par la CI ;
  - le **nombre de tests** de la dernière CI, calculé au build ;
  - le **score Lighthouse mobile** de la dernière exécution CI sur `main`, s'il est disponible via la synchro GitHub, sinon la ligne est omise ;
  - la stack et le lien vers le dépôt ;
  - email, GitHub, LinkedIn, CV.

  Aucune valeur n'est codée en dur : une donnée absente est retirée, jamais remplacée.
- **Mobile.** Même ordre ; le dos du dossard en pleine largeur.

### Pages projet (études de cas) : vague 2
**Même modèle pour chaque étude**, sur le terrain du monde : couverture (titre, pointage du km de son étape, clip ou schéma), puis, dans l'ordre, **Contexte et contraintes**, **Décision et alternative écartée**, **Ce que j'ai porté**, **Résultat**, **Ce que je referais**, **Code** (liens vers le dépôt ou un fichier précis). Une rubrique sans fait réel est retirée. Transition accueil → étude : **fondu simple par défaut**. La View Transition sur l'image partagée n'est ajoutée que si l'étude a un resolver qui charge ses données avant la navigation ; sinon elle est abandonnée.

## 7. Système de mouvement (réécrit selon Emil)

Courbes : `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`, `--ease-io: cubic-bezier(0.77, 0, 0.175, 1)`. Jamais `ease-in`, jamais `transition: all`. On n'anime que `transform`, `opacity` et `clip-path`, avec un repli en mouvement réduit pour chacun.

| Mouvement | But | Comment | Durée, courbe | Mouvement réduit |
| --- | --- | --- | --- | --- |
| Bandeau : km, altitude, D+ | Orientation (signature) | Valeurs pilotées par le scroll, écrites par rAF seulement quand le dixième change ; la trace orange se remplit par `transform: scaleX` d'un masque | Linéaire, suit le scroll | Identique (un chiffre qui change n'est pas un mouvement) ; la trace saute sans transition |
| Ligne de pointage du bandeau | Récompense, rythme | Le bandeau s'étend d'une ligne par `transform` ; elle reste 2,4 s puis se replie plus vite (180 ms). Une fois par étape et par session (`sessionStorage`, lu côté navigateur seulement, l'état SSR est replié) | Entrée 320 ms `--ease-out` | Ligne affichée sans déplacement |
| Chapitre épinglé (P2) | Repère | `position: sticky`, pas d'animation | — | — |
| Coupe de terrain | Changement de chapitre | Coupe nette, sans transition | — | — |
| Plaques photo | Révélation | `clip-path: inset(0 0 100% 0)` vers `inset(0)`, une fois, avec 80 ms de décalage entre les deux plaques | 600 ms `--ease-io` | Fondu de 160 ms |
| Entrée des blocs | Séquencer la lecture | Titre, puis texte, puis visuel : 16 px avec opacité, 60 ms de décalage, une seule fois (directive `Reveal` existante) | 320 ms `--ease-out` | Fondu de 160 ms ; rien de caché sans JS |
| Index P3 : aperçu | Signature | Fondu enchaîné dans le cadre fixe ; la ligne active passe en pleine intensité, les autres restent lisibles (contraste ≥ 4,5:1, jamais en dessous) | 240 ms `ease` ; `@media (hover:hover) and (pointer:fine)` | Changement direct |
| Aperçu de pointage (bandeau) | Exploration | Infobulle partant de son point : `scale(0.97)` avec opacité, délai de 300 ms au premier survol puis 0 ms entre voisins | 150 ms `--ease-out` | Changement direct |
| L'endurance, deux fois | Progression | `CountUp` : les deux barres d'une année se remplissent ensemble, une année après l'autre | 700 ms par année | État final |
| Boutons, liens, lignes | Feedback | `scale(0.97)` au `:active` ; soulignement au survol | 140 / 160 ms | Conservé |
| Accueil → étude | Continuité | Fondu (View Transition seulement avec resolver, §6) | 200 ms | Aucun |

**Pas animés** : la navigation au clavier et le focus, le texte pendant la lecture, les chiffres du dossard et du colophon, le changement de langue, les courbes de niveau, et tout ce qui revient plus de cinq fois par session. Pas de parallaxe, pas de scroll-jacking, pas de curseur personnalisé, pas de particules.

## 8. Composants (Angular, dans le code existant)

| Composant | Rôle | Remplace ou étend |
| --- | --- | --- |
| `TrackingBand` | Bandeau de suivi : km, altitude, D+, dernier temps de passage, mini profil avec pointages, aperçus, ligne de pointage, lien « Comment c'est calculé », ouverture du road book sur mobile | Remplace `ElevationProfile` en colonne ; réutilise `CourseProgress`, `kmAtScroll`, `profile.data` et `RoadBook` |
| `ChapterPin` | Chapitre épinglé (ordinateur) / barre sticky (mobile) | Nouveau, pour P2 (et P1 en version compacte non sticky) |
| `PhotoPlates` | Plaques superposées, révélation et repli sur capture ou schéma | Remplace les `<figure>` actuelles |
| `ContourField` | Fond statique de courbes de niveau généré depuis le profil | Nouveau, SVG rendu côté serveur |
| `DecisionCard` | Encadré Problème / Options / Choix / Résultat | Nouveau, contenu tiré des données (admin ou fichier de contenu), pas codé en dur dans le gabarit |
| `ProjectIndex` | Index avec aperçu (P3) | Remplace la liste actuelle des projets P3 |
| `EnduranceTwice` | Km et commits par année, deux barres synchronisées | Nouveau, réutilise `CountUp` et absorbe « Les années en chiffres » |
| `Bib` | Dossard objet (couverture) et dos (colophon vivant) | Étend le `Bib` existant |
| `LiveColophon` | Données du dos du dossard (commit, déploiement, tests, Lighthouse) | Nouveau ; lit un `build-info` produit à la CI et la synchro GitHub |
| `CountUp` | Existant, conservé | — |

**Fonctions pures testées** :
- altitude et D+ cumulé à un km donné, à partir de `PROFILE` (D+ = somme des montées) ;
- dernier pointage atteint et son temps ;
- génération des courbes de niveau ;
- agrégation des commits par année ;
- contraste de chaque paire texte/terrain.

**Données nouvelles côté back** : agrégation des commits par année (à partir de la synchro GitHub existante), plus éventuellement le statut et le Lighthouse de la dernière CI. C'est le seul changement back, en lecture seule.

## 9. Performance et accessibilité

- **Hydratation incrémentale**, absente aujourd'hui (vérifié : `app.config.ts` n'a que `provideClientHydration()`). Elle est ajoutée en tranche 1 : `withIncrementalHydration()` et `@defer (hydrate on viewport)` sur P1, P2, P3, Journal et Arrivée. Le Départ et le bandeau restent en hydratation immédiate. Le gain sur le TBT est mesuré avant et après.
- **Budget JS** : aucune dépendance ajoutée, pas de bibliothèque d'animation (CSS, WAAPI, rAF).
- **Bandeau** : un seul écouteur de scroll passif et rAF ; il écrit `transform` directement sur l'élément, pas une variable CSS héritée.
- **Budget de hauteur des éléments fixes sur mobile (390 × 844)** : barre de chapitre (48 px) + bandeau (52 px, 76 px quand il est étendu) ≤ 15 % de la hauteur. `scroll-padding-top` et `scroll-padding-bottom` en conséquence, pour que le focus ne soit jamais masqué (WCAG 2.4.11).
- **Accessibilité du bandeau** :
  - c'est une `nav` « Parcours » contenant une liste de liens d'ancre ;
  - sur mobile, le bouton « Parcours » est un `button` qui ouvre le road book comme une boîte de dialogue (focus piégé, Échap) ;
  - les valeurs qui défilent sont `aria-hidden` ;
  - une région `aria-live="polite"` séparée annonce seulement les pointages atteints (« P2 atteint, km 44 »).
- **Contrastes** : chaque paire texte/terrain des deux thèmes est ≥ 4,5:1, garanti par un test (§5).
- **Lighthouse** : il tourne déjà en CI. Le rendre obligatoire avant la fusion de `redesign/v4` dans `main` relève d'un réglage GitHub qu'Enzo fera lui-même.

## 10. Vérification

À chaque tranche :
- tests Vitest et E2E Playwright avec axe ;
- `lint.mjs`, `inspect.mjs` et `scenes.mjs` de taste-skill à 1440, 768 et 390 px, captures relues ;
- `impeccable detect` sur les fichiers modifiés ;
- Lighthouse en local, et en CI sur la PR de tranche ;
- captures ordinateur et téléphone envoyées à Enzo.

À la fin de chaque vague : passe de finition impeccable. À la fin du chantier : réécriture de DESIGN.md par le documenteur, puis relecture d'Enzo avant toute fusion dans `main`.

## 11. Livraison en deux vagues (fusionnées dans `redesign/v4`, pas dans `main`)

**Vague 1 : le site qui donne envie d'appeler.**
1. Système : jetons, terrains des deux thèmes et test de contraste, `ContourField`, hydratation incrémentale.
2. `TrackingBand` (signature) avec les pointages officiels et le road book mobile.
3. Départ, `Bib` objet et ligne de preuve.
4. P1 compacte, et P2 avec `ChapterPin`, `DecisionCard` et `PhotoPlates`.
5. P3 `ProjectIndex`.
6. « L'endurance, deux fois » (front et agrégation des commits côté back) et Journal.
7. Arrivée et dos du dossard `LiveColophon` (build-info en CI).
8. Finition de la vague 1, puis revue d'Enzo. Il peut décider de déployer la vague 1 seule.

**Vague 2 : la profondeur.**
9. Gabarit unique des études de cas, appliqué à trading-app, Oltre, Zotracker et GFaim.
10. Transitions de page (fondu ; View Transition si resolver).
11. Finition, DESIGN.md réécrit, revue finale d'Enzo.

## 12. Hors périmètre

Pas de nouveau contenu inventé (témoignages, logos, chiffres hors CV), pas de migration de framework, pas de son ni de 3D. Les changements côté back se limitent aux lectures du §8.

## 13. Décisions prises et ouvertes

**Prises :**
- Temps de passage officiels (§3).
- Projets d'école conservés en index compact.
- Badge validé.
- Toge et cérémonie retirées.
- Coupon et dérive des courbes retirés.
- Le pointage ne se superpose plus au contenu.

**Ouvertes (non bloquantes) :**
1. Photo de promo : publiable telle quelle, ou en cadrage serré ?
2. Photo du GTA avec le dossard 1592, et photo au travail : si elles arrivent, elles remplacent les replis.
3. Texte de l'encadré Décision : relu par Enzo avant la fusion, pour vérifier que chaque ligne est exacte.

## 14. Risques

- **Trop d'effets au total** : la règle des trois signatures est vérifiée à chaque tranche. Ce qui n'oriente pas, ne récompense pas ou ne donne pas de feedback est retiré.
- **Profil perçu « traileur qui code »** : les chiffres monumentaux sont réservés aux preuves (décision, km et commits, pointages). Le chrono de 13 h 35 n'apparaît en monumental qu'à l'Arrivée.
- **Performance mobile** : mesurée à chaque tranche ; si Lighthouse passe sous 90, on retire avant d'optimiser.
- **Chantier inachevé** : la vague 1 est déployable seule ; la vague 2 ne bloque rien.
- **Direction tirée par taste-skill** (« la page est l'objet », sceau 212362163) : on garde l'idée de l'objet (dossard et son dos, road book) et l'index avec aperçu. Les dossiers à onglets de sa couverture sont remplacés par le dossard, qui est l'objet propre au sujet ; le coupon est retiré après le conseil.

## 15. Trace du conseil (2026-11-02)

Cinq membres (Pragmatique, Red-teamer, Rigoriste, Premiers principes, Généraliste), note moyenne 6,7/10 sur la v1 de cette spec. Unanimité : concept fort, preuve d'ingénierie sous-spécifiée, P1 trop scolaire. Majorité : trop d'effets cumulés, photos manquantes. Le Rigoriste a relevé l'absence d'hydratation incrémentale (vérifié) et des contradictions d'accessibilité, corrigées au §9. Cette révision intègre ces points.
