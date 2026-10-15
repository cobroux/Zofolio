--liquibase formatted sql

--changeset zofolio:retours-enzo-master-body
UPDATE experience SET body = '{"fr":"Licence informatique (2020-2023) puis Master ILI (2023-2025) à l''Université d''Artois, dont deux ans en alternance chez Worldline."}'
WHERE stage = 'P1' AND kind = 'EDUCATION' AND sort_order = 10;

--changeset zofolio:retours-enzo-p3-repos
UPDATE project SET repo_url = 'https://github.com/cobroux/Oltre-backend' WHERE slug = 'oltre';
UPDATE project SET repo_url = 'https://github.com/cobroux/Zotracker' WHERE slug = 'zotracker';
UPDATE project SET repo_url = 'https://github.com/cobroux/garmin-mcp' WHERE slug = 'garmin-mcp';
UPDATE project SET repo_url = 'https://github.com/cobroux/histoquiz' WHERE slug = 'histoquiz';
