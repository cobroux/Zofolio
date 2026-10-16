Status: APPROVED by Enzo 2026-10-16

# English copy, V1 + V2 "Mid-course" (T30)

Translation of `copy-fr-v1.md` and `copy-fr-v2.md` (both validated by Enzo). Same keys, same order.
Rules: sober "I", dry tone, one touch of fun per section at most, no buzzwords. Proper names and stack unchanged. Units in km/m, times in `13:35:53` format, dates as `11 October 2025`, numbers as `3,160 m` / `79.4 km`.
Worldline: employer name only. No architecture, no client, no feature name, no product name. Nothing added compared with the FR version.
Gaps stay as `[TO PROVIDE: ...]`.

Glossary: dossard = bib · ravitaillement = aid station · « Le mur du 60e km » = The wall at km 60 · étape = leg · tracé = route · heures de passage = split times · Départ / Arrivée = Start / Finish · Journal de course = Training log · fiche compacte = short card · décision / compromis = decision / trade-off.

---

# Part 1: V1 (`copy-fr-v1.md`)

## 0. Meta and shared

| Key | Text |
|---|---|
| `meta.title` | Enzo Leveque, Java / Spring Boot and Angular full-stack engineer |
| `meta.description` | Enzo Leveque's portfolio: 2.5 years on a trading application at Worldline, side projects born from running, and the Grand Trail d'Auvergne finished in 13:35:53. |
| `meta.legal.title` | Legal notice, Enzo Leveque |
| `meta.legal.description` | Publisher, host and handling of contact form data. |
| `nav.depart` | Start |
| `nav.p1` | Foundations |
| `nav.p2` | Worldline |
| `nav.p3` | Projects |
| `nav.journal` | Training log |
| `nav.arrivee` | Finish |
| `footer.line` | Enzo Leveque · GitHub · LinkedIn (the Pheidippides line sits under the form, see `arrivee.foot`) |
| `footer.legal` | Legal notice |
| `footer.skip` | Skip to content |
| `profile.label` | Elevation profile of the 2025 Grand Trail d'Auvergne |
| `404.title` | Page not found |
| `404.body` | You're off course. The markings pick up again on the home page. |
| `404.cta` | Back to the start |

## 1. Start (hero)

| Key | Text |
|---|---|
| `hero.h1` | Enzo Leveque |
| `hero.title` | Java / Spring Boot + Angular full-stack engineer |
| `hero.lead` | 2.5 years on a critical trading application at Worldline. |
| `hero.stack` | Java · Spring Boot · Angular · Docker · SQL |
| `hero.cta.cv` | Download the CV |
| `hero.cta.contact` | Contact me |
| `hero.split` | Start 06:30 · km 0 |
| `hero.bib` | 1592 |
| `hero.keyfact` | 2.5 years · Worldline · trading |
| `hero.photo.alt` | Enzo Leveque in trail gear, in front of a blue sky. |

## 2. P1: The foundations (km 20)

| Key | Text |
|---|---|
| `p1.title` | The foundations |
| `p1.lead` | A bachelor's and a master's degree in computer science at Université d'Artois, two years of it as a work-study placement. The projects below are written by hand and delivered on time. |
| `p1.master.title` | Master's in Software Engineering for the Internet (ILI) |
| `p1.master.body` | Bachelor's in computer science (2020-2023), then the ILI master's (2023-2025) at Université d'Artois, two years of it as a work-study placement at Worldline. |
| `p1.licence` | Bachelor's in computer science, Université d'Artois, 2020-2023 (mini timeline: Bachelor's 2020-2023, then Master's 2023-2025). |
| `p1.tag` | Written by hand |
| `p1.note` | Roman road on the GR3: roughly where the trail gets serious. |
| `p1.card1` | LISP-Interpretor: a Lisp interpreter written in Java, with its reader, evaluator and environment. Java. github.com/cobroux/LISP-Interpretor |
| `p1.card2` | BomberStudent: a networked Bomberman, client and server talking over sockets. C. github.com/cobroux/BomberStudent |
| `p1.card3` | DPE calculator: an app that computes the median energy performance rating (DPE) of a street, a city or a department, shipped with its CI/CD pipeline (DevOps project). Java EE · JSF · Docker Compose · Elasticsearch · Nginx. github.com/cobroux/Projet-JAI-Devops-DPE-calculator |

