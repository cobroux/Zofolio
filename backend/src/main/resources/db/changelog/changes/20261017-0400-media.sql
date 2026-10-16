--liquibase formatted sql

--changeset zofolio:media (D43 : fichiers téléversés, nom = SHA-256 tronqué du contenu final)
CREATE TABLE media (
    id BIGSERIAL PRIMARY KEY,
    file_name VARCHAR(40) NOT NULL UNIQUE,
    kind VARCHAR(8) NOT NULL,
    content_type VARCHAR(32) NOT NULL,
    bytes INT NOT NULL,
    width INT,
    height INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
