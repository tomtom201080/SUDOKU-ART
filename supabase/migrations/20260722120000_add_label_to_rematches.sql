-- Nom facultatif donné par l'expéditeur à un défi ("Défi du dimanche"...),
-- pour s'y retrouver plus facilement dans "Mes défis envoyés" qu'avec la
-- difficulté et la date seules.
alter table public.rematches add column if not exists label text;
