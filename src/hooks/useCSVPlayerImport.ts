
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

    console.log('🎯🎯🎯 IMPORTAZIONE SINGOLO GIOCATORE - INIZIO');
    console.log('📋 Dati giocatore da importare:', playerData);
    console.log('🔒 VERIFICA CRITICA: Importo SOLO questo giocatore, non una lista');

    try {
      // Crea l'oggetto da inserire nel database con tutti i campi necessari
      // IMPORTANTE: NON usa tier: 'CSV' - diventa un giocatore normale del database
      const playerToInsert = {
        user_id: user.id,
        name: playerData.name || '',
        surname: playerData.surname || '',
        team: playerData.team || null,
        role_category: playerData.roleCategory!,
        role: playerData.role!,
        tier: playerData.tier || '', // Tier vuoto, NON 'CSV'
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

      console.log('📝 OGGETTO SINGOLO da inserire nel database:');
      console.log('👤 Nome:', playerToInsert.name);
      console.log('👤 Cognome:', playerToInsert.surname);
      console.log('⚽ Ruolo:', playerToInsert.role_category);
      console.log('🏟️ Team:', playerToInsert.team);
      console.log('🎯 Tier:', playerToInsert.tier, '(NON CSV - diventa giocatore normale)');
      console.log('🔢 User ID:', playerToInsert.user_id);

      // INSERIMENTO SINGOLO - ATTENZIONE: UN SOLO GIOCATORE
      console.log('💾 ESEGUENDO INSERT di UN SOLO GIOCATORE...');
      const { data, error } = await supabase
        .from('players')
        .insert([playerToInsert]) // Array con UN SOLO elemento
        .select()
        .single(); // Ci aspettiamo UN SOLO risultato

      if (error) {
        console.error('❌ ERRORE nell\'inserimento del SINGOLO giocatore:', error);
        console.error('❌ Dettagli errore:', error.message);
        toast.error('Errore nell\'aggiunta del giocatore');
        return null;
      }

      if (!data) {
        console.error('❌ ERRORE: Nessun dato restituito dall\'inserimento');
        toast.error('Errore nell\'aggiunta del giocatore - nessun dato restituito');
        return null;
      }

      console.log('✅✅✅ SUCCESSO! Giocatore inserito come NORMALE (non CSV):');
      console.log('🆔 ID inserito:', data.id);
      console.log('👤 Nome inserito:', data.name);
      console.log('👤 Cognome inserito:', data.surname);
      console.log('⚽ Ruolo inserito:', data.role_category);
      console.log('🎯 Tier inserito:', data.tier, '(NON CSV)');
      console.log('🔢 Conteggio inserimenti: 1 (UNO SOLO)');
      
      toast.success(`Giocatore ${playerData.surname} aggiunto al database principale!`);
      
      // IMPORTANTE: Invalida la cache per aggiornare la lista dei giocatori
      console.log('🔄 Invalidando la cache dei giocatori...');
      queryClient.invalidateQueries({ queryKey: ['players'] });
      
      return data;

    } catch (error) {
      console.error('❌ ERRORE GENERALE nell\'importazione del SINGOLO giocatore:', error);
      toast.error('Errore nell\'importazione del giocatore');
      return null;
    }
  };

  return {
    importSingleCSVPlayer
  };
};
