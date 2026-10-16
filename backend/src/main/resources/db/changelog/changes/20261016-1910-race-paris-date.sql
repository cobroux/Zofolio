--liquibase formatted sql

--changeset zofolio:race-paris-date (retours-v2 : 49e édition, dimanche 12 avril 2026)
UPDATE race SET race_date = '2026-04-12', name = jsonb_set(jsonb_set(name, '{fr}', '"Marathon de Paris"'), '{en}', '"Paris Marathon"') WHERE sort_order = 50;
