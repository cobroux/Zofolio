# T24 - Revue du point de contrôle B

Diff : `origin/main..feat/v1-briques` (hors lockfile, `public/img`, `public/fonts`, `profile.data.ts`). Verdict : **OK, aucun bloquant** (4 majeurs à traiter avant le point D).

## Vérification exécutée
- `backend ./mvnw -B verify` : EXIT 0 (ITs Testcontainers PostgreSQL 17 + mailpit, JaCoCo).
- `frontend npm test` : 5 fichiers, 10 tests verts ; `npm run lint` : propre.
- Aucun `.env`, GPX, `private/` ni photo brute suivis (`git ls-tree`) ; `.env` ignoré. Les JPEG n'ont qu'un APP1 Exif de 76 octets sans GPS ; `profile.data.ts` sans lat/lon (script `gpx-to-profile.mjs` ne les écrit pas).
- Non vérifié : contenu du PDF CV (pas de `pdftotext`), lecture du `detail` réel des erreurs (non exécuté), hydratation réelle du toggle (non exécutée).

## Critères B (plan §6)
6 routes conformes (ITs verts) ; JaCoCo en place ; shell SSR avec thème sans flash (script inline avant rendu) ; client API typé ; profil sans lat/lon. Atteints.

## Problèmes (du plus grave au moins grave)

