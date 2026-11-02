--liquibase formatted sql

--changeset zofolio:stack-neutral-labels
-- stack n'est pas localisé : des libellés neutres évitent du français sur la version EN.
UPDATE project SET stack = (
    SELECT jsonb_agg(CASE e WHEN 'messaging asynchrone' THEN 'Async messaging' WHEN 'JavaScript natif' THEN 'Vanilla JS' ELSE e END ORDER BY i)
    FROM jsonb_array_elements_text(stack) WITH ORDINALITY AS t(e, i))
WHERE jsonb_exists_any(stack, array['messaging asynchrone', 'JavaScript natif']);
UPDATE experience SET stack = (
    SELECT jsonb_agg(CASE e WHEN 'messaging asynchrone' THEN 'Async messaging' WHEN 'JavaScript natif' THEN 'Vanilla JS' ELSE e END ORDER BY i)
    FROM jsonb_array_elements_text(stack) WITH ORDINALITY AS t(e, i))
WHERE jsonb_exists_any(stack, array['messaging asynchrone', 'JavaScript natif']);
