# DESIGN.md — Portfolio d'Enzo Leveque, « La Course »

Direction : affiche de course / magazine sport haut de gamme. Une idée : **le scroll est la distance, et la page est le dossard 1592.** Tout ce qui suit sert à ce que la métaphore structure sans jamais masquer le contenu.

## 1. Direction artistique et principes

**Phrase d'idée :** le profil de dénivelé réel du Grand Trail d'Auvergne 2025 devient la barre de progression et le sommaire du site. Test concurrent : aucun autre portfolio n'a ce profil, ce dossard ni ces pointages.

**Signature :** le dossard (grand numéro 1592 en condensé gras, orange) + le profil de dénivelé fixe qui se remplit pendant le scroll.

### On fait
- Grands aplats de couleur par chapitre (papier, encre, orange), très gros titres condensés, texte courant en pleine encre.
- Le contenu d'abord : chaque section répond à une question d'un tech lead (qui, quoi, preuve, contact). La course habille, ne remplace pas.
- Chiffres traités comme des données (tabulaires, alignés) : durées, km, D+, commits.
- Humour sec en petit : splits ironiques, badges PR, notes de bas de page (« P2 : la plus longue étape. Ravito : badge d'accès. »).
- Clins d'œil histoire discrets, une fois chacun : Phidippides (sous le formulaire de l'Arrivée, phrase explicite : « Phidippides a couru de Marathon à Athènes pour porter un message. Ici, un formulaire suffit. »), voies romaines (note sur le GR3 dans P1).
- Un seul accent (orange). Un seul geste signature de mouvement (le profil).
- Photos réelles, grandes, cadrage constant, angles droits.

