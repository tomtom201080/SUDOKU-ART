-- Permet à un candidat libre (résultat de défi de groupe enregistré sans
-- compte, rematch_results.player_user_id = null) de rattacher rétroactivement
-- sa ligne à son compte juste après s'être connecté/inscrit depuis l'écran
-- de fin de défi. La ligne est identifiée par rematch_id + player_name (le
-- pseudo est déjà garanti unique par défi côté application), et seule une
-- ligne pas encore rattachée peut être modifiée.

grant update (player_user_id) on public.rematch_results to anon, authenticated;

drop policy if exists "claim_own_anonymous_rematch_result" on public.rematch_results;

create policy "claim_own_anonymous_rematch_result"
  on public.rematch_results
  for update
  to anon, authenticated
  using (player_user_id is null)
  with check (auth.uid() is not null and player_user_id = auth.uid());
