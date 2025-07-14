
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PlayerRole, SpecificRole } from '@/types/Player';

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
      console.log('💾 Inizio salvataggio nel database di', players.length, 'giocatori');
      
      // NON eliminiamo i giocatori esistenti - manteniamo i dati del database separati dal CSV
      // I CSV players saranno gestiti separatamente per il Real Time Builder
      
      console.log('✅ CSV players caricati in memoria per Real Time Builder');
      toast.success(`${players.length} giocatori CSV caricati e pronti per il Real Time Builder`);
      
    } catch (error) {
      console.error('Errore nel caricamento CSV:', error);
      toast.error('Errore nel caricamento CSV');
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

  const clearCSVPlayers = () => {
    setCsvPlayers([]);
    console.log('🗑️ CSV players cleared');
  };

  return {
    csvPlayers,
    loading,
    handleCSVUpload,
    parseCSVData,
    saveCSVPlayersToDatabase,
    clearCSVPlayers
  };
};
