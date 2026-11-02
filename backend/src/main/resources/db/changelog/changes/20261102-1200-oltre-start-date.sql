--liquibase formatted sql

--changeset zofolio:oltre-start-date
UPDATE project SET note = note || '{"fr": "Projet commencé en octobre 2025. Commits : backend et frontend.", "en": "Project started in October 2025. Commits: back end and front end."}'::jsonb WHERE slug = 'oltre';
