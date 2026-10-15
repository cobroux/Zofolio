--liquibase formatted sql

--changeset zofolio:20261015-1100-cv-download
CREATE TABLE cv_download (
    id            bigserial PRIMARY KEY,
    lang          varchar(2)  NOT NULL,
    downloaded_at timestamptz NOT NULL DEFAULT now()
);