### Majeurs
1. `backend/src/main/resources/application.properties:9` + `ContactController.java:21` : l'IP du limiteur vient de `getRemoteAddr()` via `forward-headers-strategy=native`. Tomcat fait confiance à tout proxy privé (10/8, 172.16/12, 192.168/16, 127/8) et prend l'en-tête `X-Forwarded-For` tel quel ; la parade dépend d'un Caddyfile qui n'existe pas encore (T-déploiement) et qui doit écraser le XFF client. Aucun test avec XFF forgé (`ContactApiIT` n'envoie qu'une valeur). Correctif : restreindre `server.tomcat.remoteip.internal-proxies` au réseau Docker, ne jamais publier le port 8080, ajouter un IT « XFF forgé à plusieurs valeurs » et vérifier que Caddy écrase l'en-tête (T36/T37).
2. `ContactService.java:32` : `IP_HASH_SALT:dev-only-salt` et `CONTACT_TO`/`SMTP_*` ont des valeurs par défaut ; en prod, un `.env` incomplet démarre sans erreur avec un sel public (hash d'IP réversible par force brute sur IPv4). Correctif : pas de défaut pour le sel (échec au démarrage), défaut réservé à un profil `dev`/test.
3. `ApiExceptionHandler.java:45-46,57` et `ApiException.java:11-16` : `ProblemDetail.forStatus(...)` laisse `detail` à `null` ; Jackson omit les nulls des ProblemDetail, alors que §4.1 donne `"detail": "Rate limit exceeded"` et que `api.models.ts:50` type `detail: string` (champ requis). Écart contrat back/front pour 429 et 503 (et 404 levé par `ApiException`). Correctif : `forStatusAndDetail` avec un détail fixe par code (« Rate limit exceeded », « Mail delivery failed », « Not found ») et ajouter une assertion `detail` dans les ITs.
4. `theme-toggle.ts:10-14` et `theme.service.ts:22-23` : le SSR rend l'icône du mode `system`, le navigateur lit `localStorage` dans le constructeur et bascule sur `light`/`dark` avant l'hydratation ; le `@switch` change de branche (risque NG0500/mismatch d'hydratation, et icône qui saute). Correctif : lire le mode depuis `data-theme` dans un `afterNextRender`, ou rendre l'icône uniquement côté navigateur.

### Mineurs
5. `ContactRequest.java:13` : `website` (honeypot) sans `@Size` ; borné seulement par la limite du corps HTTP. Correctif : `@Size(max = 200)` (la validation précède le honeypot, donc un 400 reste possible pour un robot).
6. `ContactService.java:46-50` : compte puis enregistre sans verrou ; des requêtes parallèles dépassent 5. Impact faible (1 visiteur, 5/h). Correctif : accepter (déjà commenté `shortcut`) ou index/verrou consultatif par `ip_hash`.
7. `ContactService.java:50-59` : seul `MailException` est capté ; une autre exception après `save` laisse la ligne en `PENDING`. Correctif : `catch (RuntimeException)` avec statut `FAILED`.
8. `ApiExceptionHandler.java:61-67` : les statuts hors contrat (405, 415, 406...) renvoient `code` = nom HTTP (`METHOD_NOT_ALLOWED`), absent de l'union `ProblemDetail.code` (`api.models.ts:52`). Correctif : mapper tout 4xx hors liste vers `MALFORMED_REQUEST`.
9. `CvController.java:30` : écriture en base à chaque GET public sans limite ni garde ; si l'insertion échoue, le CV n'est pas servi (500). Correctif : encapsuler `save` dans un try/catch journalisé (le CV prime sur la statistique).
10. `theme-toggle.ts:7` : `aria-label` fixe « Thème sombre » avec `aria-pressed` alors que le bouton cycle sur 3 états ; `aria-pressed=false` en `system` quand l'OS est sombre côté SSR. Correctif : retirer `aria-pressed`, mettre le libellé du mode courant dans `aria-label` (le `role=status` existant annonce déjà le changement).
11. `seo.service.ts:40` : `og:image` pointe `/fr/og/og-fr.jpg`, fichier absent du diff (livrable T-photos). Correctif : créer le fichier ou différer la balise jusqu'à ce qu'il existe.
12. `content.api.ts:18` : toute erreur (500, 429, réseau) devient `null` « indisponible », indistinguable d'un 404 ; acceptable (ADR 0002), mais le SSR renvoie alors HTTP 200. Correctif : à documenter ; rien à faire en V1.

## Conformité DTO (back ↔ `api.models.ts`)
`Experience`, `ProjectSummary`, `Race`, `HomeResponse`, `ContactRequest`, `ProblemDetail.errors[{field,code}]` : noms, nullabilité et unions identiques au §4 (nulls toujours émis, `distanceKm` en `numeric(5,1)`, `date` ISO). Seul écart : `detail` (point 3). Codes d'erreur 400/404/429/503/500 conformes ; `Retry-After` présent (borne haute 3600 s). Ordre serveur validation → honeypot → limite → enregistrement → SMTP conforme. En-tête d'e-mail : `name` sans caractère de contrôle (`\p{Cc}`, IT sur CRLF), `email` borné par `@Email` (pas de CR/LF), sujet et `Reply-To` passent par JavaMail. Aucune valeur rejetée ni pile dans les erreurs ; IP jamais stockée (SHA-256 salé).

## SSR
Appel interne via `API_INTERNAL_URL` (compose : `http://backend:8080`), timeout 2 s, erreur -> `null`, hero/Arrivée non dépendants ; `RenderMode.Server` (pas de prérendu qui figerait un « indisponible »). OK.
Écart accepté (Source Sans 3 sans `tnum`) : non signalé.

## Corrections
- 1 corrigé : `application.properties` (`server.tomcat.remoteip.internal-proxies` limité à 172.16/12, loopback exclu) ; IT `ForwardedForIT` (XFF forgé ignoré, 6e requête = 429) ; `ContactApiIT` déclare 127.0.0.1 proxy de confiance. Caddy doit écraser le XFF : noté sous T38 dans `tasks/todo.md`.
- 2 corrigé : `ContactService.java` (échec au démarrage si `IP_HASH_SALT` absent ou < 16 caractères) ; `backend/src/test/resources/config/application.properties` et `.env.example` fournissent une valeur ; test unitaire ajouté. `CONTACT_TO`/`SMTP_*` gardent leurs défauts (hors demande).
- 3 corrigé : `ApiExceptionHandler.java` (`detail` générique par `code`, jamais le message Spring) ; `api.models.ts` documenté ; assertions dans `ContactApiIT` et `ApiErrorIT`.
- 4 corrigé : `theme-toggle.ts` (3 icônes rendues, affichage par CSS sur `data-theme`, donc SSR = client) ; `theme-toggle.spec.ts`. Hydratation réelle non exécutée.
- 5 corrigé : `ContactRequest.java` (`@Size(max = 200)`). 7 corrigé : `ContactService.java` (`RuntimeException`). 8 corrigé : `ApiExceptionHandler.java` (4xx hors liste = `MALFORMED_REQUEST`). 10 corrigé : `theme-toggle.ts` (`aria-pressed` retiré, `aria-label` dynamique).
- 6, 9, 11, 12 reportés (pas une ligne évidente ou hors périmètre).