Note: the ILI class logo stays out of V1 without the written consent of the teacher it represents (plan §5).

### R1: Aid station, hospital porter

| Key | Text |
|---|---|
| `r1.title` | Hospital porter in the ER |
| `r1.body` | From 2020 to 2023, at the Beuvry hospital. Keeping a cool head and speaking clearly when everything moves fast: training that still pays off during a production incident. |
| `r1.ration` | 2020 to 2023 · emergency room · Beuvry hospital |
| `r1.fun` | Aid station: access badge. |

## 3. P2: Worldline (km 44)

Inverted flat block, the longest leg. The whole block is subject to Enzo's validation.

| Key | Text |
|---|---|
| `p2.title` | 2.5 years on a trading app |
| `p2.lead` | At Worldline, from 2023 to 2025: 2.5 years of professional experience. The application lets finance professionals buy and sell securities on the stock market. Here, a mistake doesn't show up in a log: it shows up in an order. |
| `p2.stack` | Java · Spring Boot · JEE · Hibernate · REST · asynchronous messaging · Docker · Tomcat · GitLab CI |
| `p2.m1.title` | Back-end developer |
| `p2.m1.dates` | March to August 2023 |
| `p2.m1.body` | My first months: a back-end project carried end to end, from study to acceptance. |
| `p2.m1.split` | Java · SQL · Git · asynchronous messaging |
| `p2.m2.title` | Full-stack developer |
| `p2.m2.dates` | September 2023 to September 2025 |
| `p2.m2.body` | Complete changes, from the need to production: analysis, back-end and front-end code, tests, review. In a Scrum team. |
| `p2.m2.split` | Spring Boot · Hibernate · REST · GitLab CI · Docker · Tomcat · Scrum |
| `p2.m3.title` | One feature, from mock-up to production |
| `p2.m3.body` | In my final year, a feature I carried alone: mock-up, validation with the Product Owner, then full development. |
| `p2.m3.split` | Figma · Spring · SQL |
| `p2.lesson` | A hard-coded date hid a bug until production. Since then, I test in real conditions. |
| `p2.fun` | P2: the longest leg. |
| `p2.now` | Since June 2026: Software Engineer (consultant) at Aubay. |

## 4. R2: Aid station, first-year tutor

| Key | Text |
|---|---|
| `r2.title` | First-year tutor |
| `r2.body` | From 2023 to 2025, at Université d'Artois, I coached first-year students through their first programs. Explaining clearly forces you to understand properly. |
| `r2.ration` | 2023-2025 · Université d'Artois · first year |

## 5. P3: Born from running (km 58.2)

Mosaic 7/5, 5/7, 12. Commit stats date from 15 October 2026: freeze or remove.

| Key | Text |
|---|---|
| `p3.title` | Born from running |
| `p3.lead` | Three tools built around my runs: tracking a race live, running my daily life, relaying my Garmin data. |
| `p3.oltre.title` | Oltre |
| `p3.oltre.pitch` | A personal app to run my day-to-day, with a separate Java back end and Angular front end. |
| `p3.oltre.split` | Angular 22 · Java · MySQL · Docker Compose · 355 commits (back end and front end) |
| `p3.oltre.tag` | Started by hand, then with AI |
| `p3.oltre.todo` | Spring Boot 4.1 back end. Project started in June 2026. |
| `p3.zotracker.title` | Zotracker |
| `p3.zotracker.pitch` | Live GPS tracking of a foot race: map, clock, pace, estimated finish time, elevation profile and messages from loved ones. |
| `p3.zotracker.split` | Node.js 22 · Docker Compose · 34 commits |
| `p3.zotracker.body` | Private alerts (SOS, stationary, off route) notify loved ones, and the start area is hidden on the public trace. A simulation mode lets me test everything without running. |
| `p3.zotracker.tag` | Designed with AI |
| `p3.zotracker.fun` | A simulation mode, because running just to test takes a while. |
| `p3.garmin.title` | garmin-mcp |
| `p3.garmin.pitch` | A REST service that relays my Garmin Connect data to Oltre. |
| `p3.garmin.split` | Python · Railway · 29 commits |
| `p3.garmin.todo` | An MCP server and a REST API that expose my Garmin Connect data (activities, sleep, Body Battery) to Claude and to Oltre. Python · Docker · Railway. |
| `p3.histoquiz` | HistoQuiz: a real-time multiplayer history quiz, from 1914 to 1991. Java 21 · Spring Boot 4.1 · WebSocket STOMP · Angular 22 · Docker. |
| `p3.link` | View the repository (github.com/cobroux/Oltre-backend, Zotracker, garmin-mcp, histoquiz) |
| `p3.video.poster` | Video demo coming soon |
| `p3.video.alt` | Placeholder for the Oltre video demo, coming soon. [TO PROVIDE: clip description (V2)] |

