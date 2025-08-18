
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2, AlertCircle, CheckCircle2, Download } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PlayerRole } from '@/types/Player';
import CSVPlayerModal from '@/components/CSVPlayerModal';
import RealTimeBudgetLayout from '@/components/RealTimeBudgetLayout';
import TeamNameInput from '@/components/TeamNameInput';
import { useRealTimeBuilder } from '@/hooks/useRealTimeBuilder';
import { useCSVFileHandler } from '@/hooks/useCSVFileHandler';
import { usePDFGenerator } from '@/hooks/usePDFGenerator';

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
    handleBudgetChange,
    teamName,
    handleTeamNameChange,
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

  const { generateTeamPDF } = usePDFGenerator();

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

  // Real Time Builder ha accesso a TUTTI i giocatori CSV, esclusi quelli già selezionati
  const getFilteredPlayers = (role: PlayerRole) => {
    console.log('🔍 Real Time Builder - getFilteredPlayers per ruolo:', role);
    console.log('🔍 Totale CSV players disponibili:', csvPlayers.length);
    
    // Ottieni tutti i giocatori già selezionati (indipendentemente dal ruolo)
    const selectedPlayerIds = selections
      .filter(selection => selection.player)
      .map(selection => selection.player!.id);
    
    console.log('🚫 Giocatori già selezionati:', selectedPlayerIds);
    
    const filtered = csvPlayers
      .filter(p => p.role === role)
      .filter(p => !selectedPlayerIds.includes(p.id)) // Escludi giocatori già selezionati
      .filter(p => 
        searchTerm === '' || 
        `${p.name} ${p.surname}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    console.log('🔍 Giocatori filtrati per', role, ':', filtered.length);
    console.log('🔍 (Esclusi', selectedPlayerIds.length, 'giocatori già selezionati)');
    return filtered;
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
          <p className="text-muted-foreground text-lg">Devi effettuare l'accesso per utilizzare Fanta Team</p>
        </div>
      </div>
    );
  }

  const totalCredits = calculateTotalCredits();
  const roleCredits = calculateRoleCredits();

  return (
    <div className="min-h-screen relative overflow-hidden p-2 sm:p-4">
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
                Fanta Team
              </h1>
              <p className="text-muted-foreground font-medium text-sm sm:text-base lg:text-lg">Costruisci la squadra in base ai crediti spesi</p>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2 flex-wrap justify-center">
              {selections.length > 0 && (
                <Button
                  onClick={() => generateTeamPDF(selections, teamName)}
                  className="glass-button bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-2xl font-medium px-3 sm:px-4 py-2 text-xs sm:text-sm"
                >
                  <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Scarica PDF</span>
                  <span className="sm:hidden">PDF</span>
                </Button>
              )}
              {selections.length > 0 && (
                <Button
                  variant="outline"
                  onClick={clearSelections}
                  className="glass-button border-red-300/20 hover:border-red-300/30 text-red-400 hover:text-red-300 px-3 sm:px-4 py-2 text-xs sm:text-sm"
                  disabled={dbLoading}
                >
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Reset Team</span>
                  <span className="sm:hidden">Reset</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Nome squadra e bottone formazione */}
        <div className="mb-4 sm:mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex-1">
            <TeamNameInput
              teamName={teamName}
              onTeamNameChange={handleTeamNameChange}
            />
          </div>
          {csvPlayers.length > 0 && (
            <Button
              onClick={() => navigate('/formation')}
              className="glass-button gradient-secondary text-white shadow-lg hover:shadow-2xl font-medium px-4 sm:px-6 py-3 text-sm sm:text-base"
              disabled={selections.length < 11}
            >
              Schiera la tua squadra {selections.length < 11 && `(${selections.length}/11)`}
            </Button>
          )}
        </div>

        {/* Stato CSV con persistenza */}
        <div className="glass-card mb-4 sm:mb-8 p-4 sm:p-6 shadow-xl">
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
            onBudgetChange={handleBudgetChange}
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
