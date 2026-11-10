--liquibase formatted sql

--changeset zofolio:case-study-v4
ALTER TABLE project ADD COLUMN contribution JSONB, ADD COLUMN hindsight JSONB;
