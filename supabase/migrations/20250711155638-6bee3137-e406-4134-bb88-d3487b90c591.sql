
-- Creare la tabella per lo squad builder
CREATE TABLE public.squad_selections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  player_id UUID REFERENCES public.players(id) NOT NULL,
  position_slot INTEGER NOT NULL,
  role_category player_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, position_slot, role_category)
);

-- Aggiungere RLS per squad_selections
ALTER TABLE public.squad_selections ENABLE ROW LEVEL SECURITY;

-- Policy per visualizzare le proprie selezioni
CREATE POLICY "Users can view their own squad selections" 
  ON public.squad_selections 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy per inserire le proprie selezioni
CREATE POLICY "Users can create their own squad selections" 
  ON public.squad_selections 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy per aggiornare le proprie selezioni
CREATE POLICY "Users can update their own squad selections" 
  ON public.squad_selections 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Policy per eliminare le proprie selezioni
CREATE POLICY "Users can delete their own squad selections" 
  ON public.squad_selections 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Trigger per aggiornare updated_at
CREATE TRIGGER update_squad_selections_updated_at
  BEFORE UPDATE ON public.squad_selections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
