-- Pseudo du destinataire d'un défi perso (1v1), qu'il soit un candidat
-- libre non connecté (pseudo local au défi, voir IncomingDefiModal) ou un
-- compte connecté (son username). Permet de remplacer le libellé générique
-- "un ami" par un vrai nom dans les résultats du défi côté expéditeur
-- (RematchResultDetail) et dans le message WhatsApp envoyé par le
-- destinataire (WinModal). Comme classic_mode/label plus tôt sur cette même
-- table, aucun grant dédié : le droit UPDATE existant sur rematches couvre
-- déjà la table entière, pas seulement les colonnes présentes à sa création.
alter table public.rematches add column if not exists recipient_name text;
