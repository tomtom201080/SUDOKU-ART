-- "Memories" (table challenges) : parité avec les défis "même grille"
-- (table rematches) — limite d'indices facultative, et rattachement de
-- l'expéditeur à son compte pour lister/supprimer ses défis envoyés dans
-- "Mes défis envoyés (Memories)".

alter table public.challenges add column if not exists hints_limit integer;
alter table public.challenges add column if not exists sender_user_id uuid references auth.users(id);

-- Le SELECT/DELETE existants sur challenges sont probablement déjà
-- permissifs (fetchChallenge et deleteChallenge fonctionnent sans policy
-- dédiée trackée ici) ; ces policies additionnelles couvrent explicitement
-- le nouveau cas d'usage sans rien retirer à l'existant (policies
-- permissives combinées en OR par Postgres).
drop policy if exists "sender_can_view_own_challenges" on public.challenges;

create policy "sender_can_view_own_challenges"
  on public.challenges
  for select
  to authenticated
  using (sender_user_id = auth.uid());

drop policy if exists "sender_can_delete_own_challenges" on public.challenges;

create policy "sender_can_delete_own_challenges"
  on public.challenges
  for delete
  to authenticated
  using (sender_user_id = auth.uid());
