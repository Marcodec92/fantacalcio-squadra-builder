
import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Zap, Target, Users, Trophy, Trash2, Download } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePlayers } from '@/hooks/usePlayers';
import { useSquadSelections } from '@/hooks/useSquadSelections';
import { usePDFGenerator } from '@/hooks/usePDFGenerator';
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
  const { generateTeamPDF } = usePDFGenerator();
  
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

  const convertToRealTimeSelections = () => {
    return squadSelections.map(selection => {
      const player = players.find(p => p.id === selection.player_id);
      return {
        id: selection.id,
        position_slot: selection.position_slot,
        role_category: selection.role_category,
        player: player ? {
          id: player.id,
          name: player.name,
          surname: player.surname,
          team: player.team,
          role: player.roleCategory,
          credits: Math.round(player.costPercentage)
        } : undefined
      };
    });
  };

  const handleDownloadPDF = () => {
    const realTimeSelections = convertToRealTimeSelections();
    generateTeamPDF(realTimeSelections, "Team Prediction");
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
        <div className="glass-card mb-4 sm:mb-8 p-4 sm:p-8 shadow-2xl slide-in-up">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="glass-button border-white/20 hover:border-white/30 font-medium px-4 sm:px-6 py-2 sm:py-3 slide-in-left text-xs sm:text-sm"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
              Torna al Database
            </Button>
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-gradient mb-2 sm:mb-3">
                Team Prediction
              </h1>
              <p className="text-muted-foreground font-medium text-sm sm:text-base lg:text-lg">Costruisci la tua formazione ideale</p>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2 flex-wrap justify-center">
              {squadSelections.length > 0 && (
                <Button
                  onClick={handleDownloadPDF}
                  className="glass-button bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-2xl font-medium px-3 sm:px-4 py-2 text-xs sm:text-sm"
                >
                  <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Scarica PDF</span>
                  <span className="sm:hidden">PDF</span>
                </Button>
              )}
              {squadSelections.length > 0 && (
                <Button
                  variant="outline"
                  onClick={handleResetTeam}
                  className="glass-button border-red-300/20 hover:border-red-300/30 text-red-400 hover:text-red-300 px-3 sm:px-4 py-2 text-xs sm:text-sm"
                  disabled={squadLoading}
                >
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Reset Team</span>
                  <span className="sm:hidden">Reset</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Budget Wheels */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-8 slide-in-left">
            {/* Budget sections side-by-side on mobile, vertical on desktop */}
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-4 lg:gap-8 items-stretch">
              {/* Total Budget Wheel */}
              <div className="glass-card p-2 sm:p-4 lg:p-8 shadow-xl pulse-glow flex flex-col h-full">
                <h3 className="text-sm sm:text-lg lg:text-xl font-bold mb-2 sm:mb-4 lg:mb-6 text-center text-gradient">Budget Totale</h3>
                <div className="flex-1 flex flex-col justify-center">
                  <BudgetWheel 
                    totalBudget={totalBudget}
                    selectedCount={squadSelections.length}
                  />
                </div>
                <div className="mt-2 sm:mt-4 lg:mt-6 text-center space-y-1 sm:space-y-2 lg:space-y-3">
                  <div className="glass-card p-2 sm:p-3 lg:p-4">
                    <p className="text-xs sm:text-sm font-medium flex items-center justify-between">
                      <span className="text-muted-foreground">
                        <span className="hidden sm:inline">Giocatori:</span>
                        <span className="sm:hidden">Giocat.:</span>
                      </span>
                      <span className="text-gradient font-bold text-sm sm:text-base lg:text-lg">{squadSelections.length}/25</span>
                    </p>
                    <p className="text-xs sm:text-sm font-medium flex items-center justify-between mt-1 sm:mt-2">
                      <span className="text-muted-foreground">Budget:</span>
                      <span className="text-gradient-secondary font-bold text-sm sm:text-base lg:text-lg">{totalBudget.toFixed(1)}%</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Budget Infographic (Costo Squadra) */}
              <div>
                <BudgetInfographic totalBudgetPercentage={totalBudget} />
              </div>
            </div>

            {/* Role Budget Wheels */}
            <RoleBudgetWheels 
              roleBudgets={roleBudgets}
              roleCounts={roleCounts}
            />

            {/* Bottone Schiera la tua formazione */}
            {squadSelections.length >= 11 && (
              <div className="mt-4 text-center">
                <Button
                  onClick={() => navigate('/team-prediction-formation')}
                  className="glass-button gradient-secondary text-white shadow-lg hover:shadow-2xl font-medium px-4 py-3 text-sm w-full"
                >
                  Schiera la tua formazione
                </Button>
              </div>
            )}
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
