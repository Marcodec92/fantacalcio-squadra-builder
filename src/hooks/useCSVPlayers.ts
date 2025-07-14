
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PlayerRole, SpecificRole, Team } from '@/types/Player';

const CSV_STORAGE_KEY = 'csvPlayers';

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

  // Carica i CSV players dal localStorage all'avvio
  useEffect(() => {
    const loadCSVFromStorage = () => {
      try {
        const storedCSV = localStorage.getItem(CSV_STORAGE_KEY);
        if (storedCSV) {
          const parsedData = JSON.parse(storedCSV);
          setCsvPlayers(parsedData);
          console.log('✅ CSV players caricati dal localStorage:', parsedData.length);
        }
      } catch (error) {
        console.error('❌ Errore nel caricamento CSV dal localStorage:', error);
        localStorage.removeItem(CSV_STORAGE_KEY);
      }
    };

    loadCSVFromStorage();
  }, []);

  // Salva i CSV players nel localStorage ogni volta che cambiano
  useEffect(() => {
    if (csvPlayers.length > 0) {
      try {
        localStorage.setItem(CSV_STORAGE_KEY, JSON.stringify(csvPlayers));
        console.log('💾 CSV players salvati nel localStorage:', csvPlayers.length);
      } catch (error) {
        console.error('❌ Errore nel salvataggio CSV nel localStorage:', error);
      }
    }
  }, [csvPlayers]);
  
  // Helper function to map role category to specific role
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

  // Helper function to validate and convert team name
  const validateTeamName = (teamName: string): Team | null => {
    const validTeams: Team[] = [
      'Atalanta', 'Bologna', 'Cagliari', 'Como', 'Cremonese', 'Fiorentina',
      'Genoa', 'Hellas Verona', 'Inter', 'Juventus', 'Lazio', 'Lecce',
      'Milan', 'Napoli', 'Parma', 'Pisa', 'Roma', 'Sassuolo', 'Torino', 'Udinese'
    ];
    
    // Try exact match first
    const exactMatch = validTeams.find(team => team.toLowerCase() === teamName.toLowerCase());
    if (exactMatch) return exactMatch;
    
    // Try partial match
    const partialMatch = validTeams.find(team => 
      team.toLowerCase().includes(teamName.toLowerCase()) || 
      teamName.toLowerCase().includes(team.toLowerCase())
    );
    if (partialMatch) return partialMatch;
    
    console.log(`⚠️ Team "${teamName}" not found in valid teams list`);
    return null;
  };

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
    const hasHeader = firstLine.includes('ruolo') || firstLine.includes('nome') || firstLine.includes('squadra') || firstLine.includes('giocatore') || firstLine.includes('cognome');
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
      
      const [ruolo, cognomeGiocatore, squadra] = parts;
      
      if (!ruolo || !cognomeGiocatore || !squadra) {
        console.log(`⚠️ Riga ${i + 1} ha campi vuoti:`, { ruolo, cognomeGiocatore, squadra });
        continue;
      }
      
      // Converti ruolo abbreviato in ruolo completo (MACRO AREA)
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
          console.log(`⚠️ Ruolo non riconosciuto: "${ruolo}" per giocatore ${cognomeGiocatore}`);
          continue;
      }

      // Il CSV contiene solo cognomi
      const cognome = cognomeGiocatore.trim();

      const player: CSVPlayer = {
        id: `csv-${i}-${cognome.replace(/\s+/g, '-')}`,
        name: '', // Nome vuoto perché il CSV contiene solo cognomi
        surname: cognome,
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

  const handleCSVUpload = async (file: File) => {
    console.log('📁 Caricamento file CSV:', file.name, 'Size:', file.size, 'bytes');
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      console.log('📖 File letto, lunghezza:', text.length);
      
      try {
        const players = parseCSVData(text);
        
        if (players.length > 0) {
          // Salva in memoria e localStorage
          setCsvPlayers(players);
          console.log('✅ CSV parsato e salvato:', players.length, 'giocatori');
          console.log('💾 CSV salvato nel localStorage per persistenza');
          toast.success(`${players.length} giocatori CSV caricati e salvati`);
        } else {
          toast.error('Nessun giocatore trovato nel file CSV. Controlla il formato del file.');
        }
        
      } catch (error) {
        toast.error('Errore nel caricamento del file CSV');
        console.error('Errore nel caricamento del CSV:', error);
      }
    };
    
    reader.onerror = (error) => {
      console.error('Errore nella lettura del file:', error);
      toast.error('Errore nella lettura del file CSV');
    };
    
    reader.readAsText(file);
  };

  const clearCSVPlayers = async () => {
    // Cancella dalla memoria e dal localStorage
    setCsvPlayers([]);
    localStorage.removeItem(CSV_STORAGE_KEY);
    console.log('🗑️ CSV players cancellati dalla memoria e localStorage');
    toast.success('Giocatori CSV cancellati');
  };

  const resetDatabase = async () => {
    if (!user) return;

    try {
      setLoading(true);
      console.log('🔄 Inizio reset database');

      // 1. Cancella tutte le selezioni del Real Time Builder
      const { error: selectionsError } = await supabase
        .from('realtime_selections')
        .delete()
        .eq('user_id', user.id);

      if (selectionsError) {
        console.error('Errore nella cancellazione selezioni Real Time:', selectionsError);
        throw selectionsError;
      }

      // 2. Cancella tutte le selezioni dello Squad Builder
      const { error: squadError } = await supabase
        .from('squad_selections')
        .delete()
        .eq('user_id', user.id);

      if (squadError) {
        console.error('Errore nella cancellazione selezioni Squad:', squadError);
        throw squadError;
      }

      // 3. Cancella tutti i giocatori del database (quelli importati)
      const { error: playersError } = await supabase
        .from('players')
        .delete()
        .eq('user_id', user.id);

      if (playersError) {
        console.error('Errore nella cancellazione giocatori:', playersError);
        throw playersError;
      }

      // 4. Pulisce lo stato locale dei CSV players E il localStorage
      setCsvPlayers([]);
      localStorage.removeItem(CSV_STORAGE_KEY);
      
      console.log('✅ Reset database completato');
      toast.success('Database resettato! Tutti i giocatori e le selezioni sono stati cancellati.');
      
    } catch (error) {
      console.error('Errore nel reset del database:', error);
      toast.error('Errore nel reset del database');
    } finally {
      setLoading(false);
    }
  };

  const removeCSVPlayer = async (playerId: string) => {
    // Rimuovi dalla memoria (il localStorage verrà aggiornato automaticamente dall'useEffect)
    setCsvPlayers(prev => prev.filter(p => p.id !== playerId));
    console.log('✅ CSV player rimosso dalla memoria e localStorage');
  };

  return {
    csvPlayers,
    loading,
    handleCSVUpload,
    parseCSVData,
    clearCSVPlayers,
    resetDatabase,
    removeCSVPlayer
  };
};
