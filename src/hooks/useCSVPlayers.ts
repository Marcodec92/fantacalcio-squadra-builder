
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PlayerRole } from '@/types/Player';

export interface CSVPlayer {
  id: string;
  name: string;
  surname: string;
  team: string;
  role: PlayerRole;
  credits: number;
}

export const useCSVPlayers = () => {
  const { user } = useAuth();
  const [csvPlayers, setCsvPlayers] = useState<CSVPlayer[]>([]);
  const [loading, setLoading] = useState(false);

  const parseCSVData = (csvText: string): CSVPlayer[] => {
    const lines = csvText.split('\n').filter(line => line.trim());
    const players: CSVPlayer[] = [];
    
    // Skip header row se presente
    const startIndex = lines[0].toLowerCase().includes('ruolo') ? 1 : 0;
    
    for (let i = startIndex; i < lines.length; i++) {
      const [ruolo, nomeGiocatore, squadra] = lines[i].split(',').map(s => s.trim());
      
      if (ruolo && nomeGiocatore && squadra) {
        // Converti ruolo abbreviato in ruolo completo
        let playerRole: PlayerRole;
        switch (ruolo.toUpperCase()) {
          case 'P':
            playerRole = 'Portiere';
            break;
          case 'D':
            playerRole = 'Difensore';
            break;
          case 'C':
            playerRole = 'Centrocampista';
            break;
          case 'A':
            playerRole = 'Attaccante';
            break;
          default:
            continue; // Skip se ruolo non riconosciuto
        }

        // Dividi nome e cognome
        const nameParts = nomeGiocatore.split(' ');
        const name = nameParts[0];
        const surname = nameParts.slice(1).join(' ') || '';

        players.push({
          id: `csv-${i}-${nomeGiocatore.replace(/\s+/g, '-')}`,
          name,
          surname,
          team: squadra,
          role: playerRole,
          credits: 0
        });
      }
    }
    
    return players;
  };

  const saveCSVPlayersToDatabase = async (players: CSVPlayer[]) => {
    if (!user) {
      toast.error('Devi essere autenticato per salvare i dati');
      return;
    }

    setLoading(true);
    try {
      // Prepara i dati per l'inserimento nel database
      const playersData = players.map(player => ({
        user_id: user.id,
        name: player.name,
        surname: player.surname,
        team: player.team as any, // Cast necessario per il tipo enum
        role_category: player.role,
        role: player.role as any, // Cast necessario per il tipo enum
        fmv: 0,
        cost_percentage: 0,
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
        tier: '',
        is_favorite: false
      }));

      const { error } = await supabase
        .from('players')
        .insert(playersData);
        
      if (error) {
        console.error('Errore nel salvare i giocatori:', error);
        toast.error('Errore nel salvare i giocatori nel database');
        return;
      }

      toast.success(`${players.length} giocatori salvati nel database`);
      console.log('Giocatori salvati con successo nel database');
      
    } catch (error) {
      console.error('Errore nel salvaggio:', error);
      toast.error('Errore nel salvare i dati');
    } finally {
      setLoading(false);
    }
  };

  const handleCSVUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      try {
        const players = parseCSVData(text);
        setCsvPlayers(players);
        
        // Salva automaticamente i dati nel database
        await saveCSVPlayersToDatabase(players);
        
        console.log('CSV caricato e salvato con successo:', players);
      } catch (error) {
        toast.error('Errore nel parsing del file CSV');
        console.error('Errore nel parsing del CSV:', error);
      }
    };
    reader.readAsText(file);
  };

  return {
    csvPlayers,
    loading,
    handleCSVUpload,
    parseCSVData,
    saveCSVPlayersToDatabase
  };
};
