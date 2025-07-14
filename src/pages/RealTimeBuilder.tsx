
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PlayerRole } from '@/types/Player';
import CSVPlayerModal from '@/components/CSVPlayerModal';
import RealTimeBudgetLayout from '@/components/RealTimeBudgetLayout';
import { useRealTimeBuilder } from '@/hooks/useRealTimeBuilder';
import { useCSVFileHandler } from '@/hooks/useCSVFileHandler';

export interface RealTimePlayer {
  id: string;
  name: string;
  surname: string;
  team: string;
  role: PlayerRole;
  credits: number;
}

export interface RealTimeSelection {
  id: string;
  position_slot: number;
  role_category: PlayerRole;
  player?: RealTimePlayer;
}

const RealTimeBuilder = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const {
    maxBudget,
    setMaxBudget,
    selections,
    isModalOpen,
    setIsModalOpen,
    selectedPosition,
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
  } = useRealTimeBuilder();

  const {
    loading,
    fileInputRef,
    handleFileUpload,
    handleDrop,
    handleDrag: handleDragEvent,
    triggerFileInput
  } = useCSVFileHandler(clearSelections);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    handleDragEvent(e);
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDropWithActive = async (e: React.DragEvent<HTMLDivElement>) => {
    setDragActive(false);
    await handleDrop(e);
  };

  const getFilteredPlayers = (role: PlayerRole) => {
    return csvPlayers
      .filter(p => p.role === role)
      .filter(p => 
        searchTerm === '' || 
        `${p.name} ${p.surname}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
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
          <p className="text-muted-foreground text-lg">Devi effettuare l'accesso per utilizzare il Real Time Builder</p>
        </div>
      </div>
    );
  }

  const totalCredits = calculateTotalCredits();
  const roleCredits = calculateRoleCredits();

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
                ⚡ Real Time Builder
              </h1>
              <p className="text-muted-foreground font-medium text-lg">Costruisci la squadra in base ai crediti spesi</p>
            </div>
            <div className="flex items-center space-x-2">
              {selections.length > 0 && (
                <Button
                  variant="outline"
                  onClick={clearSelections}
                  className="glass-button border-red-300/20 hover:border-red-300/30 text-red-400 hover:text-red-300"
                  disabled={dbLoading}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Reset Team
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Stato CSV con persistenza */}
        <div className="glass-card mb-8 p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {csvPlayers.length === 0 ? (
                <>
                  <AlertCircle className="w-6 h-6 text-orange-500" />
                  <div>
                    <p className="text-orange-600 font-medium">
                      Nessun file CSV caricato
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Carica un file CSV dalla pagina Database per iniziare
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                  <div>
                    <p className="text-green-600 font-medium">
                      ✅ {csvPlayers.length} giocatori CSV disponibili
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Dati persistenti - disponibili anche dopo la navigazione
                    </p>
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {csvPlayers.length === 0 && (
                <Button
                  onClick={() => navigate('/')}
                  className="glass-button gradient-primary font-medium"
                  size="sm"
                >
                  Vai al Database
                </Button>
              )}
              {selections.length > 0 && (
                <p className="text-blue-600 font-medium text-sm">
                  💾 {selections.length} selezioni salvate
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Budget and Squad Layout - Solo se ci sono giocatori CSV */}
        {csvPlayers.length > 0 && (
          <RealTimeBudgetLayout
            totalCredits={totalCredits}
            maxBudget={maxBudget}
            selectedCount={selections.length}
            roleCredits={roleCredits}
            selections={selections}
            onPositionClick={handlePositionClick}
            onRemovePlayer={handleRemovePlayer}
            onUpdateCredits={handleUpdateCredits}
          />
        )}

        {/* CSV Player Selection Modal */}
        <CSVPlayerModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          players={selectedPosition ? getFilteredPlayers(selectedPosition.role) : []}
          selectedRole={selectedPosition?.role}
          onPlayerSelect={handlePlayerSelect}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      </div>
    </div>
  );
};

export default RealTimeBuilder;
