-- Ajoute un numéro court et lisible (#47) à côté de l'id technique (uuid)
-- des défis et défis "même grille" : les liens de partage utilisent
-- désormais ce numéro (?defi=47, ?rematch=47) au lieu de l'uuid, plus
-- simple à lire/retaper. L'uuid `id` reste la vraie clé primaire partout en
-- base (RLS, claim_token, rematch_results.rematch_id...) — seul le lien
-- public change, rien d'autre ne bouge. Les liens déjà partagés avant cette
-- migration (uuid dans l'URL) continuent de fonctionner : le code applicatif
-- détecte le format (numérique vs uuid) et bascule sur l'ancien chemin de
-- lecture si besoin.
alter table public.challenges
  add column if not exists number bigint generated always as identity;

alter table public.challenges
  add constraint challenges_number_unique unique (number);

alter table public.rematches
  add column if not exists number bigint generated always as identity;

alter table public.rematches
  add constraint rematches_number_unique unique (number);
