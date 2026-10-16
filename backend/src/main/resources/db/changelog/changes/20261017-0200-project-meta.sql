--liquibase formatted sql

--changeset zofolio:project-meta (D45 : titre et description de page, repris des meta.* validés ; dernier changeset de contenu, D46)
ALTER TABLE project ADD COLUMN meta_title JSONB, ADD COLUMN meta_description JSONB;

UPDATE project SET
  meta_title = '{"fr": "Oltre, application de pilotage du quotidien, Enzo Leveque", "en": "Oltre, a day-to-day planning app, Enzo Leveque"}',
  meta_description = '{"fr": "Étude de cas d''Oltre : un agenda personnel (sport, dépenses, tâches, rendez-vous) en Angular et Spring Boot, avec ses décisions et leurs compromis.", "en": "Oltre case study: a personal calendar (sport, expenses, tasks, appointments) in Angular and Spring Boot, with its decisions and trade-offs."}'
WHERE slug = 'oltre';

UPDATE project SET
  meta_title = '{"fr": "Zotracker, suivi GPS de course en direct, Enzo Leveque", "en": "Zotracker, live GPS race tracking, Enzo Leveque"}',
  meta_description = '{"fr": "Étude de cas de Zotracker : un suivi GPS en direct pour que les proches suivent une course, sans appli à installer, avec ses décisions et leurs compromis.", "en": "Zotracker case study: live GPS tracking so loved ones can follow a race, with no app to install, and its decisions and trade-offs."}'
WHERE slug = 'zotracker';

UPDATE project SET
  meta_title = '{"fr": "GFaim, planificateur de repas, Enzo Leveque", "en": "GFaim, meal planner, Enzo Leveque"}',
  meta_description = '{"fr": "Étude de cas de GFaim : mon projet de fin d''études, un planificateur de repas en Java et Quarkus, avec un cahier des charges imposé puis de la liberté d''innover.", "en": "GFaim case study: my final-year project, a meal planner in Java and Quarkus, with a fixed specification and then the freedom to innovate."}'
WHERE slug = 'gfaim';

UPDATE project SET
  meta_title = '{"fr": "Application de trading chez Worldline, Enzo Leveque", "en": "Trading application at Worldline, Enzo Leveque"}',
  meta_description = '{"fr": "2,5 ans d''expérience professionnelle sur une application de trading chez Worldline : le contexte, le mur du projet et ce que j''en retire.", "en": "2.5 years of professional experience on a trading application at Worldline: the context, the project''s wall and what I take from it."}'
WHERE slug = 'trading-app';
