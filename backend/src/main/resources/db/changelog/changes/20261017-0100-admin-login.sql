--liquibase formatted sql

--changeset zofolio:admin-login (D38 : échecs de connexion admin, comptés par hash d'IP)
CREATE TABLE admin_login_failure (
    id BIGSERIAL PRIMARY KEY,
    ip_hash VARCHAR(64) NOT NULL,
    failed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX admin_login_failure_ip_idx ON admin_login_failure (ip_hash, failed_at);
CREATE INDEX admin_login_failure_at_idx ON admin_login_failure (failed_at);
