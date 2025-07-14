
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
    console.log('📄 Parsing CSV text:', csvText.substring(0, 200) + '...');
    
    const lines = csvText.split('\n').filter(line => line.trim());
    console.log('📋 Righe CSV trovate:', lines.length);
    
    if (lines.length === 0) {
      console.log('❌ Nessuna riga trovata nel CSV');
      return [];
    }

    const players: CSVPlayer[] = [];
    
    // Mostra le prime righe per debug
    console.log('🔍 Prime 3 righe del CSV:');
    lines.slice(0, 3).forEach((line, index) => {
      console.log(`Riga ${index + 1}:`, line);
    });
    
    // Verifica se la prima riga è un header
    const firstLine = lines[0].toLowerCase();
    const hasHeader = firstLine.includes('ruolo') || firstLine.includes('nome') || firstLine.includes('squadra') || firstLine.includes('giocatore');
    const startIndex = hasHeader ? 1 : 0;
    
    console.log('🏁 Header rilevato:', hasHeader, 'Inizio parsing da riga:', startIndex + 1);
    
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Prova diversi separatori
      let parts: string[] = [];
      if (line.includes(',')) {
        parts = line.split(',').map(s => s.trim().replace(/"/g, ''));
      } else if (line.includes(';')) {
        parts = line.split(';').map(s => s.trim().replace(/"/g, ''));
      } else if (line.includes('\t')) {
        parts = line.split('\t').map(s => s.trim().replace(/"/g, ''));
      } else {
        console.log('⚠️ Riga non riconosciuta (nessun separatore):', line);
        continue;
      }
      
      console.log(`🔍 Riga ${i + 1} parti:`, parts);
      
      if (parts.length < 3) {
        console.log(`⚠️ Riga ${i + 1} ha meno di 3 colonne:`, parts);
        continue;
      }
      
      const [ruolo, nomeGiocatore, squadra] = parts;
      
      if (!ruolo || !nomeGiocatore || !squadra) {
        console.log(`⚠️ Riga ${i + 1} ha campi vuoti:`, { ruolo, nomeGiocatore, squadra });
        continue;
      }
      
      // Converti ruolo abbreviato in ruolo completo
      let playerRole: PlayerRole;
      const ruoloUpper = ruolo.toUpperCase().trim();
      
      switch (ruoloUpper) {
        case 'P':
        case 'POR':
        case 'PORTIERE':
          playerRole = 'Portiere';
          break;
        case 'D':
        case 'DIF':
        case 'DIFENSORE':
          playerRole = 'Difensore';
          break;
        case 'C':
        case 'CEN':
        case 'CENTROCAMPISTA':
          playerRole = 'Centrocampista';
          break;
        case 'A':
        case 'ATT':
        case 'ATTACCANTE':
          playerRole = 'Attaccante';
          break;
        default:
          console.log(`⚠️ Ruolo non riconosciuto: "${ruolo}" per giocatore ${nomeGiocatore}`);
          continue;
      }

      // Dividi nome e cognome - gestisci meglio i nomi
      const nameParts = nomeGiocatore.trim().split(' ').filter(part => part.length > 0);
      const name = nameParts[0] || '';
      const surname = nameParts.slice(1).join(' ') || '';

      const player: CSVPlayer = {
        id: `csv-${i}-${nomeGiocatore.replace(/\s+/g, '-')}`,
        name,
        surname,
        team: squadra.trim(),
        role: playerRole,
        credits: 0
      };

      players.push(player);
      console.log(`✅ Giocatore aggiunto:`, player);
    }
    
    console.log('🎯 Totale giocatori parsati:', players.length);
    return players;
  };

  const saveCSVPlayersToDatabase = async (players: CSVPlayer[]) => {
    if (!user) {
      toast.error('Devi essere autenticato per salvare i dati');
      return;
    }

    if (players.length === 0) {
      toast.error('Nessun giocatore da salvare - controlla il formato del CSV');
      return;
    }

    setLoading(true);
    try {
      console.log('💾 Inizio salvataggio nel database di', players.length, 'giocatori');
      
      // Prima elimina tutti i giocatori esistenti dell'utente
      const { error: deleteError } = await supabase
        .from('players')
        .delete()
        .eq('user_id', user.id);
        
      if (deleteError) {
        console.error('Errore nell\'eliminare i giocatori esistenti:', deleteError);
        toast.error('Errore nell\'eliminare i dati precedenti');
        return;
      }

      console.log('🗑️ Giocatori precedenti eliminati');

      // Prepara i dati per l'inserimento nel database
      const playersData = players.map(player => ({
        user_id: user.id,
        name: player.name,
        surname: player.surname,
        team: player.team as any,
        role_category: player.role,
        role: player.role as any,
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

      console.log('📋 Dati preparati per l\'inserimento:', playersData.slice(0, 2));

      const { error } = await supabase
        .from('players')
        .insert(playersData);
        
      if (error) {
        console.error('Errore nel salvare i giocatori:', error);
        toast.error('Errore nel salvare i giocatori nel database: ' + error.message);
        return;
      }

      toast.success(`${players.length} giocatori salvati nel database`);
      console.log('✅ Giocatori salvati con successo nel database');
      
    } catch (error) {
      console.error('Errore nel salvaggio:', error);
      toast.error('Errore nel salvare i dati');
    } finally {
      setLoading(false);
    }
  };

  const handleCSVUpload = async (file: File) => {
    console.log('📁 Caricamento file CSV:', file.name, 'Size:', file.size, 'bytes');
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      console.log('📖 File letto, lunghezza:', text.length);
      
      try {
        const players = parseCSVData(text);
        setCsvPlayers(players);
        
        if (players.length > 0) {
          // Salva automaticamente i dati nel database
          await saveCSVPlayersToDatabase(players);
        } else {
          toast.error('Nessun giocatore trovato nel file CSV. Controlla il formato del file.');
        }
        
        console.log('CSV caricato e salvato con successo:', players);
      } catch (error) {
        toast.error('Errore nel parsing del file CSV');
        console.error('Errore nel parsing del CSV:', error);
      }
    };
    
    reader.onerror = (error) => {
      console.error('Errore nella lettura del file:', error);
      toast.error('Errore nella lettura del file CSV');
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