## 6. Log (training diary)

The GitHub contribution graph is out of V1. No ranking.

| Key | Text |
|---|---|
| `journal.title` | Training log |
| `journal.lead` | 32 races finished, always a bit further. Same method as at work: measure, adjust, repeat. |
| `journal.index` | 459 |
| `journal.index.caption` | UTMB Index. A number, not a ranking. |
| `journal.col.date` | Date |
| `journal.col.race` | Race |
| `journal.col.dist` | Distance |
| `journal.col.time` | Time |
| `journal.col.note` | Note |
| `journal.pr` | Personal record |
| `journal.fun` | (merged into `journal.index.caption`) |

| Race | Date | Distance | Time | Note |
|---|---|---|---|---|
| Grand Trail d'Auvergne (GTA) | 11 October 2025 | 79.4 km, 3,160 m D+ | 13:35:53 | Start at 06:30, finish at 20:05. A whole day without a single meeting. |
| Côte d'Opale | 13 September 2026 | 62 km | 7:32:39 (personal record) | 5 min 12 s faster than the year before. |
| Côte d'Opale | 14 September 2025 | 62 km | 7:37:51 | The time to beat. |
| Paris Marathon | 2026, [TO PROVIDE: day and month] | 42.195 km | 3:36 | Under 3:40, in the streets of Paris. |
| Louvre-Lens Marathon (La Route du Louvre) | 11 May 2025 | 42.195 km | 3:56:05 | Four minutes under the 4-hour mark. |
| Triathlon des Moines (M format, Fourmies) | [TO PROVIDE: year] | [TO PROVIDE] | 2:28 | Three sports, one clock. |
| Chtriman (S format) | [TO PROVIDE: year] | [TO PROVIDE] | 1:16 | Short format, high pace. |
| Club des Baudets d'Hinges | [TO PROVIDE: since when] | n/a | n/a | Running with others changes the pace. |

## 7. Finish (km 79.4)

Orange flat block.

| Key | Text |
|---|---|
| `arrivee.split` | Finish 20:05 · km 79.4 |
| `arrivee.title` | Next goal: 100 km. (2 lines: "Next goal:" / "100 km.") |
| `arrivee.subtitle` | And a new role. Let's talk. |
| `arrivee.lead` | Looking for a role based in Paris. French, English (TOEIC 910). |
| `arrivee.email` | enzo.lvq12@gmail.com |
| `arrivee.github` | GitHub |
| `arrivee.linkedin` | LinkedIn |
| `arrivee.cv` | Download the CV |
| `arrivee.foot` | Pheidippides ran from Marathon to Athens to carry a message. Here, a form will do. |

### Contact form

| Key | Text |
|---|---|
| `form.title` | Write a message |
| `form.name` | Name |
| `form.email` | Email |
| `form.company` | Company (optional) |
| `form.message` | Message |
| `form.submit` | Send message |
| `form.sending` | Sending… |
| `form.honeypot` | Website (leave empty) |
| `form.noscript` | Without JavaScript, email me directly or download the CV: the links above work. |
| `form.success` | Message sent. Thank you, I'll reply as soon as I can. |

Field errors (`VALIDATION_FAILED`, `errors[].code` = constraint, plan §4.1 and §4.3):

| Field | `code` | Message |
|---|---|---|
| name | NotBlank | Please enter your name. |
| name | Size | The name is limited to 100 characters. |
| name | Pattern | The name can't contain line breaks or control characters. |
| email | NotBlank | Please enter your email address. |
| email | Email | This email address doesn't look valid. |
| email | Size | The email address is limited to 254 characters. |
| company | Size | The company name is limited to 100 characters. |
| message | NotBlank | Write a message: a blank page won't get you very far. |
| message | Size | The message is limited to 5,000 characters. |

