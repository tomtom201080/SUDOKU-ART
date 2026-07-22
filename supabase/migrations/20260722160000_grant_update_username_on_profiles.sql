-- profiles a été créée à la main dans le dashboard Supabase, hors
-- migrations versionnées (comme rematch_results, voir les migrations
-- 20260722090000 et 20260724090000). preferred_lang a déjà nécessité un
-- grant dédié pour cette même table (20260722150000) ; rien ne garantit
-- que username, la colonne d'origine, dispose du même droit UPDATE pour
-- authenticated — sans lui, un utilisateur qui ressaisit/renomme son pseudo
-- après en avoir déjà un voit l'upsert échouer silencieusement (l'INSERT
-- initial fonctionne, mais pas le UPDATE via ON CONFLICT).

grant update (username) on public.profiles to authenticated;
