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

  // Carica i CSV players dal database all'avvio
  useEffect(() => {
    if (user) {
      loadCSVPlayersFromDatabase();
    }
  }, [user]);

  const loadCSVPlayersFromDatabase = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('user_id', user.id)
        .eq('tier', 'CSV'); // Usiamo il tier per identificare i players CSV

      if (error) {
        console.error('Errore nel caricamento CSV players:', error);
        return;
      }

      if (data && data.length > 0) {
        const players: CSVPlayer[] = data.map(player => ({
          id: player.id,
          name: player.name,
          surname: player.surname,
          team: player.team || '',
          role: player.role_category,
          credits: 0
        }));
        
        setCsvPlayers(players);
        console.log('📥 CSV players caricati dal database:', players.length);
      }
    } catch (error) {
      console.error('Errore nel caricamento CSV players:', error);
    } finally {
      setLoading(false);
    }
  };

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
      console.log('💾 Inizio salvataggio nel database di', players.length, 'giocatori CSV');
      
      // Prima eliminiamo i vecchi CSV players
      const { error: deleteError } = await supabase
        .from('players')
        .delete()
        .eq('user_id', user.id)
        .eq('tier', 'CSV');

      if (deleteError) {
        console.error('Errore nell\'eliminazione dei vecchi CSV players:', deleteError);
      }

      // Ora salviamo i nuovi CSV players con la corretta mappatura dei tipi
      const playersToInsert = players.map(player => {
        const validatedTeam = validateTeamName(player.team);
        
        return {
          user_id: user.id,
          name: player.name,
          surname: player.surname,
          team: validatedTeam, // Questo ora è del tipo corretto o null
          role_category: player.role,
          role: getDefaultSpecificRole(player.role),
          tier: 'CSV', // Marchiamo come CSV per distinguerli
          cost_percentage: 0,
          fmv: 0,
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
        };
      });

      const { data, error } = await supabase
        .from('players')
        .insert(playersToInsert)
        .select();

      if (error) {
        console.error('Errore nel salvataggio CSV players:', error);
        toast.error('Errore nel salvataggio dei giocatori CSV');
        return;
      }

      console.log('✅ CSV players salvati nel database:', data?.length);
      
      // Aggiorna lo stato locale con i players salvati
      if (data) {
        const savedPlayers: CSVPlayer[] = data.map(player => ({
          id: player.id,
          name: player.name,
          surname: player.surname,
          team: player.team || '',
          role: player.role_category,
          credits: 0
        }));
        setCsvPlayers(savedPlayers);
      }
      
      toast.success(`${players.length} giocatori CSV salvati nel database e pronti per il Real Time Builder`);
      
    } catch (error) {
      console.error('Errore nel salvataggio CSV:', error);
      toast.error('Errore nel salvataggio CSV');
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
        
        if (players.length > 0) {
          await saveCSVPlayersToDatabase(players);
        } else {
          toast.error('Nessun giocatore trovato nel file CSV. Controlla il formato del file.');
        }
        
        console.log('CSV caricato con successo:', players);
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

  const clearCSVPlayers = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('players')
        .delete()
        .eq('user_id', user.id)
        .eq('tier', 'CSV');

      if (error) {
        console.error('Errore nella cancellazione CSV players:', error);
        return;
      }

      setCsvPlayers([]);
      console.log('🗑️ CSV players cancellati dal database');
      toast.success('Giocatori CSV cancellati');
    } catch (error) {
      console.error('Errore nella cancellazione CSV players:', error);
      toast.error('Errore nella cancellazione dei giocatori CSV');
    }
  };

  const resetDatabase = async () => {
    if (!user) return;

    try {
      setLoading(true);
      console.log('🔄 Inizio reset completo del database');

      // 1. Cancella tutti i CSV players
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
        console.error('Errore nella cancellazione selezioni:', selectionsError);
        throw selectionsError;
      }

      // 3. Aggiorna lo stato locale
      setCsvPlayers([]);
      
      console.log('✅ Reset database completato');
      toast.success('Database resettato con successo! Tutti i CSV e le selezioni sono stati cancellati.');
      
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
    saveCSVPlayersToDatabase,
    clearCSVPlayers,
    loadCSVPlayersFromDatabase,
    resetDatabase
  };
};