### On interdit (liste anti-slop)
- Dégradés (fonds, boutons, texte), glow, ombres au repos, verre/flou d'arrière-plan, pilule flottante de nav.
- Monospace hors vrai bloc de code (les chiffres sont tabulaires dans la police de texte).
- Eyebrows (petit label au-dessus d'un titre), pastilles « New », MAJUSCULES minuscules espacées, numérotation 01/02/03 décorative (les pointages P1/P2/P3 sont du contenu, pas de la déco).
- Filets de 1 px décoratifs, grilles visibles, repères de coupe. Séparer par espace ou changement de ton. Exception : courbes de niveau du fond (motif SVG très faible, aria-hidden) et le tracé du profil (c'est la donnée).
- Grilles de 3 cartes identiques à icônes, cartes arrondies douces 12 px, avatars générés, blobs, emoji, mockups de dashboards gris.
- Palette violet/indigo, crème jaunâtre + terracotta. Néon, vert fluo « fitness », anneaux d'activité.
- Mot accentué dans un titre (italique/couleur/souligné). Titre sur plus de 2 lignes à toute largeur.
- Classements, tracés GPS, cartes de chaleur de parcours. Citer UTMB index (459) comme un chiffre, jamais en classement.
- Phrases creuses : « passionné », « solutions innovantes », « de l'idée à la production ». Remplacer par un fait chiffré.
- Animer : voir §7 (liste du « pas animé »).

### Ton
Sérieux, factuel, avec 1 touche de fun par section maximum. Tutoiement jamais ; « je » sobre.

## 2. Typographie

Deux familles, gratuites (OFL), auto-hébergées en WOFF2 variable, sous-ensemble latin + latin-ext (accents FR), `font-display: swap`, `size-adjust` sur le fallback pour éviter le CLS. Précharger uniquement Archivo (Display) et Source Sans 3 (romain).

| Rôle | Famille | Réglage |
|---|---|---|
| Display (titres, dossard, chiffres-clés) | **Archivo** variable (axes wght 100–900, wdth 62–125) | `wdth 70–75`, `wght 800`, interlettrage -0.02em, interligne 0.9 |
| Texte (paragraphes, UI, légendes) | **Source Sans 3** variable | `wght 400/600`, interligne 1.5, `font-variant-numeric: lining-nums` |

Fallbacks : `Archivo, "Arial Narrow", "Helvetica Neue", sans-serif` / `"Source Sans 3", system-ui, sans-serif`. Vérifier avec fonttools que les deux exposent `tnum` (sinon basculer les chiffres tabulaires sur Archivo wdth 100).

### Échelle (fluide, 5 tailles maximum)
| Token | Taille (clamp) | Usage |
|---|---|---|
| `--t-bib` | clamp(9rem, 32vw, 30rem) | Numéro 1592 du hero uniquement |
| `--t-display` | clamp(3rem, 9vw, 8rem) | Titres de section (h2), 2 lignes max |
| `--t-lead` | clamp(1.375rem, 2.2vw, 1.75rem) | Chapô, pitch (en `<p>`, ≤ 25 mots) |
| `--t-body` | clamp(1.0625rem, 1vw + .8rem, 1.1875rem) | Texte courant, 17–19 px, 45–70 car. par ligne |
| `--t-small` | 0.9375rem (15 px) | Légendes, notes, splits (jamais en dessous de 15 px) |

h1 (nom) utilise `--t-display` ; le dossard est décoratif (`aria-hidden`, le nom reste le h1).

### Chiffres
- `font-variant-numeric: tabular-nums lining-nums` sur tout composant de données : splits, tableaux de courses, compteurs de commits, durées, km.
- Format FR : espace fine insécable avant l'unité (`79,4 km`, `13 h 35 min 53 s` ; en display : `13h35'53`), virgule décimale en FR, point en EN ; milliers en espace fine insécable (`3 160 m`).
- Alignement des splits à droite sur le séparateur décimal ; colonne de chiffres jamais en proportionnel.
- Titres : sentence case, pas de capitales forcées. Majuscules uniquement pour le mot DÉPART/ARRIVÉE du dossard (taille ≥ 1 rem).

## 3. Couleur

Un fond, une encre, un accent. Séparation des surfaces par pas de ton. Vérifiés WCAG (ratios calculés).

### Clair « Jour de course »
| Token | Hex | Rôle | Contraste |
|---|---|---|---|
| `--bg` | #F6F3EC | Papier blanc cassé (neutre froid-chaud, pas jaune-crème) | — |
| `--surface` | #ECE8DE | Cartes, bandes de ravito | — |
| `--ink` | #14161A | Texte courant, titres | 16,34:1 sur bg |
| `--ink-2` | #4A4D55 | Légendes, notes | 7,63:1 bg, 6,91:1 surface |
| `--accent` | #C2410C | Orange dossard : fonds de CTA, chiffres display, profil rempli | 4,67:1 sur bg (texte ≥ 18 px/600 ou UI), 4,23:1 sur surface (réservé grands éléments/UI ≥ 3:1) |
| `--on-accent` | #FFFFFF | Texte sur bouton orange | 5,18:1 |
| `--line-muted` | #8A8D94 | Profil non parcouru, contours de champ | 3,0:1 sur bg (UI ≥ 3:1) |
| `--contour` | #14161A à 6 % | Courbes de niveau | décor, hors seuil |
| `--focus` | #14161A + halo #F6F3EC | Anneau de focus 3 px + 2 px d'espace | ≥ 3:1 |

### Sombre « Départ 6h30 »
| Token | Hex | Rôle | Contraste |
|---|---|---|---|
| `--bg` | #0E1626 | Bleu nuit (pas noir pur) | — |
| `--surface` | #16213A | Cartes, ravitos | — |
| `--ink` | #EDEFF4 | Texte courant | 15,72:1 bg, 13,9:1 surface |
| `--ink-2` | #A9B1C3 | Légendes | 8,41:1 bg, 7,44:1 surface |
| `--accent` | #FF8A2B | Orange de frontale : CTA, profil « éclairé », chiffres | 7,68:1 bg, 6,8:1 surface |
| `--on-accent` | #0E1626 | Texte sur bouton orange | 7,68:1 |
| `--line-muted` | #5B6B8C | Profil non parcouru | 3,38:1 sur bg |
| `--contour` | #EDEFF4 à 5 % | Courbes de niveau | décor |

### Règles
- Orange = actions, point courant, parcouru du profil, numéro du dossard. Jamais sur plus de ~8 % de la surface visible, sauf le bandeau d'arrivée (aplat orange plein, texte `--on-accent`, ok).
- Pas de texte orange < 18 px en clair sur surface. Liens courants : encre soulignée (offset 3 px), orange au survol.
- Sections en aplats : Départ = bg ; P1 = bg ; P2 = `--ink` inversé en clair (fond encre, texte papier) / `--surface` en sombre ; P3 = bg ; Journal = surface ; Arrivée = accent. Les inversions sont les seules ruptures de couleur.
- Aucune information portée par la seule couleur (badges PR : icône + texte ; progression : aussi chiffrée en km).
- Statuts : succès texte #1F6B3A sur bg clair (5,88:1) ; en sombre, utiliser l'orange + libellé, pas de vert.

## 4. Grille, espacement, breakpoints

- Base 8 px. Tokens : 4, 8, 12, 16, 24, 32, 48, 64, 96, 144, 200.
- Grille 12 colonnes, gouttière 24 px (16 px mobile). Marges latérales : 16 px mobile, 24 px tablette, 32 px desktop. Conteneur max 1440 px ; les images et aplats vont jusqu'aux bords.
- Mesure du texte : 62 ch maximum. Trois bords gauches seulement : col. 1, col. 4, col. 7.
- Écart entre sections : 144–200 px desktop, 96 px mobile ; intérieur de section ≤ 48 px.
- Breakpoints (min-width) : `sm` 480, `md` 768, `lg` 1100, `xl` 1440. Le profil latéral fixe n'existe qu'à partir de `lg` ; en dessous : barre haute + road book.
- Colonne latérale desktop : rail fixe de 72 px à droite (profil vertical), contenu décalé de 72 px.
- Cibles tactiles ≥ 44×44 px (WCAG 2.2 : 24 px minimum, on vise plus). Un seul CTA primaire par écran.
- Coins : carrés (0) partout ; boutons carrés. Décision unique, jamais d'arrondi 8–16 px.
- Hauteurs : `min-height: 100svh` pour le hero uniquement (jamais `100vh`).

## 5. Blueprint section par section

Chaque section est composée différemment de sa voisine. Titres ≤ 2 lignes.

### Départ (hero)
- **Contenu :** h1 « Enzo Leveque », titre « Ingénieur fullstack Java / Spring Boot + Angular », 1 phrase (2,5 ans sur une appli de trading critique chez Worldline), stack en une ligne, CTA primaire « Télécharger le CV », CTA secondaire « Me contacter » : tous visibles sans scroll à 390×844 et 1440×900.
- **Desktop :** aplat papier ; à gauche (col. 1–7) nom, titre, phrase, 2 CTA ; le dossard 1592 géant rogné par le bord bas ; à droite (col. 8–12) portrait trail sur ciel bleu, pleine hauteur, bord droit ras, cadre carré. Heure et distance en petit : « Départ 6h30 · km 0 ».
- **Mobile :** portrait en haut (ratio 4:5, plein écran de largeur), puis nom, titre, CTA empilés ; dossard 1592 en filigrane derrière le portrait inférieur, jamais sous le texte. Les CTA tiennent dans les 844 px.
- **Chiffre-clé :** « 2,5 ans · Worldline · trading » en lead, pas de compteurs animés.

### P1 — Fondations (km 20)
- Titre « Les fondations ». Grand bloc Master ILI (Université d'Artois) à gauche ; à droite, 3 cartes segment (projets universitaires) de tailles inégales, tag « Écrit à la main ». Note : « Voie romaine sur le GR3 : c'est à peu près ici que le trail devient sérieux. »
- Mobile : pile verticale, la carte la plus forte d'abord.

### Ravitaillement R1 (entre P1 et P2)
- Bande `--surface` basse : brancardier aux urgences (soft skill : sang-froid, communication sous pression). 2 phrases, une ligne de « ration » (fait chiffré si disponible).

### P2 — Worldline (km 44, la plus longue étape)
- Section la plus haute (≈ 2,5 écrans). Aplat inversé (encre / surface sombre). Grand titre « 2,5 ans sur une appli de trading ». Frise verticale des missions : chaque mission = bloc texte + split (stack, durée, impact). Le profil fixe s'y étire visiblement (étape longue).
- Aucune donnée confidentielle ; chiffres génériques (ordre de grandeur) validés par Enzo.
- Mobile : un bloc par mission, split en dessous.

### Ravitaillement R2
- Tuteur L1 (transmission, pédagogie). Même gabarit que R1, texte différent, jamais la même formulation.

### P3 — Projets perso nés de la course (km 58,2)
- Titre « Nés de la course ». Mosaïque (retours Enzo 2026-10-16) : Oltre en phare sur 7 colonnes (affiche 16:10 « Démo vidéo à venir » tant que le clip n'existe pas, jamais de faux lecteur), une pile paire de cartes sur 5 colonnes (Zotracker, garmin-mcp), la carte restante (HistoQuiz) en bandeau pleine largeur : aucune case vide. Chaque carte : pitch en 1 phrase, split, tag IA, lien « Voir le dépôt » (GitHub).
- Mobile : clips en tête de carte, lecture seulement dans le viewport.

### Journal — carnet d'entraînement
- Fond `--surface`. Deux colonnes (≥ 1280 px) : à gauche titre, courte intro, grand chiffre UTMB Index 459 (« un chiffre, pas un classement ») et photo finisher qui occupe la hauteur restante (le graphe de contributions GitHub viendra en V2) ; à droite la liste des courses en tableau (vrai `<table>`) : date, course, distance, D+, temps, note ironique. Entre 768 et 1279 px : texte et photo côte à côte, puis une fiche par course. Lignes : UTMB index 459, marathons Paris et Louvre-Lens, Côte d'Opale 62 km ×2 (7 h 37 → 7 h 32, badge PR), triathlon M de Fourmies, Ch'ti Trail S, Baudets d'Hinges (club).
- Mobile : graphe défilable horizontalement (focusable), tableau en cartes empilées.

### Arrivée — contact (km 79,41)
- Aplat orange plein. « Arrivée 20 h 05 · km 79,4 », titre display sur 2 lignes imposées « Prochain objectif : / 100 km. » (taille en `cqi` pour tenir dans la colonne), puis « Et un nouveau poste. Parlons-en. », bouton CV, ligne e-mail · GitHub · LinkedIn. Formulaire à droite ; la phrase Phidippides ferme la colonne gauche.
- Mobile : email en 2 lignes max, boutons pleine largeur.

## 6. Composants clés

### Dossard (`Bib`)
Rectangle papier (clair) / blanc cassé (sombre), numéro 1592 en `--t-bib`, Archivo wdth 62, wght 900, orange ; 4 trous d'épingle en cercles `--bg` aux coins (formes pleines, pas de filet). Texte « Grand Trail d'Auvergne 2025 · 79,4 km » en `--t-small`. `aria-hidden` ; l'info est dans le h1.

### Profil de dénivelé (`ElevationProfile`)
- Source : tableau [km, altitude] réel (Garmin), simplifié à ~200 points (Ramer–Douglas–Peucker), un seul `<path>` SVG + clipPath de progression.
- Desktop : rail vertical fixe à droite (72 px), km 0 en haut. Mobile : barre horizontale 4 px en haut (profil mini 24 px de haut en tap-expand non requis).
- Parcouru : `--accent` ; restant : `--line-muted`. Point courant : cercle plein de 10 px.
- Checkpoints : 4 boutons ronds 24 px (zone 44 px) à 0 / 20 / 44 / 58,2 / 79,41 km avec libellé en infobulle ; chacun est un lien d'ancre (`#p2`) avec `aria-current="location"` sur l'actif. Libellés visibles au survol/focus uniquement sur desktop.
- Accessibilité : `<nav aria-label="Profil de la course">` ; le SVG est décoratif, la liste d'ancres sert de vrai sommaire ; `role="progressbar"` n'est pas utilisé (pas de double annonce).
- Sombre : au passage de chaque checkpoint, la portion parcourue « s'éclaire » (opacité 0,35 → 1 + couleur orange de frontale).

### Carte segment (`SegmentCard`)
Surface `--surface`, carrée, pas d'ombre. Contenu : vidéo/visuel 16:10 (ou aplat), titre (display wdth 75), pitch 1 phrase, ligne de split, tag IA, lien. Hover (pointeur fin) : image `scale(1.03)` dans son cadre masqué ; au toucher, rien. Aucune flèche décorative.

### Ravitaillement (`Aid`)
Bande basse (≤ 160 px) `--surface`, texte `--t-body`, un fait + un trait d'humour. Placée entre deux segments, hors profil. Titre en `<h3>` ou `<p>` strong (pas de h2).

### Split (`Split`)
Ligne de 4 colonnes : durée · stack · commits · note. Tabulaire, alignée à droite pour les nombres. Format : « 3 mois · Java 21, Spring Boot · 214 commits ». La note ironique (`--ink-2`, `--t-small`) : « dont 12 pour corriger un typo ». Badge PR (carré orange plein, icône + texte « PR »), uniquement pour un record réel.

### Tag IA (`AiTag`)
Pastille carrée 28 px de haut, texte `--t-small` 600 : « Écrit à la main », « Commencé à la main, puis IA », « Conçu avec IA ». Ton `--surface`-contrasté (fond encre, texte papier en clair ; inverse en sombre) ; jamais en orange. Info textuelle explicite, pas d'icône seule. Lien vers une courte note « Comment j'utilise l'IA » (1 paragraphe dans la page projet).

### Bascule de thème (`ThemeToggle`)
Bouton 44×44 dans l'en-tête, `<button aria-pressed>` avec libellé « Thème sombre » ; 3 états : système / clair / sombre via menu simple. Défaut : `prefers-color-scheme`. Persistance `localStorage` dans try/catch. Application avant le premier rendu (script inline) pour éviter le flash.

### Road book (`RoadBook`, mobile)
- Déclencheur : tap sur la barre haute (zone ≥ 44 px) ou bouton « Road book » dans l'en-tête.
- Plein écran (`<dialog>` modal, focus piégé, `Esc` ferme), fond `--bg`. Liste verticale des 5 étapes : nom, km, une phrase ; le profil est dessiné à gauche, chaque étape est une ancre. L'étape courante est marquée.
- Fermeture au tap sur une étape, scroll vers l'ancre, retour du focus au déclencheur.

### Navigation et en-tête
Wordmark « E. Leveque » à gauche, bascule FR/EN et thème à droite. Pas de barre flottante ni de verre. Le lien d'évitement « Aller au contenu » est le premier élément focusable.

### Page projet (gabarit)
Pitch + split → Problème → Schéma d'archi (SVG inline, couleurs du thème, titre et `desc`) → 2–3 décisions et compromis (texte, pas d'accordéon) → « Le mur du 60e km » (la difficulté : bloc `--surface` pleine largeur) → Ce que j'en retire → Liens (repo, démo, vidéo). Clip 15–30 s en boucle muette : `<video muted loop playsinline preload="metadata" poster>` ; pas d'autoplay hors viewport.

## 7. Mouvement (selon Emil)

Principe : le mouvement sert l'orientation (où suis-je dans la course) et le retour d'action. Seules `transform` et `opacity` sont animées ; le reste jamais. Courbes : `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`, `--ease-io: cubic-bezier(0.77, 0, 0.175, 1)`. Aucune `ease-in`. Aucun `transition: all`.

| Animation | But | Propriété | Courbe / durée | Interruption | Reduced-motion |
|---|---|---|---|---|---|
| Profil rempli au scroll | Orientation (progression) | `transform: scaleY`/`scaleX` sur un masque (origine au départ) liée au scroll (`animation-timeline: scroll()`, fallback IntersectionObserver) | linéaire, pilotée par le scroll | Suit le scroll en direct ; aucune file d'attente | Pas de mouvement : état final discret à chaque checkpoint (changement de couleur instantané) |
| Point courant | Position | `transform: translate` | pilotée par le scroll | Idem | Saute directement |
| « Éclairage » du profil (sombre) | Récompense (identité sombre) | `opacity` du tracé orange (0,35 → 1) | `--ease-out` 400 ms, déclenché une fois par checkpoint | Transition CSS : se retarget si on revient en arrière | Passage instantané (opacité fixe) |
| Entrée des blocs de section | Séquencer la lecture | `opacity` + `translateY(16px → 0)` | `--ease-out` 320 ms, décalage 60 ms par élément (titre, texte, visuel), déclenché 1 fois (IntersectionObserver, marge -80 px) | Transition (pas de keyframes), pas de reset si on repart | Fondu seul 160 ms, sans translation ; contenu jamais caché sans JS |
| Ouverture road book | Continuité spatiale | `opacity` + `translateY(12px → 0)` du panneau | `--ease-out` 220 ms entrée, 160 ms sortie (sortie plus rapide) | Transition : un tap pendant l'ouverture inverse sans saut | Fondu 120 ms |
| Bascule de thème | Retour d'action | `opacity` d'un voile `::view-transition` (View Transitions API) 200 ms ou changement direct | `ease` 200 ms | Retarget si double tap | Changement direct, sans transition |
| Appui bouton / carte | Feedback tactile | `transform: scale(0.97)` à `:active` | `--ease-out` 140 ms, retour 160 ms | Transition ; retarget naturel | Conservé (feedback, sans déplacement) |
| Survol carte (pointeur fin) | Affordance | image `scale(1.03)` | `ease` 240 ms, `@media (hover:hover) and (pointer:fine)` | Retarget à la sortie | Retiré |
| Clip vidéo | Preuve vivante | lecture muette en boucle (déclenchée par IntersectionObserver) | — | Pause hors viewport | Poster fixe + bouton Lecture |
| Compteur de splits | — | Pas d'animation | — | — | — |
| Changement de langue FR/EN | — | Aucune | — | — | — |

### Ce qu'on n'anime PAS
- Navigation clavier et focus (anneau instantané), sommaire du road book au clavier, liens d'ancre des checkpoints (le saut vers l'ancre utilise `scroll-behavior: smooth` seulement hors reduced-motion).
- Texte courant, tableaux, compteurs, chiffres du dossard, tags IA, parallaxe, scroll-jacking, curseur personnalisé, particules, marquees, machine à écrire.
- `width`, `height`, `top/left`, `box-shadow`, `filter: blur` (hors masque rare de crossfade ≤ 2 px).
- Tout ce qui se déclenche plus de ~5 fois par session (survols de liste, focus) : aucune animation d'entrée répétée.

