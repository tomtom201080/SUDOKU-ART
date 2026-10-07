-- Pièce jointe vidéo pour le mode partage (QR, "Appel à un ami") et les
-- défis ("Memories" photo, "même grille") — étend le système de photo perso
-- déjà en place (uploadSharedPhoto / challenges.photo_path /
-- rematches.photo_path, voir src/lib/sharedPhoto.js) en une table unique
-- "média" (photo OU vidéo), plutôt que de dupliquer les colonnes trois fois.
-- Les colonnes photo_path existantes ne sont PAS touchées : les anciens
-- défis avec photo continuent de fonctionner tels quels, rétrocompatibilité
-- totale. Seules les NOUVELLES pièces jointes passent par shared_media.
--
-- Suppression = soft delete (deleted_at) : une vidéo supprimée par son
-- propriétaire doit laisser les partages existants "afficher le poster
-- seul" (le poster est une vraie image stockée, jamais dépendante de la
-- disponibilité de la vidéo source).
create table public.shared_media (
  id text primary key default generate_short_id(16),
  type text not null check (type in ('photo', 'video')),
  source text not null check (source in ('upload', 'link')),
  video_url text,              -- lien d'origine (YouTube/Vimeo/direct) ; null si photo, ou vidéo uploadée chez nous
  video_path text,             -- chemin du FICHIER vidéo dans le bucket share-media ; renseigné seulement si source='upload'
  provider text check (provider in ('youtube', 'vimeo', 'direct', 'storage')),
  poster_path text not null,   -- toujours une image stockée dans le bucket share-media (jamais le lien brut)
  duration_seconds numeric,
  ratio numeric,                -- largeur / hauteur
  owner_user_id uuid references auth.users(id),
  device_token text not null,   -- toujours renseigné (même connecté) : sert au quota et à la suppression invité
  report_count int not null default 0,
  play_count int not null default 0,
  deleted_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.challenges   add column media_id text references public.shared_media(id);
alter table public.rematches    add column media_id text references public.shared_media(id);
alter table public.shared_grids add column media_id text references public.shared_media(id);

alter table public.shared_media enable row level security;

-- Lecture publique par id : un destinataire de défi ou un invité qui scanne
-- un QR n'est jamais connecté. Rien de confidentiel ici (média volontai-
-- rement partagé par son propriétaire) — même modèle que shared_grids.
create policy "shared_media_select_all"
  on public.shared_media
  for select
  to anon, authenticated
  using (true);

-- Un seul signalement compté par (média, appareil) — table d'appoint plutôt
-- qu'un simple compteur, pour empêcher un même appareil de gonfler
-- artificiellement report_count en rappelant la RPC en boucle.
create table public.shared_media_reports (
  media_id text not null references public.shared_media(id),
  device_token text not null,
  reason text,
  created_at timestamptz not null default now(),
  primary key (media_id, device_token)
);
alter table public.shared_media_reports enable row level security;
-- Pas de policy select/insert directe : uniquement via report_shared_media().