Global errors (by `code` from plan §4.1, `aria-live`):

| HTTP | `code` | Message |
|---|---|---|
| 400 | `VALIDATION_FAILED` | A few fields need fixing before sending. |
| 400 | `MALFORMED_REQUEST` | The message couldn't be read. Reload the page and try again. |
| 429 | `RATE_LIMITED` | Too many messages sent from this connection. Try again in {minutes} min, or write directly to [TO PROVIDE: contact email address]. |
| 503 | `MAIL_DELIVERY_FAILED` | Your message is saved, but the notification didn't go out. To be sure it gets read, write to [TO PROVIDE: contact email address]. |
| 500 | `INTERNAL_ERROR` | An unexpected error occurred. Try again in a moment. |
| 404 | `NOT_FOUND` | This resource doesn't exist. |
| no response | network | The server isn't responding. Check your connection and try again. |

## 8. Photo alt texts

| Key | Alt |
|---|---|
| `photo.portrait.alt` | Enzo Leveque in trail gear, in front of a blue sky. |
| `photo.IMG_0124.alt` | Enzo, medal around his neck, in front of the finish arch of the Trail de la Côte d'Opale 62 km |
| `photo.IMG_7732.alt` | Enzo mid-race, bib pinned to his front |
| `photo.IMG_2506.alt` | not used in V1 |
| `photo.IMG_2487.alt` | not used in V1 |

Photos showing third parties still need cropping (SPEC §11, plan §5).

## 9. Legal notice

| Key | Text |
|---|---|
| `legal.title` | Legal notice |
| `legal.editor.title` | Publisher |
| `legal.editor.body` | Enzo Leveque, private individual. Contact: enzo.lvq12@gmail.com. In accordance with article 6-III-2 of the French LCEN law, the address of a non-professional publisher is disclosed to the host. |
| `legal.host.title` | Host |
| `legal.host.body` | Hetzner Online GmbH, Industriestr. 25, 91710 Gunzenhausen, Germany, www.hetzner.com. Server located in the European Union. |
| `legal.data.title` | Contact form data |
| `legal.data.body` | The form collects your name, email address, company (optional) and message, in order to answer your request. A hashed fingerprint of your IP address is kept only to limit the number of submissions (5 per hour). No automatic email is sent to you. |
| `legal.retention.title` | Retention |
| `legal.retention.body` | Messages are kept for 12 months, then deleted. |
| `legal.rights.title` | Your rights |
| `legal.rights.body` | You can request access to, correction of or deletion of your data (GDPR) by writing to [TO PROVIDE: contact email address]. You can also lodge a complaint with the CNIL (cnil.fr). |
| `legal.cookies` | This site sets no cookies or trackers. Only a theme preference is stored in your browser (localStorage): it is strictly necessary and exempt from consent. |
| `legal.credits` | Photographs: Enzo Leveque. For IMG_2487, if used later: Margot and Fabien, photographers, permission obtained. |

---

# Part 2: V2 "Mid-course" (`copy-fr-v2.md`)

## 1. Oltre (slug `oltre`)

