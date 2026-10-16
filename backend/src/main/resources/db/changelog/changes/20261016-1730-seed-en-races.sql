--liquibase formatted sql

--changeset zofolio:seed-en-races (copy-en-v1-v2.md)
UPDATE race SET name = name || '{"en": "Grand Trail d''Auvergne (GTA)"}'::jsonb, note = note || '{"en": "Start at 06:30, finish at 20:05. A whole day without a single meeting."}'::jsonb
WHERE sort_order = 10;
UPDATE race SET name = name || '{"en": "Côte d''Opale"}'::jsonb, note = note || '{"en": "5 min 12 s faster than the year before."}'::jsonb
WHERE sort_order = 20;
UPDATE race SET name = name || '{"en": "Côte d''Opale"}'::jsonb, note = note || '{"en": "The time to beat."}'::jsonb
WHERE sort_order = 30;
UPDATE race SET name = name || '{"en": "Louvre-Lens Marathon (La Route du Louvre)"}'::jsonb, note = note || '{"en": "Four minutes under the 4-hour mark."}'::jsonb
WHERE sort_order = 40;
UPDATE race SET name = name || '{"en": "Paris Marathon 2026"}'::jsonb, note = note || '{"en": "Under 3:40, in the streets of Paris."}'::jsonb
WHERE sort_order = 50;
UPDATE race SET name = name || '{"en": "Triathlon des Moines (M format, Fourmies)"}'::jsonb, note = note || '{"en": "Three sports, one clock."}'::jsonb
WHERE sort_order = 60;
UPDATE race SET name = name || '{"en": "Chtriman (S format)"}'::jsonb, note = note || '{"en": "Short format, high pace."}'::jsonb
WHERE sort_order = 70;