-- Crée une pièce jointe média (photo ou vidéo). Le fichier (poster, et vidéo
-- si upload) est déjà envoyé dans le Storage AVANT cet appel (voir
-- src/lib/sharedMedia.js) — cette fonction ne fait qu'enregistrer les
-- métadonnées, après validation :
--   - une vidéo UPLOADÉE (source='upload', provider='storage') exige un
--     appelant connecté (auth.uid() non nul) — vérifié ici, pas seulement
--     côté UI : un lien vidéo (YouTube/Vimeo/direct) reste lui accessible
--     aux invités (n'héberge pas le fichier vidéo chez nous, seulement un
--     poster, même coût qu'une photo).
--   - quota anti-abus par appareil (device_token) : 20 créations / 24h.
create or replace function public.create_shared_media(
  p_type text,
  p_source text,
  p_video_url text,
  p_video_path text,
  p_provider text,
  p_poster_path text,
  p_duration_seconds numeric,
  p_ratio numeric,
  p_device_token text
)
returns public.shared_media
language plpgsql
security definer
set search_path = public, auth, pg_catalog
as $$
declare
  recent_count int;
  result public.shared_media;
begin
  if p_type not in ('photo', 'video') then
    raise exception 'invalid type';
  end if;
  if p_source not in ('upload', 'link') then
    raise exception 'invalid source';
  end if;
  if p_device_token is null or length(p_device_token) = 0 or length(p_device_token) > 100 then
    raise exception 'invalid device token';
  end if;
  if p_poster_path is null or length(p_poster_path) = 0 then
    raise exception 'poster is required';
  end if;
  if p_type = 'video' and p_source = 'upload' then
    if p_provider is distinct from 'storage' then
      raise exception 'invalid provider for uploaded video';
    end if;
    if p_video_path is null or length(p_video_path) = 0 then
      raise exception 'video path is required for an uploaded video';
    end if;
    if auth.uid() is null then
      raise exception 'login required to upload a video file';
    end if;
  end if;
  if p_source = 'link' and (p_video_url is null or p_provider not in ('youtube', 'vimeo', 'direct')) then
    raise exception 'invalid link video';
  end if;

  select count(*) into recent_count
  from public.shared_media
  where device_token = p_device_token
    and created_at > now() - interval '1 day';

  if recent_count >= 20 then
    raise exception 'rate limit exceeded';
  end if;

  insert into public.shared_media (
    type, source, video_url, video_path, provider, poster_path, duration_seconds, ratio,
    owner_user_id, device_token
  ) values (
    p_type, p_source, p_video_url, p_video_path, p_provider, p_poster_path, p_duration_seconds, p_ratio,
    auth.uid(), p_device_token
  )
  returning * into result;

  return result;
end;
$$;

grant execute on function public.create_shared_media(text, text, text, text, text, text, numeric, numeric, text) to anon, authenticated;

-- Suppression par le propriétaire uniquement (compte, ou même device_token
-- pour un média créé sans compte) — soft delete : la ligne reste (poster
-- toujours lisible), seule la lecture vidéo doit être désactivée par les
-- composants consommateurs (deleted_at non nul).
create or replace function public.delete_shared_media(p_id text, p_device_token text)
returns void
language plpgsql
security definer
set search_path = public, auth, pg_catalog
as $$
declare
  owner uuid;
  token text;
begin
  select owner_user_id, device_token into owner, token
  from public.shared_media where id = p_id;

  if owner is null and token is distinct from p_device_token then
    raise exception 'not allowed';
  end if;
  if owner is not null and owner is distinct from auth.uid() then
    raise exception 'not allowed';
  end if;

  update public.shared_media set deleted_at = now() where id = p_id;
end;
$$;

grant execute on function public.delete_shared_media(text, text) to anon, authenticated;

-- Signale un média (remonté dans le dashboard admin). Idempotent par
-- appareil grâce à la clé primaire (media_id, device_token).
create or replace function public.report_shared_media(p_id text, p_device_token text, p_reason text)
returns void
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
begin
  insert into public.shared_media_reports (media_id, device_token, reason)
  values (p_id, p_device_token, p_reason)
  on conflict (media_id, device_token) do nothing;

  update public.shared_media
  set report_count = (select count(*) from public.shared_media_reports where media_id = p_id)
  where id = p_id;
end;
$$;

grant execute on function public.report_shared_media(text, text, text) to anon, authenticated;

-- Incrémente le compteur de lectures (clic sur ▶ après victoire) —
-- fire-and-forget, purement indicatif pour le KPI "taux de lecture".
create or replace function public.increment_shared_media_play(p_id text)
returns void
language sql
security definer
set search_path = public, pg_catalog
as $$
  update public.shared_media set play_count = play_count + 1 where id = p_id;
$$;

grant execute on function public.increment_shared_media_play(text) to anon, authenticated;

-- Stats admin (dashboard KPI) : même garde que get_platform_stats().
create or replace function public.get_shared_media_stats()
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
    'total_photos', (select count(*) from public.shared_media where type = 'photo' and deleted_at is null),
    'total_videos', (select count(*) from public.shared_media where type = 'video' and deleted_at is null),
    'videos_uploaded', (select count(*) from public.shared_media where type = 'video' and source = 'upload' and deleted_at is null),
    'videos_youtube', (select count(*) from public.shared_media where type = 'video' and provider = 'youtube' and deleted_at is null),
    'videos_vimeo', (select count(*) from public.shared_media where type = 'video' and provider = 'vimeo' and deleted_at is null),
    'videos_direct', (select count(*) from public.shared_media where type = 'video' and provider = 'direct' and deleted_at is null),
    'total_plays', (select coalesce(sum(play_count), 0) from public.shared_media),
    'total_reports', (select count(*) from public.shared_media_reports),
    'created_today', (select count(*) from public.shared_media where created_at >= date_trunc('day', now()))
  ) into result;

  return result;
end;
$$;

