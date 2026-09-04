-- Catalogue de grilles numérotées, pour associer un numéro stable et lisible
-- (ex. "Grille #128") à une œuvre + une difficulté : sert à créer des liens
-- sudokuart.com/?grille=128 imprimables sur un visuel teaser (voir
-- TeaserGridGenerator.jsx) — n'importe qui ouvrant ce lien démarre EXACTEMENT
-- la même grille depuis le début, sans dépendre d'un id de défi imprévisible
-- ni d'une vraie partie déjà en cours.
--
-- Volontairement séparé de `challenges`/`rematches` : ce n'est ni un défi ni
-- une comparaison de score, juste une grille de départ figée et réutilisable
-- indéfiniment. On ne stocke que l'id de l'œuvre (painting_id), jamais de
-- copie de l'image : son URL reste résolue dynamiquement via
-- src/data/paintingsIndex.js, donc rien n'expire côté stockage.
create table if not exists public.numbered_puzzles (
  number bigint generated always as identity primary key,
  puzzle jsonb not null,
  solution jsonb not null,
  difficulty text not null,
  painting_id text not null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

alter table public.numbered_puzzles enable row level security;

-- Lecture publique : n'importe quel visiteur ouvrant un lien ?grille=N (donc
-- non authentifié la plupart du temps) doit pouvoir charger cette grille.
-- Rien de privé n'y est stocké (juste un puzzle + l'id d'une œuvre publique).
create policy "numbered_puzzles_select_all"
  on public.numbered_puzzles
  for select
  to anon, authenticated
  using (true);

-- Création réservée à l'admin (même identité que get_platform_stats() /
-- is_platform_admin()) : seul le générateur de grille teaser, un outil
-- admin, crée des entrées ici.
create policy "numbered_puzzles_insert_admin"
  on public.numbered_puzzles
  for insert
  to authenticated
  with check ((auth.jwt() ->> 'email') = 't.dabadie@gmail.com');