| Key | Text |
|---|---|
| `oltre.title` | Oltre |
| `oltre.pitch` | A personal app to organize work and personal life in one full calendar: sport, expenses, tasks, appointments. |
| `oltre.role` | Design and development, alone and from scratch: back end, front end, and setting up Spring Boot and Angular |
| `oltre.duration` | Ongoing |
| `oltre.stack` | Angular 22 · Java 21 · Spring Boot 4.1 · MySQL · Docker Compose |
| `oltre.archi` | A separate Angular front end and Spring Boot back end, a MySQL database, and a small standalone service that fetches my Garmin data. |
| `oltre.problem` | My daily life was scattered: runs in Garmin, expenses in one place, tasks and appointments in another. I wanted to see everything in one place, with my sports activities in it. |
| `oltre.decision1.title` | Garmin in a separate service |
| `oltre.decision1.tradeoff` | Garmin offers no official access: I use an unofficial library, which I isolated from the back end. One more service to run and protect, but a fragile dependency that doesn't contaminate the rest. And when Garmin refuses the connection, the real error reaches the screen instead of a vague message. |
| `oltre.decision2.title` | Gemini rather than Anthropic for the AI coach |
| `oltre.decision2.tradeoff` | Gemini has a free tier, the Anthropic API doesn't: for a personal project, the choice was quick. Downside: the coach stays silent without a key, and the model name has already needed a fix. |
| `oltre.decision3.title` | Login lockout by email and by IP |
| `oltre.decision3.tradeoff` | A stranger can't lock my account from their own machine. Downside: the counter lives in memory, resets to zero on restart and isn't shared across instances. |
| `oltre.wall` | The hardest part wasn't the code: it was pinning down my idea and giving it shape. Going from a fuzzy need, organizing my work and personal life, to a concrete product. |
| `oltre.takeaway` | Depending on an unofficial API means planning from day one where it will break, and telling the user plainly. |
| `oltre.aiNote` | Started by hand, then continued with AI help. |
| `oltre.clip.caption` | A walk through Oltre: expenses, tasks, meals. Dummy data. |
| `oltre.clip.alt` | Screen recording of Oltre: the calendar, then expenses, tasks and meals, with dummy data. |
| `oltre.schema.title` | Oltre architecture |
| `oltre.schema.desc` | Diagram: the Angular front end calls the Spring Boot back end, which reads a MySQL database, queries the Garmin service and, optionally, the Gemini API for the AI coach. |
| `oltre.status` | Ongoing. |

## 2. Zotracker (slug `zotracker`)

| Key | Text |
|---|---|
| `zotracker.title` | Zotracker |
| `zotracker.pitch` | Live GPS tracking of a foot race: my loved ones follow me on a map, with nothing to install. |
| `zotracker.role` | Design and development |
| `zotracker.duration` | Since October 2026 |
| `zotracker.stack` | Node.js 22 · Vanilla JavaScript · Leaflet · Docker Compose · Caddy |
| `zotracker.archi` | My phone sends its position to the server, which snaps it to the official route and broadcasts it live to the public page. |
| `zotracker.problem` | Zotracker was born for the Lille marathon: my parents, family and friends wanted to follow me live. It runs in the browser, with no app to install, and I plan to reuse it on other races. |
| `zotracker.decision1.title` | JSON files rather than a database |
| `zotracker.decision1.tradeoff` | No service to run or back up. Downside: disk writes are on me. I've already added a retry on failure and a refusal to start if the file is corrupted. |
| `zotracker.decision2.title` | A vanilla JavaScript front end, no bundler |
| `zotracker.decision2.tradeoff` | No build step. Downside: duplicated code between server and browser. Statistics are computed twice, and the two results already diverge on the estimated finish time before the start. |
| `zotracker.decision3.title` | Distance computed on the GPX route |
| `zotracker.decision3.tradeoff` | Distance follows the official course, without the GPS zigzag. Points more than 100 m away are ignored, and a gap above 150 m shows "off route". Without a GPX file, the server falls back to raw points, which are less accurate. |
| `zotracker.wall` | On race day, anything can give out: the network drops, the browser GPS shuts off when the screen locks (on iPhone), and safety alerts must still go out. Points are queued when the network drops; the rest of that reliability is still to be built. |
| `zotracker.takeaway` | An app used on race day isn't judged by its demo: it's judged at the worst moment of the race. Hence the simulation mode, to test without running. |
| `zotracker.aiNote` | Designed with AI. |
| `zotracker.clip.caption` | A simulated race on the official Grand Trail d'Auvergne route. |
| `zotracker.clip.alt` | Screen recording of Zotracker: a virtual runner moves along the map, with the clock, pace and elevation profile. |
| `zotracker.schema.title` | Zotracker architecture |
| `zotracker.schema.desc` | Diagram: the GPS position reaches the Node.js server, which projects it onto the route, computes pace and split times, then broadcasts live to the public page and the admin, and triggers the alerts. |
| `zotracker.status` | Ongoing. |

## 3. GFaim (slug `gfaim`, not deployed)

