--liquibase formatted sql

--changeset zofolio:experience-schema
CREATE TABLE experience (
    id BIGSERIAL PRIMARY KEY,
    stage VARCHAR(4) NOT NULL,
    kind VARCHAR(16) NOT NULL,
    title JSONB NOT NULL,
    body JSONB NOT NULL,
    period JSONB,
    stack JSONB,
    note JSONB,
    sort_order INT NOT NULL
);
