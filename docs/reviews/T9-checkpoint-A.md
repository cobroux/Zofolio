# T9 - Revue du point de contrôle A

Diff : `main..feat/v1-socle`. Verdict : **OK, aucun bloquant** (2 critères A non vérifiables ici, voir fin).

## Vérification exécutée
- `backend ./mvnw -B verify` (Java 21) : BUILD SUCCESS, 1 IT, JaCoCo OK.
- `frontend npm test` (1 test), `npm run lint`, `npm run build` : verts.
- `git ls-files | grep -E 'private/|\.env$'` : vide.

## Problèmes (du plus grave au moins grave)

1. **Majeur** - `backend/src/main/java/dev/zofolio/shared/ApiExceptionHandler.java:43-47` : `handleAny` renvoie 500 sans journaliser l'exception, la cause est perdue (ex. échec SMTP/BDD). Correctif : ajouter un `log.error("Unhandled", ex)` avant le retour.
2. **Majeur** - `frontend/angular.json:36` : `allowedHosts: ["localhost"]` ; en prod le domaine sera refusé par le SSR (repli CSR ou 400). Correctif : ajouter le domaine de prod (ou variable) avant T38.
3. **Mineur** - `docker-compose.yml:27` : `env_file: .env` sur le frontend lui injecte `DB_PASSWORD`, `SMTP_PASSWORD`, `IP_HASH_SALT` inutiles. Correctif : ne passer que `API_INTERNAL_URL` (déjà en `environment`), retirer `env_file`.
4. **Mineur** - `docker-compose.yml:16-23` : le backend n'a ni `ports` ni healthcheck, `frontend` dépend de lui sans `service_healthy` ; le critère « sert le back » n'est pas observable depuis l'hôte. Correctif : healthcheck actuator ou `127.0.0.1:8080:8080` en dev.
5. **Mineur** - `backend/src/main/resources/application.properties:4` : mot de passe BDD par défaut `zofolio` si `DB_PASSWORD` absent (démarrage silencieux avec un secret faible en prod). Correctif : retirer le défaut (échec explicite).
6. **Mineur** - `backend/.../ApiExceptionHandler.java:53-54` : `HttpStatus.valueOf` lève sur un statut non standard. Correctif : `String.valueOf(status.value())` ou `status.toString()`.
7. **Mineur** - `frontend/src/server.ts:35-41` : `maxAge: '1y'` aussi pour `favicon.ico` et fichiers non hachés. Correctif : `immutable` seulement pour les assets hachés (à traiter avec T17 polices).
8. **Mineur** - `.gitignore:5-6` : `*.jpeg`/`*.JPG` ignorés mais pas `*.jpg`/`*.png` hors `private/`. Correctif : unifier (`*.[jJ][pP][gG]`) ou s'en tenir à `private/`.
9. **Mineur** - `frontend/src/index.html:2,5` : `lang="en"` et `<title>Frontend</title>` ; sans objet tant que T18/T20 n'ont pas eu lieu. Correctif : `lang="fr"`, titre réel dans T20.
10. **Mineur** - `.github/workflows/ci.yml:22,37` : actions épinglées par tag, pas par SHA. Correctif : épingler par SHA (optionnel, dépôt public).

## Non vérifié (réserve sur critères A)
- `docker compose up --build` servant `/fr/` et le back : non exécuté.
- CI verte sur une PR : non vérifiable localement (aucune PR).
