-- Permet à un participant CONNECTÉ de défi de groupe (l'expéditeur qui
-- rejoue son propre lien, ou un ami invité) de mettre à jour SA PROPRE ligne
-- rematch_results quand il retente la grille — plutôt que d'accumuler une
-- nouvelle ligne à chaque tentative. Complète la migration précédente
-- (20260722090000) qui ne couvrait que le rattachement de compte
-- (player_user_id) après connexion.

grant update (player_name, errors, seconds, hints) on public.rematch_results to authenticated;

drop policy if exists "update_own_rematch_result" on public.rematch_results;

create policy "update_own_rematch_result"
  on public.rematch_results
  for update
  to authenticated
  using (player_user_id = auth.uid())
  with check (player_user_id = auth.uid());
