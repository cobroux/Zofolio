# V3-T16 : revue sécurité de l'admin (point de contrôle J)

Diff `main..feat/v3-arrivee` (backend, Caddyfile, compose, `.env.example`). Skill `security-and-hardening`. Verdict : **aucun bloquant ouvert**. `./mvnw clean verify` vert (55 tests, une fois sur trois `MediaIT` a échoué sur le téléversement de 6 Mo, voir M2).

## Corrigé dans cette revue (avec test)
| # | Gravité | Constat | Correction | Test |
|---|---|---|---|---|
| C1 | Majeur | Blocage contournable : l'échec n'était enregistré qu'après le bcrypt (~250 ms). Une rafale d'essais parallèles passait tous le contrôle (15/15 mots de passe testés au lieu de 5). | `AdminAuthController.login` : contrôle + comptage atomiques (`synchronized`, une instance) avant le bcrypt ; effacé au succès. | `AdminAuthIT.parallelWrongGuessesAreCountedBeforeBcrypt` |
| C2 | Majeur | `GET /api/admin/session` créait une session mémoire pour tout anonyme : saturation du tas par simple boucle de GET. Le « ligne de base » n'apportait rien (`changeSessionId` au login suffit). | `getSession(true)` retiré ; plus de cookie `__Host-zadmin` avant la connexion. | `AdminAuthIT` (aucun cookie de session avant login, cookie durci après) |
| C3 | Moyen | Aucune borne de corps sur `/api/*` (JSON non authentifié, ex. `login`, `contact`, lu en entier par Jackson). | `Caddyfile` : `request_body max_size 1MB` sur `/api/*` (6 Mo reste sur `/api/admin/media`). | config, non testable en JUnit |
| C4 | Preuve A01 | Aucun test n'énumérait les mappings. | `AdminRoutesIT` lit `RequestMappingHandlerMapping` : tout `/api/admin/**` sauf `GET /session` et `POST /login` répond 401 sans session, les méthodes mutantes 403 sans CSRF (plus de 15 mappings). | `AdminRoutesIT` |
| C5 | Demande | `metaDescription` FR de GFaim à 161 caractères (bloquait le PUT admin). | `20261017-0900-gfaim-meta-fr.sql` (156 caractères, sens inchangé) ; `ProjectAdminIT` exige maintenant 0 échec d'aller-retour. | `ProjectAdminIT.seededProjectsRoundTripUnchanged` |

## Vérifié sans constat
- **Authentification** : bcrypt coût >= 12 exigé au démarrage (hash vide ou faible = connexion refusée, journal d'avertissement) ; `changeSessionId` au login ; cookie `__Host-`, `HttpOnly`, `Secure`, `SameSite=Strict`, `Path=/` ; expiration 2 h d'inactivité ; déconnexion invalide la session et expire le cookie ; mot de passe jamais journalisé (`grep` vide, IT sur la sortie) ; IP seulement hachée dans les journaux et en base ; bcrypt calculé même bloqué (bon mot de passe pendant un blocage refusé).
- **CSRF** : `csrf.spa()` sur toute la chaîne admin, y compris `login` et `logout` ; GET/HEAD/OPTIONS seuls exemptés ; la chaîne publique reste sans CSRF et sans session (test existant).
- **Autorisation** : `anyRequest().hasRole("ADMIN")` sur `/api/admin/**` (aussi pour les chemins inconnus et `preview`) ; un seul utilisateur, pas d'IDOR possible ; ids/slugs validés (`SLUG`, `FILE_NAME`).
- **Upload** : nom = SHA-256 du contenu ré-encodé (le nom client n'entre jamais dans un chemin), `delete` revérifié par regex et `startsWith(dir)` ; extension vs octets magiques ; images décodées puis ré-encodées sans métadonnées (EXIF/GPS/XMP/ICC absents, orientation appliquée), dimensions lues avant décodage (4096 max), 5 Mo ; MP4 parcouru boîte par boîte (profondeur 6, tailles bornées, `uuid` et `udta`/`meta` non vides refusés, tout le fichier parcouru donc rien d'ajouté en queue), 2,5 Mo ; références `/uploads/<hash>.mp4|jpg|png` obligatoires et existantes dans les projets ; écriture atomique.
- **Servi par Caddy** : `/uploads` en lecture seule (volume `:ro`), `nosniff`, type MIME par l'extension canonique (jamais html/svg/js), pas de `browse`, aucune exécution possible.
- **Injection** : une seule requête native (`findSlugsUsingMedia`, paramétrée) ; JPQL/Spring Data ailleurs ; texte rendu par interpolation Angular ; `demoUrl` `^https://` ; clés de langue sur liste blanche.
- **Erreurs / journaux** : `ProblemDetail` + `code`, `server.error.include-stacktrace=never`, titres génériques, aucun détail de hash ou de chemin dans les réponses ; journaux admin = identifiant de la ressource et action. **CORS** : aucun (même origine). XFF écrasé par Caddy, `remoteip` limité au réseau Docker.

## Restant (aucun bloquant), à traiter
- **M1 (moyen, T6/T8 prod)** : la chaîne publique désactive les en-têtes de sécurité (choix testé : pas d'en-tête sur l'API publique) et le Caddyfile n'en pose que sur `/uploads`. Le Caddyfile de production doit ajouter `Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy`, `frame-ancestors`/CSP au moins sur `/fr/admin` et `/api`. Ajouter aussi `Content-Security-Policy "default-src 'none'; sandbox"` sur `/uploads`.
- **M2 (faible, test)** : `MediaIT.disguisedOversizedAndMetadataFilesAreRejected` est instable (`chunked transfer encoding` au envoi de 6 Mo quand Tomcat coupe la connexion). À stabiliser (envoyer avec `Content-Length`, ou tolérer la coupure et accepter 413).
- **M3 (faible)** : un téléversement 4096x4096 consomme ~300 Mo de tas (image + copies d'orientation). Un seul administrateur, mais fixer `-Xmx` du conteneur >= 512 Mo ou orienter en place.
- **M4 (faible)** : le plafond global (20 échecs/h) permet à un tiers de verrouiller Enzo 1 h (accepté, plan-v3 Q5). Le blocage par IP dépend de la vraie IP : à revérifier au point M (Cloudflare).
- **M5 (info)** : MP4 conservé tel quel ; les boîtes `free`/`skip` peuvent porter des octets arbitraires (sans effet : servi `video/mp4` + `nosniff`). Session mémoire non partagée : un redémarrage déconnecte (voulu).
