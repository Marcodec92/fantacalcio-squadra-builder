
-- Modifica la tabella players per rendere il campo role nullable
-- così possiamo salvare giocatori con solo il ruolo generico
ALTER TABLE public.players 
ALTER COLUMN role DROP NOT NULL;

-- Aggiorna il default per il campo role a NULL
ALTER TABLE public.players 
ALTER COLUMN role SET DEFAULT NULL;
