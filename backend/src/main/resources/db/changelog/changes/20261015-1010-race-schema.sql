--liquibase formatted sql

--changeset zofolio:race-schema
CREATE TABLE race (
    id BIGSERIAL PRIMARY KEY,
    kind VARCHAR(8) NOT NULL,
    race_date DATE,
    name JSONB NOT NULL,
    distance_km NUMERIC(5,1),
    elevation_gain_m INT,
    duration_s INT,
    note JSONB,
    personal_record BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INT NOT NULL
);
