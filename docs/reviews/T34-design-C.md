# T34 – Revue design du point de contrôle C

Date : 2026-10-15. Captures : `docs/reviews/T34/{360,390,768,1440}-{light,dark}-{fold,full}.png` (16 PNG).
Méthode : Chrome headless piloté par puppeteer-core (le profil du MCP chrome-devtools était verrouillé par un autre processus) ; les appels `/api/*` du navigateur sont servis avec le JSON réel du back (voir M-env). Mesures DOM : cibles, tailles de texte, contrastes, débordements, hauteurs de titres. Comparé à `Main/Mobile/Dark.dc.html` (rendus de référence, photo absente dans la maquette) et à DESIGN §9.

## Verdict : NON VALIDÉ (3 bloquants). T34 reste décochée.

Ce qui est conforme : premier écran mobile (nom, titre, CV, Contact visibles sans scroll à 390×844 et 360×640, CV en bas à 769 px et 593 px), dossard 1592 en `tnum`, rail 72 px et barre-profil mobile fidèles à la maquette, aucun dégradé/ombre/monospace/eyebrow, un seul accent, cibles toutes ≥ 44 px (aucune en dessous sur 6 largeurs), focus 3 px visible, texte ≥ 15 px (sauf « km 0 » 13 px), contrastes OK en sombre, chiffres de course exacts, formulaire sur orange lisible en clair et en sombre (D11 validé, encre sur orange). Aucune propriété animée hors `transform`/`opacity`, aucun `transition: all`.

## Bloquants

1. **Bascule de thème inaccessible à 1100 px et plus** : `header` et `footer` pleine largeur passent sous le rail fixe (`z-index: 10`, 72 px). Le bouton de thème est à x 1364–1408, sous le rail (x ≥ 1368) ; « Mentions légales » aussi. Capture : `1440-light-fold.png` (pas de bouton visible en haut à droite). Fichiers : `frontend/src/styles.css` (bloc `@media (min-width:1100px)`), `core/layout/header.ts`, `footer.ts`. Correctif : à ≥ 1100 px, ajouter `padding-inline-end: calc(var(--margin) + 72px)` à `header` et `footer` (comme `main`).
2. **Défilement horizontal à 768 px** (scrollWidth 898 > 768) : le tableau du Journal ne tient pas dans la colonne 8fr (table 898 px) et le dossard déborde de 8 px. Capture : `768-light-full.png` (colonne Note écrasée en bas). Fichier : `features/home-course/sections/journal.section.ts` (`@media (min-width: 768px)`). Correctif : passer la mise en tableau à `min-width: 1024px` (cartes en dessous) ou envelopper le `table` dans `overflow-x:auto`, et `overflow-x: clip` sur `.start`/`app-bib` pour supprimer les 8 px.
3. **Env. Docker : le contenu disparaît après hydratation** (« Contenu indisponible pour le moment. » dans les 5 sections ; capturé avant stub). Le SSR rend le contenu, puis le client refait `GET /api/fr/...` sur `localhost:4000`, qui ne proxifie pas vers le back → 404 → `null`. Fichiers : `docker-compose.yml`/Caddy (T38), `core/api/content.api.ts`. Correctif : router `/api/*` vers le back (Caddy en prod, `proxy.conf` ou `app.get('/api/{*splat}')` dans `server.ts` pour compose) et/ou `provideClientHydration(withHttpTransferCache())` pour ne pas refetcher ; à traiter avant T36 (les E2E échoueraient sinon).

## Majeurs

4. **Dossard sur le visage à 360 px** : photo de 204 px de haut (`clamp(160px, 100svh-436px, 380px)`) et dossard 144 px (min de `--t-bib`) masquent le visage. Capture : `360-light-fold.png` (aussi `360-dark-fold.png`). Fichiers : `start.section.css:28`, `shared/bib/bib.css:144-148`, `styles/tokens.css:19`. Correctif : `--t-bib: clamp(6.5rem, 26vw, 30rem)` et `min-height` de la photo à 240 px sous 400 px de large (visage au tiers haut, `object-position: center 20%`).
5. **Animation d'entrée des blocs non implémentée** (DESIGN §7) : aucune règle `transition`/`@keyframes` hors profil, road book et feedback tactile. Voir la spec ci-dessous.
6. **Titres > 2 lignes** (§9 anti-slop) : « Journal de course » 3 lignes à 768 et 1440, « Prochain objectif : 100 km… et un nouveau poste » 5 lignes à 1440 (3 à 390). Captures `1440-light-full.png`, `390-light-full.png`. Fichiers : `journal.section.ts`, `finish.section.ts:36` (colonne trop étroite). Correctif : titre sur toute la largeur au-dessus du tableau (`grid-column: 1 / -1`), et h2 de l'Arrivée en `grid-column: span 8` avec `font-size: clamp(3rem, 7vw, 6rem)`.
7. **Orange en petit texte sur `--surface` clair** : « Record personnel » 15 px, `#C2410C` sur `#ECE8DE` = 4,23:1 (< 4,5:1), règle §9 explicite. Capture : `1440-light-full.png` (ligne Côte d'Opale 2026). Fichier : `journal.section.ts:128` (`.pr`). Correctif : `color: var(--ink)` avec l'icône en orange.
8. **Photo finisher absente de la page** : `finisher-cote-d-opale-*` n'est référencée nulle part dans `frontend/src` (la section Arrivée n'a pas de photo). Correctif : l'intégrer avec le recadrage ci-dessous (ou retirer les fichiers inutilisés).

