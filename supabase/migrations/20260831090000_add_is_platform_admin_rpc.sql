-- Fonction générique de vérification du rôle admin (t.dabadie@gmail.com),
-- utilisée par les outils réservés à l'admin qui n'ont pas déjà leur propre
-- RPC protégé (ex. le générateur de grille teaser, purement client, qui ne
-- lit/écrit aucune donnée privilégiée mais doit quand même prouver le rôle
-- côté serveur et pas seulement via un bouton caché dans l'interface).
--
-- Même logique que get_platform_stats() : SECURITY DEFINER, vérification de
-- l'identité en tout premier. Appelée directement depuis la console du
-- navigateur par un utilisateur autre que l'admin, elle renvoie simplement
-- `false` (pas de donnée à protéger ici, juste un statut booléen).
create or replace function public.is_platform_admin()
returns boolean
language sql
security definer
set search_path = public, auth, pg_catalog
as $$
  select (auth.jwt() ->> 'email') = 't.dabadie@gmail.com';
$$;

grant execute on function public.is_platform_admin() to authenticated;
