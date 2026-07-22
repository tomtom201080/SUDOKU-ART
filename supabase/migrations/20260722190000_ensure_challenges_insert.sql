-- Même risque que celui déjà corrigé sur rematch_results (voir
-- 20260724090000_ensure_rematch_results_insert.sql) : la table challenges a
-- été créée à la main dans le dashboard Supabase, hors migrations
-- versionnées, et rien ne garantit que sa policy INSERT d'origine couvre le
-- rôle authenticated en plus du rôle anon. Si elle ne vise que anon, un
-- expéditeur CONNECTÉ qui crée un défi (createChallenge, src/lib/challenges.js)
-- voit son insertion rejetée par RLS sans aucune erreur visible côté app.
-- Une policy permissive supplémentaire n'ajoute qu'un OR aux policies déjà
-- en place, jamais un AND : ceci ne retire aucun accès existant.

grant insert on public.challenges to anon, authenticated;

drop policy if exists "challenges_insert_any" on public.challenges;

-- with check : who ever crée la ligne doit soit n'avoir aucune identité
-- (expéditeur non connecté), soit insérer sous son propre auth.uid() —
-- cohérent avec sender_user_id ajouté par la migration
-- 20260722180000_add_hints_limit_and_sender_to_challenges.sql.
create policy "challenges_insert_any"
  on public.challenges
  for insert
  to anon, authenticated
  with check (sender_user_id is null or sender_user_id = auth.uid());
