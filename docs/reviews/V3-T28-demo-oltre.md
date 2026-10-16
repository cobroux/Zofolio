# V3-T28 : revue de la démo Oltre (point L)

Verdict : aucun bloquant (2 problèmes corrigés dans la branche `feat/demo-profile`). `mvn verify` : 66 tests verts ; front `npm test` 97 verts, build OK.

## Corrigé (commit sur feat/demo-profile)
1. **Majeur, DemoGuard contournable** : il lisait `getRequestURI()`, donc `DELETE /api/users/me;x=1` ou `POST /auth/register;x=1` passait (Spring ignore `;param`). Désormais `getServletPath()` (décodé, sans paramètres). Test ajouté.
2. **Moyen, seeder sans garde-fou** : `reset()` vidait toute base si le profil `demo` était actif. Refus (`IllegalStateException`) si un utilisateur autre que `demo@oltre.dev` existe. Test ajouté.

## Priorités
1. Profil : activé seulement par `SPRING_PROFILES_ACTIVE: demo` dans `docker-compose.demo.yaml` ; tous les beans sont `@Profile("demo")` ; rien ne change sans (66 tests existants verts). OK.
2. Routes mutantes énumérées : `/auth/register` (bloqué), `PUT/DELETE /api/users/me*` (bloqués), `/api/garmin/connect` POST/DELETE (bloqués), `/api/coach/plan/generate` (clé Gemini vide, 503), `/api/appointments|tasks|expenses|meals` et `/api/coach/goals|toggle` (CRUD sur les données de démo, voulu, effacé la nuit). Pas d'envoi d'e-mail, pas d'écriture de fichier. Garmin : `getActivities/Details/connect/disconnect/isConnected` bouchonnés, `getRecords` passe par `getActivities` surchargé : aucun appel réseau. `garmin.service-url=http://garmin.invalid`, token vide.
3. Aucune donnée réelle ni secret commité (grep `@gmail|leveque|cobroux` vide dans `demo/` et le compose ; secrets via `.env.demo`, `${VAR:?}`). Seul identifiant : `demo@oltre.dev` / `demo-oltre-2026`, public voulu.
4. Remise à zéro : au démarrage (`ApplicationReadyEvent`) et à 04:00 Europe/Paris, transaction unique, ordre de suppression compatible avec les clés étrangères (testé, idempotent). Limite : après remise à zéro, les jetons JWT d'avant pointent vers un utilisateur supprimé (reconnexion nécessaire, acceptable). Un échec nocturne est seulement journalisé.
5. Bandeau : `role="status"`, texte visible, contraste #78350f sur #fef3c7 (~8:1). OK. Mineur : `/register` reste accessible par URL en démo (le back répond 403).
6. `pom.xml` : pas de plugin failsafe dans le projet, donc `**/*IT.java` dans surefire n'a pas de doublon ; effet : `DemoProfileIT` tourne avec `verify`. OK.

## Mineurs, non corrigés
- Le fichier `app.html` du front apparaît entièrement modifié (fins de ligne CRLF vers LF), bruit de diff.
- `mysql` du compose sans mot de passe par défaut : variables obligatoires, correct.