### Règles transversales
- Max 300 ms pour toute UI ; l'unique mouvement long (profil) est piloté par le scroll, pas par un timer.
- Démarrer à `scale(0.95)` + opacité, jamais `scale(0)`. Popovers (infobulle de checkpoint) partent de leur déclencheur ; le road book (modale) reste centré.
- Infobulle : délai 300 ms au premier survol, 0 ms ensuite entre checkpoints voisins.
- `will-change` uniquement sur le masque du profil. Animations CSS plutôt que JS quand c'est prédéterminé.
- Test : ralenti ×4, puis relecture le lendemain.

## 8. Photos

- **Hero :** portrait trail sur ciel bleu, source 1200×1600 (ratio 3:4). Jamais agrandi au-delà de 1200 px de large (`max-width: 1200px`, pas de `object-fit` qui agrandit) : sur écran plus large, le bloc garde sa taille et l'aplat papier absorbe l'espace. Exporter AVIF + WebP + JPEG, `fetchpriority="high"`, `width`/`height` renseignés (pas de CLS), pas de lazy-loading sur le LCP. Cadrage mobile : 4:5 centré sur le visage et le dossard visibles ; desktop : 3:4 pleine hauteur.
- Ciel : le bleu de la photo ne doit pas entrer en collision avec l'orange ; pas de filtre coloré, légère correction de niveaux uniquement. Légende de lieu/date en `--t-small`.
- **Photos de course :** une image dominante par section, 3:2 (large) ou 4:5 (portrait), même traitement partout, coins droits. Alt = description factuelle (« Montée vers Saint-Anthème, 14 h »), pas décorative. Max 6 à 8 photos sur la page.
- **Recadrage des tiers :** visages de coureurs ou de bénévoles non consentants : recadrer ou flouter. Pas de plaques, pas de dossards tiers lisibles. Crédit photo si l'auteur est un tiers.
- **Traitement :** pas de duotone, pas de grain artificiel, pas de bord arrondi. Clair : photo telle quelle. Sombre : réduire légèrement la luminosité (`filter: brightness(.9)` statique) si l'image est très blanche.
- **Vidéo :** 15–30 s, boucle muette, ≤ 2,5 Mo par fichier, H.264 + WebM, affiche WebP (ADR 0003). Pas d'autoplay hors viewport ni sous `prefers-reduced-motion`/`Save-Data`.
- Aucun tracé GPS, aucune carte de parcours ; le profil de dénivelé seul.
- Poids total des images au premier écran ≤ 250 Ko ; `srcset` 480/800/1200 px ; Lighthouse mobile ≥ 90 perf.

