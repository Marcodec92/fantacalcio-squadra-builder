
-- Crea una tabella per salvare le selezioni del Real Time Builder
CREATE TABLE public.realtime_selections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  position_slot INTEGER NOT NULL,
  role_category public.player_role NOT NULL,
  player_name TEXT NOT NULL,
  player_surname TEXT NOT NULL,
  player_team TEXT,
  credits INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, position_slot, role_category)
);

-- Abilita RLS
ALTER TABLE public.realtime_selections ENABLE ROW LEVEL SECURITY;

-- Policy per vedere le proprie selezioni
CREATE POLICY "Users can view their own realtime selections" 
  ON public.realtime_selections 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy per creare le proprie selezioni
CREATE POLICY "Users can create their own realtime selections" 
  ON public.realtime_selections 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy per aggiornare le proprie selezioni
CREATE POLICY "Users can update their own realtime selections" 
  ON public.realtime_selections 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Policy per cancellare le proprie selezioni
CREATE POLICY "Users can delete their own realtime selections" 
  ON public.realtime_selections 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Trigger per aggiornare updated_at
CREATE TRIGGER update_realtime_selections_updated_at
  BEFORE UPDATE ON public.realtime_selections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
