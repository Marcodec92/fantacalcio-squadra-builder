import { useState, useEffect } from 'react';
import { PlayerRole } from '@/types/Player';
import { RealTimePlayer, RealTimeSelection } from '@/pages/RealTimeBuilder';
import { useCSVPlayers } from './useCSVPlayers';
import { useRealTimeSelections } from './useRealTimeSelections';

export const useRealTimeBuilder = () => {
  const [maxBudget, setMaxBudget] = useState<number>(() => {
    // Carica il budget salvato dal localStorage o usa 500 come default
    const savedBudget = localStorage.getItem('fantaTeamBudget');
    return savedBudget ? parseInt(savedBudget) : 500;
  });
  const [selections, setSelections] = useState<RealTimeSelection[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<{
    slot: number;
    role: PlayerRole;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dragActive, setDragActive] = useState(false);
  
  const { csvPlayers } = useCSVPlayers();
  const { 
    loading: dbLoading, 
    saveSelection, 
    loadSelections, 
    removeSelection: dbRemoveSelection, 
    clearAllSelections: dbClearAllSelections 
  } = useRealTimeSelections();

  // Carica le selezioni dal database all'avvio
  useEffect(() => {
    const loadInitialSelections = async () => {
      const savedSelections = await loadSelections();
      if (savedSelections.length > 0) {
        setSelections(savedSelections);
      }
    };
    
    loadInitialSelections();
  }, []);

  // Salva il budget nel localStorage quando cambia
  const handleBudgetChange = (newBudget: number) => {
    setMaxBudget(newBudget);
    localStorage.setItem('fantaTeamBudget', newBudget.toString());
    console.log('💰 Budget massimo aggiornato a:', newBudget);
  };

  const handlePositionClick = (slot: number, role: PlayerRole) => {
    if (csvPlayers.length === 0) {
      console.log('⚠️ Nessun CSV player disponibile - impossibile aprire il modal');
      return;
    }
    
    console.log('✅ Apertura modal con', csvPlayers.length, 'CSV players disponibili');
    setSelectedPosition({ slot, role });
    setSearchTerm('');
    setIsModalOpen(true);
  };

  const handlePlayerSelect = async (player: RealTimePlayer, credits: number) => {
    if (!selectedPosition) return;
    
    const newSelection: RealTimeSelection = {
      id: `${selectedPosition.role}-${selectedPosition.slot}`,
      position_slot: selectedPosition.slot,
      role_category: selectedPosition.role,
      player: { ...player, credits }
    };

    // Aggiorna lo stato locale
    setSelections(prev => {
      const filtered = prev.filter(
        s => !(s.position_slot === selectedPosition.slot && s.role_category === selectedPosition.role)
      );
      return [...filtered, newSelection];
    });

    // Salva nel database
    await saveSelection(newSelection);
    
    setIsModalOpen(false);
    setSelectedPosition(null);
    console.log('Giocatore selezionato:', newSelection);
  };

  const handleRemovePlayer = async (slot: number, role: PlayerRole) => {
    // Rimuovi dallo stato locale
    setSelections(prev => 
      prev.filter(s => !(s.position_slot === slot && s.role_category === role))
    );

    // Rimuovi dal database
    await dbRemoveSelection(slot, role);
    
    console.log('Giocatore rimosso dalla posizione:', slot, role);
  };

  const handleUpdateCredits = async (slot: number, role: PlayerRole, newCredits: number) => {
    // Aggiorna lo stato locale
    setSelections(prev => 
      prev.map(selection => {
        if (selection.position_slot === slot && selection.role_category === role && selection.player) {
          const updatedSelection = {
            ...selection,
            player: {
              ...selection.player,
              credits: newCredits
            }
          };
          
          // Salva nel database in background
          saveSelection(updatedSelection);
          
          return updatedSelection;
        }
        return selection;
      })
    );
    
    console.log('Crediti aggiornati per posizione:', slot, role, 'nuovi crediti:', newCredits);
  };

  const calculateTotalCredits = () => {
    return selections.reduce((total, selection) => {
      return total + (selection.player?.credits || 0);
    }, 0);
  };

  const calculateRoleCredits = () => {
    const roleCredits = {
      Portiere: 0,
      Difensore: 0,
      Centrocampista: 0,
      Attaccante: 0
    };

    selections.forEach(selection => {
      if (selection.player) {
        roleCredits[selection.role_category] += selection.player.credits;
      }
    });

    return roleCredits;
  };

  const clearSelections = async () => {
    setSelections([]);
    await dbClearAllSelections();
  };

  return {
    maxBudget,
    setMaxBudget,
    handleBudgetChange,
    selections,
    setSelections,
    isModalOpen,
    setIsModalOpen,
    selectedPosition,
    setSelectedPosition,
    searchTerm,
    setSearchTerm,
    dragActive,
    setDragActive,
    handlePositionClick,
    handlePlayerSelect,
    handleRemovePlayer,
    handleUpdateCredits,
    calculateTotalCredits,
    calculateRoleCredits,
    clearSelections,
    csvPlayers,
    dbLoading
  };
};
