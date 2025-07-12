
-- Aggiungi campo per i giocatori preferiti
ALTER TABLE public.players 
ADD COLUMN is_favorite boolean DEFAULT false;

-- Aggiorna l'enum delle categorie plus per includere "Under 19" e "Pararigori"
ALTER TYPE public.plus_category ADD VALUE 'Under 19';
ALTER TYPE public.plus_category ADD VALUE 'Pararigori';
