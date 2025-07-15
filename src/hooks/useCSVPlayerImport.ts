
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Player, PlayerRole, SpecificRole } from '@/types/Player';

export const useCSVPlayerImport = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Helper function to map role category to default specific role
  const getDefaultSpecificRole = (roleCategory: PlayerRole): SpecificRole => {
    console.log('🎯 Mapping role category to default specific role:', roleCategory);
    
    switch (roleCategory) {
      case 'Portiere':
        return 'Portiere';
      case 'Difensore':
        return 'Difensore centrale'; // Default to most common defender role
      case 'Centrocampista':
        return 'Mediano'; // Default to most common midfielder role
      case 'Attaccante':
        return 'Attaccante centrale'; // Default to most common attacker role
      default:
        console.warn('Unknown role category:', roleCategory, 'defaulting to Portiere');
        return 'Portiere';
    }
  };

  const importSingleCSVPlayer = async (playerData: Partial<Player>) => {
    if (!user) {
      toast.error('Devi essere autenticato per aggiungere giocatori');
      return null;
    }

    console.log('🎯🎯🎯 IMPORTAZIONE SINGOLO GIOCATORE - INIZIO');
    console.log('📋 Dati giocatore da importare:', playerData);
    console.log('🔒 VERIFICA CRITICA: Importo SOLO questo giocatore, non una lista');

    try {
      // IMPORTANTE: Impostiamo un ruolo specifico di default basato sulla categoria
      const defaultSpecificRole = getDefaultSpecificRole(playerData.roleCategory!);
      
      // Crea l'oggetto da inserire nel database con tutti i campi necessari
      const playerToInsert = {
        user_id: user.id,
        name: playerData.name || '',
        surname: playerData.surname || '',
        team: playerData.team || null,
        role_category: playerData.roleCategory!,
        role: defaultSpecificRole, // RUOLO SPECIFICO DI DEFAULT - poi sarà modificato manualmente dall'utente
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

      console.log('📝 OGGETTO SINGOLO da inserire nel database:');
      console.log('👤 Nome:', playerToInsert.name);
      console.log('👤 Cognome:', playerToInsert.surname);
      console.log('⚽ Ruolo categoria:', playerToInsert.role_category);
      console.log('⚽ Ruolo specifico di default:', playerToInsert.role, '(sarà modificato manualmente)');
      console.log('🏟️ Team:', playerToInsert.team);
      console.log('🎯 Tier:', playerToInsert.tier);
      console.log('🔢 User ID:', playerToInsert.user_id);

      // INSERIMENTO SINGOLO
      console.log('💾 ESEGUENDO INSERT di UN SOLO GIOCATORE...');
      const { data, error } = await supabase
        .from('players')
        .insert([playerToInsert])
        .select()
        .single();

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

      console.log('✅✅✅ SUCCESSO! Giocatore inserito con ruolo specifico di default:');
      console.log('🆔 ID inserito:', data.id);
      console.log('👤 Nome inserito:', data.name);
      console.log('👤 Cognome inserito:', data.surname);
      console.log('⚽ Ruolo categoria inserito:', data.role_category);
      console.log('⚽ Ruolo specifico inserito:', data.role, '(default - da specificare manualmente)');
      console.log('🎯 Tier inserito:', data.tier);
      console.log('🔢 Conteggio inserimenti: 1 (UNO SOLO)');
      
      toast.success(`Giocatore ${playerData.surname} aggiunto con ruolo ${defaultSpecificRole}! Ora puoi specificare il ruolo dettagliato.`);
      
      // Invalida la cache per aggiornare la lista dei giocatori
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
