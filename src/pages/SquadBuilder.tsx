
import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Zap, Target, Users, Trophy, Trash2 } from "lucide-react";
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
  const { squadSelections, addSelection, updateSelection, deleteSelection, clearAllSelections, isLoading: squadLoading } = useSquadSelections();
  
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

  const handleResetTeam = () => {
    clearAllSelections();
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
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
        <div className="floating-orb"></div>
        <div className="floating-orb"></div>
        <div className="floating-orb"></div>
        
        <div className="glass-card p-12 text-center max-w-md w-full fade-in-scale">
          <div className="w-20 h-20 mx-auto mb-8 gradient-accent rounded-3xl flex items-center justify-center pulse-glow">
            <span className="text-3xl">🔒</span>
          </div>
          <h2 className="text-3xl font-bold mb-6 text-gradient-secondary">Accesso richiesto</h2>
          <p className="text-muted-foreground text-lg">Devi effettuare l'accesso per utilizzare Team Prediction</p>
        </div>
      </div>
    );
  }

  if (playersLoading || squadLoading) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        <div className="floating-orb"></div>
        <div className="floating-orb"></div>
        <div className="floating-orb"></div>
        
        <div className="text-center fade-in-scale">
          <div className="w-20 h-20 mx-auto mb-8 glass-card rounded-3xl flex items-center justify-center pulse-glow">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-transparent border-t-white/60"></div>
          </div>
          <p className="text-muted-foreground font-medium text-xl">Caricamento...</p>
        </div>
      </div>
    );
  }

  const { roleBudgets, roleCounts } = calculateRoleBudgets();
  const totalBudget = calculateTotalBudget();

  return (
    <div className="min-h-screen relative overflow-hidden p-4">
      <div className="floating-orb"></div>
      <div className="floating-orb"></div>
      <div className="floating-orb"></div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="glass-card mb-8 p-8 shadow-2xl slide-in-up">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="glass-button border-white/20 hover:border-white/30 font-medium px-6 py-3 slide-in-left"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Torna al Database
            </Button>
            <div className="text-center">
              <h1 className="text-5xl font-bold text-gradient mb-3">
                ⚽ Team Prediction
              </h1>
              <p className="text-muted-foreground font-medium text-lg">Costruisci la tua formazione ideale</p>
            </div>
            <div className="flex items-center space-x-2">
              {squadSelections.length > 0 && (
                <Button
                  variant="outline"
                  onClick={handleResetTeam}
                  className="glass-button border-red-300/20 hover:border-red-300/30 text-red-400 hover:text-red-300"
                  disabled={squadLoading}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Reset Team
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Budget Wheels */}
          <div className="lg:col-span-1 space-y-8 slide-in-left">
            {/* Total Budget Wheel */}
            <div className="glass-card p-8 shadow-xl pulse-glow">
              <h3 className="text-xl font-bold mb-6 text-center text-gradient">Budget Totale</h3>
              <BudgetWheel 
                totalBudget={totalBudget}
                selectedCount={squadSelections.length}
              />
              <div className="mt-6 text-center space-y-3">
                <div className="glass-card p-4">
                  <p className="text-sm font-medium flex items-center justify-between">
                    <span className="text-muted-foreground">Giocatori:</span>
                    <span className="text-gradient font-bold text-lg">{squadSelections.length}/25</span>
                  </p>
                  <p className="text-sm font-medium flex items-center justify-between mt-2">
                    <span className="text-muted-foreground">Budget:</span>
                    <span className="text-gradient-secondary font-bold text-lg">{totalBudget.toFixed(1)}%</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Role Budget Wheels */}
            <RoleBudgetWheels 
              roleBudgets={roleBudgets}
              roleCounts={roleCounts}
            />

            {/* Budget Infographic */}
            <BudgetInfographic totalBudgetPercentage={totalBudget} />
          </div>

          {/* Squad Grid */}
          <div className="lg:col-span-3 slide-in-right">
            <div className="glass-card p-8 shadow-2xl">
              <SquadGrid
                squadSelections={squadSelections}
                players={players}
                onPositionClick={handlePositionClick}
                onRemovePlayer={(selectionId) => deleteSelection(selectionId)}
                calculateBonusTotal={calculateBonusTotal}
              />
            </div>
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
