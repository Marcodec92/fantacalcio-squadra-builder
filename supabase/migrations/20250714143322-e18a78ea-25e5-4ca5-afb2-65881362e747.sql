
-- Rimuovi la foreign key constraint esistente
ALTER TABLE public.squad_selections 
DROP CONSTRAINT IF EXISTS squad_selections_player_id_fkey;

-- Ricrea la foreign key constraint con CASCADE DELETE
ALTER TABLE public.squad_selections 
ADD CONSTRAINT squad_selections_player_id_fkey 
FOREIGN KEY (player_id) 
REFERENCES public.players(id) 
ON DELETE CASCADE;
