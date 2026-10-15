--liquibase formatted sql

--changeset zofolio:project-schema
CREATE TABLE project (
    id BIGSERIAL PRIMARY KEY,
    slug VARCHAR(64) NOT NULL UNIQUE,
    tier VARCHAR(16) NOT NULL,
    stage VARCHAR(4),
    title JSONB NOT NULL,
    pitch JSONB NOT NULL,
    ai_tag VARCHAR(16) NOT NULL,
    stack JSONB NOT NULL,
    duration JSONB,
    commits INT,
    note JSONB,
    repo_url VARCHAR(255),
    demo_url VARCHAR(255),
    sort_order INT NOT NULL
);
