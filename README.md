# Zofolio

Portfolio d'Enzo Leveque : Angular 22 (SSR) côté front, Spring Boot 4.1 et PostgreSQL 17 côté back.

## Commandes de dev

```bash
# Tout lancer en local : http://localhost:4000 (Caddy : /api/* -> backend, le reste -> frontend)
docker compose up --build
# Back
cd backend && ./mvnw verify            # build + tests unitaires et d'intégration
cd backend && ./mvnw spring-boot:run
# Front
cd frontend && npm ci && npm start     # http://localhost:4200
cd frontend && npm test                # Vitest
cd frontend && npm run lint
cd frontend && npm run build           # build SSR de production
cd frontend && npx playwright test     # E2E
```

## CI et protection de branche

La CI est définie dans `.github/workflows/ci.yml`. Elle se lance sur chaque `pull_request` et sur chaque `push` sur `main`, avec deux jobs :

- `backend` : `./mvnw -B verify` (Java 21 Temurin, Testcontainers sur `ubuntu-latest`) ;
- `frontend` : `npm ci`, `npm run lint`, `npm test`, `npm run build` (Node 22).

Les runs obsolètes d'une même branche sont annulés. Les actions sont épinglées sur leur version majeure et le token n'a que `contents: read`.

Procédure pour exiger la CI avant fusion (à faire une fois, par Enzo) :

1. Lancer la CI une première fois (ouvrir une PR de test) pour que les noms de checks `backend` et `frontend` existent.
2. Sur GitHub : Settings > Branches > Add rule, motif `main`.
3. Cocher « Require status checks to pass before merging », puis ajouter `backend` et `frontend`.
4. Vérifier avec `gh api repos/:owner/:repo/branches/main/protection` (le JSON doit lister les deux checks dans `required_status_checks.contexts`).