## Mineurs

9. « km 0 » du rail/profil à 13 px (< 15 px) : `elevation-profile.css`, passer à 15 px.
10. Thème sombre : P2 (`--surface` #16213A sur `--bg` #0E1626) se distingue à peine des autres sections ; conforme à DESIGN §3, mais l'inversion « respiration » est quasi perdue (`1440-dark-full.png`). Correctif : P2 sombre sur `#1B2A48` ou garder l'inversion claire (`--ink`/`--bg`) aussi en sombre ; décision à confirmer par Enzo.
11. Dossard à 390 px légèrement tronqué à droite (398 px de bord droit) : volontaire (bleed), à valider ; vérifier qu'il reste lisible (« 1592 » lisible sur `390-light-fold.png`).
12. En-tête 390/360 : bascule de thème à x 330–374, marge droite 16 px OK ; aucun problème de focus masqué constaté (header non sticky).

## Spec : animation d'entrée des blocs (DESIGN §7, ligne « Entrée des blocs »)

- But : séquencer la lecture de chaque section (titre, texte, visuel). Une seule fois par bloc, jamais répétée.
- Propriétés : `opacity` 0 → 1 et `transform: translateY(16px)` → `none`. Rien d'autre.
- Courbe / durée : `transition: opacity 320ms var(--ease-out), transform 320ms var(--ease-out)` (jamais `all`, pas de keyframes).
- Décalage : 60 ms par élément, par ordre (`--i` : titre 0, texte 1, visuel 2 ; `transition-delay: calc(var(--i) * 60ms)`), 180 ms maximum au total.
- Déclenchement : `IntersectionObserver` avec `rootMargin: '0px 0px -80px 0px'`, `threshold: 0`, `unobserve` après le premier passage ; pas de reset en remontant.
- Hors premier écran seulement : le hero (Départ) n'est pas animé (LCP, CLS 0). Éléments initialement visibles au chargement : état final tout de suite.
- Sans JS / SSR : état initial caché uniquement sous `html.js .reveal:not(.in)` (classe posée par un script inline) ; sans JS le contenu est visible.
- Reduced-motion : `@media (prefers-reduced-motion: reduce)` → pas de translation, `opacity` seule en 160 ms, sans décalage.
- Interruption : transition CSS, donc retarget naturel ; aucune file d'attente.
- Fichier suggéré : une directive `appReveal` dans `shared/` + règle dans `styles.css` (< 1 Ko de JS).

## Spec : recadrage de la photo finisher (source 1280 × 1706 px)

Cadrage portrait 4:5 : rectangle `x = 200, y = 450, w = 900, h = 1125` (de 200 à 1100 px en x, de 450 à 1575 px en y), à rééchantillonner en 1280 × 1600 puis 640 × 800 (jpg/webp/avif).
- Retire : les passants flous à droite (x ≥ 1130, y 660–800) et à gauche (x < 40, y 690–760), le cadre jaune « Finisher 2025 » (reste en partie sur x < 460, y > 800 : le garder est acceptable, sinon prendre `x = 450, w = 650, h = 810` serré sur le coureur).
- Conserve : casquette, visage, médaille, dossard 1440 (centré à x ≈ 690), jambes jusqu'aux chaussures (y ≈ 1500), bannière « Trail National Côte d'Opale » en fond lisible.
- Si le recadrage n'est pas fait dans le fichier : `aspect-ratio: 4/5; object-fit: cover; object-position: 50% 45%` et `transform: scale(1.25)` sur l'image dans un conteneur `overflow: hidden` avec `transform-origin: 54% 55%` (équivalent).
- Alt : « Enzo montre sa médaille de finisher devant l'affiche du Trail Côte d'Opale ». Ne pas flouter ni assombrir.

## Corrections (2026-10-15)

- B1 thème inaccessible >= 1100 px : corrigé (`padding-inline-end` de 72 px de plus sur header et footer).
- B2 défilement horizontal 768 px : corrigé (tableau en cartes jusqu'à 1023 px, tableau pleine largeur dès 1024 px).
- B3 contenu indisponible en Docker : corrigé (service `caddy` sur 127.0.0.1:4000, `/api/*` vers backend, reste vers frontend, `X-Forwarded-For` écrasé ; vérifié par curl).
- M4 dossard/visage 360 px : corrigé (`--t-bib` min 6.5rem, dossard mobile `clamp(6.5rem, 26vw, 9.5rem)`, photo min 240 px sous 400 px, `object-position: center 20%`). Contrôle visuel 360x640 : visage dégagé, CTA visibles.
- M5 animation d'entrée : corrigé (directive `appReveal`, spec appliquée, hero exclu, reduced-motion en opacité 160 ms, `html.js` posé par script inline).
- M6 titres > 2 lignes : corrigé (h2 Journal et Arrivée sur toute la largeur, Arrivée en `clamp(2.25rem, 7vw, 6rem)` et `text-wrap: balance`). Nombre de lignes non mesuré dans un navigateur.
- M7 « Record personnel » : corrigé (texte `--ink`, icône orange).
- M8 photo finisher : corrigé (recadrage 4:5 via `make-images.sh`, 1280x1600 et 640x800, sans GPS vérifié par `mdls`/`sips`, placée dans le Journal).
- m9 « km 0 » 15 px : corrigé. m10 (P2 sombre) : non traité, décision d'Enzo. m11, m12 : sans action.
