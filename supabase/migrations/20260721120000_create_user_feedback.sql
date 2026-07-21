-- Table de retours utilisateurs (bug / incompréhension / difficulté /
-- suggestion / autre). Premier fichier de migration versionné du projet :
-- le schéma existant (dont game_events) a été créé à la main dans le
-- dashboard Supabase et n'est pas concerné par ce fichier.

create table if not exists public.user_feedback (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  feedback_type text not null check (feedback_type in ('bug', 'confusion', 'difficulty', 'suggestion', 'other')),
  message text check (char_length(message) <= 2000),
  page text,
  language text check (char_length(language) <= 10),
  difficulty text check (char_length(difficulty) <= 20),
  progress_percent smallint check (progress_percent between 0 and 100),
  puzzle_id text check (char_length(puzzle_id) <= 100),
  app_version text check (char_length(app_version) <= 30),
  user_agent_category text check (char_length(user_agent_category) <= 20)
);

comment on table public.user_feedback is
  'Retours utilisateurs volontaires (bouton "Signaler un problème"). Aucune donnée personnelle requise, aucune IP stockée par notre code applicatif.';

alter table public.user_feedback enable row level security;

-- Écriture publique autorisée (formulaire anonyme, pas de compte requis),
-- mais uniquement en insertion : personne ne peut modifier ou supprimer un
-- retour existant depuis le client.
create policy "user_feedback_insert_anonymous"
  on public.user_feedback
  for insert
  to anon, authenticated
  with check (true);

-- Aucune lecture publique : seul un accès via la service role key
-- (dashboard Supabase, ou un futur outil admin côté serveur) peut consulter
-- les retours. Le client (clé anon) ne peut jamais lire les retours d'autrui.
-- (Pas de policy "select" créée : RLS activé + aucune policy select = accès
-- refusé par défaut pour anon/authenticated.)
