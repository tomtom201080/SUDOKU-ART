-- Jusqu'ici, un défi photo terminé (gagné ou perdu) voyait sa photo ET sa
-- ligne supprimées immédiatement (confidentialité : ne pas garder la photo
-- d'un ami indéfiniment). Ça empêchait tout historique "gagné/perdu" dans
-- le tableau Memories, puisque la ligne disparaissait avant même de pouvoir
-- être affichée. Nouveau compromis : on garde photo + ligne 7 jours après
-- la fin de la partie (voir purgeExpiredChallenges dans lib/challenges.js,
-- appelée à chaque ouverture du tableau Memories), pour laisser le temps de
-- consulter le résultat, puis nettoyage.
alter table public.challenges add column if not exists completed_at timestamptz;
