-- L'insertion dans rematch_results (submitGroupResult) est confirmée
-- fonctionnelle pour les candidats libres non connectés (rôle anon). Rien ne
-- garantit en revanche que le rôle authenticated dispose du même droit :
-- la policy INSERT d'origine a été créée à la main dans le dashboard
-- Supabase, hors migrations versionnées, et si elle ne vise que anon, un
-- participant CONNECTÉ (y compris l'expéditeur qui joue son propre lien
-- envoyé) voit son insertion rejetée par RLS SANS AUCUNE ERREUR VISIBLE côté
-- app — l'appel est enveloppé dans un .catch() qui l'avalait jusqu'ici
-- silencieusement (corrigé en parallèle dans useGame.js). Cette migration
-- garantit explicitement le droit d'insertion pour les deux rôles ; une
-- policy permissive supplémentaire ne fait qu'ajouter un OR aux policies
-- déjà en place, jamais un AND, donc ceci ne retire aucun accès existant.

grant insert on public.rematch_results to anon, authenticated;

drop policy if exists "rematch_results_insert_any" on public.rematch_results;

-- with check : on n'autorise à écrire que sous sa propre identité (son
-- propre auth.uid(), ou aucune identité pour un candidat libre non
-- connecté) — pas au nom de quelqu'un d'autre.
create policy "rematch_results_insert_any"
  on public.rematch_results
  for insert
  to anon, authenticated
  with check (player_user_id is null or player_user_id = auth.uid());