| Key | Text |
|---|---|
| `gfaim.title` | GFaim |
| `gfaim.pitch` | A meal planner for a family, my final-year project. |
| `gfaim.role` | Team of four. I handled both front end and back end. |
| `gfaim.duration` | January to March 2025 |
| `gfaim.stack` | Java 21 · Quarkus · PostgreSQL · Docker Compose · OpenAPI |
| `gfaim.archi` | A native Android app calls a token-protected Quarkus API, which reads a PostgreSQL database and queries the external Spoonacular API. |
| `gfaim.problem` | A professor wanted a meal planner for his family. The starting specification was fixed: we had to follow it. After that, the freedom to innovate beyond it. |
| `gfaim.decision1.title` | Tokens signed with RSA |
| `gfaim.decision1.tradeoff` | The signature is checked with a public key, and the private key stays safe. Downside: generating and distributing keys is done by hand. |
| `gfaim.decision2.title` | A dedicated certificate for the Spoonacular API |
| `gfaim.decision2.tradeoff` | The HTTPS connection goes through a certificate imported by hand. Downside: a manual step to repeat on every machine. [TO PROVIDE: the reason (network, proxy or choice).] |
| `gfaim.wall` | Getting four people's ideas to converge, and meeting the delivery deadlines. |
| `gfaim.innovations` | Features proposed by the team beyond the specification. |
| `gfaim.takeaway` | A good result, and a good team experience. |
| `gfaim.aiNote` | `null` (not provided) |
| `gfaim.status` | Finished: final-year project delivered. Not deployed. |
| `gfaim.clip.caption` | [TO PROVIDE: clip caption, to write when Enzo supplies the footage] |
| `gfaim.clip.alt` | [TO PROVIDE: GFaim clip description] |
| `gfaim.schema.title` | GFaim architecture |
| `gfaim.schema.desc` | Diagram: the Android app calls the GFaim API, which checks a signed token, reads a PostgreSQL database and queries the Spoonacular API. |

## 4. Worldline (slug `trading-app`)

The whole block is subject to Enzo's word-for-word validation. No clip, no architecture diagram, no repository.

| Key | Text |
|---|---|
| `trading.title` | Trading application at Worldline |
| `trading.pitch` | For 2.5 years, I worked on an application that lets finance professionals buy and sell securities on the stock market. |
| `trading.role` | Back-end developer, then full-stack |
| `trading.duration` | 2.5 years of professional experience (March 2023 to September 2025) |
| `trading.stack` | Java · Spring Boot · JEE · Hibernate · REST · asynchronous messaging · GitLab CI · Docker |
| `trading.problem` | A trading application can't afford approximation. When you buy or sell securities, a mistake doesn't stay in a log file: it shows up in an order. My job: deliver complete changes, from analysing the need to production, in a Scrum team. |
| `trading.decision1.title` | Testing in real conditions |
| `trading.decision1.tradeoff` | A hard-coded date hid a bug until production. Since then, I test under conditions close to the real thing, which takes more preparation time before delivery. |
| `trading.decision2.title` | Validating the mock-up before coding |
| `trading.decision2.tradeoff` | On a feature I carried alone in my final year, I had the Product Owner validate the mock-up before development. One more exchange up front, but fewer rework loops along the way. |
| `trading.wall` | The complexity of the solution, and meeting the Definition of Done: a change is only finished once everything is verified, tested and reviewed. |
| `trading.takeaway` | Working on a critical system taught me rigour: analyse before coding, test before shipping, and keep a cool head when everything moves fast. |
| `trading.aiNote` | `null` |
| `trading.repos` | `[]` |
| `trading.privacy` | Professional experience: for confidentiality, I don't detail the application's architecture or features. |

Note: the `decision1` and `decision2` trade-offs are drafting proposals from V1 facts (`p2.lesson`, `p2.m3.body`): Enzo corrects or removes them. Dates: internship March to August 2023, work-study September 2023 to September 2025, to be confirmed.

## 5. Short cards (P1)

One line each: name, stack, link. GFaim has its own case study page and also lives in P1.

| Key | Text |
|---|---|
| `p1.cinefolie` | Cin-folie: a film search and rating site, with accounts and reviews, built on TMDB data. Third-year bachelor's project, in a pair. PHP · CSS · SQLite. github.com/cobroux/Cin-folie-website |
| `p1.quarkus` | quarkus-color: a minimal Quarkus service, one tested `/colors` REST resource, with Dockerfiles and an image-build workflow. Java. github.com/cobroux/quarkus-color |
| `p1.objvlisp` | ObjVLisp2023: third-year bachelor's ObjVLisp project (submitted January 2023), an object model reimplemented in Java, test-driven: supplied tests to make pass. Java. github.com/cobroux/ObjVLisp2023 |
| `p1.lambda` | LambdaCalcul: a pair project on propositional logic (world generation, satisfiability), then a second part with `epiSat` and `update`. Haskell. github.com/cobroux/LambdalCalcul-project |
| `p1.gfaim` | GFaim: my final-year project, a meal planner. Java · Quarkus · PostgreSQL. Read the case study. |

