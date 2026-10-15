--liquibase formatted sql

--changeset zofolio:stages-v2 (décisions d'Enzo 2026-10-15, plan-v2 §9)
UPDATE project SET stage = 'P1' WHERE slug IN ('gfaim', 'cin-folie', 'quarkus-color', 'objvlisp2023', 'lambda-calcul');
UPDATE project SET title = '{"fr":"Application de trading chez Worldline"}' WHERE slug = 'trading-app';
