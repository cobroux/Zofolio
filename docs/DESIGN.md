# DESIGN.md — Portfolio d'Enzo Leveque, « La Course » v4 (« Grand reportage en direct »)

Document écrit après coup, depuis le site construit sur `redesign/v4` (vagues 1 et 2). Les valeurs viennent de `frontend/src/styles/tokens.css`, `styles.css` et des composants ; quand la spec (`docs/superpowers/specs/2026-11-02-redesign-v4-design.md`) et le code diffèrent, le code gagne.

Idée : **le road book et le suivi en direct du Grand Trail d'Auvergne 2025 (dossard 1592, profil réel de 79,4 km) sont la mise en page et la navigation.** Le dossard est la couverture, chaque étape de carrière est un chapitre en champ de couleur plein, un bandeau fixe en bas suit la lecture jusqu'à l'Arrivée. La métaphore structure sans jamais masquer le contenu.

## 1. Principes et liste anti-slop

### On fait
- Un champ de couleur plein par chapitre (§3, terrains), coupe franche entre deux chapitres, jamais de fondu.
- Le contenu d'abord : chaque section répond à une question d'un tech lead (qui, quoi, preuve, contact).
- Chiffres traités comme des données : tabulaires, vrais textes (SSR), jamais décoratifs ni inventés.
- Humour sec en petit, une touche par section au plus. Phidippides une seule fois, sous le formulaire de l'Arrivée.
- Un seul accent (orange). Trois signatures (§6) : bandeau de suivi, dossard, index P3 avec aperçu.
- Photos réelles, grandes, angles droits, posées en plaques (§6).

### On interdit
- Dégradés (fonds, boutons, texte), glow, ombres (aucun `box-shadow` ni `text-shadow` dans le code), verre/flou d'arrière-plan, pilule flottante.
- Monospace hors vrai bloc de code. Eyebrows, pastilles « New », MAJUSCULES espacées (aucun `text-transform`, aucun interlettrage positif), numérotation 01/02/03 décorative. Les repères P1/P2/P3 et « km 58,2 » sont du contenu.
- Filets décoratifs et grilles visibles : on sépare par espace ou changement de ton. Exceptions : courbes de niveau (SVG statique, `aria-hidden`, opacité 0,06 clair / 0,08 sombre) et tracé du profil (c'est la donnée).
- Grilles de 3 cartes identiques, coins arrondis (0 partout ; seuls les points ronds du bandeau et les trous du dossard sont des cercles), avatars générés, blobs, emoji, mockups de dashboards.
- Violet/indigo, néon, vert « fitness », anneaux d'activité. Classements, tracés GPS, cartes de chaleur. UTMB Index (459) cité comme un chiffre, jamais en classement.
- Mot accentué dans un titre. Phrases creuses (« passionné », « solutions innovantes ») : remplacer par un fait chiffré.
- Animer : voir §7.

### Ton
Sérieux, factuel. Pas de tutoiement ; « je » sobre.

## 2. Typographie

Deux familles OFL, auto-hébergées en WOFF2 variable (`styles/fonts.css`), `font-display: swap`, replis ajustés (`Archivo Fallback` : ascent 87,8 %, descent 21 % ; `Source Sans 3 Fallback` : `size-adjust` 92 %, ascent 111 %, descent 43 %). Préchargées : `/fr/fonts/archivo-latin.woff2` et `/fr/fonts/source-sans-3-latin.woff2`.

| Rôle | Jeton | Valeur |
|---|---|---|
| Display | `--font-display` | `archivo, 'Archivo Fallback', 'Arial Narrow', 'Helvetica Neue', sans-serif` (axes wght 400–900, wdth 62–100 %) |
| Texte | `--font-text` | `'Source Sans 3', 'Source Sans 3 Fallback', system-ui, sans-serif` (wght 400–700) |

Titres `h1`–`h3` globaux : Archivo 800, `font-stretch: 72%`, interlettrage -0.02em, interligne 0.9. Corps : Source Sans 3 400, interligne 1.5, `lining-nums`. Mesure `--measure: 62ch`.

### Échelle (jetons)
| Jeton | Valeur | Usage |
|---|---|---|
| `--t-display` | clamp(3rem, 9vw, 8rem) | h1 / h2 par défaut |
| `--t-lead` | clamp(1.375rem, 2.2vw, 1.75rem) | chapôs |
| `--t-body` | clamp(1.0625rem, 1vw + 0.8rem, 1.1875rem) | texte courant |
| `--t-small` | 0.9375rem (15 px) | légendes, notes, splits |

Tailles locales réellement utilisées (toutes en Archivo sauf mention) : nom du Départ `15vw` (<768) puis `10vw`, 2 lignes max ; numéro P1/P2 du chapitre épinglé `clamp(5rem, 12vw, 11rem)` wdth 62 % (compact : `clamp(2.5rem, 5vw, 4rem)`) ; chrono de l'Arrivée `clamp(2.75rem, 12cqi, 7rem)` ; titres Journal et Endurance `clamp(3rem, 7vw, 6rem)` ; lignes de l'index P3 `clamp(2.5rem, 7vw, 5.5rem)` ; « km 58,2 » `clamp(1.75rem, 4vw, 2.5rem)` ; 459 `clamp(4rem, 8vw, 6rem)` ; valeurs d'endurance `clamp(2.25rem, 13vw, 4.5rem)`, puis `clamp(2.5rem, 5vw, 4.5rem)` dès 768 px ; études : h2 `clamp(2.25rem, 5.5vw, 4.5rem)` (`clamp(2.25rem, 3.3vw, 3.25rem)` en colonne dès 1100), h3 `clamp(1.5rem, 2.4vw, 2rem)`, numéro d'étape du dossard de segment `clamp(2.5rem, 5vw, 3.75rem)` wght 900 wdth 62 %.

### Chiffres
- `.tnum` = `tabular-nums lining-nums`, posé sur splits, tableaux, bandeau, dossard, compteurs, `dd` des fiches.
- Format par locale (`@@numberLocale`, `fr-FR` / `en`) : `79,4 km`, `13 h 35 min 53 s` (`formatDuration`), milliers groupés par la locale. Un champ absent s'écrit « — », jamais 0.
- Titres en sentence case ; aucune capitale forcée.

## 3. Couleur et terrains

Un fond, une encre, un accent. Surfaces séparées par pas de ton. Chaque terrain redéfinit tout son jeu de jetons ; mêmes valeurs dans `styles/tokens.css` et `shared/terrain/terrain.ts` (un test calcule les contrastes : encres et accent/on-accent ≥ 4,5:1, focus et accent sur fond ≥ 3:1).

### Racine (jetons du thème)
| Jeton | Clair « Jour de course » | Sombre « Départ 6h30 » | Rôle |
|---|---|---|---|
| `--bg` | #f6f3ec | #0e1626 | fond |
| `--surface` | #ece8de | #16213a | bandes, cartes, encadrés |
| `--ink` | #14161a | #edeff4 | texte |
| `--ink-2` | #4a4d55 | #a9b1c3 | légendes, notes |
| `--accent` | #c2410c | #ff8a2b | CTA, chiffres-clés, tracé parcouru |
| `--on-accent` | #ffffff | #0e1626 | texte sur accent |
| `--line-muted` | #8a8d94 | #5b6b8c | tracé restant, contours de champs |
| `--focus` | #14161a | #edeff4 | anneau de focus |

Le sombre s'applique par `prefers-color-scheme` (si `data-theme` n'est pas `light`) ou par `data-theme='dark'`.

