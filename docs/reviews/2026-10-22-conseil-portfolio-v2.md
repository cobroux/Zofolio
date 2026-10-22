# Conseil multi-agents sur le portfolio, 2e passage (2026-10-22)

Réévaluation après les PR #23 à #29 (précédent : [2026-10-21-conseil-portfolio.md](2026-10-21-conseil-portfolio.md), 7/10). 5 membres indépendants, relecture et classement à l'aveugle par 5 relecteurs qui ont vérifié les faits sur le site et le repo. Limites : aucun rendu visuel ni Lighthouse en direct ; tous des Claude.

**Note globale : 7,5/10 (+0,5), unanime.** Le demi-point vient de ce qui a été retiré de faux (colophon en brouillon, infra inventée, Aubay absent, compteurs faibles). Pas un point entier : rien de nouveau ne prouve le niveau Java, et deux corrections ont ouvert de nouveaux angles d'attaque.
Projection (rigoriste) : 8 avec le domaine et un colophon exact, 8,5 avec la preuve Worldline.

## Ce qui va mieux
- Colophon exact (190 tests, infra réelle) ; plus aucun gabarit.
- Aubay visible dès le hero ; Journal sport bien dosé (3 courses, détail replié).
- DA et design : toujours le point fort, aucune nouvelle critique.

## Nouveaux problèmes (vérifiés par les relecteurs)
- [ ] **CV servi = l'ancien.** `/api/fr/cv` est identique octet pour octet au PDF du 15/10 (sans Aubay), derrière le bouton principal. Priorité n° 1, unanime.
- [ ] **Trou de 9 mois visible** : Worldline finit en sept. 2025, Aubay et Oltre commencent en juin 2026. « Et un nouveau poste » le floutait. À côté, 4 748 km de sport en 2026 (lecture hostile possible).
- [ ] **Colophon inexact sur Lighthouse** : « les seuils font échouer le build, une PR rouge ne se fusionne pas ». Faux : la protection de `main` n'exige que backend, frontend, e2e, et Lighthouse mesure `localhost:4000` en CI, pas la prod.
- [ ] **Aperçu LinkedIn** (meta et og:description) : pas d'Aubay, finit sur le chrono du GTA. `og-fr.jpg` toujours en 404.
- [ ] **Statut ambigu** : hero « chez Aubay », pied de page « Recherche basée à Paris » (gênant vis-à-vis de l'employeur actuel).
- [ ] **EN inachevé** : « messaging asynchrone », « JavaScript natif » en français ; décimales FR (« 62,9 km ») à côté de « km 58.2 ».
- [ ] **Aubay sans étape propre**, logé dans « P2 · Worldline », avant les postes de 2023.
- [ ] **Compteurs de commits** sur les projets tagués IA (Zotracker 111 en 3 semaines, meilleure semaine 121) : lecture « les agents codent, il pilote ». Montrer le jugement (un refus daté, un ADR) plutôt que le volume.
- [ ] « Ce que j'ai décidé moi-même » reste générique (aucun refus daté, les 3 ADR ne sont pas liés).

## Les 3 prochains changements les plus rentables
1. **CV et cohérence du récit (~1 h)** : nouveau PDF, Aubay dans meta/OG sans le chrono, une ligne sur sept. 2025 → juin 2026, statut clair dans le pied de page.
2. **Domaine** (connu) : sans aperçu LinkedIn, ne pas diffuser le lien.
3. **Une preuve Spring signée** : Worldline (schéma anonymisé, vraie décision avec l'alternative écartée, un ordre de grandeur), ou, si confidentiel, un module back d'Oltre écrit à la main avec lien vers le code et un ADR.

## Notes du conseil
- Accord à 5 : 7,5/10, trou de 9 mois, phrase Lighthouse, Worldline comme plafond.
- Désaccord : CV ou domaine en premier. Position retenue : le CV, en ligne et contradictoire dès maintenant ; le domaine bloque seulement la diffusion.
- Classement agrégé : généraliste 1,2 · rigoriste 2,2 · pragmatique 2,6 · premiers principes 4,0 · red-teamer 5,0.
- Écarté : le doute sur les tests front (81 est juste : un `it.each` génère 3 cas).
- À trancher par Enzo : que dire des 9 mois (ou rien) ; statut public (« Basé à Paris » ou « En poste, ouvert aux échanges »).
