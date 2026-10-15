--liquibase formatted sql

--changeset zofolio:seed-races
-- Marathon de Paris : année 2026 seulement (jour et mois inconnus) ; Moines et Chtriman : année inconnue. Dates NULL, triées en dernier.
INSERT INTO race (kind, race_date, name, distance_km, elevation_gain_m, duration_s, note, personal_record, sort_order) VALUES
('RACE', '2025-10-11', '{"fr":"Grand Trail d''Auvergne (GTA)"}', 79.4, 3160, 48953, '{"fr":"Départ à 6 h 30, arrivée à 20 h 05. Une journée entière sans réunion."}', FALSE, 10),
('RACE', '2026-09-13', '{"fr":"Côte d''Opale"}', 62.9, 893, 27159, '{"fr":"5 min 12 s de mieux que l''année précédente."}', TRUE, 20),
('RACE', '2025-09-14', '{"fr":"Côte d''Opale"}', 63.3, 891, 27471, '{"fr":"La référence à battre."}', FALSE, 30),
('RACE', '2025-05-11', '{"fr":"Marathon du Louvre-Lens (La Route du Louvre)"}', 42.2, NULL, 14165, '{"fr":"Quatre minutes de moins que les 4 heures."}', FALSE, 40),
('RACE', NULL, '{"fr":"Marathon de Paris 2026"}', 42.2, NULL, 12960, '{"fr":"Sous les 3 h 40, dans les rues de Paris."}', FALSE, 50),
('RACE', NULL, '{"fr":"Triathlon des Moines (format M, Fourmies)"}', NULL, NULL, 8880, '{"fr":"Trois sports, un seul chrono."}', FALSE, 60),
('RACE', NULL, '{"fr":"Chtriman (format S)"}', NULL, NULL, 4560, '{"fr":"Format court, rythme soutenu."}', FALSE, 70);
