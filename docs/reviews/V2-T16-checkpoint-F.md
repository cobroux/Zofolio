# V2-T16 : revue du point de contrôle F (diff `origin/main..ff7e183`)

## Verdict : APPROUVÉ, aucun bloquant

Vérifications exécutées sur l'arbre de travail :
- `backend ./mvnw -B verify` : exit 0 (le message « Surefire is going to kill self fork JVM » est un bruit de fin de fork, pas un échec).
- `frontend npm run build` : OK, `dist/frontend/browser/{fr,en}` produits.
- `frontend npm test` : 54/55. L'échec est `src/app/shared/contributions/contributions.spec.ts:30` (attendu 53 barres, reçu 52).
- `frontend npm run lint` : 5 erreurs `no-empty-function` dans `src/app/shared/clip/clip.ts:70,86` et `clip.spec.ts:20,21,43`.
- Les deux derniers échecs viennent de fichiers qui ne sont PAS dans `ff7e183` (travail en cours des agents front/clips). Ils sont hors périmètre F, mais le front doit repasser au vert avant la fusion (voir M3).

## Problèmes (du plus grave au moins grave)

### Moyens
- **M1 : liste GitHub tronquée sans pagination** : `backend/src/main/java/dev/zofolio/githubsync/GithubClient.java:~24` (requête `repositories(first: 100 …)`, aucun `pageInfo.hasNextPage`) et `GithubSyncService.java:~46` (`deleteAll` des dépôts absents).
  Au-delà de 100 dépôts publics, la réponse est partielle. Elle est pourtant acceptée, et un dépôt curé hors de la première page serait supprimé du cache. Avec les dépôts actuels d'Enzo le risque est nul.
  Correctif : demander `pageInfo { hasNextPage }` et lever `IllegalStateException` si `hasNextPage` est vrai, ou ne supprimer que si la réponse est complète. De même, refuser une liste `nodes` vide si le cache n'est pas vide.
- **M2 : migration `project-v2` fragile** : `backend/src/main/resources/db/changelog/changes/20261016-1100-project-v2.sql:6-7`.
  Le `regexp_replace` ne retire que le préfixe `https://github.com/cobroux/`. Les seeds actuels (`20261015-1200-seed-projects.sql`) ont tous ce préfixe, donc c'est correct aujourd'hui. Une URL d'une autre forme deviendrait un « nom de dépôt » invalide, et `DROP COLUMN` est irréversible.
  Correctif : ajouter `AND repo_url LIKE 'https://github.com/cobroux/%'`, et sauvegarder avant la mise en production.
- **M3 : tests et lint rouges dans l'arbre** (voir plus haut). Le critère du plan est « tout vert ». Les agents front/clips doivent corriger `contributions.spec.ts` (52 contre 53 barres), `clip.ts` et `clip.spec.ts`.

### Mineurs
- **m1 : `SeoService.update`** : `frontend/src/app/core/seo/seo.service.ts:31` : `/^\/((fr|en)\/?)?/` retire aussi un début de segment (`/entreprise` devient `treprise`). Sans effet avec les routes actuelles (`projets/…`, `mentions-legales`).
  Correctif : `/^\/(?:(?:fr|en)(?:\/|$))?/`.
- **m2 : `Header.switchHref`** : `frontend/src/app/core/layout/header.ts` : l'ancre `#active` n'est posée que sur `/`. C'est conforme à D21. `lang` et `hreflang` valent `other`, donc il n'y a pas de boucle.
- **m3 : `GithubSyncServiceTest`** n'a pas de cas « liste de dépôts vide » ni « plus de 100 dépôts » (lié à M1).
- **m4 : `ContentService.java` `cache()`** charge tous les `github_repo` à chaque requête `/projects` (négligeable à cette échelle).

## Conformité aux priorités

1. **Sécurité github-sync : conforme.**
   - Le token n'apparaît que dans l'en-tête `Authorization` (`GithubClient.fetch`).
   - Les logs n'écrivent que le code HTTP ou le nom de classe de l'exception, jamais `getMessage()`.
   - Les tests `GithubSyncServiceTest` et `GithubSyncIT` vérifient l'absence du token dans les logs et dans le corps de l'erreur.
   - Délais de connexion et de lecture : 10 s. JDK `HttpClient` ne suit pas les redirections.
   - Le cache n'est jamais modifié sur échec : 9 cas d'échec testés (401, 500, `errors`, `user` nul, valeurs négatives, nom trop long, JSON invalide, timeout). Dans `GithubSyncIT`, le cache reste intact après un 500. La transaction est tout-ou-rien.
   - La requête GraphQL est une constante, `login` passe par `variables` : pas d'injection.
   - Les dépôts non curés ne sont pas exposés : seuls les dépôts de `github_repos` du projet sont agrégés (testé avec `prive-non-cure`).
   - Réserve : M1.
2. **Contrats §4 : conformes.** `ProjectSummary`, `Video`, `CaseStudy`, `Contributions`, `HomeResponse` du back correspondent à `api.models.ts` (noms, nullabilité, `caseStudy` nul dans les listes, non nul seulement pour CASE_STUDY avec `problem`, repli FR des `decisions`). Les IT vérifient les chaînes JSON.
3. **i18n : conforme.**
   - `/` renvoie 302 vers `/fr/` ou `/en/` selon `acceptsLanguages('fr','en')`, FR par défaut, avec `Vary: Accept-Language`.
   - Pas de redirection ouverte : cible construite à partir de deux valeurs fixes.
   - Pas de boucle : seule la route `/` redirige et `/en/*` est servi.
   - `hreflang` fr, en et x-default (vers fr) sur la page et dans `sitemap.xml`. `canonical` dans la locale courante.
   - Bascule : conserve le chemin (E2E `bascule FR/EN`).
   - `i18nMissingTranslation: error` actif. Il reste 123 `state="initial"` dans `messages.en.xlf`, attendus jusqu'à V2-T33.
4. **Liquibase : sûr.** Les 3 changesets sont nouveaux et ordonnés après `20261015-1202`. Aucun changeset existant n'est modifié (vérifié par `git diff --name-status`). Réserve : M2.
5. **Tests : probants.** Ils couvrent les chemins d'échec, l'absence du token, l'agrégation et l'isolation des dépôts non curés, avec un vrai serveur HTTP local dans l'IT. Lacune : m3. Couverture non mesurée dans cette revue (JaCoCo est configuré dans le pom).
