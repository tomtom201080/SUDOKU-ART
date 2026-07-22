-- Nom facultatif donné à un défi photo à la création, pour s'y retrouver
-- dans l'historique Memories (même besoin déjà couvert sur rematches.label,
-- voir 20260722120000_add_label_to_rematches.sql).
alter table public.challenges add column if not exists label text;
