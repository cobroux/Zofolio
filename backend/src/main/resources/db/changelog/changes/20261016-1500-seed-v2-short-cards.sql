--liquibase formatted sql

--changeset zofolio:seed-v2-short-cards (copy-fr-v2.md §5, fiches P1)
UPDATE project SET pitch = '{"fr": "Cin-folie : un site de recherche et de notation de films, avec comptes et avis, sur les données de TMDB. Projet de L3 en binôme."}', stack = '["PHP", "CSS", "SQLite"]' WHERE slug = 'cin-folie';
UPDATE project SET pitch = '{"fr": "quarkus-color : un service Quarkus minimal, une ressource REST `/colors` testée, avec Dockerfiles et workflow de build d''image."}', stack = '["Java"]' WHERE slug = 'quarkus-color';
UPDATE project SET pitch = '{"fr": "ObjVLisp2023 : projet ObjVLisp de L3 informatique (rendu de janvier 2023), un modèle objet réimplémenté en Java, en TDD : des tests fournis à faire passer."}', stack = '["Java"]' WHERE slug = 'objvlisp2023';
UPDATE project SET pitch = '{"fr": "LambdaCalcul : projet en binôme sur la logique propositionnelle (génération de mondes, satisfiabilité), puis une seconde partie avec `epiSat` et `update`."}', stack = '["Haskell"]' WHERE slug = 'lambda-calcul';