## 9. Checklist de revue design

### Concept et contenu
- [ ] En 10 s on comprend : nom, métier, stack, preuve (Worldline), action (CV, contact).
- [ ] Hero : CTA CV + Contact visibles sans scroll à 390×844 et 1440×900.
- [ ] La métaphore n'a jamais remplacé l'information (chaque section a un vrai titre).
- [ ] Aucun classement, aucun tracé GPS ; chiffres de la course exacts (dossard 1592, 79,4 km, ~3 160 m D+, 13 h 35 min 53 s).
- [ ] Tags IA justes : à la main / commencé à la main puis IA / conçu avec IA.
- [ ] Clin d'œil histoire : max 2, discrets.

### Anti-slop
- [ ] Zéro dégradé, ombre au repos, verre, monospace, eyebrow, filet décoratif, numérotation 01/02.
- [ ] Pas trois cartes identiques ; deux sections voisines n'ont pas la même composition.
- [ ] Un seul accent (orange) et un seul geste signature (le profil).
- [ ] Aucune phrase générique ; chaque affirmation a une preuve.
- [ ] Titres ≤ 2 lignes à 320, 390, 768, 1440 px.

### Typo et couleur
- [ ] Archivo + Source Sans 3 chargées en WOFF2 auto-hébergé ; `tnum` actif sur les splits.
- [ ] Contrastes mesurés : texte ≥ 4,5:1 ; UI et grands textes ≥ 3:1 ; thème clair et sombre.
- [ ] Orange jamais en petit texte sur `--surface` clair (4,23:1).
- [ ] Texte jamais sous 15 px ; texte courant 17–19 px, 45–70 car./ligne.