### Terrains de chapitre (classes `.terrain-*`)
| Terrain | bg clair | bg sombre | surface clair / sombre | ink, accent, on-accent |
|---|---|---|---|---|
| `night` | #0e1626 | #0e1626 | #16213a / #16213a | #edeff4, #ff8a2b, #0e1626 (identiques dans les deux thèmes) |
| `paper` | #f6f3ec | #16203a | #ece8de / #1e2b4a | clair : #14161a, #c2410c, #ffffff ; sombre : #edeff4, #ff8a2b, #0e1626 |
| `deep` | #0a1120 | #0a1120 | #16213a / #16213a | comme `night` |
| `accent` | #c2410c | #ff8a2b | #9a3412 / #ffb36b | clair : ink #ffffff, ink-2 #ffffff, accent #ffffff, on-accent #c2410c ; sombre : ink #0e1626, ink-2 #0e1626, accent #0e1626, on-accent #ff8a2b |

`--line-muted` vaut #5b6b8c dans `night`, `deep` et `paper` sombre, #8a8d94 dans `paper` clair ; `accent` ne le redéfinit pas.

Attribution (code) : Départ = `night` ; P1 = `paper` ; P2 = `deep` ; P3 = `accent` ; Arrivée = `night` ; bandeau de suivi = `night` dans les deux thèmes. Ravitaillements R1/R2 (`Aid`) et Journal : fond `--surface` du thème racine (pas de classe terrain). Études de cas, colophon, pied de page : jetons racine.

