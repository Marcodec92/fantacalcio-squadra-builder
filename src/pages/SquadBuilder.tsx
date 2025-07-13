
import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePlayers } from '@/hooks/usePlayers';
import { useSquadSelections } from '@/hooks/useSquadSelections';
import SquadGrid from '@/components/SquadGrid';
import PlayerSelectionModal from '@/components/PlayerSelectionModal';
import BudgetWheel from '@/components/BudgetWheel';
import RoleBudgetWheels from '@/components/RoleBudgetWheels';
import BudgetInfographic from '@/components/BudgetInfographic';
import { PlayerRole } from '@/types/Player';

const SquadBuilder = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { players, isLoading: playersLoading, calculateBonusTotal } = usePlayers();
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

  const calculateRoleBudgets = () => {
    const roleBudgets = {
      Portiere: 0,
      Difensore: 0,
      Centrocampista: 0,
      Attaccante: 0
    };

    const roleCounts = {
      Portiere: 0,
      Difensore: 0,
      Centrocampista: 0,
      Attaccante: 0
    };

    squadSelections.forEach(selection => {
      const player = players.find(p => p.id === selection.player_id);
      if (player) {
        roleBudgets[selection.role_category] += player.costPercentage;
        roleCounts[selection.role_category]++;
      }
    });

    return { roleBudgets, roleCounts };
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center p-4">
        <Card className="p-8 text-center shadow-xl bg-white/80 backdrop-blur-sm border-0 rounded-3xl">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center">
            <span className="text-2xl">🔒</span>
          </div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Accesso richiesto</h2>
          <p className="text-gray-600">Devi effettuare l'accesso per utilizzare il Squad Builder</p>
        </Card>
      </div>
    );
  }

  if (playersLoading || squadLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Caricamento...</p>
        </div>
      </div>
    );
  }

  const { roleBudgets, roleCounts } = calculateRoleBudgets();
  const totalBudget = calculateTotalBudget();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 bg-white/80 hover:bg-white border-gray-200 rounded-2xl shadow-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Torna al Database
          </Button>
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              ⚽ Squad Builder
            </h1>
            <p className="text-gray-600 font-medium">Costruisci la tua formazione ideale</p>
          </div>
          <div className="w-32"></div> {/* Spacer for centering */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Budget Wheels */}
          <div className="lg:col-span-1 space-y-6">
            {/* Total Budget Wheel */}
            <Card className="p-6 shadow-xl bg-white/70 backdrop-blur-sm border-0 rounded-3xl">
              <h3 className="text-lg font-bold mb-4 text-center text-gray-800">Budget Totale</h3>
              <BudgetWheel 
                totalBudget={totalBudget}
                selectedCount={squadSelections.length}
              />
              <div className="mt-4 text-center space-y-2">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3">
                  <p className="text-sm text-gray-700 font-medium">
                    Giocatori: <span className="font-bold text-blue-600">{squadSelections.length}/25</span>
                  </p>
                  <p className="text-sm text-gray-700 font-medium">
                    Budget: <span className="font-bold text-purple-600">{totalBudget.toFixed(1)}%</span>
                  </p>
                </div>
              </div>
            </Card>

            {/* Role Budget Wheels */}
            <RoleBudgetWheels 
              roleBudgets={roleBudgets}
              roleCounts={roleCounts}
            />

            {/* Budget Infographic */}
            <BudgetInfographic totalBudgetPercentage={totalBudget} />
          </div>

          {/* Squad Grid */}
          <div className="lg:col-span-3">
            <Card className="p-6 shadow-xl bg-white/70 backdrop-blur-sm border-0 rounded-3xl">
              <SquadGrid
                squadSelections={squadSelections}
                players={players}
                onPositionClick={handlePositionClick}
                onRemovePlayer={(selectionId) => deleteSelection(selectionId)}
                calculateBonusTotal={calculateBonusTotal}
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
          calculateBonusTotal={calculateBonusTotal}
        />
      </div>
    </div>
  );
};

export default SquadBuilder;
