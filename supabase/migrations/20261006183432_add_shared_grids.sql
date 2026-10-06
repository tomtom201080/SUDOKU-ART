-- QR code de partage sous la grille (voir ShareGridPanel.jsx / sharedGrids.js).
-- Deux types de ligne dans la même table :
--   - 'initial'  : la grille de départ telle quelle (ni chiffre saisi, ni
--     note), créée une seule fois par partie en cours, au premier affichage
--     du QR (dédoublonnage côté client — l'id est gardé en mémoire).
--   - 'snapshot' : état figé au moment du clic sur "Appel à un ami"
--     (chiffres saisis + notes/candidats à cet instant précis).
-- Lecture publique par id (un invité qui scanne n'est jamais connecté).
-- Écriture exclusivement via les RPC ci-dessous (SECURITY DEFINER) : aucune
-- policy insert/update/delete sur la table elle-même, pour garder le
-- contrôle de forme + la limite anti-abus même si quelqu'un appelle l'API
-- REST directement en contournant l'appli.
create table if not exists public.shared_grids (
  id text primary key,
  type text not null check (type in ('initial', 'snapshot')),
  puzzle jsonb not null,
  solution jsonb not null,
  user_grid jsonb not null,
  notes_grid jsonb not null default '[]'::jsonb,
  difficulty text not null check (difficulty in ('facile', 'moyen', 'complique', 'enfer')),
  painting_id text,
  photo_path text,
  device_token text not null,
  scan_count int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.shared_grids enable row level security;

create policy "shared_grids_select_all"
  on public.shared_grids
  for select
  to anon, authenticated
  using (true);

-- Identifiant court (8 caractères alphanumériques), pour garder le QR peu
-- dense — pas d'extension requise (pgcrypto), juste random() pur SQL.
create or replace function public.generate_short_id(len int default 8)
returns text
language plpgsql
as $$
declare
  chars text := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result text := '';
  i int;
begin
  for i in 1..len loop
    result := result || substr(chars, 1 + floor(random() * length(chars))::int, 1);
  end loop;
  return result;
end;
$$;

-- Crée une grille partagée (initiale ou snapshot). Valide la forme du
-- payload (grilles 9x9, difficulté connue, taille raisonnable) et applique
-- une limite anti-abus par appareil (device_token, voir
-- src/lib/deviceToken.js) — max 30 créations / 24h, largement suffisant
-- pour un usage normal (plusieurs "Appel à un ami" par partie) tout en
-- bloquant un script qui spammerait l'insertion.
create or replace function public.create_shared_grid(
  p_type text,
  p_puzzle jsonb,
  p_solution jsonb,
  p_user_grid jsonb,
  p_notes_grid jsonb,
  p_difficulty text,
  p_painting_id text,
  p_photo_path text,
  p_device_token text
)
returns public.shared_grids
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  recent_count int;
  new_id text;
  attempt int := 0;
  result public.shared_grids;
begin
  if p_type not in ('initial', 'snapshot') then
    raise exception 'invalid type';
  end if;
  if p_difficulty not in ('facile', 'moyen', 'complique', 'enfer') then
    raise exception 'invalid difficulty';
  end if;
  if p_device_token is null or length(p_device_token) = 0 or length(p_device_token) > 100 then
    raise exception 'invalid device token';
  end if;
  if jsonb_typeof(p_puzzle) is distinct from 'array' or jsonb_array_length(p_puzzle) <> 9
     or jsonb_typeof(p_solution) is distinct from 'array' or jsonb_array_length(p_solution) <> 9
     or jsonb_typeof(p_user_grid) is distinct from 'array' or jsonb_array_length(p_user_grid) <> 9 then
    raise exception 'invalid grid shape';
  end if;
  -- Garde-fou de taille (notes_grid est le plus gros champ, 9x9x9 booléens) :
  -- un payload légitime tient largement sous cette limite.
  if pg_column_size(p_puzzle) + pg_column_size(p_solution) + pg_column_size(p_user_grid)
     + pg_column_size(p_notes_grid) > 200000 then
    raise exception 'payload too large';
  end if;

  select count(*) into recent_count
  from public.shared_grids
  where device_token = p_device_token
    and created_at > now() - interval '1 day';

  if recent_count >= 30 then
    raise exception 'rate limit exceeded';
  end if;

  loop
    new_id := generate_short_id();
    attempt := attempt + 1;
    exit when not exists (select 1 from public.shared_grids where id = new_id) or attempt >= 5;
  end loop;

  insert into public.shared_grids (
    id, type, puzzle, solution, user_grid, notes_grid, difficulty,
    painting_id, photo_path, device_token
  ) values (
    new_id, p_type, p_puzzle, p_solution, p_user_grid, coalesce(p_notes_grid, '[]'::jsonb), p_difficulty,
    p_painting_id, p_photo_path, p_device_token
  )
  returning * into result;

  return result;
end;
$$;

grant execute on function public.create_shared_grid(text, jsonb, jsonb, jsonb, jsonb, text, text, text, text) to anon, authenticated;

-- Incrémente le compteur de scans — appelée par le destinataire à
-- l'ouverture de /g/<id>, jamais par le créateur.
create or replace function public.increment_shared_grid_scan(p_id text)
returns void
language sql
security definer
set search_path = public, pg_catalog
as $$
  update public.shared_grids set scan_count = scan_count + 1 where id = p_id;
$$;

grant execute on function public.increment_shared_grid_scan(text) to anon, authenticated;

-- Stats admin (dashboard KPI) : même garde que get_platform_stats().
create or replace function public.get_shared_grids_stats()
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
    'total_initial', (select count(*) from public.shared_grids where type = 'initial'),
    'total_snapshot', (select count(*) from public.shared_grids where type = 'snapshot'),
    'total_scans', (select coalesce(sum(scan_count), 0) from public.shared_grids),
    'created_today', (select count(*) from public.shared_grids where created_at >= date_trunc('day', now())),
    'created_7d', (select count(*) from public.shared_grids where created_at >= now() - interval '7 days')
  ) into result;

  return result;
end;
$$;

grant execute on function public.get_shared_grids_stats() to authenticated;
