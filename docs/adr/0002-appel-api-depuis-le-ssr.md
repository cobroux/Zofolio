# ADR 0002 : Appel de l'API depuis le SSR

- Statut : proposé (tech-lead, 2026-10-15), à valider par Enzo
- Modules : core-shell, infra, home-course

## Contexte
SPEC : chaque page publique contient son contenu dans le HTML initial (SSR Angular, conteneur Node), contenu servi par l'API Spring. En prod, Caddy fait le TLS et route `/api/*` vers le back, le reste vers le SSR. Le SSR s'exécute dans le réseau Docker ; le navigateur, lui, ne voit que le domaine public.

## Décision
- Le code Angular appelle toujours des URL relatives `/api/...`.
- Côté serveur uniquement, un intercepteur `HttpClient` préfixe par `API_INTERNAL_URL` (`http://backend:8080` en Docker, `http://localhost:8080` en dev) et applique un timeout de 2 s.
- Le transfer cache HTTP d'Angular (`provideClientHydration`, actif par défaut pour les GET) réinjecte les réponses dans le HTML : le navigateur ne refait pas l'appel à l'hydratation.
- En cas d'erreur ou de timeout, la section concernée affiche un état « contenu indisponible » ; le hero et l'Arrivée, statiques, s'affichent toujours (ADR 0001, point 3).
- En dev sans Docker : `ng serve` avec `proxy.conf.json` (`/api` → `localhost:8080`). Aucune configuration CORS nulle part.

## Alternatives écartées
- SSR qui passe par l'URL publique (`https://domaine/api`) : aller-retour TLS et DNS inutile, dépendance à Caddy, casse en local.
- Prérendu (SSG) au build : le contenu en base (puis l'admin V3) imposerait un rebuild à chaque modification.
- Le SSR lit la base directement : deux chemins d'accès aux données, logique de repli FR dupliquée.

## Conséquences
- Une variable d'environnement de plus (`API_INTERNAL_URL`) et un intercepteur de quelques lignes, testé.
- Le back n'est jamais exposé hors du réseau Docker en prod, ce qui rend aussi fiable l'`X-Forwarded-For` posé par Caddy (limite de débit du contact).
- La latence du back s'ajoute au TTFB : à surveiller dans Lighthouse (T37) ; l'agrégat `/home` limite à un seul appel par page.
