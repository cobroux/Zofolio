--liquibase formatted sql

--changeset zofolio:r2-tutorat-dates (copy-fr-v1 r2.body, r2.ration)
UPDATE experience SET
    body = '{"fr":"De 2023 à 2025, à l''Université d''Artois, j''ai accompagné des étudiants de première année sur leurs premiers programmes. Expliquer clairement oblige à comprendre sérieusement."}',
    period = '{"fr":"2023-2025"}'
WHERE stage = 'R2' AND kind = 'AID' AND sort_order = 70;
