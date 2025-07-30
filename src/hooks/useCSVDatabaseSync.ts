import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Player, PlayerRole, SpecificRole } from '@/types/Player';

interface CSVPlayer {
  id: string;
  name: string;
  surname: string;
  team: string;
  role: PlayerRole;
  credits: number;
}

export const useCSVDatabaseSync = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Helper function to map role category to default specific role
  const getDefaultSpecificRole = (roleCategory: PlayerRole): SpecificRole => {
    switch (roleCategory) {
      case 'Portiere':
        return 'Portiere';
      case 'Difensore':
        return 'Difensore centrale';
      case 'Centrocampista':
        return 'Mediano';
      case 'Attaccante':
        return 'Attaccante centrale';
      default:
        return 'Portiere';
    }
  };

  // Funzione per identificare un giocatore (nome + cognome)
  const getPlayerKey = (name: string, surname: string) => `${name.trim().toLowerCase()}_${surname.trim().toLowerCase()}`;

  const syncDatabaseWithCSV = async (csvPlayers: CSVPlayer[]) => {
    if (!user) {
      toast.error('Devi essere autenticato per sincronizzare il database');
      return false;
    }

    console.log('🔄 INIZIO SINCRONIZZAZIONE DATABASE CON CSV');
    console.log('📊 Giocatori nel CSV:', csvPlayers.length);

    try {
      // 1. Recupera tutti i giocatori attualmente nel database per questo utente
      const { data: existingPlayers, error: fetchError } = await supabase
        .from('players')
        .select('*')
        .eq('user_id', user.id);

      if (fetchError) {
        console.error('❌ Errore nel recupero giocatori esistenti:', fetchError);
        toast.error('Errore nel recupero dei giocatori esistenti');
        return false;
      }

      console.log('📊 Giocatori esistenti nel database:', existingPlayers?.length || 0);

      // 2. Crea mappe per confronto rapido
      const csvPlayersMap = new Map();
      csvPlayers.forEach(player => {
        const key = getPlayerKey(player.name, player.surname);
        csvPlayersMap.set(key, player);
      });

      const existingPlayersMap = new Map();
      (existingPlayers || []).forEach(player => {
        const key = getPlayerKey(player.name, player.surname);
        existingPlayersMap.set(key, player);
      });

      console.log('🗺️ Mappa CSV creata con', csvPlayersMap.size, 'giocatori');
      console.log('🗺️ Mappa DB creata con', existingPlayersMap.size, 'giocatori');

      // 3. Identifica giocatori da aggiornare, aggiungere ed eliminare
      const playersToUpdate: any[] = [];
      const playersToAdd: any[] = [];
      const playersToDelete: string[] = [];

      // Controlla ogni giocatore del CSV
      csvPlayers.forEach(csvPlayer => {
        const key = getPlayerKey(csvPlayer.name, csvPlayer.surname);
        const existingPlayer = existingPlayersMap.get(key);

        if (existingPlayer) {
          // Giocatore esiste: controlla se serve aggiornamento
          const needsUpdate = existingPlayer.team !== csvPlayer.team;
          
          if (needsUpdate) {
            console.log(`🔄 Aggiornamento necessario per ${csvPlayer.name} ${csvPlayer.surname}: ${existingPlayer.team} → ${csvPlayer.team}`);
            playersToUpdate.push({
              id: existingPlayer.id,
              team: csvPlayer.team
            });
          }
        } else {
          // Giocatore nuovo: aggiungi
          console.log(`➕ Nuovo giocatore da aggiungere: ${csvPlayer.name} ${csvPlayer.surname}`);
          playersToAdd.push({
            user_id: user.id,
            name: csvPlayer.name,
            surname: csvPlayer.surname,
            team: csvPlayer.team,
            role_category: csvPlayer.role,
            role: getDefaultSpecificRole(csvPlayer.role),
            tier: 'CSV',
            cost_percentage: 0,
            fmv: csvPlayer.credits,
            goals: 0,
            assists: 0,
            malus: 0,
            goals_conceded: 0,
            yellow_cards: 0,
            penalties_saved: 0,
            x_g: 0,
            x_a: 0,
            x_p: 0,
            ownership: 0,
            plus_categories: [],
            is_favorite: false
          });
        }
      });

      // Controlla giocatori da eliminare (esistono nel DB ma non nel CSV)
      existingPlayers?.forEach(existingPlayer => {
        const key = getPlayerKey(existingPlayer.name, existingPlayer.surname);
        if (!csvPlayersMap.has(key)) {
          console.log(`🗑️ Giocatore da eliminare: ${existingPlayer.name} ${existingPlayer.surname}`);
          playersToDelete.push(existingPlayer.id);
        }
      });

      console.log(`📊 Riepilogo operazioni:`);
      console.log(`   - Da aggiornare: ${playersToUpdate.length}`);
      console.log(`   - Da aggiungere: ${playersToAdd.length}`);
      console.log(`   - Da eliminare: ${playersToDelete.length}`);

      // 4. Esegui le operazioni nel database
      let updatedCount = 0;
      let addedCount = 0;
      let deletedCount = 0;

      // Aggiorna giocatori esistenti
      for (const playerUpdate of playersToUpdate) {
        const { error } = await supabase
          .from('players')
          .update({ team: playerUpdate.team })
          .eq('id', playerUpdate.id);

        if (error) {
          console.error('❌ Errore aggiornamento giocatore:', error);
        } else {
          updatedCount++;
        }
      }

      // Aggiungi nuovi giocatori
      if (playersToAdd.length > 0) {
        const { error, data } = await supabase
          .from('players')
          .insert(playersToAdd)
          .select();

        if (error) {
          console.error('❌ Errore aggiunta giocatori:', error);
        } else {
          addedCount = data?.length || 0;
        }
      }

      // Elimina giocatori non più presenti
      for (const playerId of playersToDelete) {
        const { error } = await supabase
          .from('players')
          .delete()
          .eq('id', playerId);

        if (error) {
          console.error('❌ Errore eliminazione giocatore:', error);
        } else {
          deletedCount++;
        }
      }

      console.log('✅ SINCRONIZZAZIONE COMPLETATA');
      console.log(`   - Aggiornati: ${updatedCount}/${playersToUpdate.length}`);
      console.log(`   - Aggiunti: ${addedCount}/${playersToAdd.length}`);
      console.log(`   - Eliminati: ${deletedCount}/${playersToDelete.length}`);

      // Invalida la cache per aggiornare la lista dei giocatori
      queryClient.invalidateQueries({ queryKey: ['players'] });

      toast.success(`Database sincronizzato! Aggiornati: ${updatedCount}, Aggiunti: ${addedCount}, Eliminati: ${deletedCount}`);

      return true;

    } catch (error) {
      console.error('❌ ERRORE GENERALE nella sincronizzazione:', error);
      toast.error('Errore nella sincronizzazione del database');
      return false;
    }
  };

  return {
    syncDatabaseWithCSV
  };
};