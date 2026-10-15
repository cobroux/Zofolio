--liquibase formatted sql

--changeset zofolio:seed-projects
INSERT INTO project (slug, tier, stage, title, pitch, ai_tag, stack, duration, commits, note, repo_url, demo_url, sort_order) VALUES
('oltre', 'CASE_STUDY', 'P3', '{"fr":"Oltre"}', '{"fr":"Une application personnelle de pilotage du quotidien, avec un backend Java et un frontend Angular séparés."}', 'HAND_THEN_AI', '["Angular 22","Java","MySQL","Docker Compose"]', NULL, 355, '{"fr":"Projet commencé en juin 2026. Commits : backend et frontend."}', NULL, NULL, 10),
('zotracker', 'CASE_STUDY', 'P3', '{"fr":"Zotracker"}', '{"fr":"Le suivi GPS en direct d''une course à pied : carte, chrono, allure, heure d''arrivée estimée, profil d''altitude et messages des proches."}', 'AI', '["Node.js 22","Docker Compose"]', NULL, 34, '{"fr":"Des alertes privées (SOS, immobile, hors parcours) préviennent les proches, et la zone de départ est masquée sur la trace publique. Un mode simulation permet de tout tester sans courir."}', NULL, NULL, 20),
('trading-app', 'CASE_STUDY', NULL, '{"fr":"Application de trading"}', '{"fr":"Une application qui permet à des professionnels de la finance d''acheter et de vendre des titres en bourse."}', 'HAND', '["Java","Spring Boot","JEE","Hibernate","REST","messaging asynchrone","Docker","Tomcat","GitLab CI"]', '{"fr":"2,5 ans"}', NULL, NULL, NULL, NULL, 30),
('gfaim', 'CASE_STUDY', NULL, '{"fr":"GFaim"}', '{"fr":"Une application et son API, projet universitaire non déployé."}', 'HAND', '[]', NULL, NULL, NULL, NULL, NULL, 40),
('garmin-mcp', 'SHORT', 'P3', '{"fr":"garmin-mcp"}', '{"fr":"Un service REST qui relaie mes données Garmin Connect vers Oltre."}', 'AI', '["Python","Railway"]', NULL, 29, NULL, NULL, NULL, 50),
('histoquiz', 'SHORT', 'P3', '{"fr":"HistoQuiz"}', '{"fr":"Un quiz d''histoire multijoueur en temps réel, de 1914 à 1991."}', 'AI', '["Java 21","Spring Boot 4.1","WebSocket STOMP","Angular 22","Docker"]', NULL, 2, NULL, NULL, NULL, 60),
('lisp-interpretor', 'SHORT', 'P1', '{"fr":"LISP-Interpretor"}', '{"fr":"Un interpréteur Lisp écrit en Java, avec son lecteur, son évaluateur et son environnement."}', 'HAND', '["Java"]', NULL, NULL, NULL, 'https://github.com/cobroux/LISP-Interpretor', NULL, 70),
('bomberstudent', 'SHORT', 'P1', '{"fr":"BomberStudent"}', '{"fr":"Un Bomberman en réseau, communiquant par sockets."}', 'HAND', '["C"]', NULL, 5, NULL, 'https://github.com/cobroux/BomberStudent', NULL, 80),
('calculateur-dpe', 'SHORT', 'P1', '{"fr":"Calculateur DPE"}', '{"fr":"Une application qui calcule le DPE médian d''une rue, d''une ville ou d''un département, livrée avec sa chaîne CI/CD (projet DevOps)."}', 'HAND', '["Java EE","JSF","Docker Compose","Elasticsearch","Nginx"]', NULL, NULL, NULL, 'https://github.com/cobroux/Projet-JAI-Devops-DPE-calculator', NULL, 90),
('cin-folie', 'SHORT', NULL, '{"fr":"Cin-folie"}', '{"fr":"Projet universitaire."}', 'HAND', '[]', NULL, NULL, NULL, NULL, NULL, 100),
('quarkus-color', 'SHORT', NULL, '{"fr":"quarkus-color"}', '{"fr":"Projet universitaire."}', 'HAND', '[]', NULL, NULL, NULL, NULL, NULL, 110),
('objvlisp2023', 'SHORT', NULL, '{"fr":"ObjVLisp2023"}', '{"fr":"Projet universitaire."}', 'HAND', '[]', NULL, NULL, NULL, NULL, NULL, 120),
('lambda-calcul', 'SHORT', NULL, '{"fr":"LambdaCalcul"}', '{"fr":"Projet universitaire."}', 'HAND', '[]', NULL, NULL, NULL, NULL, NULL, 130),
('file-name-changer', 'HIDDEN', NULL, '{"fr":"File-name-changer"}', '{"fr":"Masqué."}', 'HAND', '[]', NULL, NULL, NULL, NULL, NULL, 900),
('root-me', 'HIDDEN', NULL, '{"fr":"Root-ME"}', '{"fr":"Masqué."}', 'HAND', '[]', NULL, NULL, NULL, NULL, NULL, 910),
('cobroux', 'HIDDEN', NULL, '{"fr":"cobroux"}', '{"fr":"Masqué."}', 'HAND', '[]', NULL, NULL, NULL, NULL, NULL, 920),
('gfaim-politique-confidentialite', 'HIDDEN', NULL, '{"fr":"GFaim, politique de confidentialité"}', '{"fr":"Masqué."}', 'HAND', '[]', NULL, NULL, NULL, NULL, NULL, 930);