### Règles
- Orange = actions, valeur du km, point courant, trace parcourue, numéros de chapitre, record personnel. Sur `accent`, l'accent s'inverse (blanc / nuit) : texte toujours `--ink`.
- Liens courants : encre soulignée (offset 3 px), `--accent` au survol (pointeur fin). Focus : `outline: 3px solid var(--focus)`, offset 2 px.
- Aucune information portée par la seule couleur (PR : étoile SVG + texte « Record personnel »).
- Le dossard et le dos du dossard sont imprimés : couleurs fixes #f6f3ec / #14161a dans les deux thèmes.

## 4. Grille, espacement, breakpoints

- Base 8 px. `--s-1` 4, `--s-2` 8, `--s-3` 12, `--s-4` 16, `--s-5` 24, `--s-6` 32, `--s-7` 48, `--s-8` 64, `--s-9` 96, `--s-10` 144, `--s-11` 200.
- `--margin` / `--gutter` : 16 / 16 px ; dès 768 px 24 / 24 ; dès 1100 px marge 32 (gouttière 24). Cible tactile `--target: 44px`.
- Breakpoints (min-width) : sm 480, md 768, lg 1100, xl 1440 ; le Journal passe en bureau à 1280 px.
- Grille 12 colonnes dès 1100 px (Départ : texte col. 1–7, plaque col. 8–12 ; P1 : pin 1–3, corps 4–8, aside 9–12 ; P2 : pin 1–4, scène 5–fin ; Arrivée : texte 1–7, formulaire 8–12). Contenu des études : `.wrap` max 1440 px, h2 col. 1–3, texte col. 4–11.
- Coins carrés. `min-height: 100svh` pour le Départ seulement.
- Saut d'ancre : `scroll-padding-bottom: 92px` (bandeau), `scroll-padding-top: 64px` sous 768 px (barre de chapitre) ; `body` reçoit `padding-bottom: 52px` quand le bandeau est présent (WCAG 2.4.11).

## 5. Composition, section par section

Ordre et ids : `#depart`, `#p1`, `#p2`, `#p3`, `#journal`, `#arrivee` (les cinq points du suivi sont `depart`, `p1` 20 km, `p2` 44 km, `p3` 58,2 km, `arrivee` 79,41 km ; `TOTAL_KM` = 79,41).

