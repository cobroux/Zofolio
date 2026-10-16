# ADR 0003 : Format et hébergement des clips vidéo

- Statut : proposé (tech-lead, 2026-10-15), à valider par Enzo
- Modules : projects (V2), infra, content-admin (V3)

## Contexte
SPEC §3 projects : boucles muettes de 15 à 30 s, avec affiche et chargement différé, sans lecture automatique sur connexion lente ni sous `reduced-motion`. DESIGN §8 : ≤ 4 Mo, H.264 + WebM. Trois clips au V2 (Oltre, Zotracker, GFaim), enregistrés une fois et rarement refaits. Lighthouse mobile ≥ 90 doit tenir sur l'accueil (clip sur la carte Oltre) et sur les pages d'étude de cas. Le SSR Express sert déjà `dist/frontend/browser` (`express.static`, `maxAge: 1y`) derrière Caddy.

## Décision
1. **Format** : pour chaque clip, un MP4 H.264 (`-crf 28`, `yuv420p`, `+faststart`) et un WebM VP9 (`-crf 38 -b:v 0`), sans piste audio (`-an`), sans métadonnées (`-map_metadata -1`), 24 i/s, ≤ 2,5 Mo chacun. Taille : 1280×800 pour le web (viewport Playwright), taille native réduite à 720 px de haut pour GFaim (portrait). Affiche en **WebP** (l'attribut `poster` n'accepte qu'une URL : WebP est lu partout, l'AVIF de DESIGN §8 ne l'est pas sur les vieux Safari).
2. **Hébergement** : fichiers commités dans `frontend/public/media/`, nommés `{slug}-{n}.{mp4|webm|webp}`, servis par le SSR comme les images (`media/...` relatif à `<base href="/fr/">`). Un clip modifié change de nom (`oltre-2`), jamais de réécriture : le cache d'un an reste juste.
3. **Données** : la colonne `project.video` (jsonb) porte `name`, `width`, `height` et une légende traduisible ; l'API renvoie les trois URL (plan-v2 §4.2).
4. **Production** : `ffmpeg` sur le poste d'Enzo (`brew install ffmpeg`, outil local et non dépendance du projet), script `tools/clips/encode.sh`. Sans ffmpeg, aucun clip n'est publié : le WebM VP8 brut de Playwright est trop lourd et n'est pas lu de façon fiable sur iOS.

## Alternatives écartées
- **YouTube ou Vimeo intégré** : cookies et traceurs (bandeau de consentement), iframe lourde, CSP à élargir, publicités possibles.
- **Git LFS** : quota de bande passante GitHub, checkout CI et build Docker plus complexes, pour 6 fichiers.
- **Volume sur le VPS servi par Caddy (`file_server`)** : fichiers hors de l'image Docker, donc hors du déploiement automatique et des sauvegardes. Cela deviendra pertinent avec l'upload de médias de l'admin (V3).
- **Stockage objet ou CDN** : un compte, une facture et un domaine de plus pour moins de 15 Mo.
- **GIF ou AVIF animé** : 5 à 10 fois plus lourd, sans contrôle de lecture.

## Conséquences
- Le dépôt grossit d'environ 15 Mo. Le build `localize` copie `public/` dans chaque locale (`browser/fr/media`, `browser/en/media`), ce qui fait environ 30 Mo de plus dans l'image. C'est accepté (VPS 40 Go) ; à revoir en V3 avec l'upload de médias.
- `express.static` gère les requêtes `Range` (nécessaires à Safari) et Caddy ne recompresse pas `video/*` : aucun changement d'infra.
- Le chargement différé est fait par le front (`@defer (on viewport)` et `preload="none"`), pas par l'hébergement.
