
import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { usePlayers } from '@/hooks/usePlayers';
import { useSquadSelections } from '@/hooks/useSquadSelections';
import SquadGrid from '@/components/SquadGrid';
import PlayerSelectionModal from '@/components/PlayerSelectionModal';
import BudgetWheel from '@/components/BudgetWheel';
import { PlayerRole } from '@/types/Player';

const SquadBuilder = () => {
  const { user } = useAuth();
  const { players, isLoading: playersLoading } = usePlayers();
  const { squadSelections, addSelection, updateSelection, deleteSelection, isLoading: squadLoading } = useSquadSelections();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<{
    slot: number;
    role: PlayerRole;
  } | null>(null);

  const handlePositionClick = (slot: number, role: PlayerRole) => {
    setSelectedPosition({ slot, role });
    setIsModalOpen(true);
  };

  const handlePlayerSelect = (playerId: string) => {
    if (!selectedPosition) return;
    
    const existingSelection = squadSelections.find(
      s => s.position_slot === selectedPosition.slot && s.role_category === selectedPosition.role
    );

    if (existingSelection) {
      updateSelection(existingSelection.id, playerId);
    } else {
      addSelection({
        player_id: playerId,
        position_slot: selectedPosition.slot,
        role_category: selectedPosition.role
      });
    }
    
    setIsModalOpen(false);
    setSelectedPosition(null);
  };

  const calculateTotalBudget = () => {
    return squadSelections.reduce((total, selection) => {
      const player = players.find(p => p.id === selection.player_id);
      return total + (player?.costPercentage || 0);
    }, 0);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Accesso richiesto</h2>
          <p>Devi effettuare l'accesso per utilizzare il Squad Builder</p>
        </Card>
      </div>
    );
  }

  if (playersLoading || squadLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-800 mb-2">⚽ Squad Builder</h1>
          <p className="text-gray-600">Costruisci la tua formazione ideale</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Budget Wheel */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4">
              <h3 className="text-lg font-semibold mb-4 text-center">Budget Totale</h3>
              <BudgetWheel 
                totalBudget={calculateTotalBudget()}
                selectedCount={squadSelections.length}
              />
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  Giocatori selezionati: {squadSelections.length}/25
                </p>
                <p className="text-sm text-gray-600">
                  Budget utilizzato: {calculateTotalBudget().toFixed(1)}%
                </p>
              </div>
            </Card>
          </div>

          {/* Squad Grid */}
          <div className="lg:col-span-3">
            <Card className="p-6">
              <SquadGrid
                squadSelections={squadSelections}
                players={players}
                onPositionClick={handlePositionClick}
                onRemovePlayer={(selectionId) => deleteSelection(selectionId)}
              />
            </Card>
          </div>
        </div>

        {/* Player Selection Modal */}
        <PlayerSelectionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          players={players.filter(p => selectedPosition ? p.roleCategory === selectedPosition.role : false)}
          selectedRole={selectedPosition?.role}
          onPlayerSelect={handlePlayerSelect}
          existingSelections={squadSelections}
        />
      </div>
    </div>
  );
};

export default SquadBuilder;