### Mouvement et accessibilité
- [ ] Seules `transform` et `opacity` animées ; aucun `transition: all`.
- [ ] Chaque animation : but, courbe, durée, interruption, fallback reduced-motion (voir §7).
- [ ] Rien d'animé au clavier ; focus visible (3 px, ≥ 3:1) ; ordre de tabulation logique.
- [ ] Road book : focus piégé, `Esc`, retour du focus ; ancres des checkpoints navigables.
- [ ] Cibles ≥ 44 px ; pas de glisser obligatoire (WCAG 2.2 : 2.5.7, 2.5.8) ; focus non masqué par l'en-tête fixe (2.4.11).
- [ ] `lang` correct par langue, `hreflang`, bascule FR/EN conserve la position de scroll.
- [ ] Alt texte et légendes ; vidéo sans son, avec poster et contrôle Lecture.
- [ ] Thème : suit le système, bascule sans flash, persistance non bloquante.

### Performance
- [ ] Lighthouse mobile : perf ≥ 90, accessibilité ≥ 95 (clair et sombre).
- [ ] LCP < 2,5 s (portrait hero préchargé), CLS < 0,05, JS d'animation < 20 Ko.
- [ ] Images dimensionnées, formats modernes, vidéo hors viewport non chargée.
- [ ] Relecture finale à froid le lendemain, sur un vrai téléphone, en ralenti ×4 pour le mouvement.

## 10. V2 : page projet, clip, carnet d'entraînement, FR/EN

Maquette : `docs/design/v2-page-projet.html` (Oltre, autonome, tokens de `tokens.css`, clair/sombre, bouton Thème pour comparer). Décisions compatibles D20-D26 ; aucune n'en contredit une. La page projet est plus sobre que l'accueil : pas de rail de profil, pas d'aplat orange, pas de geste signature animé. Elle garde le dossard, les chiffres tabulaires et un seul accent.

### 10.1 Blueprint de la page projet (`projets/:slug`)
Ordre fixe (D25, plan-v2 §4.2) : lien retour → pitch + dossard de segment → clip → problème → schéma → décisions → mur du 60e km → ce que j'en retire → liens. Un seul `<h1>` (titre du projet), les sections sont des `<h2>` en sentence case, sans eyebrow ni numérotation.

