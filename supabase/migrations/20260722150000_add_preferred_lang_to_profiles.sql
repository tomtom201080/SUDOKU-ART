-- Langue préférée d'un compte, pour qu'un utilisateur connecté retrouve sa
-- langue sur n'importe quel appareil (contrairement à localStorage, propre
-- à chaque appareil/navigateur). Voir src/i18n/index.jsx et lib/profiles.js.
alter table public.profiles add column if not exists preferred_lang text;

-- Droit explicite sur cette nouvelle colonne : d'autres colonnes de cette
-- table (ex. rematch_results.player_name plus tôt) ont déjà nécessité un
-- grant dédié en plus d'une policy RLS correcte — mieux vaut l'ajouter
-- maintenant que déboguer un échec silencieux plus tard.
grant update (preferred_lang) on public.profiles to authenticated;
