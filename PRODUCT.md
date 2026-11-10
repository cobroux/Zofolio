# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: tech leads, engineering managers and recruiters hiring a **fullstack Java/Spring + Angular** engineer in Paris. They arrive from a CV, LinkedIn or a shared link, give the first screen a few seconds, then spend a few minutes cross-checking the site against the CV before deciding whether to call.

## Product Purpose

Zofolio (https://zoworks.fr) is Enzo Leveque's portfolio. It exists to back the CV with proof and to make the reader want Enzo on their team. Success is all of: the visitor writes (contact form, email, LinkedIn), keeps the CV (download), and remembers him ("the trail-running dev with bib 1592").

## Positioning

The site is a race: the real elevation profile of the Grand Trail d'Auvergne 2025 (79.4 km, finished in 13 h 35 min 53 s, bib 1592) is the table of contents, the scroll is the distance, and each career stage is a checkpoint (P1 education, P2 Worldline, P3 personal projects, finish = contact). No other portfolio has this profile, this bib or these splits. The site itself (Angular 22 SSR, Spring Boot 4.1, Postgres, CI with E2E and Lighthouse, automated deploy) is part of the proof.

## Operating Context

- Readers compare the site with the CV PDF served at `/api/{fr,en}/cv` (replaceable from the admin). Facts must match the CV.
- Bilingual FR/EN; FR is the source.
- Content (projects, races, yearly stats, case studies) is edited through the admin and served by the API; the visual layer must render whatever the admin holds.

## Capabilities and Constraints

- Stack fixed: Angular 22 SSR front, Spring Boot back, Caddy, one ARM VM. No framework migration.
- Full content readable without JavaScript (SSR); `prefers-reduced-motion` honoured everywhere.
- Lighthouse mobile thresholds: 90 performance, 95 accessibility, best practices, SEO. axe-core: zero violations in light and dark, FR and EN.
- The redesign lives on branch `redesign/v4` and is not deployed until Enzo explicitly approves.

## Brand Commitments

- Name: Enzo Leveque. Domain zoworks.fr. Monogram "EL" favicon.
- Concept "La Course": bib 1592, the GTA profile, checkpoints P1/P2/P3, finish line. Binding.
- Voice: serious and factual, figures over adjectives, one touch of dry humour per section at most (Phidippides under the contact form, PR badges). First person, sober "je", never "tu".
- Personality to convey: endurance and regularity, rigour, curiosity (history, technology, AI used as a tool), dry humour.

## Evidence on Hand

- Real photos: portrait, finisher Côte d'Opale, course photos (`frontend/public/img/`), demo clips (`frontend/public/media/`, admin media).
- Real data: GTA profile (`profile.data.ts`), races and yearly totals 2023–2026 (API), GitHub contributions sync.
- Case studies: Worldline trading app (TOM), Oltre, Zotracker, GFaim; facts in `docs/content/facts-*.md` and the CV (`backend/src/main/resources/cv/`).
- Absent, never to be invented: testimonials, client logos, press, employer-approved figures beyond the CV.

## Product Principles

1. Proof before ornament: every section answers a tech lead's question (who, what, proof, contact).
2. The race structures, it never hides the content.
3. Premium through precision: few ideas, each executed perfectly; the site's own quality is evidence.
4. Consistency with the CV is non-negotiable.
5. Fast on a phone: a beautiful but slow site is a negative signal for an engineer.

## Accessibility & Inclusion

WCAG 2.2 AA; keyboard and screen-reader complete; reduced-motion and no-JS paths show all content.