grant execute on function public.get_shared_media_stats() to authenticated;

-- Liste des médias signalés (dashboard admin, action "supprimer").
create or replace function public.get_reported_shared_media()
returns setof public.shared_media
language plpgsql
security definer
set search_path = public, auth, pg_catalog
as $$
declare
  caller_email text;
begin
  caller_email := auth.jwt() ->> 'email';
  if caller_email is distinct from 't.dabadie@gmail.com' then
    raise exception 'access denied';
  end if;

  return query
    select * from public.shared_media
    where report_count > 0 and deleted_at is null
    order by report_count desc, created_at desc;
end;
$$;

grant execute on function public.get_reported_shared_media() to authenticated;

-- Suppression admin (dashboard, bouton sur un média signalé) — distincte de
-- delete_shared_media() : ici l'appelant n'est pas forcément le
-- propriétaire, seule l'identité admin est vérifiée (même garde que
-- get_platform_stats()).
create or replace function public.admin_delete_shared_media(p_id text)
returns void
language plpgsql
security definer
set search_path = public, auth, pg_catalog
as $$
declare
  caller_email text;
begin
  caller_email := auth.jwt() ->> 'email';
  if caller_email is distinct from 't.dabadie@gmail.com' then
    raise exception 'access denied';
  end if;

  update public.shared_media set deleted_at = now() where id = p_id;
end;
$$;

grant execute on function public.admin_delete_shared_media(text) to authenticated;

-- ──────────────────────────────────────────────────────────────────────
-- Storage : bucket dédié "share-media" (public, chemins aléatoires non
-- devinables — même modèle de confiance que le bucket sudoku-images déjà
-- utilisé par les photos perso aujourd'hui, pas d'URL signée : cohérent
-- avec l'existant, et le contenu n'est jamais sensible, volontairement
-- partagé par son propriétaire).
--
-- Convention de chemin : <device_token>/<posters|videos>/<id aléatoire>.<ext>
-- — "videos" exige un appelant connecté, "posters" reste ouvert aux
-- invités (photo/poster, même coût qu'une photo). Si l'insertion du bucket
-- échoue parce qu'il existe déjà (créé au Dashboard à la place), ignore
-- l'erreur et exécute seulement les policies ci-dessous.
insert into storage.buckets (id, name, public)
values ('share-media', 'share-media', true)
on conflict (id) do nothing;

create policy "share_media_select_public"
  on storage.objects for select
  to public
  using (bucket_id = 'share-media');

create policy "share_media_insert_posters_any"
  on storage.objects for insert
  to anon, authenticated
  with check (
    bucket_id = 'share-media'
    and (storage.foldername(name))[2] = 'posters'
  );

create policy "share_media_insert_videos_authenticated"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'share-media'
    and (storage.foldername(name))[2] = 'videos'
  );

-- ──────────────────────────────────────────────────────────────────────
-- Étend create_shared_grid() (table shared_grids, migration
-- 20261006183432_add_shared_grids.sql) pour qu'un QR "Appel à un ami"
-- puisse aussi référencer un media_id (photo/vidéo perso via
-- MediaPicker.jsx), pas seulement une œuvre de bibliothèque (painting_id).
-- DROP + CREATE (plutôt que CREATE OR REPLACE) car la signature change
-- (nouveau paramètre) : Postgres traiterait sinon l'ancienne et la nouvelle
-- comme deux fonctions surchargées distinctes au lieu de remplacer
-- proprement — déployé en même temps que le code client qui l'appelle
-- désormais toujours avec ce paramètre (null pour une œuvre de bibliothèque).
drop function if exists public.create_shared_grid(text, jsonb, jsonb, jsonb, jsonb, text, text, text, text);

create function public.create_shared_grid(
  p_type text,
  p_puzzle jsonb,
  p_solution jsonb,
  p_user_grid jsonb,
  p_notes_grid jsonb,
  p_difficulty text,
  p_painting_id text,
  p_photo_path text,
  p_device_token text,
  p_media_id text default null
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
    painting_id, photo_path, device_token, media_id
  ) values (
    new_id, p_type, p_puzzle, p_solution, p_user_grid, coalesce(p_notes_grid, '[]'::jsonb), p_difficulty,
    p_painting_id, p_photo_path, p_device_token, p_media_id
  )
  returning * into result;

  return result;
end;
$$;

grant execute on function public.create_shared_grid(text, jsonb, jsonb, jsonb, jsonb, text, text, text, text, text) to anon, authenticated;
