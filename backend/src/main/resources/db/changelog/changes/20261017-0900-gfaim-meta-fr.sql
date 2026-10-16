--liquibase formatted sql

--changeset zofolio:gfaim-meta-fr (revue V3-T16 : metaDescription FR de GFaim à 160 caractères au plus, 156 ici)
UPDATE project SET meta_description = jsonb_set(meta_description, '{fr}', '"Étude de cas de GFaim : mon projet de fin d''études, un planificateur de repas en Java et Quarkus, d''abord à cahier des charges imposé, puis libre d''innover."') WHERE slug = 'gfaim';