| Zone | Desktop (≥ 1100) | Mobile (< 768) |
|---|---|---|
| Retour | Lien texte « ← Retour au parcours (P3, km 58,2) » vers `/#p3`, cible 44 px | Idem |
| Pitch + dossard | Titre `--t-display` + chapô `--t-lead` (≤ 25 mots, 28ch) + Tag IA en col. 1-7 ; dossard en col. 9-12 | Pile : titre, chapô, tag, puis dossard pleine largeur |
| Clip | Pleine largeur du conteneur, 16:10, sous le hero | Pleine largeur, 16:10 ; bouton et légende sous le cadre |
| Problème, schéma, décisions, retire, liens | `h2` en col. 1-3, contenu en col. 4-11 (bords gauches 1 et 4 seulement), mesure 62 ch | `h2` au-dessus, contenu pleine largeur |
| Décisions | Première décision en pleine mesure, les deux suivantes côte à côte (jamais 3 cartes identiques) ; titre `h3` + « Compromis : » en gras, texte, pas d'accordéon | Pile |
| Mur du 60e km | Bande `--surface` pleine largeur ; « km 60 » display orange (décor, `aria-hidden`, ≥ 18 px) en col. 1-3, `h2` + texte en col. 4-11 | « km 60 » au-dessus, puis texte |
| Liens | Liste de liens (dépôts, « Revoir le clip »), puis un CTA « Me contacter » | Idem, CTA pleine largeur |