- **Départ** (`night`, `min-height: 100svh`, courbes de niveau 12 niveaux) : h1 « Enzo / Leveque » (deux lignes sous 768 px), titre en `--t-lead` 600, ligne de preuve en `--ink-2`, CTA « Télécharger le CV » (aplat `--accent`, 48 px de haut) et « Me contacter » (lien `#arrivee`). À droite dès 1100 px, portrait 4:5 (AVIF/WebP/JPEG, `fetchpriority="high"`, 1200×1600) avec le dossard qui chevauche son bas. CTA visibles sans scroll.
- **P1 · Les fondations** (`paper`, km 20) : pin compact, bloc master, frise de diplômes (segments de 6 px de haut, longueur proportionnelle à la durée, dernier segment en accent), tampon rond du badge de promo (rotation -8°), plaque photo de promo, ligne d'index des projets d'école, note GR3. Suivie du ravitaillement R1.
- **P2 · Worldline** (`deep`, km 44) : pin sticky à gauche (barre de 48 px sous 768 px), chapô, cinq faits, encadré Décision (§6), lien vers l'étude. Suivie de R2.
- **P3 · Nés de la course** (`accent`, km 58,2) : en-tête « P3 · km 58,2 » + h2, puis index P3 avec aperçu (§6).
- **Journal** (fond `--surface`) : « L'endurance, deux fois » (km courus et contributions par année depuis 2023, barres `transform: scaleX`, série absente = « — »), puis intro, UTMB Index 459, trois dernières courses, plaque nocturne du club, photo finisher ; le reste (graphe de contributions, autres courses) est replié dans un `<details>`. Tableau de courses sous 1280 px : une fiche par course.
- **Arrivée** (`night`) : h2 = chrono officiel `13 h 35 min 53 s` (`<time datetime="PT13H35M53S">`, une seule fois à cette taille), tableau des pointages officiels, contact (e-mail, CV, LinkedIn, GitHub), formulaire, phrase Phidippides, dos du dossard (colophon vivant : commit, déploiement, CI, stack ; une ligne n'existe que si sa donnée existe).
- **Ravitaillement** (`Aid`) : bande `--surface`, « Ravito · km N » en Archivo 800 2.25rem, un fait + une note. Hors profil.
- **En-tête** : lien d'évitement (premier focusable), wordmark « E. Leveque » (Archivo 800 1.5rem), lien de langue (autre locale, 44 px), bascule de thème. **Pied de page** : `--surface`, GitHub, LinkedIn, Colophon, Mentions légales.

## 6. Composants et signatures

### Signature 1 : bandeau de suivi (`TrackingBand`)
- Fixe en bas, 52 px (76 px quand la ligne de pointage est ouverte), `terrain-night` dans les deux thèmes. Hôte de `RoadBook`.
- Valeurs en direct à la position de lecture (ligne de référence à `innerHeight / 3`) : km au dixième (Archivo 800 30 px, orange), altitude, D+, dernier passage officiel ; jamais de temps interpolé. Tout vient du vrai profil (`profile.data.ts`, fonctions pures de `course-progress.ts`) ; lien « Comment c'est calculé » vers le dépôt (dès 1100 px). Valeurs `aria-hidden` ; largeurs réservées (`min-width` en `ch`) pour que rien ne saute.
- Tracé : un `<path>` (viewBox 1000×100, `non-scaling-stroke`), restant `--trail` #5b6b8c 1.5 px, parcouru `--accent` 2.5 px via `clipPath` dont le masque est écrit en `transform: scaleX(p)`. Point courant 10 px (bordure #0e1626 2 px). Pointages P1/P2/P3/Arr. : liens d'ancre 44 px avec point de 6 px à l'altitude réelle, `aria-current="location"` sur l'actif.
- Infobulle (pointeur fin) : papier #f6f3ec / #14161a, `scale(0.97)` + opacité 150 ms `--ease-out`, délai 300 ms au premier survol puis 0 entre voisins.
- Ligne de pointage : 24 px qui glisse de derrière le bandeau, une fois par étape et par session (`sessionStorage`), visible 2400 ms, entrée 320 ms, sortie 180 ms ; annoncée par une région `aria-live="polite"`.
- Sous 768 px : km + tracé + bouton « Parcours » (avec JS) qui ouvre le road book ; sans JS, les liens d'ancre restent.

### Road book (`RoadBook`)
`<dialog>` plein écran (`100dvh`), fond `--bg`, focus piégé, `Esc`, retour du focus au déclencheur. Valeurs en direct, puis les cinq étapes (km, nom, ligne) en ancres, bordure gauche 4 px `--line-muted`, `--accent` pour l'actuelle. Entrée 220 ms, sortie 160 ms, `translateY(12px)` + opacité (`@starting-style`).

### Signature 2 : dossard (`Bib`)
Rectangle 5:3 papier #f6f3ec / #14161a, **hôte conteneur** (`cqi`), quatre trous d'épingle découpés en `clip-path` evenodd (cercles de rayon ~1,2 % aux coins). Face avant : « 1592 » Archivo 800 `34cqi` wdth 62 %, interligne 0.8, puis « Grand Trail d'Auvergne · 79,4 km · départ 6 h 30 » en `max(0.8125rem, 3.6cqi)` 600 ; `aria-hidden` sur le numéro (le h1 porte le nom). Face arrière (`face="back"`) : contenu projeté, colophon vivant (`LiveColophon`, `max(0.8125rem, 2.9cqi)`). Largeur réglée sur l'hôte (Départ : `clamp(260px, 64%, 360px)` ; 72 % dès 1100 px). Version « segment » des études : voir §8.

### Signature 3 : index P3 avec aperçu (`ProjectIndex`)
Une ligne par projet P3 en très grand titre (Archivo 800 `clamp(2.5rem, 7vw, 5.5rem)` wdth 72 %), `<h3>` dont le lien couvre toute la ligne (étude de cas, sinon dépôt), méta tabulaire (stack · commits), pitch, lien « Code ». Ligne active ou survolée : soulignée (0.06em), sans déplacement et sans atténuer les autres. Dès 768 px **avec pointeur fin et survol** : grille 7fr / 5fr, cadre d'aperçu sticky (`top: --s-9`, 16:10, fond #0e1626), fondu enchaîné 240 ms `--ease-out` ; la vidéo ne monte que si `motion && engaged && onScreen` (survol ou focus, à l'écran, hors mouvement réduit / `saveData` / 2g), sinon le poster. Ligne sans média : le cadre s'efface (opacité 0). Sans pointeur fin ou sous 768 px : pas de cadre, poster ou `Clip` en ligne, vidéo seulement au bouton. Source des posters : `video.poster`, sinon capture réelle (`gfaim-shot-1.png`).

### Plaques photo (`PhotoPlates`)
Plaque principale + encart optionnel (55 % de large, à droite), légende 0.875rem `--ink-2`. Variante `ui` : capture ou schéma projeté en `[plate-ui]` à la place d'une image. Révélation une fois : `clip-path: inset(0 100% 0 0)` vers rien, 600 ms `--ease-io`, encart +80 ms. Sans JS (`html.js` absent) l'image est visible.

