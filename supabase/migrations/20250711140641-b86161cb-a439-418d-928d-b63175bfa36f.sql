
-- Crea gli enum per i tipi di ruolo
CREATE TYPE player_role AS ENUM ('Portiere', 'Difensore', 'Centrocampista', 'Attaccante');

CREATE TYPE specific_role AS ENUM (
  'Portiere',
  'Difensore centrale', 'Esterno offensivo', 'Braccetto',
  'Mediano', 'Regista', 'Mezzala', 'Trequartista', 'Ala offensiva',
  'Attaccante centrale', 'Seconda punta', 'Mezzapunta'
);

CREATE TYPE team_name AS ENUM (
  'Atalanta', 'Bologna', 'Cagliari', 'Como', 'Cremonese', 'Fiorentina',
  'Genoa', 'Hellas Verona', 'Inter', 'Juventus', 'Lazio', 'Lecce',
  'Milan', 'Napoli', 'Parma', 'Pisa', 'Roma', 'Sassuolo', 'Torino', 'Udinese'
);

CREATE TYPE plus_category AS ENUM ('Under 21', 'Rigorista', 'Calci piazzati', 'Assistman', 'Goleador');

-- Crea la tabella principale per i giocatori
CREATE TABLE public.players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  surname TEXT NOT NULL,
  team team_name,
  role specific_role NOT NULL,
  role_category player_role NOT NULL,
  cost_percentage DECIMAL(5,2) DEFAULT 0,
  fmv DECIMAL(10,2) DEFAULT 0,
  tier TEXT DEFAULT '',
  goals INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  malus INTEGER DEFAULT 0,
  goals_conceded INTEGER DEFAULT 0,
  yellow_cards INTEGER DEFAULT 0,
  penalties_saved INTEGER DEFAULT 0,
  x_g DECIMAL(5,2) DEFAULT 0,
  x_a DECIMAL(5,2) DEFAULT 0,
  x_p DECIMAL(5,2) DEFAULT 0,
  ownership INTEGER DEFAULT 0 CHECK (ownership >= 0 AND ownership <= 100),
  plus_categories plus_category[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Abilita Row Level Security per garantire che ogni utente veda solo i propri giocatori
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

-- Policy per permettere agli utenti di vedere solo i propri giocatori
CREATE POLICY "Users can view their own players" 
  ON public.players 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy per permettere agli utenti di inserire i propri giocatori
CREATE POLICY "Users can create their own players" 
  ON public.players 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy per permettere agli utenti di aggiornare i propri giocatori
CREATE POLICY "Users can update their own players" 
  ON public.players 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Policy per permettere agli utenti di eliminare i propri giocatori
CREATE POLICY "Users can delete their own players" 
  ON public.players 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Trigger per aggiornare automaticamente updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_players_updated_at 
  BEFORE UPDATE ON public.players 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Indici per migliorare le performance
CREATE INDEX idx_players_user_id ON public.players(user_id);
CREATE INDEX idx_players_role_category ON public.players(role_category);
CREATE INDEX idx_players_team ON public.players(team);
