
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PlayerRole, SpecificRole, Team } from '@/types/Player';

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

  // NON carichiamo più i CSV players dal database all'avvio
  // I giocatori CSV ora esistono solo in memoria fino a quando non vengono selezionati

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

      // IMPORTANTE: Il CSV contiene solo cognomi, quindi trattiamo il campo come cognome
      // e lasciamo il nome vuoto per ora
      const cognome = cognomeGiocatore.trim();

      const player: CSVPlayer = {
        id: `csv-${i}-${cognome.replace(/\s+/g, '-')}`,
        name: '', // Nome vuoto perché il CSV contiene solo cognomi
        surname: cognome, // Questo è il cognome dal CSV
        team: squadra.trim(),
        role: playerRole,
        credits: 0
      };

      players.push(player);
      console.log(`✅ Giocatore aggiunto (COGNOME):`, player);
    }
    
    console.log('🎯 Totale giocatori parsati:', players.length);
    return players;
  };

  // RIMOSSA la funzione saveCSVPlayersToDatabase - ora i giocatori vengono salvati solo quando selezionati

  const handleCSVUpload = async (file: File) => {
    console.log('📁 Caricamento file CSV:', file.name, 'Size:', file.size, 'bytes');
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      console.log('📖 File letto, lunghezza:', text.length);
      
      try {
        const players = parseCSVData(text);
        
        if (players.length > 0) {
          // IMPORTANTE: NON salviamo più nel database, teniamo solo in memoria
          setCsvPlayers(players);
          console.log('✅ CSV parsato e tenuto in memoria:', players.length, 'giocatori');
          toast.success(`${players.length} giocatori CSV caricati e pronti per la selezione`);
        } else {
          toast.error('Nessun giocatore trovato nel file CSV. Controlla il formato del file.');
        }
        
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

  const clearCSVPlayers = () => {
    // Ora cancelliamo solo dalla memoria, non dal database
    setCsvPlayers([]);
    console.log('🗑️ CSV players cancellati dalla memoria');
    toast.success('Giocatori CSV cancellati dalla memoria');
  };

  const resetDatabase = async () => {
    if (!user) return;

    try {
      setLoading(true);
      console.log('🔄 Inizio reset database CSV');

      // 1. Cancella tutti i giocatori CSV dal database (quelli con tier = 'CSV')
      const { error: csvError } = await supabase
        .from('players')
        .delete()
        .eq('user_id', user.id)
        .eq('tier', 'CSV');

      if (csvError) {
        console.error('Errore nella cancellazione CSV players:', csvError);
        throw csvError;
      }

      // 2. Cancella tutte le selezioni del Real Time Builder
      const { error: selectionsError } = await supabase
        .from('realtime_selections')
        .delete()
        .eq('user_id', user.id);

      if (selectionsError) {
        console.error('Errore nella cancellazione selezioni Real Time:', selectionsError);
        throw selectionsError;
      }

      // 3. Pulisce lo stato locale dei CSV players
      setCsvPlayers([]);
      
      console.log('✅ Reset database completato');
      toast.success('Database resettato! Tutti i giocatori CSV e le selezioni Real Time sono stati cancellati.');
      
    } catch (error) {
      console.error('Errore nel reset del database:', error);
      toast.error('Errore nel reset del database');
    } finally {
      setLoading(false);
    }
  };

  return {
    csvPlayers,
    loading,
    handleCSVUpload,
    parseCSVData,
    clearCSVPlayers,
    resetDatabase
  };
};
