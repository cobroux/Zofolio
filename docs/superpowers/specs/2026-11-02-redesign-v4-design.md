# Refonte v4 « Grand reportage en direct » : spec de design

Date : 2026-11-02 · Branche : `redesign/v4` (jamais déployée sans le feu vert d'Enzo) · Produit : [PRODUCT.md](../../../PRODUCT.md)

## 1. But

Faire de zoworks.fr un site qui donne à un tech lead l'effet « il me le faut dans mon équipe ». Il doit accrocher dès le premier écran, donner envie d'aller jusqu'à l'Arrivée, et paraître l'œuvre d'un développeur confirmé, pas d'un portfolio de fin d'études. Il garde le concept « La Course » et tous les faits du site actuel.

**Réussite** : le visiteur écrit, garde le CV et se souvient « du dev traileur au dossard 1592 ».

**Critères mesurables :**
- Lighthouse mobile : performance ≥ 90 ; accessibilité, bonnes pratiques et SEO ≥ 95.
- axe : 0 violation, en clair et en sombre, en FR et en EN.
- Aucun contenu caché sans JavaScript ni en mouvement réduit.
- `inspect.mjs` (taste-skill) : 0 FAIL à 1440, 768 et 390 px.
- `impeccable detect` : propre.

## 2. Principe directeur

**La beauté au maximum, la complexité maîtrisée.** Un seul système de mouvement, celui de la course, exécuté au millimètre, plutôt qu'une collection d'effets. Le premium vient des détails : typographie réglée, photos mises en scène, rythme des transitions, états soignés, thème sombre aussi abouti que le clair, et performance. Le texte que l'on lit ne bouge jamais ; seuls le décor et les données bougent.

## 3. L'idée

> Sur ce site, **le road book et le suivi en direct du Grand Trail d'Auvergne 2025 (dossard 1592, profil réel de 79,4 km)** deviennent **la mise en page et la navigation**. Le dossard est la couverture, chaque étape de carrière est une page du road book, et un bandeau de suivi en direct accompagne la lecture jusqu'à l'Arrivée.

Test du concurrent : un autre dev traileur n'a ni ce profil, ni ce dossard, ni ces pointages ; la phrase ne marche que pour Enzo.

**L'élément vivant.** Le bandeau de suivi affiche en direct le km, l'altitude et le D+ cumulé à la position de lecture. Ces chiffres sont calculés à partir du vrai profil (`profile.data.ts`), pas inventés. Survoler un pointage affiche un aperçu de l'étape, cliquer dessus y mène. Au toucher, le bandeau ouvre le road book. Sans JavaScript, le bandeau est une liste de liens d'ancre.

**Chrono : donnée à fournir.** Le site ne connaît aujourd'hui que le départ à 6 h 30 et le temps total, 13 h 35 min 53 s. Les temps de passage à P1, P2 et P3 ne s'affichent que si Enzo fournit ses temps officiels. Sans eux, le bandeau montre le km, l'altitude et le D+, et l'Arrivée seule montre 13 h 35 min 53 s. Aucun temps intermédiaire ne sera interpolé.

## 4. Ce qui reste, ce qui change

| Reste (vérité produit) | Change (monde visuel) |
| --- | --- |
| Faits, textes FR/EN, CV, routes, admin, API, SSR, i18n | Composition de chaque section : magazine, couches, champs de couleur |
| Concept : dossard 1592, profil, P1-P2-P3, Arrivée | Le profil vertical discret devient le **bandeau de suivi** en bas |
| Palette : encre nuit `#0e1626` / papier `#f6f3ec`, un seul accent orange (sombre `#ff8a2b`, clair `#c2410c`) | La palette s'emploie en **champs pleins** par chapitre : chaque étape a son terrain de couleur |
| Polices : Archivo (titres condensés), Source Sans 3 (texte) | Échelle plus contrastée : titres jusqu'à ~10vw, chiffres de pointage monumentaux |
| Règles anti-slop de DESIGN.md §1 : pas de dégradé, pas de glow, pas d'eyebrow, pas de mono | §7 « Mouvement » de DESIGN.md réécrit (voir §7) ; DESIGN.md est réécrit à la fin, à partir du site construit |

Le `docs/DESIGN.md` actuel reste la référence de la prod jusqu'à la fusion. Sur la branche, il sera remplacé à la fin par le documenteur d'impeccable, à partir du site construit.

## 5. Matière du monde

- **Courbes de niveau** : fond SVG généré à partir du relief du profil (et non un motif générique), à très faible opacité, avec une dérive lente sur ordinateur. Sur mobile et en mouvement réduit, il reste fixe.
- **Champs de chapitre** : chaque étape a son terrain. Départ en nuit, P1 en papier, P2 dans une nuit plus profonde (la plus longue étape), P3 sur le terrain de l'accent, Journal en papier, Arrivée en nuit. La couleur change par **coupe franche** au bord de la section, jamais par fondu.
- **Le dossard** : un objet imprimé réel. Rectangle 5:3, quatre trous d'épingle découpés en `clip-path`, numéro 1592 en Archivo condensé noir. C'est l'objet de la couverture et le motif de retour au pied de page, « le dos du dossard ».
- **Photos** : celles d'Enzo, en grand, à angles droits, avec un traitement unique. Elles sont posées en **plaques superposées** : une grande, une petite qui chevauche avec une marge couleur du terrain, et une légende en Source Sans à 14 px. Elles se révèlent au scroll par `clip-path: inset()`, une seule fois.
- **Chiffres** : tabulaires, très grands pour les pointages et le Journal, toujours en texte réel (SSR). Pas de chiffre décoratif inventé.

## 6. Composition, section par section

Chaque section a une composition différente de ses voisines, et aucune n'est une grille de cartes. Les marges extérieures sont égales, et l'espace entre sections va de 160 à 240 px sur ordinateur.

### Départ (couverture)
- **Ordinateur.** Terrain nuit et courbes de niveau. À gauche, le nom « Enzo Leveque » en Archivo condensé à environ 10vw, sur une ligne, `h1`. Dessous, une phrase qui dit le métier : « Ingénieur fullstack Java/Spring + Angular, chez Aubay après 2,5 ans de trading chez Worldline ». Puis le bouton « Télécharger le CV » et le lien « Me contacter ». À droite, le portrait, posé en plaque avec le **dossard 1592** épinglé qui chevauche son bas. Le dossard porte « Grand Trail d'Auvergne · 79,4 km · départ 6 h 30 ». Le bandeau de suivi apparaît à km 0.
- **Mobile.** Nom sur deux lignes à environ 15vw, phrase, bouton pleine largeur, puis le portrait et le dossard en dessous.

### P1 · Fondations (km 20)
- **Ordinateur.** Terrain papier. En haut à gauche, un chapitre épinglé (position sticky pendant toute l'étape) : « P1 » monumental en accent, le titre et « km 20 · 2020 → 2025 ». La colonne de droite défile : formation, alternance, les dépôts d'école regroupés dans un seul bloc « Index des projets d'école » (noms en ligne, dense, en liens). La note GR3 et voies romaines reste en note de bas de page.
- **Ravitaillement R1.** Une bande pleine largeur en accent, avec une phrase et un chiffre.
- **Mobile.** Le chapitre devient une fine barre sticky en haut, « P1 · Fondations ». Le contenu passe sur une colonne.

### P2 · Worldline, la plus longue étape (km 44)
- **Ordinateur.** Terrain nuit profonde. Chapitre épinglé à gauche. Le texte de l'étape reprend les faits du CV : TOM, migration move2cloud vers RabbitMQ, choix argumenté d'ActiveMQ, batchs Copartis, contrôles pré-trade, puis Aubay (Java/Spring Boot et Python). À droite, les plaques photo superposées et un fragment d'interface réel de l'étude de cas, recadré, marqué `data-ui`. Le **pointage P2** apparaît à l'entrée de l'étape : une plaque claire en surimpression, « P2 · km 44 · 2,5 ans », plus le temps de passage s'il est fourni. Lien vers l'étude de cas.
- **Ravitaillement R2.**
- **Mobile.** Barre sticky, plaques en pleine largeur, pointage en petite bannière au-dessus du bandeau pendant 2 s.

### P3 · Projets nés de la course (km 58,2)
- **Ordinateur.** Terrain de l'accent. **Index avec aperçu**, le geste signature de la direction tirée par taste-skill : les projets (Oltre, Zotracker, garmin-mcp, GFaim…) en lignes de titres très grands. Au survol ou au focus d'une ligne, son clip ou sa capture apparaît dans **un cadre fixe** (fondu enchaîné de 240 ms), avec stack et commits à côté. Chaque ligne mène à l'étude de cas.
- **Mobile.** Chaque ligne affiche son image en ligne, sans survol.

### Journal · carnet d'entraînement
- **Ordinateur.** Terrain papier. « Les années en chiffres » en **colonne alignée sur la décimale** : les totaux 2023 → 2026 en chiffres monumentaux, chacun avec sa barre. L'animation existante (barres et compteurs l'un après l'autre) est conservée, et ce bloc **sort du `<details>`** pour être vu sans clic. Les dernières courses suivent en tableau, les autres restent repliées. Le graphe de contributions GitHub reste.
- **Mobile.** Chiffres à environ 15vw, alignement conservé, légendes sous chaque chiffre.

### Arrivée · contact (km 79,41)
- **Ordinateur.** Terrain nuit. La **ligne d'arrivée** : une large bande où s'affiche « 13 h 35 min 53 s », le seul chrono certain, en chiffres monumentaux, avec « Prochain objectif : 100 km » en petit. Dessous, le formulaire est présenté comme un **coupon détachable** : une carte pleine avec ses encoches, une perforation en points ronds, et le formulaire existant avec ses champs et ses états. Phidippides reste sous le formulaire.
- **Pied de page, « le dos du dossard ».** Le dossard retourné porte les liens (email, GitHub, LinkedIn, CV) et le colophon.
- **Mobile.** Coupon vertical, perforation horizontale.

### Pages projet (études de cas)
Même monde : couverture de l'étude avec son pointage (le km de son étape), sections en champs, plaques, fragments `data-ui`. **Transition de vue** entre l'accueil et l'étude : l'image de la ligne d'index devient le visuel de couverture (View Transitions API) ; un fondu simple sinon.

## 7. Système de mouvement (réécrit selon Emil)

Courbes : `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`, `--ease-io: cubic-bezier(0.77, 0, 0.175, 1)`. Jamais `ease-in`, jamais `transition: all`. On n'anime que `transform`, `opacity` et `clip-path`, avec un repli en mouvement réduit pour chacun.

| Mouvement | But | Comment | Durée, courbe | Mouvement réduit |
| --- | --- | --- | --- | --- |
| Bandeau : km, altitude, D+ | Orientation (signature) | Valeurs pilotées par le scroll, mises à jour par rAF quand la valeur change au dixième ; la trace orange se remplit par `transform: scaleX` d'un masque | Linéaire, suit le scroll | Mise à jour par paliers aux pointages |
| Pointage d'étape | Récompense, rythme | Plaque qui monte de 16 px avec opacité, reste 2,4 s puis sort plus vite (sortie 180 ms) ; une fois par étape et par visite | Entrée 320 ms `--ease-out` | Apparition fixe, sans déplacement |
| Chapitre épinglé | Repère | `position: sticky` (pas d'animation) ; le grand « P2 » passe d'opacité 0 à 1 en entrant | 240 ms | Identique, sans fondu |
| Coupe de terrain | Changement de chapitre | Le bord de section reste une coupe nette, sans transition | — | — |
| Plaques photo | Révélation | `clip-path: inset(0 0 100% 0)` vers `inset(0)`, une fois, avec 80 ms de décalage entre les deux plaques | 600 ms `--ease-io` | Fondu de 160 ms |
| Entrée des blocs | Séquencer la lecture | Titre, puis texte, puis visuel : 16 px avec opacité, 60 ms de décalage, une fois (directive `Reveal` existante) | 320 ms `--ease-out` | Fondu de 160 ms ; rien de caché sans JS |
| Index P3 : aperçu | Signature taste-skill | Fondu enchaîné dans le cadre fixe ; la ligne active passe en encre pleine, les autres restent en `--muted` lisible (contraste ≥ 4,5:1, jamais en dessous) | 240 ms `ease` ; `@media (hover:hover) and (pointer:fine)` | Changement direct |
| Aperçu de pointage (bandeau) | Exploration | Infobulle partant de son point : `scale(0.97)` avec opacité, délai de 300 ms au premier survol puis 0 ms entre voisins | 150 ms `--ease-out` | Changement direct |
| Courbes de niveau | Profondeur | Dérive `translate` de 18 px en 18 s, aller-retour, ordinateur seulement | `ease-in-out` | Fixe |
| Barres du Journal | Progression (existant) | `CountUp` | 700 ms par année | État final |
| Boutons, liens, lignes | Feedback | `scale(0.97)` au `:active` ; soulignement au survol | 140 / 160 ms | Conservé |
| Accueil → étude | Continuité | View Transition sur l'image partagée | 300 ms `--ease-io` | Fondu ou rien |

**Pas animés** : la navigation au clavier et le focus, le texte courant, les chiffres du dossard, le changement de langue, et tout ce qui revient plus de cinq fois par session. Pas de parallaxe sur le texte, pas de scroll-jacking, pas de curseur personnalisé, pas de particules.

## 8. Composants (Angular, dans le code existant)

| Composant | Rôle | Remplace ou étend |
| --- | --- | --- |
| `TrackingBand` | Bandeau de suivi : km, altitude, D+, mini profil avec pointages, aperçus, ouverture du road book sur mobile | Remplace `ElevationProfile` en colonne ; réutilise `CourseProgress`, `profile.data` et `RoadBook` |
| `CheckpointPlate` | Plaque de pointage d'étape | Nouveau |
| `ChapterPin` | Chapitre épinglé (ordinateur) / barre sticky (mobile) | Nouveau, dans chaque section |
| `PhotoPlates` | Plaques superposées et révélation | Remplace les `<figure>` actuelles |
| `ContourField` | Fond de courbes de niveau généré depuis le profil | Nouveau, SVG statique rendu côté serveur |
| `ProjectIndex` | Index avec aperçu (P3) | Remplace la liste actuelle des projets P3 |
| `Bib` | Dossard objet (couverture et dos) | Étend le `Bib` existant |
| `Coupon` | Habillage du formulaire de contact | Enveloppe le `ContactForm` existant sans changer sa logique |
| `CountUp` | Existant, conservé | — |

**Fonctions pures testées** : altitude et D+ cumulé à un km donné à partir de `PROFILE` (D+ = somme des montées), génération des courbes de niveau, choix du pointage actif.

## 9. Performance et accessibilité

- **Budget JS** : la refonte n'ajoute aucune dépendance, pas de bibliothèque d'animation (CSS, WAAPI, rAF). L'hydratation incrémentale `@defer (hydrate on viewport)` reste.
- **Courbes de niveau** : SVG calculé au build ou côté serveur, un seul chemin par niveau, pas de filtre.
- **Photos** : AVIF, WebP et JPEG déjà générés, `width`/`height` posés, chargement différé sauf pour le portrait de la couverture.
- **Bandeau** : un seul écouteur de scroll passif et rAF ; il écrit `transform` directement sur l'élément, pas une variable CSS héritée.
- **Accessibilité** : le bandeau est une `nav` « Parcours » avec une liste de liens ; les valeurs en direct sont dans un `aria-live="off"` (pas de bavardage), avec un résumé lisible à chaque pointage. Les sticky ne masquent jamais le focus (`scroll-padding`).

## 10. Vérification

À chaque tranche :
- tests Vitest et E2E Playwright avec axe ;
- `lint.mjs`, `inspect.mjs` et `scenes.mjs` de taste-skill à 1440, 768 et 390 px, captures relues ;
- `impeccable detect` sur les fichiers modifiés ;
- Lighthouse en local ;
- captures ordinateur et téléphone envoyées à Enzo.

À la fin : passe de finition impeccable, réécriture de DESIGN.md par le documenteur, puis relecture d'Enzo avant toute fusion dans `main`.

## 11. Découpage en tranches (fusionnées dans `redesign/v4`, pas dans `main`)

1. Système : jetons (terrains, échelle), `ContourField`, `ChapterPin`, coupes de terrain.
2. `TrackingBand` et `CheckpointPlate` (la signature), road book mobile branché.
3. Départ et `Bib` objet.
4. P1, P2 et R1/R2 avec `PhotoPlates`.
5. P3 `ProjectIndex`.
6. Journal sorti du repli, colonne alignée sur la décimale.
7. Arrivée : ligne d'arrivée et `Coupon`, pied de page « dos du dossard ».
8. Pages projet et View Transitions.
9. Finition : audit, Lighthouse, DESIGN.md, relecture d'Enzo.

## 12. Hors périmètre

Pas de nouveau contenu inventé (témoignages, logos, chiffres hors CV), pas de changement côté back (sauf un éventuel champ de temps de passage si Enzo les fournit), pas de migration de framework, pas de son ni de 3D.

## 13. Décisions ouvertes (pour Enzo)

1. **Temps de passage officiels** P1, P2 et P3 du GTA 2025 (site des résultats ou montre). Sans eux, pas de chrono intermédiaire.
2. **Photos** : pour P2 et P3, en as-tu d'autres que celles de `frontend/public/img/` (équipe, lieu, course) ? Sinon, on utilisera des captures d'interface réelles et des photos de course.
3. **Projets d'école en P1** : on les regroupe dans un index dense (recommandé) ou on les retire ?

## 14. Risques

- **Trop d'effets au total** : chaque tranche est relue à l'aune de la règle « un seul système de mouvement ». Tout ce qui n'oriente pas, ne récompense pas ou ne donne pas de feedback est retiré.
- **Performance mobile** : le bandeau et les révélations sont mesurés à chaque tranche ; si Lighthouse passe sous 90, on retire avant d'optimiser.
- **Direction tirée par taste-skill** (« la page est l'objet », sceau 212362163) : on garde l'idée de l'objet (dossard, road book, coupon, dos) et l'index avec aperçu. Les dossiers à onglets de sa couverture sont remplacés par le dossard, qui est l'objet propre au sujet.
