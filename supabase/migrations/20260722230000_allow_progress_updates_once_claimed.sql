-- Cause réelle du suivi "en cours" qui ne s'écrivait jamais : la policy
-- "Anyone can claim an unclaimed challenge token" (using: claim_token IS
-- NULL / with check: claim_token IS NOT NULL) est scopée EXCLUSIVEMENT à la
-- toute première écriture (poser le jeton anti-transfert). Une fois le lien
-- ouvert, claim_token n'est plus null : USING échoue, et même sur la
-- première écriture, si on ne touche pas claim_token dans le même appel,
-- WITH CHECK échoue aussi. Résultat : started_at/progress_* (et sans doute
-- completed/result pour un destinataire non connecté) ne s'écrivaient
-- jamais après le claim initial. Cette policy additionnelle autorise
-- explicitement les écritures de suivi UNE FOIS le défi déjà réclamé —
-- s'ajoute aux policies existantes (OR), n'en retire aucune.
create policy "progress_tracking_update"
  on public.challenges
  for update
  to anon, authenticated
  using (claim_token is not null)
  with check (claim_token is not null);

-- Même raisonnement pour les défis "même grille" en mode perso
-- (claim_token, voir claimRematchToken).
create policy "progress_tracking_update"
  on public.rematches
  for update
  to anon, authenticated
  using (claim_token is not null)
  with check (claim_token is not null);

-- Mode groupe (rematch_results) : les policies existantes couvrent un
-- participant CONNECTÉ (player_user_id = auth.uid()), mais pas un candidat
-- libre non connecté qui met à jour sa propre ligne anonyme
-- (player_user_id IS NULL) après l'avoir créée via startGroupParticipant.
create policy "anon_can_update_own_unclaimed_result"
  on public.rematch_results
  for update
  to anon
  using (player_user_id is null)
  with check (player_user_id is null);
