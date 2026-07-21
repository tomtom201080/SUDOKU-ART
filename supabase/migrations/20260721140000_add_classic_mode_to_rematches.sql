-- Permet à un défi (DefiComposer) ou un "même grille" (RematchComposer)
-- d'être envoyé sans aucune image (sudoku classique), en plus des
-- options existantes (photo perso ou œuvre d'art tirée au hasard).
alter table public.rematches
  add column if not exists classic_mode boolean not null default false;