### Autres composants
- **Chapitre épinglé** (`ChapterPin`) : repère (P1, P2), `h2` titre Archivo 700 1.5rem, méta tabulaire. Sticky (`top: 6rem`) ou compact ; sous 768 px, barre opaque de 48 px (`z-index: 5`).
- **Encadré Décision** (`DecisionCard`) : `--surface`, padding 32 px, h3 orange `clamp(2rem, 4vw, 2.75rem)`, `dl` Problème / Options / Choix / Résultat ; **une rubrique vide est retirée, jamais remplie** ; deux colonnes (8rem + reste) dès 600 px.
- **Split** (`Split`) : une ligne `durée · stack · commits · langages · dernier push`, `--t-small`, `--ink-2` (ou `--split-ink`), tabulaire ; note optionnelle dessous. Format via `Intl` de la locale.
- **Clip** (`Clip`) : `aspect-ratio` = celui de la vidéo (16:10 en paysage), affiche puis `@defer (on viewport; on interaction)`, `<video muted loop playsinline preload="none" poster>`. Bouton « Lecture » / « Pause » 44×96 px minimum (fond `--ink`, texte `--bg`) **sous** le cadre, toujours visible. Lecture auto à 50 % dans le viewport, pause en dehors, jamais sous reduced-motion, `saveData` ou 2g ; un clic est toujours honoré ; fichier absent : « Démo vidéo à venir ».
- **Courbes de niveau** (`ContourField`) : statique, `z-index: -1`, trait `--ink` 1.5 px, tracées depuis le profil réel.
- **Bascule de thème** : bouton 44×44, trois états système → clair → sombre (`data-theme`, `localStorage` clé `theme` en `try/catch`), appliquée avant le rendu par le script inline de `index.html`. **Bascule de langue** : lien `hreflang` vers l'autre préfixe de locale, chemin et section active conservés (rechargement).

## 7. Mouvement

Principe : le mouvement sert l'orientation et le retour d'action. Propriétés animées : `transform`, `opacity`, `clip-path` ; jamais `transition: all`, jamais `ease-in`. Courbes : `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`, `--ease-io: cubic-bezier(0.77, 0, 0.175, 1)`. `will-change` uniquement sur le masque du tracé du bandeau.

| Mouvement | Propriété | Durée, courbe | Mouvement réduit |
|---|---|---|---|
| Trace et point du bandeau | `transform` écrit par rAF depuis le scroll | aucune transition, suit le scroll | identique (saute) |
| Ligne de pointage | `transform: translateY` | entrée 320 ms, sortie 180 ms, `--ease-out` ; ouverte 2400 ms | affichée sans déplacement |
| Infobulle de pointage | opacité + `scale(0.97)` | 150 ms `--ease-out`, délai 300 ms puis 0 | `transition: none` |
| Entrée des blocs (`Reveal`) | opacité + `translateY(16px)` | 320 ms `--ease-out`, +60 ms par rang (`--i`, 0 à 3), une fois, marge -80 px | état final immédiat, rien de caché |
| Plaques photo | `clip-path` | 600 ms `--ease-io`, encart +80 ms | fondu 160 ms `linear` |
| Aperçu de l'index P3 | opacité | 240 ms `--ease-out` | aucune transition |
| Endurance (`CountUp`) | texte + `--p` des barres | 700 ms par année (`STEP_MS`), freinage cubique, années l'une après l'autre | valeurs finales du SSR |
| Road book | opacité + `translateY(12px)` | entrée 220 ms, sortie 160 ms, `--ease-out` | fondu 120 ms, sans translation |
| Appui bouton, CTA, lien de pointage, étape du road book | `transform: scale(0.97)` à `:active` | 140 ms `--ease-out` | `transition: none` (CTA du Départ) ou durée 0.01 ms (règle globale) |
| Survol lien | `color` | immédiat | — |

### Transition de page : fondu de 200 ms
`withViewTransitions` (Angular Router) : `::view-transition-old(root)` et `::view-transition-new(root)` à `animation-duration: 200ms`, `--ease-out`. **Sautée à la navigation initiale** (`skipInitialTransition: true`) et **sautée en `prefers-reduced-motion`** (`onViewTransitionCreated` appelle `skipTransition()`). La bascule de thème utilise `startViewTransition` sauf mouvement réduit (changement direct).

