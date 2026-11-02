--liquibase formatted sql

--changeset zofolio:oltre-start-date
UPDATE project SET note = note || '{"fr": "Projet commencé en février 2026. Commits : backend et frontend.", "en": "Project started in February 2026. Commits: back end and front end."}'::jsonb WHERE slug = 'oltre';
