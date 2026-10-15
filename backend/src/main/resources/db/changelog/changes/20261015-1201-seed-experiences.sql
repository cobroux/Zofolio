--liquibase formatted sql

--changeset zofolio:seed-experiences
INSERT INTO experience (stage, kind, title, body, period, stack, note, sort_order) VALUES
('P1', 'EDUCATION', '{"fr":"Master Ingénierie Logicielle pour l''Internet (ILI)"}', '{"fr":"Université d''Artois, en alternance à partir du 18 septembre 2023. Soutenance d''alternance : « Master 2 ILI »."}', '{"fr":"2023-2025"}', NULL, NULL, 10),
('P1', 'EDUCATION', '{"fr":"Licence informatique"}', '{"fr":"Université d''Artois."}', '{"fr":"2020-2023"}', NULL, NULL, 20),
('R1', 'AID', '{"fr":"Brancardier aux urgences"}', '{"fr":"De 2020 à 2023, au centre hospitalier de Beuvry. Garder la tête froide et parler clairement quand tout va vite : un entraînement qui sert encore devant un incident de production."}', '{"fr":"2020 à 2023"}', NULL, '{"fr":"Ravito : badge d''accès."}', 30),
('P2', 'MISSION', '{"fr":"Développeur back-end"}', '{"fr":"Mes premiers mois : un projet back-end mené de bout en bout, de l''étude à la recette."}', '{"fr":"Mars à août 2023"}', '["Java","SQL","Git","messaging asynchrone"]', NULL, 40),
('P2', 'MISSION', '{"fr":"Développeur fullstack"}', '{"fr":"Des évolutions complètes, du besoin à la mise en production : analyse, code back et front, tests, revue. En équipe Scrum."}', '{"fr":"Septembre 2023 à septembre 2025"}', '["Spring Boot","Hibernate","REST","GitLab CI","Docker","Tomcat","Scrum"]', '{"fr":"Une date codée en dur a masqué un bug jusqu''en production. Depuis, je teste en conditions réelles."}', 50),
('P2', 'MISSION', '{"fr":"Une fonctionnalité, de la maquette à la prod"}', '{"fr":"En dernière année, une fonctionnalité portée seul : maquette, validation avec le Product Owner, puis développement complet."}', NULL, '["Figma","Spring","SQL"]', NULL, 60),
('R2', 'AID', '{"fr":"Tuteur en L1"}', '{"fr":"En 2022-2023, à l''Université d''Artois, j''ai accompagné des étudiants de première année sur leurs premiers programmes. Expliquer clairement oblige à comprendre sérieusement."}', '{"fr":"2022-2023"}', NULL, NULL, 70);
