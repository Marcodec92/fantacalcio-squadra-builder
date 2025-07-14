
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Player } from '@/types/Player';

export const useCSVPlayerImport = () => {
  const { user } = useAuth();

  const importSingleCSVPlayer = async (playerData: Partial<Player>) => {
    if (!user) {
      toast.error('Devi essere autenticato per aggiungere giocatori');
      return null;
    }

    console.log('🎯 importSingleCSVPlayer - Inizio importazione singolo giocatore:', playerData);

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

      console.log('📝 Oggetto da inserire nel database:', playerToInsert);

      // Inserisci SOLO questo giocatore nel database
      const { data, error } = await supabase
        .from('players')
        .insert([playerToInsert]) // IMPORTANTE: array con un solo elemento
        .select()
        .single();

      if (error) {
        console.error('❌ Errore nell\'inserimento del giocatore:', error);
        toast.error('Errore nell\'aggiunta del giocatore');
        return null;
      }

      console.log('✅ Giocatore inserito con successo:', data);
      toast.success(`Giocatore ${playerData.surname} aggiunto con successo!`);
      
      return data;

    } catch (error) {
      console.error('❌ Errore generale nell\'importazione:', error);
      toast.error('Errore nell\'importazione del giocatore');
      return null;
    }
  };

  return {
    importSingleCSVPlayer
  };
};
