# ADR 0001 : Stockage des traductions

- Statut : proposé (tech-lead, 2026-10-15), à valider par Enzo
- Modules : content, core-shell, i18n-en (V2), content-admin (V3)

## Contexte
V1 en FR seul, EN en V2 sans refonte. SPEC : « chaque texte traduisible est stocké par langue ; si l'EN manque, le FR est servi ». Deux natures de texte : le contenu éditorial (projets, expériences, courses, éditable par l'admin en V3) et les textes d'interface (boutons, labels, aria, erreurs, hero).

## Décision
1. **Contenu en base : une colonne `jsonb` par champ traduisible**, valeur `{"fr": "...", "en": "..."}`, mappée en `Map<String,String>` (`@JdbcTypeCode(SqlTypes.JSON)`). Résolution unique `I18n.pick(map, lang)` = `map[lang] ?? map["fr"]`.
2. **Interface via `@angular/localize`** (attributs `i18n`, `$localize`), un build par locale, sous-chemins `/fr/` et `/en/`. V1 construit `fr` seul ; V2 ajoute `messages.en.xlf` et `"en"` dans `localize`.
3. Le hero et l'Arrivée sont des textes d'interface (statiques), le reste de l'accueil vient de l'API.

## Alternatives écartées
- Table `translation(entity, entity_id, field, lang, value)` : jointures partout, pas de contrainte d'intégrité par champ, plus de code pour le même résultat.
- Colonnes `title_fr`, `title_en` : migration de schéma à chaque langue, doublement des colonnes.
- Dictionnaires JSON chargés à l'exécution côté front (service maison ou `ngx-translate`) : code ou dépendance en plus, textes absents du HTML SSR tant que le JSON n'est pas chargé, pas d'extraction ni de vérification au build.

## Conséquences
- Ajouter l'EN = changesets Liquibase qui complètent les `jsonb` (`jsonb_set`) + un fichier XLIFF ; zéro migration de schéma.
- Le build front double en V2 (une sortie par locale) ; le changement de langue recharge la page (acceptable, DESIGN interdit toute animation à ce moment).
- Un texte d'interface modifiable sans redéploiement est impossible : acceptable, l'admin V3 ne cible que le contenu.
