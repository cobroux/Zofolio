--liquibase formatted sql

--changeset zofolio:project-v2
ALTER TABLE project ADD COLUMN github_repos JSONB NOT NULL DEFAULT '[]',
    ADD COLUMN role JSONB, ADD COLUMN problem JSONB, ADD COLUMN decisions JSONB, ADD COLUMN wall JSONB,
    ADD COLUMN takeaway JSONB, ADD COLUMN ai_note JSONB, ADD COLUMN video JSONB;
UPDATE project SET github_repos = jsonb_build_array(regexp_replace(repo_url, '^https://github\.com/cobroux/', ''))
    WHERE repo_url IS NOT NULL;
ALTER TABLE project DROP COLUMN commits, DROP COLUMN repo_url;
