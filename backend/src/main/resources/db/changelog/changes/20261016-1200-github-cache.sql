--liquibase formatted sql

--changeset zofolio:github-cache
CREATE TABLE github_repo (
    name VARCHAR(100) PRIMARY KEY,
    pushed_at TIMESTAMPTZ,
    commits INT,
    languages JSONB NOT NULL,
    synced_at TIMESTAMPTZ NOT NULL
);
CREATE TABLE github_contributions (
    id SMALLINT PRIMARY KEY CHECK (id = 1),
    start_date DATE NOT NULL,
    counts JSONB NOT NULL,
    total INT NOT NULL,
    synced_at TIMESTAMPTZ NOT NULL
);
