--liquibase formatted sql

--changeset zofolio:gfaim-caption (retours-v2)
UPDATE project SET video = jsonb_set(video, '{caption}', '{"fr": "Inscription, onboarding, création de la famille, allergies, calendrier des repas et fiche recette. Données factices.", "en": "Sign-up, onboarding, family setup, allergies, meal calendar and a recipe. Mock data."}'::jsonb) WHERE slug = 'gfaim';
