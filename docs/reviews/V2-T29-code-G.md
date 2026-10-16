# V2-T29 : revue de code, point de contrôle G

Périmètre : `ff7e183..HEAD` + travail non commité (hors lockfiles, `public/media`, `docs/reviews`). Aucun bloquant.

## Corrigé
- `clip.ts` : la `<video>` n'avait pas de nom accessible (seul le `<figure>` en avait un) : `aria-labelledby` ajouté.
- `clip.ts` : une pause demandée par le visiteur était annulée dès que le clip repassait dans le viewport (IntersectionObserver) : drapeau `userPaused`.

## Vérifié, conforme
- SSR : Clip et graphe n'appellent `window`/`matchMedia`/`IntersectionObserver` que dans `effect` gardé par `isPlatformBrowser` ou `afterNextRender`. 404 : `NotFoundPage` pose `RESPONSE_INIT.status = 404` (test : fiche courte, slug inconnu, API en échec) ; l'`ContentApi` convertit toute erreur en `null`.
- Clip : pas d'`autoplay`, `calm()` couvre reduced-motion, saveData et 2g ; bouton Lecture/Pause toujours visible ; `preload="none"`.
- SVG : `role="img"` + `<title>` + `<desc>` référencés ; gabarit masqué en `display: none` (donc retiré de l'arbre d'accessibilité) ; sens porté aussi par le pointillé et le texte, pas la couleur seule.
- Graphe : région défilante focusable et nommée, résumé textuel, pas d'animation, cas « tout à zéro » sans NaN.
- Animations : seules `transform` (`transition: transform`), aucun `transition: all`.
- Seed ↔ DTO ↔ front : `Video`, `CaseStudy`, `Decision`, `Contributions` concordent (record Java, `api.models.ts`, fixtures) ; `stage` `P1`/`P3` couvert par `CHECKPOINTS`.

## Restant (non bloquant)
1. `case-study.page.ts` (effect, `seo.update(..., !v)`) : une panne passagère de l'API renvoie 404 + `noindex` rendus côté serveur ; un crawleur pourrait désindexer la page. Distinguer 404 (slug inconnu) d'une erreur réseau (statut 503) demande de changer `ContentApi`.
2. `case-study.page.ts` : titre `${title}, Enzo Leveque` au lieu des `meta.*.title` / `meta.*.description` de `copy-en-v1-v2.md` (meta par page non repris ; la description est le pitch).
3. `diagrams` : `id` statiques (`oltre-h-t`, `carnet-sum`) valides tant qu'une seule instance par page existe.
4. `diagram.css` : entre 900 et 1100 px de large, le schéma horizontal est réduit et le texte (15 px dans le viewBox) passe vers 12-13 px.
5. `contributions.ts` : le pic affiche `0` si toutes les semaines sont vides (cas théorique, après la première synchro).
6. `SeedContentIT` / Liquibase : `oltre.note` (EN) n'a pas de ligne exacte dans `copy-en-v1-v2.md` (traduite du FR de la base) ; `gfaim` décision 2 : le marqueur `[TO PROVIDE]` de l'EN est écarté, comme dans le FR en base.
