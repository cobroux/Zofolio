--liquibase formatted sql
--changeset zofolio:20261017-1000-seed-sport-years
-- Agrégats Garmin validés par Enzo (2026-10-17) : km et D+ = course à pied + vélo (km de natation exclus, peu fiables) ;
-- heures et activités = course + vélo + natation. 2026 arrêté au 16 octobre. Aucun GPS ni donnée de santé.
INSERT INTO sport_year (year, distance_km, elevation_gain_m, hours, activities) VALUES
  (2023, 347, 2424, 45, 57),
  (2024, 2191, 13675, 184, 164),
  (2025, 3619, 29136, 268, 200),
  (2026, 4748, 32931, 279, 269)
ON CONFLICT (year) DO UPDATE SET distance_km = EXCLUDED.distance_km, elevation_gain_m = EXCLUDED.elevation_gain_m,
  hours = EXCLUDED.hours, activities = EXCLUDED.activities, updated_at = now();
