--liquibase formatted sql

--changeset zofolio:sport-year (D48 : totaux annuels saisis dans l'admin ; aucun tracé ni donnée de santé)
CREATE TABLE sport_year (
    year SMALLINT PRIMARY KEY CHECK (year BETWEEN 2000 AND 2100),
    distance_km INT,
    elevation_gain_m INT,
    hours INT,
    activities INT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
