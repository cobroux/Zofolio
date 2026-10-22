# Conseil multi-agents sur le portfolio (2026-10-21)

5 membres indépendants (pragmatique, red-teamer, rigoriste, premiers principes, généraliste), relecture et classement à l'aveugle par 5 relecteurs qui ont vérifié les faits sur le site et le repo. Limites : aucun rendu visuel ni Lighthouse en direct ; tous des Claude.

**Note globale : 7/10.** DA et design au-dessus de la moyenne ; le contenu dessert le CV.

## 1. Direction artistique — forte, à garder
« La Course » s'appuie sur du vrai (profil GTA en sommaire, dossard 1592, pointages P1/P2/P3) ; liste anti-slop de DESIGN §1 tenue dans le code.
Réserve unanime : le sport pèse autant que Worldline (Journal, années en chiffres, 7 courses, UTMB, « 100 km »). Risque : « un traileur qui code ».

## 2. Design — la partie la plus solide
Typo cohérente, plancher 15 px, contrastes calculés deux thèmes, `prefers-reduced-motion`, SSR sans JS, en-têtes de sécurité, axe + Lighthouse en CI.
Détail : points ronds (profil, road book, dossard) face à « coins carrés partout » (DESIGN.md:108) — décoratifs, pas des boutons.

## 3. Appui au CV — pas encore (faits vérifiés)
- [x] Colophon prod en brouillon : « [À MESURER : prod] », « [À recompter avant publication] », paragraphes Oracle Cloud + Cloudflare alors que VPS ; « 120 tests » affichés pour ≈ 190 réels (81 back, 79 Vitest, 29 E2E). → corrigé (190 tests, infra réelle ; tableau Lighthouse retiré : mesures prod mobile 87 / 83 / 90 en perf, sous le seuil, à optimiser avant de le remettre).
- [ ] Domaine cassé : canonical, og:image, sitemap, robots → `enzoleveque.dev` (ne répond pas) ; `/fr/og/og-fr.jpg` en 404 → pas d'aperçu LinkedIn.
- [ ] Aubay absent ; le site finit sur « Et un nouveau poste ». Texte prêt : `p2.now`, docs/content/copy-fr-v1.md:97.
- [ ] Kafka / ActiveMQ / RabbitMQ / « expert » du CV non prouvés ; étude Worldline sans schéma ni chiffre.
- [ ] Oltre : novembre 2025 (CV) vs juin 2026 (site) — non vérifié par les relecteurs.
- [ ] Signaux faibles : HistoQuiz 2 commits, « 17 semaines actives sur 53 », « Date non renseignée » ×2, « Smarty » sur GFaim.
- [x] Libellé EN « Designed with AI » encore dans docs/content/copy-v3.md:53.

IA : la transparence est un atout seulement si tout est propre ; aujourd'hui rien ne montre ce qu'Enzo a tranché lui-même.

## 4. Les 3 changements les plus rentables
1. **Colophon + domaine (1-2 h)** — vraies mesures ou retrait, vrai décompte de tests, infra réelle (VPS + Caddy) ; canonical/OG/sitemap corrects ou domaine réel. Avant toute diffusion du lien.
2. **Aligner sur le CV (~2 h)** — Aubay (`p2.now`), dates Oltre, retirer les compteurs faibles, libellé EN.
3. **Preuves Worldline (½ j)** — schéma anonymisé REST → ActiveMQ → traitement d'ordres, une décision avec l'alternative écartée, un ordre de grandeur ; ligne « mes décisions » sur Zofolio/Oltre avec lien vers un ADR ou une revue où une proposition d'agent a été refusée.

## Notes du conseil
- Désaccord : jusqu'où réduire le sport. Position retenue : garder la DA et le Journal, mais le replier sous l'Arrivée.
- Classement agrégé : red-teamer 1,0 · rigoriste 2,4 · premiers principes 2,6 · généraliste 4,0 · pragmatique 5,0.
- Écarté : retirer la table des modèles du colophon (elle sert le récit IA) ; « boutons ronds » (ce sont des points décoratifs).
- À trancher par Enzo : Aubay retiré volontairement (confidentialité) ?
