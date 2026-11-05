--liquibase formatted sql

--changeset zofolio:github-contribution-years
CREATE TABLE github_contribution_year (
    year INT PRIMARY KEY,
    total INT NOT NULL CHECK (total >= 0),
    synced_at TIMESTAMPTZ NOT NULL
);
