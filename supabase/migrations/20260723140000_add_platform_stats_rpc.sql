-- Fonction réservée à l'admin (t.dabadie@gmail.com) pour le tableau de bord
-- "Statistiques plateforme" (comptes, activité, volumétrie, taille de la
-- base). SECURITY DEFINER : nécessaire pour lire auth.users (jamais
-- accessible directement au client) et pour agréger des tables sans policy
-- SELECT globale dédiée (profiles, challenges, rematches, game_events).
--
-- La vérification d'identité se fait ICI, en tout premier, à l'intérieur
-- même de la fonction — pas seulement côté interface. Même en appelant
-- cette fonction directement depuis la console du navigateur (en contournant
-- complètement le bouton et le composant React), un utilisateur autre que
-- l'admin obtient une exception, jamais la moindre donnée.
create or replace function public.get_platform_stats()
returns json
language plpgsql
security definer
set search_path = public, auth, pg_catalog
as $$
declare
  caller_email text;
  result json;
begin
  caller_email := auth.jwt() ->> 'email';
  if caller_email is distinct from 't.dabadie@gmail.com' then
    raise exception 'access denied';
  end if;

  select json_build_object(
    'total_accounts', (select count(*) from auth.users),
    'new_accounts_today', (select count(*) from auth.users where created_at >= date_trunc('day', now())),
    'new_accounts_7d', (select count(*) from auth.users where created_at >= now() - interval '7 days'),
    'accounts_with_username', (select count(*) from public.profiles where username is not null),

    'distinct_authenticated_users_today', (
      select count(distinct user_id) from public.game_events
      where user_id is not null and created_at >= date_trunc('day', now())
    ),
    'distinct_authenticated_users_7d', (
      select count(distinct user_id) from public.game_events
      where user_id is not null and created_at >= now() - interval '7 days'
    ),
    -- Approximation : aucun identifiant d'appareil n'est stocké sur
    -- game_events pour les visiteurs non connectés, donc on ne peut pas
    -- compter des visiteurs anonymes DISTINCTS — seulement le nombre de
    -- parties démarrées sans compte, qui peut surcompter un même visiteur
    -- ayant lancé plusieurs parties le même jour.
    'anonymous_game_starts_today', (
      select count(*) from public.game_events
      where user_id is null and event_type = 'start' and created_at >= date_trunc('day', now())
    ),
    'game_events_today', (select count(*) from public.game_events where created_at >= date_trunc('day', now())),
    'game_events_7d', (select count(*) from public.game_events where created_at >= now() - interval '7 days'),

    'total_challenges_sent', (select count(*) from public.challenges),
    'challenges_completed', (select count(*) from public.challenges where completed = true),
    'total_rematches_sent', (select count(*) from public.rematches),
    'rematches_completed', (select count(*) from public.rematches where completed = true),

    'db_size_bytes', pg_database_size(current_database()),
    'db_size_pretty', pg_size_pretty(pg_database_size(current_database())),

    'generated_at', now()
  ) into result;

  return result;
end;
$$;

grant execute on function public.get_platform_stats() to authenticated;
