--liquibase formatted sql

--changeset zofolio:20261015-1100-contact-message
CREATE TABLE contact_message (
    id         bigserial PRIMARY KEY,
    name       varchar(100),
    email      varchar(254),
    company    varchar(100),
    message    text,
    ip_hash    char(64)    NOT NULL,
    status     varchar(8)  NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_contact_message_ip_hash_created_at ON contact_message (ip_hash, created_at);