## 6. V2 interface texts

| Key | Text |
|---|---|
| `project.back` | Back to the course |
| `project.section.problem` | The problem |
| `project.section.schema` | The architecture |
| `project.section.decisions` | The decisions |
| `project.section.decisions.lead` | Every choice has a price. Here it is. |
| `project.section.wall` | The wall at km 60 |
| `project.section.wall.lead` | Where it really pushed back. |
| `project.section.takeaway` | What I take from it |
| `project.section.links` | Links |
| `project.split.duration` | Duration |
| `project.split.role` | Role |
| `project.split.stack` | Stack |
| `project.split.commits` | Commits |
| `project.split.languages` | Languages |
| `project.link.repo` | View the repository |
| `project.link.repos` | View the repositories |
| `project.link.demo` | See the demo |
| `project.link.casestudy` | Read the case study |
| `project.video.play` | Play |
| `project.video.pause` | Pause |
| `project.video.label` | Silent video demo, looping |
| `project.video.reduced` | Autoplay is turned off. Start the video with the button. |
| `project.fun` | A wall at km 60: that's where a 79.4 km race is decided. |
| `lang.switch.fr` | FR |
| `lang.switch.en` | EN |
| `lang.switch.label` | Site language |
| `lang.switch.toEn` | Switch the site to English |
| `lang.switch.toFr` | Switch the site to French |
| `contrib.title` | My GitHub activity |
| `contrib.caption` | Contributions over the last 12 months, updated every 6 hours. |
| `contrib.total` | {total} contributions in a year |
| `contrib.cell` | {count} contributions on {date} |
| `contrib.less` | Less |
| `contrib.more` | More |
| `contrib.unavailable` | The graph isn't available right now. |
| `contrib.alt` | GitHub contribution graph over one year: one square per day, darker when activity is higher. |
| `project404.title` | Case study not found |
| `project404.body` | This page doesn't exist, or not yet. The course continues on the home page. |
| `project404.cta` | Back to the course |

## 7. Meta for the 4 pages

| Key | Text |
|---|---|
| `meta.oltre.title` | Oltre, a day-to-day planning app, Enzo Leveque |
| `meta.oltre.description` | Oltre case study: a personal calendar (sport, expenses, tasks, appointments) in Angular and Spring Boot, with its decisions and trade-offs. |
| `meta.zotracker.title` | Zotracker, live GPS race tracking, Enzo Leveque |
| `meta.zotracker.description` | Zotracker case study: live GPS tracking so loved ones can follow a race, with no app to install, and its decisions and trade-offs. |
| `meta.gfaim.title` | GFaim, meal planner, Enzo Leveque |
| `meta.gfaim.description` | GFaim case study: my final-year project, a meal planner in Java and Quarkus, with a fixed specification and then the freedom to innovate. |
| `meta.trading.title` | Trading application at Worldline, Enzo Leveque |
| `meta.trading.description` | 2.5 years of professional experience on a trading application at Worldline: the context, the project's wall and what I take from it. |

---

## Questionable choices for Enzo

1. "Brancardier aux urgences" = "Hospital porter in the ER" (UK "porter", US "patient transporter").
2. `arrivee.lead`: "Looking for a role based in Paris" (the FR is ambiguous).
3. "Chaque choix a un prix" = "Every choice has a price" (could be "has a cost").
4. `nav.journal` = "Log", section = "Race log"; `nav.arrivee` = "Finish".
5. "ingénieur d'études" = "study engineer" (no clean EN equivalent; "software engineer" is the usual translation).
6. Worldline sentence "it shows up in an order" kept literal (word "order" appears in FR as well).

## Decisions by Enzo (2026-10-16)
- "Brancardier" = hospital porter in the ER (ok) · arrivee.lead = "Looking for a role based in Paris" (ok) · "Projets perso" = "Side projects" (ok)
- "Ingénieur d'études" = "Software Engineer (consultant)" (not "study engineer")
- Rail "Arr." = "Finish" · "Journal" = "Training log"
