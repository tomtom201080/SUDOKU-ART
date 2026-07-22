-- Suivi "en cours" pour les tableaux Memories et Défi : au lieu du seul
-- statut binaire "en attente / terminé", on veut voir qu'une partie a
-- démarré, avec un instantané (%, temps, erreurs, indices) mis à jour
-- périodiquement pendant que le destinataire joue (voir useGame.js).
--
-- Colonnes distinctes des colonnes de résultat FINAL existantes
-- (recipient_result_*, errors/seconds/hints sur rematch_results) : celles-ci
-- servent au classement et ne doivent jamais contenir une valeur
-- intermédiaire — started_at/progress_* sont donc entièrement séparées,
-- pour ne prendre aucun risque avec la logique de classement déjà en place.

-- Memories (photo, toujours un seul destinataire)
alter table public.challenges add column if not exists started_at timestamptz;
alter table public.challenges add column if not exists progress_percent integer;
alter table public.challenges add column if not exists progress_error_count integer;
alter table public.challenges add column if not exists progress_elapsed_seconds integer;
alter table public.challenges add column if not exists progress_hints_used integer;

-- Défi même grille, mode perso (1 seul destinataire, résultat directement
-- sur la ligne rematches)
alter table public.rematches add column if not exists recipient_started_at timestamptz;
alter table public.rematches add column if not exists recipient_progress_percent integer;
alter table public.rematches add column if not exists recipient_progress_error_count integer;
alter table public.rematches add column if not exists recipient_progress_elapsed_seconds integer;
alter table public.rematches add column if not exists recipient_progress_hints_used integer;

-- Défi même grille, mode groupe (une ligne par participant dans
-- rematch_results, déjà créée aujourd'hui seulement à la fin de partie ;
-- "completed" devient nécessaire puisqu'une ligne peut désormais exister
-- avant la fin, le temps que la partie soit en cours).
alter table public.rematch_results add column if not exists started_at timestamptz;
alter table public.rematch_results add column if not exists completed boolean not null default false;
alter table public.rematch_results add column if not exists progress_percent integer;
alter table public.rematch_results add column if not exists progress_error_count integer;
alter table public.rematch_results add column if not exists progress_elapsed_seconds integer;
alter table public.rematch_results add column if not exists progress_hints_used integer;

-- Les lignes déjà existantes dans rematch_results n'ont été créées que par
-- des parties terminées (voir submitGroupResult, appelé uniquement à la fin
-- avant ce jour) : elles sont donc rétroactivement "terminées".
update public.rematch_results set completed = true where completed = false;

-- Suit le même schéma que les grants déjà nécessaires ailleurs sur ces
-- mêmes tables (voir 20260722160000, 20260724090000) : la policy UPDATE
-- d'origine, créée à la main dans le dashboard, ne couvre pas forcément ces
-- nouvelles colonnes pour les deux rôles anon/authenticated.
grant update (started_at, progress_percent, progress_error_count, progress_elapsed_seconds, progress_hints_used)
  on public.challenges to anon, authenticated;

grant update (recipient_started_at, recipient_progress_percent, recipient_progress_error_count, recipient_progress_elapsed_seconds, recipient_progress_hints_used)
  on public.rematches to anon, authenticated;

grant insert, update (started_at, completed, progress_percent, progress_error_count, progress_elapsed_seconds, progress_hints_used, player_name, player_user_id, errors, seconds, hints)
  on public.rematch_results to anon, authenticated;
