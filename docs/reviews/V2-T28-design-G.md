# V2-T28 : revue design du point de contrôle G

Verdict : **validé, aucun bloquant**. Un écart corrigé, deux notes à faire (non bloquantes).
Captures : `docs/reviews/V2-T28/` (1440 / 768 / 390, clair et sombre : accueil P1, P3, Journal ; Oltre, Zotracker, GFaim, Worldline ; Oltre EN). Avant/après de l'écart : `V2-T28/avant/` et `V2-T28/apres-*-oltre.png`.
Mesures automatiques sur les 36 pages : 0 débordement horizontal, 1 seul `h1`, aucune cible `a`/`button` sous 44 px.

| # | Écart | Capture | Statut |
|---|---|---|---|
| 1 | Desktop ≥ 1100 : `h2` en colonnes 1-3 trop grand, « L'architecture » coupé en « L'architect / ure » (Oltre, Zotracker) | avant : `avant/1440-*-fr_projets_oltre.png` ; après : `apres-1440-*-oltre.png` | **Corrigé** (`case-study.page.css`, `h2` du grid à `clamp(2.25rem, 3.3vw, 3.25rem)`), vérifié à 1100 et 1440 |
| 2 | Schéma horizontal à 1440 : conteneur ~810 px pour un viewBox 900, texte affiché ≈ 13,5 px (< 15 px du DESIGN 10.2) | `1440-*-fr_projets_oltre.png` | À faire : élargir `.diagram-wrap` ou passer le texte du SVG à 17 px dans le viewBox |
| 3 | Graphe de contributions : les données du cache ne couvrent que les dernières semaines, donc 50 barres de repos et 2-3 barres actives ; la forme reste lisible mais peu parlante | `1440-light-home-journal.png` | À faire côté données (synchro GitHub), pas de défaut de gabarit |

## Checklist 10.8
- Gabarit : ordre respecté ; Worldline sans schéma ni clip, dossard sans lignes vides. OK.
- GFaim : aucun bloc clip, aucune affiche (`video: null`, 0 `<video>` dans le DOM). Conforme à la décision d'Enzo.
- Clip Oltre et Zotracker : 16:10, bouton Lecture/Pause sous le cadre, 44 px, nommé ; Pause affichée après lecture. OK (validé par Enzo).
- Dossard : chiffres tabulaires, lignes `null` omises ; la valeur « Rôle » longue est alignée à droite sur 5 à 6 lignes (lisible, léger déséquilibre). Sans suite.
- Schémas : lisibles en clair et en sombre, un seul nœud orange, texte « non officielle » présent ; un seul gabarit visible par largeur. Voir écart 2 pour la taille.
- Rythme vertical, mur du 60e km, contrastes orange/surface : OK dans les deux thèmes.
- Bascule FR/EN : cibles 44 px, `aria-current`, lien vers `/en/projets/oltre` et rendu EN sans débordement à 390 (certains textes de contenu restent en FR : périmètre du traducteur).
- 360 px et reduced-motion : non rejoués dans cette passe (390 testé ; reduced-motion couvert par les tests unitaires du Clip).