Variante **Worldline** (`trading-app`, titre « Application de trading chez Worldline ») : même gabarit sans schéma (la section et son `h2` n'existent pas), sans clip, `repos` vide donc pas de lien dépôt, dossard sans « Commits » ni « Langages » (valeurs `null` : ligne omise, pas de tiret). Aucun nom de fonctionnalité ni de client.
Variante **GFaim** : clip portrait (10.3) ; pas de lien store.

**Dossard de segment (`BibSplit`)** : rectangle `--surface`, 4 trous d'épingle `--bg` (comme `Bib`, §6), numéro d'étape « P3 · km 58,2 » en Archivo wdth 62 / 900 orange, puis une `<dl>` : libellé `--ink-2` à gauche, valeur à droite en `tabular-nums` (durée, rôle, commits, langages, dernier push, stack). Une ligne de note « synchro GitHub, 6 h » rappelle l'origine des chiffres. Landmark `<aside aria-label="Fiche du projet">`. `commits`, `languages`, `lastPushAt` à `null` : la ligne disparaît.

### 10.2 Schéma d'architecture (SVG inline, D25)
Style « relais » : nœuds carrés pleins `--bg` posés sur un cadre `--surface` (inversion de ton, aucun filet de contour), texte `--ink` 15 px (nom, 600) et `--ink-2` (détail), flèches orthogonales `--ink` 2 px à pointe pleine, légende de lien en `--ink-2` sur la flèche. **Une seule couleur d'accent : le nœud fragile (celui du mur) en aplat `--accent`, texte `--on-accent`, flèche orange.** Optionnel = pointillé. Aucune information par la seule couleur : le nœud orange porte aussi le texte « non officielle ». Contraste : orange sur `--surface` clair 4,23:1 (grand aplat, OK UI ≥ 3:1), texte dessus en `--on-accent` 5,18:1 / 7,68:1.
- Deux gabarits du même schéma : horizontal (≥ 900 px, viewBox 900×330, texte 15 px minimum à l'affichage) et vertical (< 900 px, viewBox 360×700, `max-width: 360`), un seul visible (`display: none` sur l'autre : jamais de double annonce). `role="img"`, `<title>` et `<desc>` traduits (le `desc` décrit le flux en une phrase), légende `<figcaption>`.
- Max 7 nœuds, 1 niveau de nesting. Rien de décoratif, pas d'icône de marque.

### 10.3 Clip (`Clip`)
- **Ratio : 16:10, partout** (tranche §5 16:9 contre §8 16:10). Raison : l'enregistrement est en 1280×800 (D24, `video.width/height`), donc 16:10 évite recadrage et bandes ; `SegmentCard` (§6) était déjà en 16:10. Le §5 est aligné. `aspect-ratio: 16/10` posé sur le cadre ; l'affiche (`<img>` en placeholder du `@defer`) a le même ratio : zéro CLS.
- **Portrait (GFaim)** : cadre `aspect-ratio: 9/19.5`, `max-height: min(70svh, 640px)`, centré dans une bande `--surface` ; légende et boutons sous le cadre, à droite sur desktop.
- **Affiche** WebP ≈ 40 Ko (ADR 0003), alt vide (la légende nomme le contenu).
- **Contrôle** : un bouton texte unique « Lecture » / « Pause » (pas d'icône seule, pas de `controls` natif), 44×96 px minimum, fond `--ink`, texte `--bg`, placé **sous** le cadre (jamais en surimpression), premier élément focusable après la vidéo ; `aria-label` identique à son texte. Toujours visible (WCAG 2.2.2). La légende est le nom accessible (`aria-labelledby` sur la `<figure>`).
- **Lecture** : `<video muted loop playsinline preload="none" poster>` ; démarre dans le viewport (seuil 50 %), se met en pause en dehors ; **aucune lecture automatique** sous `prefers-reduced-motion`, `saveData` ou `effectiveType` 2g : l'affiche reste, le bouton fait « Lecture ». Un clic utilisateur est toujours honoré. Clip absent (`video: null`) : le composant n'est pas rendu.
- Légende : sujet + « Données factices, 22 s, sans son ».

### 10.4 Carnet d'entraînement (graphe de contributions, D26)
Pas de grille 53×7 : c'est la heatmap GitHub reproduite. Un **carnet** lit comme un volume hebdomadaire de plan d'entraînement.
- **Forme** : une barre par semaine (53), la **hauteur** donne le total hebdomadaire (échelle linéaire, plancher 6 px, max = 90 px), alignées sur une ligne de base en encre 2 px. Semaine à zéro = repos : trait de 3 px en `--line-muted` (le repos fait partie du carnet). Une annotation « Meilleure semaine : N » au-dessus de la barre maximale.
- **5 tons** (le ton répète la hauteur, il ne la remplace pas) : repos `--line-muted`, puis `--accent` mélangé à `--surface` à 35 / 55 / 78 / 100 % (`color-mix`, pas de dégradé), par quartiles des semaines actives. Aucun vert.
- **Légende** : `Repos`, quatre tons, `Charge`, + « La hauteur donne la valeur ; le ton la répète. » ; `aria-hidden`.
- **Accessibilité** : résumé texte au-dessus (« 812 contributions sur 12 mois · 41 semaines actives sur 53 · meilleure semaine : 47 »), le SVG est `role="img"` avec `<title>`. Mois sous la ligne de base, 15 px, tabulaires.
- **Responsive** : viewBox 742×170 ; sous 742 px, conteneur `overflow-x: auto` focusable (`tabindex="0"`, `role="region"`, nommé par le résumé), scroll initial sur les semaines récentes. Section masquée si `contributions` est `null`. Pas d'animation (SSR, §7 « compteurs »).
- Place : colonne gauche de la section Journal, sous le chiffre UTMB Index, à la place du vide actuel sous la photo si l'espace manque, sinon sous la photo.

### 10.5 Bascule FR/EN (D21)
Dans l'en-tête, groupe à droite avant le bouton Thème : `FR / EN`, deux liens `<a hreflang lang>` dans `<nav aria-label="Langue">` (traduit), chacun 44×44, `--t-small` 600 ; la langue courante `aria-current="true"` en encre soulignée 2 px (offset 6 px), l'autre en `--ink-2` ; séparateur « / » `aria-hidden`. Pas de drapeaux, pas de menu, pas de select. Le lien conserve le chemin et l'ancre active (la section courante) ; recharge de page, sans animation.

### 10.6 Accueil : GFaim et fiches courtes (décisions d'Enzo, plan-v2 §9)
- GFaim entre en **P1** avec une `SegmentCard` « étude de cas » (lien vers `projets/gfaim`) ; Cin-folie, quarkus-color, ObjVLisp2023, LambdaCalcul : une ligne chacune (nom, stack, lien dépôt) dans une liste compacte sous les cartes P1, sans carte ni tag, pour ne pas ajouter 4 cartes identiques.
- Les 4 études de cas (Oltre, Zotracker, GFaim, Worldline) ont un lien « Lire l'étude de cas » (lien souligné, pas de flèche) en plus de « Voir le dépôt ». Les fiches courtes n'ont jamais de page.

### 10.7 Mouvement V2 (Emil : un but, `transform`/`opacity`, `--ease-out`, jamais d'`ease-in`)
| Élément | Propriété | Courbe | Durée | Interruption | Reduced-motion |
|---|---|---|---|---|---|
| Entrée des blocs (problème, décisions, retire) | `opacity` + `translateY(16px → 0)`, 1 fois | `--ease-out` | 320 ms, décalage 60 ms | Transition CSS, pas de reset | Fondu 160 ms seul |
| Bouton Lecture/Pause, Me contacter, FR/EN | `transform: scale(.97)` à `:active` | `--ease-out` | 140 ms | Retarget naturel | Conservé |
| Lien (survol, pointeur fin) | `color` seulement | `ease` | 120 ms | — | Retiré |
| Clip | Lecture muette en boucle | — | — | Pause hors viewport, au `blur` d'onglet | Affiche + « Lecture », jamais auto |
| Dossard, schéma, mur, carnet | Aucune | — | — | — | — |
| Bascule FR/EN, thème | Rechargement / View Transitions (§7) | — | — | — | Direct |
Pas de parallaxe, pas de tracé animé du schéma, pas de barres qui poussent dans le carnet. Aucun `transition: all`.

### 10.8 Checklist V2
- [ ] Ordre du gabarit respecté ; Worldline sans schéma, sans clip, sans ligne vide dans le dossard.
- [ ] Un `h1` ; titres ≤ 2 lignes à 320, 390, 768, 1440 px (« Trois décisions, trois compromis » vérifier à 320).
- [ ] Dossard : chiffres `tabular-nums`, lignes `null` omises, contraste orange ≥ 3:1 (grand display).
- [ ] Schéma lisible en clair et en sombre, texte ≥ 15 px affiché, un seul nœud orange, `title` + `desc` traduits, pas de double annonce horizontal/vertical.
- [ ] Clip 16:10 sans CLS ; sous reduced-motion, `saveData` et 2g : affiche + « Lecture », aucune requête vidéo avant clic ; bouton Pause visible, 44 px, nommé ; vidéo sans piste audio.
- [ ] Carnet : résumé texte, légende, 5 tons distincts en clair et sombre, hauteur lisible sans la couleur, zone défilable focusable sur mobile.
- [ ] Bascule FR/EN : 2 cibles 44 px, `aria-current`, `hreflang`, ancre conservée, fonctionne sans JS.
- [ ] Un seul accent, zéro dégradé/ombre/filet décoratif/eyebrow ; mouvement conforme à 10.7.
- [ ] Revue à 360/390/768/1440, clair et sombre, ralenti ×4.


## 11. V3 : admin, colophon, stats du Journal

Maquette : `docs/design/v3-colophon-admin.html` (captures 1440 et 390, clair et sombre, dans `docs/design/v3-captures/`). Aucun token, aucune couleur, aucune police en plus : mêmes `--bg/--surface/--ink/--ink-2/--accent/--line-muted`, mêmes Archivo + Source Sans 3, coins carrés, un seul accent. Les textes du colophon sont ceux de `docs/content/copy-v3.md` (brouillon, non validé) ; la maquette n'en reprend que la structure.

### 11.1 Admin (`/fr/admin`, usage d'Enzo seul)
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
- **Mouvement** : aucun, hors `scale(.97)` à `:active` des boutons (140 ms, §10.7) et fondu 120 ms de l'aperçu. Pas de squelette animé : « Chargement… » en texte.
- **Médias** : liste en tableau (miniature 48 px carrée, nom, dimensions, poids `tnum`, `usedBy`, Supprimer). Suppression = dialogue de confirmation, focus piégé, bouton par défaut « Annuler ».

### 11.2 Colophon (`/fr/colophon`, ADN « La Course »)
La page prouve la méthode. Elle garde la signature (dossard, orange, aplats) mais en **version calme** : aucun profil, pas de 1592 géant (le dossard est déjà sur l'accueil), mouvement = §7 seulement.
- **Blueprint** (ordre de `copy-v3.md`) :
  1. **Départ** (fond `--bg`) : `h1` « Colophon » en `--t-display` (une ligne), chapô `--t-lead`. À droite ≥ 1100 px, bloc « dossard » petit (`--surface`, hauteur ~ 12rem) : « Édition 2026 · FR + EN » et la date de dernière mise à jour en `tnum`. Pas d'image.
  2. **La stack** (`--bg`) : trois colonnes de texte (Back, Front, Infra), **pas** de cartes ni d'icônes de logos. Chaque ligne : nom en 600, version en `tnum`.
  3. **Méthode : une équipe d'agents** (aplat `--ink` inversé, comme P2) : liste des agents et du modèle de chacun en tableau (agent, rôle, modèle), la boucle d'une feature en 5 lignes (spec, tâche, test, revue, merge).
  4. **IA assumée** (`--bg`) : les trois tags `AiTag` existants avec le projet concerné, sans fausse modestie.
  5. **Ce que la CI vérifie** (`--surface`) : liste des jobs, un `Aid` (ravito) pour la phrase d'humour.
  6. **Scores Lighthouse** (voir ci-dessous).
  7. **Tout est dans le dépôt** (aplat `--accent`, texte `--on-accent`, comme l'Arrivée) : trois liens (dépôt, `tasks/`, `docs/adr/`) en grandes lignes soulignées. Seul aplat orange de la page.
- **Scores Lighthouse comme des « splits »** : un tableau 4 lignes (Performance, Accessibilité, Bonnes pratiques, SEO) × 3 colonnes de pages (`/fr/`, `/en/`, `/fr/projets/oltre`). Le score est un `Split` : chiffre en Archivo 800 `wdth 75`, `tnum`, aligné à droite, taille `clamp(2.5rem, 6vw, 4.5rem)` ; libellé et seuil (« seuil 90 ») en `--t-small` `--ink-2`. **Tout score ≥ seuil est en encre ; le score qui est juste au seuil (≤ seuil + 2) prend une note ironique en `--ink-2` et une icône « limite » (« 90 : pile au seuil, je l'écris »)** ; aucun vert, aucun anneau/jauge/cercle d'activité. L'orange reste réservé au record éventuel (badge PR, icône + texte) : jamais pour « bon ». En dessous : date de mesure (`tnum`), méthode (« mobile, médiane de trois mesures »), lien vers le rapport `docs/reviews/…`. Valeurs en dur, datées, jamais « 100 » arrondi.
- **Mobile 390** : une colonne ; le tableau des scores passe en 3 blocs (une page chacun) avec 4 splits en grille 2×2 ; le tableau des agents en `dl`.
- **Accessibilité** : vrais `<table>` avec `<caption>`, scores lisibles sans la couleur ni l'icône (le mot « limite » est écrit), un `h1`, titres ≤ 2 lignes de 320 à 1440.

### 11.3 Stats sport du Journal (`sportYears`)
- **Place** : dans la colonne gauche du Journal, **sous** le graphe de contributions (§10.4), avant la photo si l'espace manque ; masqué si `sportYears` est `[]`. Titre `<h3>` « Les années en chiffres », une phrase d'intro, la note « Totaux annuels seulement : ni tracé, ni fréquence cardiaque, ni donnée de santé » en `--t-small`.
- **Forme** : un vrai `<table>` (c'est l'équivalent texte), une ligne par année décroissante, colonnes Année · Kilomètres · D+ · Heures · Activités. Chiffres `tabular-nums lining-nums`, alignés à droite sur la virgule, milliers en espace fine insécable, unités dans l'en-tête de colonne (`km`, `m D+`, `h`), jamais répétées par cellule. Année en Archivo 800. Valeur `null` : tiret long « — » avec `aria-label` « non renseigné ». Ligne de l'année en cours : mention « en cours » en texte.
- **Pas de graphique** : ni barres, ni anneaux, ni courbe (l'écart serait décor et la donnée est saisie à la main). Pas de classement ni de « meilleure année » en badge. Le seul geste visuel est la hauteur de ligne et la typographie.
- **Mobile** : le tableau garde 5 colonnes si la largeur le permet à 15 px (≥ 360 px : Année, km, D+, h, act.) ; sinon `overflow-x: auto` focusable nommé par le titre. Pas d'animation, pas de compteur qui monte (SSR, §7).

### 11.4 Checklist V3
- [ ] Admin : zéro couleur/police hors tokens ; un seul bouton orange par écran ; aucun dégradé, ombre, verre, filet décoratif, zébrage ; coins carrés.
- [ ] Admin : FR et EN côte à côte ≥ 900 px, empilés en dessous, `lang` par champ ; labels visibles ; compteurs `tnum`.
- [ ] Admin : chaque `code` d'erreur a un texte FR, une icône et une position ; erreur jamais portée par la couleur seule ; focus placé sur le récapitulatif après un échec.
- [ ] Admin : upload au clavier ; contraintes écrites avant l'envoi ; refus expliqué en clair ; suppression avec confirmation et `usedBy`.
- [ ] Admin : `noindex`, aucune donnée en `localStorage`, aucun `innerHTML`.
- [ ] Colophon : un `h1`, titres ≤ 2 lignes de 320 à 1440 ; un seul aplat orange ; aucune carte d'icônes ni logo ; faits renvoyant à un fichier du dépôt.
- [ ] Colophon : scores = splits en `tnum`, datés, valeurs réelles, note au seuil, aucune jauge ni vert.
- [ ] Stats : `<table>` avec `<caption>`, `tnum`, `null` → « — », masqué si `[]`, aucun graphique ni classement ; rendu SSR sans `sportYears`.
- [ ] 360 / 390 / 768 / 1440, clair et sombre, contrastes mesurés ; texte ≥ 15 px.
