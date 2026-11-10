--liquibase formatted sql

--changeset zofolio:p3-demo-urls
UPDATE project SET demo_url = 'https://oltre.zoworks.fr' WHERE slug = 'oltre' AND demo_url IS NULL;
UPDATE project SET demo_url = 'https://zotracker.zoworks.fr' WHERE slug = 'zotracker' AND demo_url IS NULL;
