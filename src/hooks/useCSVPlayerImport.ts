
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Player } from '@/types/Player';

export const useCSVPlayerImport = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const importSingleCSVPlayer = async (playerData: Partial<Player>) => {
    if (!user) {
      toast.error('Devi essere autenticato per aggiungere giocatori');
      return null;
    }

    console.log('🎯 importSingleCSVPlayer - INIZIO importazione SINGOLO giocatore:', playerData);
    console.log('🔒 VERIFICA: Stiamo importando SOLO questo giocatore, non una lista');

    try {
      // Crea l'oggetto da inserire nel database con tutti i campi necessari
      const playerToInsert = {
        user_id: user.id,
        name: playerData.name || '',
        surname: playerData.surname || '',
        team: playerData.team || null,
        role_category: playerData.roleCategory!,
        role: playerData.role!,
        tier: playerData.tier || '',
        cost_percentage: playerData.costPercentage || 0,
        fmv: playerData.fmv || 0,
        goals: playerData.goals || 0,
        assists: playerData.assists || 0,
        malus: playerData.malus || 0,
        goals_conceded: playerData.goalsConceded || 0,
        yellow_cards: playerData.yellowCards || 0,
        penalties_saved: playerData.penaltiesSaved || 0,
        x_g: playerData.xG || 0,
        x_a: playerData.xA || 0,
        x_p: playerData.xP || 0,
        ownership: playerData.ownership || 0,
        plus_categories: playerData.plusCategories || [],
        is_favorite: playerData.isFavorite || false
      };

      console.log('📝 SINGOLO oggetto da inserire nel database:', playerToInsert);
      console.log('🔍 CONTROLLO CRITICO: Non stiamo inserendo un array, ma un singolo oggetto');

      // Inserisci SOLO questo giocatore nel database - IMPORTANTE: array con un solo elemento
      const { data, error } = await supabase
        .from('players')
        .insert([playerToInsert]) // ARRAY CON UN SOLO ELEMENTO - QUESTO È FONDAMENTALE
        .select()
        .single(); // .single() perché ci aspettiamo un solo risultato

      if (error) {
        console.error('❌ Errore nell\'inserimento del SINGOLO giocatore:', error);
        toast.error('Errore nell\'aggiunta del giocatore');
        return null;
      }

      console.log('✅ SINGOLO giocatore inserito con successo:', data);
      console.log('🎉 CONFERMA: È stato inserito solo 1 giocatore, non di più');
      toast.success(`Giocatore ${playerData.surname} aggiunto con successo!`);
      
      // IMPORTANTE: Invalida la cache per aggiornare la lista dei giocatori
      console.log('🔄 Invalidando la cache dei giocatori...');
      queryClient.invalidateQueries({ queryKey: ['players'] });
      
      return data;

    } catch (error) {
      console.error('❌ Errore generale nell\'importazione del SINGOLO giocatore:', error);
      toast.error('Errore nell\'importazione del giocatore');
      return null;
    }
  };

  return {
    importSingleCSVPlayer
  };
};