### Garanties
- **Mouvement réduit** : règle globale `animation-duration: 0.01ms`, `transition-duration: 0.01ms`, une itération ; `Reveal` montre l'état final ; `CountUp` n'agit pas ; plaques en fondu 160 ms ; `scroll-behavior: smooth` seulement hors reduced-motion ; vidéos jamais lancées seules ; fondu de page sauté.
- **Sans JS** : le script inline pose `html.js` ; sans lui tout est visible (`.reveal`, plaques). Le bandeau est une navigation de liens d'ancre (le bouton « Parcours » et le road book n'apparaissent qu'avec JS). Le formulaire de contact est masqué (il enverrait le message dans l'URL) : seul son `<noscript>` reste. Le contenu complet est dans le HTML SSR.
- **Pas animé** : focus et navigation clavier, texte courant, chiffres du dossard, changement de langue, courbes de niveau, coupes de terrain, tout ce qui se produit plus de ~5 fois par session. Pas de parallaxe, de scroll-jacking, de curseur ni de particules.

## 8. Études de cas (`projets/:slug`, `CaseStudyView`)

Page sur jetons racine, plus sobre que l'accueil : pas de bandeau ni de terrain, un seul `h1`.

**Hero** : lien « ← Retour au parcours (P3 · km 58,2) » (ancre de l'étape), titre `h1`, chapô `--t-lead` (28ch), dossard de segment, puis clip (paysage : pleine largeur sous le hero ; portrait : sous le pitch ou entre pitch et dossard dès 1100 px, 340 px max) ; Worldline : logo, et la frise des 2,5 ans (`WorldlineTimeline`, filet vertical 2 px, bornes carrées orange 12 px, entrée par `Reveal`) à la place du clip.

**Dossard de segment** (`aside`, `aria-label="Fiche du projet"`) : `--surface`, quatre trous ronds de 12 px `--bg`, étape « P3 · km 58,2 » Archivo 900 wdth 62 % orange, `dl` (Durée, Rôle, Commits, Langages, Dernier push, Stack ; libellé `--ink-2`, valeur 600 tabulaire à droite). **Une valeur `null` retire sa ligne**, sans tiret. Note « Commits et langages : synchro GitHub, 6 h. ».

**Rubriques, dans cet ordre** (chacune `<section>` avec `h2`, `appReveal` sauf Architecture et Code) :
1. Contexte et contraintes (toujours ; paragraphe problème + paragraphe « mur » s'il existe)
2. Décision et alternative écartée (si décisions ; première en pleine mesure, les suivantes côte à côte dès 1100 px ; `h3` + « Compromis : »)
3. Architecture (schéma inline, titre `diagramTitle(slug)`)
4. Ce que j'ai porté
5. Résultat
6. Ce que je referais
7. Code (dépôts, démo, « Revoir le clip »)

Puis le CTA « Me contacter » (aplat `--accent`, vers `#arrivee`). **Une rubrique sans contenu (texte vide ou `null`) est retirée de la page, jamais remplacée par un texte de remplissage ni un titre vide.** Fiche courte ou slug inconnu : 404 ; API en échec : 503 avec `Retry-After: 30`, pas de `noindex`.

**Schémas** (`diagram.css`, style « relais ») : cadre `--surface`, nœuds `--bg`, texte `--ink` 600 15 px et `--ink-2` 15 px, flèches `--ink` 2 px, optionnel en pointillé `6 5`, **un seul nœud fragile en aplat `--accent`** (texte `--on-accent`, flèche orange 3 px). Deux gabarits : horizontal (conteneur ≥ 950 px, viewBox 900) et vertical (max 360 px), un seul visible. Aucune animation.

## 9. Photos et médias

- Portrait du Départ : AVIF/WebP/JPEG, 480/800/1200 px, `width`/`height` renseignés, `object-position: center 20%`, pas de lazy-loading (LCP). Autres images : `loading="lazy" decoding="async"`, alt factuel, `alt=""` pour les affiches de clip (la légende nomme le contenu).
- Pas de filtre coloré, de duotone, de grain, de bord arrondi (le tampon du badge de promo, découpé à son cercle, est un objet).
- Vidéo : 15–30 s, boucle muette, MP4 puis WebM, affiche dans les deux cas, ≤ 2,5 Mo. Aucun tracé GPS, aucune carte de parcours.

## 10. Admin (`/fr/admin`, inchangé en v4)

Vérifié contre `features/admin/` : mêmes jetons racine, mêmes polices, `noindex`, FR seul. Pas de bandeau, de terrain ni de signature.

**Principe** : un outil, pas une vitrine. Pas de dossard, pas de profil, pas de mouvement signature, pas de sections en aplat orange. L'admin est une page `--bg` avec des bandes `--surface` ; la sobriété vient de la densité (interligne 1.4, espaces 8/16/24) et non d'une autre palette. Thème clair et sombre comme le site (même bascule), `noindex`.
- **Cadre** : en-tête de 64 px (wordmark « Zofolio admin » en Archivo, liens Projets · Courses · Stats · Médias en 600 `--t-small`, Déconnexion à droite, chaque cible 44 px). Contenu en une colonne de 1100 px max. Titres de page en Archivo 800, `clamp(2rem, 4vw, 3rem)` (pas `--t-display` : l'admin ne crie pas).
- **Connexion** : un seul champ « Mot de passe », un bouton primaire. Erreur sous le champ (texte + icône, `role="alert"`). `LOGIN_LOCKED` : « Trop d'essais. Réessayez dans N min » avec le `Retry-After` en minutes, bouton désactivé (`aria-disabled`, pas masqué).
- **Liste des projets** : vrai `<table>` : titre (lien), slug, niveau (`Étude de cas` / `Fiche` / `Masqué`), étape, ordre, mis à jour. Chiffres en `tnum`. Pas de zébrage ni de filets (grille visible, §1) : lignes séparées par l'espace (12 px), survol en `--surface`. Un `HIDDEN` est écrit « Masqué » et porte l'icône œil barré, pas seulement `--ink-2`. Bouton primaire « Nouveau projet » en haut à droite : **un seul CTA orange par écran**. Mobile : le tableau devient une pile (titre, puis `dl` slug/niveau/étape), pas de défilement horizontal.
- **Formulaire d'édition** : une section par groupe (Identité, Textes, Décisions, Dépôts, Clip, Référencement). Les champs traduisibles sont **FR à gauche, EN à droite** (deux colonnes ≥ 900 px, empilés FR puis EN en dessous, chaque colonne titrée « Français » / « English » en `<h3>`, `lang` posé sur chaque champ). Label au-dessus du champ (jamais placeholder seul), aide en `--t-small` `--ink-2`, compteur « 112 / 120 » en `tnum` quand la limite est proche (≥ 80 %). Champs : fond `--bg`, contour 1 px `--line-muted` (UI ≥ 3:1), focus = anneau 3 px du site. Slug en lecture seule après création (« Immuable »). Barre d'actions collante en bas : **Aperçu FR**, **Aperçu EN** (secondaires, contour encre), **Enregistrer** (orange, = publier ; libellé « Enregistrer et publier » tant que le niveau n'est pas `Masqué`). Un projet `Masqué` affiche « Non publié » dans la barre.
- **Aperçu** : panneau plein écran qui rend le vrai gabarit `CaseStudyView` ; bandeau haut `--ink` inversé « Aperçu · FR · non enregistré », bouton Fermer (`Esc`) ; le focus revient au bouton d'origine. **Limite connue** : l'admin est en FR seul (D39) et les libellés fixes du gabarit (titres de sections, boutons) sont compilés en français ; l'« Aperçu EN » ne traduit que les textes du projet, pas ces libellés. Le rendu EN complet se vérifie sur `/en/projets/<slug>` après l'enregistrement.
- **États d'erreur par `code`** (texte clair, jamais le `detail` anglais) :
  | `code` | Où | Texte (FR) |
  |---|---|---|
  | `VALIDATION_FAILED` | sous le champ de `errors[].field`, bloc récapitulatif en tête (`role="alert"`, liens vers chaque champ) | « Titre : 120 caractères maximum. » |
  | `UNAUTHENTICATED` | redirection vers la connexion, brouillon du formulaire gardé en mémoire de page (jamais `localStorage`) | « Session expirée. Reconnectez-vous. » |
  | `LOGIN_LOCKED` | connexion | voir plus haut |
  | `SLUG_TAKEN` / 409 | sous le champ slug | « Ce slug existe déjà. » |
  | `MEDIA_REJECTED` / refus d'upload | sous la zone d'upload | raison traduite : type, taille, métadonnées interdites |
  | `MEDIA_IN_USE` / 409 | dialogue de suppression | « Utilisé par : oltre, gfaim. Retirez-le d'abord. » |
  | `NOT_FOUND` | page | « Introuvable. Retour à la liste. » |
  | `INTERNAL_ERROR` / réseau | bandeau en tête | « Erreur du serveur. Rien n'est perdu : réessayez. » |
  Une erreur = texte + icône + bordure 2 px `--accent` du champ ; jamais la couleur seule. Pas de toast qui disparaît (les messages restent jusqu'à action).
- **Zone d'upload** (Médias, clip) : bloc `--surface`, bordure 2 px **pleine** `--line-muted` (pas de pointillés « dropzone » : décor), grande cible, texte « Choisir un fichier » (bouton, clavier d'abord) et « ou déposez-le ici ». Contraintes écrites en clair avant l'envoi (« JPEG, PNG · 5 Mo max · MP4 · 2,5 Mo max · métadonnées retirées », alignées sur `MediaService` : 5 Mo image, 2,5 Mo MP4 ; pas de WebP en envoi). Envoi : barre de progression d'un trait de 4 px `--accent` + pourcentage en `tnum` (`role="progressbar"`) ; succès : nom, dimensions, poids, « Utilisé par : — ». Sous reduced-motion, la barre avance sans transition.
- **Mouvement** : aucun, hors `scale(.97)` à `:active` des boutons (140 ms, §7) et fondu 120 ms de l'aperçu. Pas de squelette animé : « Chargement… » en texte.
- **Médias** : liste en tableau (miniature 48 px carrée, nom, dimensions, poids `tnum`, `usedBy`, Supprimer). Suppression = dialogue de confirmation, focus piégé, bouton par défaut « Annuler ».

### Checklist admin
- [ ] Admin : zéro couleur/police hors tokens ; un seul bouton orange par écran ; aucun dégradé, ombre, verre, filet décoratif, zébrage ; coins carrés.
- [ ] Admin : FR et EN côte à côte ≥ 900 px, empilés en dessous, `lang` par champ ; labels visibles ; compteurs `tnum`.
- [ ] Admin : chaque `code` d'erreur a un texte FR, une icône et une position ; erreur jamais portée par la couleur seule ; focus placé sur le récapitulatif après un échec.
- [ ] Admin : upload au clavier ; contraintes écrites avant l'envoi ; refus expliqué en clair ; suppression avec confirmation et `usedBy`.
- [ ] Admin : `noindex`, aucune donnée en `localStorage`, aucun `innerHTML`.

## 11. Checklist de revue v4

- [ ] Bandeau : valeurs du km, trace et point calculés depuis le profil réel ; liens d'ancre sans JS ; ligne de pointage une fois par étape et par session ; rien ne passe sous le bandeau au focus (92 px).
- [ ] Terrains : coupe franche, aucun fondu entre chapitres ; chaque paire texte/terrain ≥ 4,5:1 en clair et en sombre ; sur `accent`, texte blanc (clair) ou nuit (sombre).
- [ ] Dossard : trous en `clip-path`, `cqi`, `aria-hidden` sur le numéro ; dos = colophon vivant, lignes sans donnée omises.
- [ ] Index P3 : survol et focus identiques ; vidéo seulement en survol/focus à l'écran ; aucun aperçu ni téléchargement vidéo sans pointeur fin.
- [ ] Études : ordre des rubriques respecté, rubrique vide retirée, ligne `null` du dossard de segment omise, un seul nœud orange par schéma.
- [ ] Mouvement : seules `transform`, `opacity`, `clip-path` ; aucun `transition: all`, aucun `ease-in` ; reduced-motion : état final, fondu de page sauté ; navigation initiale sans fondu.
- [ ] Sans JS : tout le contenu lisible, bandeau en liens d'ancre, formulaire remplacé par son `<noscript>`.
- [ ] Un seul accent, zéro dégradé, ombre, verre, eyebrow, monospace, numérotation décorative ; titres ≤ 2 lignes à 320, 390, 768, 1440 px ; texte ≥ 15 px ; cibles ≥ 44 px.
- [ ] Lighthouse mobile ≥ 90 perf, ≥ 95 accessibilité / bonnes pratiques / SEO ; axe-core sans violation en clair, sombre, FR, EN.

## 12. Écarts constatés dans le build, non érigés en règle

Présents dans le code, à ne pas reproduire sur de nouvelles surfaces ni à lire comme des décisions du système :
- Filets de 1 px entre lignes des tableaux de courses (`--line-muted`) et des pointages de l'Arrivée (`--ink` à 25 %), filet vertical de 2 px de la frise Worldline, bandes de 6 px de la frise de diplômes P1 : relèvent de la donnée tabulaire ou de la frise, mais contredisent la règle « pas de filet » du §1.
- `filter: brightness(1.08)` au survol du CTA primaire du Départ (`start.section.css`) : hors liste des propriétés animées du §7.
- Le colophon (`/colophon`) garde la structure v3 (aplats `--ink`, `--surface`, `--accent` de page entière sur jetons racine, et non les terrains v4) et n'utilise ni bandeau ni signatures.

## 13. Vérifications non faites

Contrastes non recalculés ici (repris des tests de `terrain.ts`) ; captures de `.superpowers/sdd/2026-11-03-redesign-v4-vague-2/captures/` et site local non rouverts pour cette rédaction (valeurs lues dans le code).
