# Zofolio

Angular 22 SSR (`frontend/`) + Spring Boot 4 / Java 21 (`backend/`), PostgreSQL, Liquibase. Règles : `docs/SPEC.md` §9. Design : `docs/DESIGN.md` (lire par section).

- Front : `cd frontend && npm test` (pas de `--watch=false`), `npm run lint`, i18n : `npx ng extract-i18n --output-path src/locale && npm run i18n:check`.
- Back : `cd backend && ./mvnw verify`.
- Local : `docker compose -p zofolio-wt up -d --build` → http://localhost:4000 (médias sous `/fr/media/`). Données GitHub : `GITHUB_TOKEN` dans `.env`, synchro 30 s après démarrage.
- Jamais de merge ni de déploiement de `main` sans feu vert explicite d'Enzo.
- Contenu : aucun chiffre inventé, donnée absente = bloc retiré (pas de « non renseigné », pas de 0).
