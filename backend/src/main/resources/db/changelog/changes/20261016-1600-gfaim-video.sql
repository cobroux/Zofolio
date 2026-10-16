--liquibase formatted sql

--changeset zofolio:gfaim-video (clip portrait, plan-v2 §5)
UPDATE project SET video = '{"name": "gfaim-1", "width": 540, "height": 1170, "caption": {"fr": "Connexion, accueil, calendrier des repas et fiche recette dans GFaim. Données factices."}}' WHERE slug = 'gfaim';
