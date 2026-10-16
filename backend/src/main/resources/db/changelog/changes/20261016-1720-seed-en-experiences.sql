--liquibase formatted sql

--changeset zofolio:seed-en-experiences (copy-en-v1-v2.md)
UPDATE experience SET title = title || '{"en": "Master''s in Software Engineering for the Internet (ILI)"}'::jsonb, body = body || '{"en": "Bachelor''s in computer science (2020-2023), then the ILI master''s (2023-2025) at Université d''Artois, two years of it as a work-study placement at Worldline."}'::jsonb, period = period || '{"en": "2023-2025"}'::jsonb
WHERE sort_order = 10;
UPDATE experience SET title = title || '{"en": "Bachelor''s in computer science"}'::jsonb, body = body || '{"en": "Université d''Artois."}'::jsonb, period = period || '{"en": "2020-2023"}'::jsonb
WHERE sort_order = 20;
UPDATE experience SET title = title || '{"en": "Hospital porter in the ER"}'::jsonb, body = body || '{"en": "From 2020 to 2023, at the Beuvry hospital. Keeping a cool head and speaking clearly when everything moves fast: training that still pays off during a production incident."}'::jsonb, period = period || '{"en": "2020 to 2023"}'::jsonb, note = note || '{"en": "Aid station: access badge."}'::jsonb
WHERE sort_order = 30;
UPDATE experience SET title = title || '{"en": "Back-end developer"}'::jsonb, body = body || '{"en": "My first months: a back-end project carried end to end, from study to acceptance."}'::jsonb, period = period || '{"en": "March to August 2023"}'::jsonb
WHERE sort_order = 40;
UPDATE experience SET title = title || '{"en": "Full-stack developer"}'::jsonb, body = body || '{"en": "Complete changes, from the need to production: analysis, back-end and front-end code, tests, review. In a Scrum team."}'::jsonb, period = period || '{"en": "September 2023 to September 2025"}'::jsonb, note = note || '{"en": "A hard-coded date hid a bug until production. Since then, I test in real conditions."}'::jsonb
WHERE sort_order = 50;
UPDATE experience SET title = title || '{"en": "One feature, from mock-up to production"}'::jsonb, body = body || '{"en": "In my final year, a feature I carried alone: mock-up, validation with the Product Owner, then full development."}'::jsonb
WHERE sort_order = 60;
UPDATE experience SET title = title || '{"en": "First-year tutor"}'::jsonb, body = body || '{"en": "From 2023 to 2025, at Université d''Artois, I coached first-year students through their first programs. Explaining clearly forces you to understand properly."}'::jsonb, period = period || '{"en": "2023-2025"}'::jsonb
WHERE sort_order = 70;
