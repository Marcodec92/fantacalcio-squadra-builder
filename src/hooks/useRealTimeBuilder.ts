
import { useState, useEffect } from 'react';
import { PlayerRole } from '@/types/Player';
import { RealTimePlayer, RealTimeSelection } from '@/pages/RealTimeBuilder';
import { useCSVPlayers } from './useCSVPlayers';

export const useRealTimeBuilder = () => {
  const [maxBudget, setMaxBudget] = useState<number>(500);
  const [selections, setSelections] = useState<RealTimeSelection[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<{
    slot: number;
    role: PlayerRole;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dragActive, setDragActive] = useState(false);
  
  const { csvPlayers } = useCSVPlayers();

  const handlePositionClick = (slot: number, role: PlayerRole) => {
    if (csvPlayers.length === 0) {
      // Se non ci sono CSV players, mostra un messaggio
      return;
    }
    
    setSelectedPosition({ slot, role });
    setSearchTerm('');
    setIsModalOpen(true);
  };

  const handlePlayerSelect = (player: RealTimePlayer, credits: number) => {
    if (!selectedPosition) return;
    
    const newSelection: RealTimeSelection = {
      id: `${selectedPosition.role}-${selectedPosition.slot}`,
      position_slot: selectedPosition.slot,
      role_category: selectedPosition.role,
      player: { ...player, credits }
    };

    setSelections(prev => {
      const filtered = prev.filter(
        s => !(s.position_slot === selectedPosition.slot && s.role_category === selectedPosition.role)
      );
      return [...filtered, newSelection];
    });
    
    setIsModalOpen(false);
    setSelectedPosition(null);
    console.log('Giocatore selezionato:', newSelection);
  };

  const handleRemovePlayer = (slot: number, role: PlayerRole) => {
    setSelections(prev => 
      prev.filter(s => !(s.position_slot === slot && s.role_category === role))
    );
    console.log('Giocatore rimosso dalla posizione:', slot, role);
  };

  const handleUpdateCredits = (slot: number, role: PlayerRole, newCredits: number) => {
    setSelections(prev => 
      prev.map(selection => {
        if (selection.position_slot === slot && selection.role_category === role && selection.player) {
          return {
            ...selection,
            player: {
              ...selection.player,
              credits: newCredits
            }
          };
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

  const clearSelections = () => {
    setSelections([]);
  };

  // Controlla se i CSV players sono disponibili
  const hasCSVPlayers = csvPlayers.length > 0;

  return {
    maxBudget,
    setMaxBudget,
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
    hasCSVPlayers,
    csvPlayers
  };
};
