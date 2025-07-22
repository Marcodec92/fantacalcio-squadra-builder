
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FileSpreadsheet, Users, Sparkles, Zap, Target, Shield, Timer, Upload, RotateCcw, Download } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePlayers } from '@/hooks/usePlayers';
import { usePlayersData } from '@/hooks/usePlayersData';
import { useCSVPlayerImport } from '@/hooks/useCSVPlayerImport';
import PlayersList from '@/components/PlayersList';
import AuthModal from '@/components/AuthModal';
import CSVPlayerSelectionModal from '@/components/CSVPlayerSelectionModal';
import { Player, PlayerRole } from '@/types/Player';
import { useCSVFileHandler } from '@/hooks/useCSVFileHandler';
import { usePDFGenerator } from '@/hooks/usePDFGenerator';
import { toast } from "@/components/ui/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { addPlayer, updatePlayer, deletePlayer } = usePlayers();
  const { importSingleCSVPlayer } = useCSVPlayerImport();
  const { data: allPlayers = [] } = usePlayersData();
  const { generateDatabasePDF } = usePDFGenerator();
  
  const [selectedRole, setSelectedRole] = useState<PlayerRole>('Portiere');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [selectedRoleForCSV, setSelectedRoleForCSV] = useState<PlayerRole | null>(null);

  const {
    csvPlayers,
    loading: csvLoading,
    fileInputRef,
    handleFileUpload,
    handleDrop,
    handleDrag,
    triggerFileInput,
    resetDatabase,
    removeCSVPlayer
  } = useCSVFileHandler(() => {});

  // Conteggio giocatori per ruolo
  const getPlayerCountByRole = (role: PlayerRole) => {
    return allPlayers.filter(player => player.roleCategory === role).length;
  };

  const handleAddPlayer = (role: PlayerRole) => {
    console.log('🎯 handleAddPlayer chiamato con ruolo:', role);
    if (csvPlayers.length > 0) {
      console.log('📋 CSV players disponibili:', csvPlayers.length, 'per ruolo:', role);
      setSelectedRoleForCSV(role);
      setShowCSVModal(true);
    } else {
      console.log('➕ Nessun CSV player disponibile, usando addPlayer standard');
      addPlayer(role);
    }
  };

  const handleCSVPlayerSelect = async (csvPlayer: any) => {
    console.log('🎯🎯🎯 HANDLE CSV PLAYER SELECT - INIZIO');
    console.log('📋 Giocatore CSV selezionato:', csvPlayer);
    console.log('🔒 VERIFICA CRITICA: Selezionato SOLO questo giocatore');
    
    try {
      // Verifica che il giocatore non sia già presente
      const alreadyExists = allPlayers.some(dbPlayer => 
        dbPlayer.name.toLowerCase() === csvPlayer.name.toLowerCase() &&
        dbPlayer.surname.toLowerCase() === csvPlayer.surname.toLowerCase() &&
        dbPlayer.team === csvPlayer.team &&
        dbPlayer.roleCategory === csvPlayer.role
      );

      if (alreadyExists) {
        console.log('⚠️ Giocatore già presente nel database');
        toast({
          title: "Errore",
          description: "Questo giocatore è già presente nella tua lista",
          variant: "destructive",
        });
        setShowCSVModal(false);
        setSelectedRoleForCSV(null);
        return;
      }

      console.log('🔧 Creazione oggetto SINGOLO giocatore per importazione...');
      
      // Crea SOLO il giocatore selezionato - SINGOLO, NON ARRAY
      const singlePlayerToAdd: Partial<Player> = {
        name: csvPlayer.name || '',
        surname: csvPlayer.surname || '',
        roleCategory: csvPlayer.role,
        role: csvPlayer.role,
        team: csvPlayer.team,
        fmv: 0,
        costPercentage: 0,
        goals: 0,
        assists: 0,
        malus: 0,
        goalsConceded: 0,
        yellowCards: 0,
        penaltiesSaved: 0,
        xG: 0,
        xA: 0,
        xP: 0,
        ownership: 0,
        plusCategories: [],
        tier: '',
        isFavorite: false
      };
      
      console.log('🚀 CHIAMATA importSingleCSVPlayer con SINGOLO giocatore:');
      console.log('👤 Nome:', singlePlayerToAdd.name);
      console.log('👤 Cognome:', singlePlayerToAdd.surname);
      console.log('⚽ Ruolo:', singlePlayerToAdd.roleCategory);
      console.log('🏟️ Team:', singlePlayerToAdd.team);
      
      // USA ESCLUSIVAMENTE IL HOOK importSingleCSVPlayer
      const result = await importSingleCSVPlayer(singlePlayerToAdd);
      
      if (result) {
        console.log('✅✅✅ SUCCESSO! Giocatore importato tramite hook dedicato');
        console.log('🆔 ID risultato:', result.id);
        
        // NON rimuovere più il giocatore dalla lista CSV
        // Il giocatore rimane disponibile per il Real Time Builder
        console.log('🔄 Giocatore rimane disponibile per Real Time Builder');
        
        setShowCSVModal(false);
        setSelectedRoleForCSV(null);
      } else {
        console.log('❌ Errore nell\'importazione del giocatore');
      }
      
    } catch (error) {
      console.error('❌ ERRORE nell\'importazione del singolo giocatore:', error);
      toast({
        title: "Errore",
        description: "Errore nell'importazione del giocatore",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePlayer = (player: Player) => {
    console.log('handleUpdatePlayer called with player:', player);
    updatePlayer(player);
  };

  const handleDeletePlayer = (playerId: string) => {
    deletePlayer(playerId);
  };

  const handleAuthButtonClick = () => {
    setShowAuthModal(true);
  };

  if (!user) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
        {/* Floating orbs */}
        <div className="floating-orb"></div>
        <div className="floating-orb"></div>
        <div className="floating-orb"></div>
        
        <div className="glass-card p-12 text-center max-w-md w-full fade-in-scale">
          <div className="w-32 h-32 mx-auto mb-8 flex items-center justify-center">
            <img 
              src="/lovable-uploads/d669915b-abe9-409e-9866-7642ab7cdd29.png" 
              alt="App Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
            Accedi per gestire i tuoi giocatori e costruire la tua formazione perfetta
          </p>
          <div className="glass-card p-6">
            <Button 
              onClick={handleAuthButtonClick}
              className="w-full glass-button gradient-primary text-white shadow-lg hover:shadow-2xl font-medium px-6 py-3"
            >
              Utilizza l'autenticazione per iniziare
            </Button>
          </div>
        </div>

        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
      </div>
    );
  }

  // Funzione per filtrare i CSV players escludendo SOLO i duplicati esatti per il DATABASE
  const getAvailableCSVPlayersForDatabase = (role: PlayerRole) => {
    console.log('🔍 getAvailableCSVPlayersForDatabase - Filtrando per ruolo:', role);
    console.log('🔍 csvPlayers disponibili:', csvPlayers.length);
    console.log('🔍 allPlayers nel database:', allPlayers.length);
    
    const filtered = csvPlayers.filter(csvPlayer => {
      // Filtra per ruolo
      if (csvPlayer.role !== role) return false;
      
      // Escludi SOLO i giocatori già presenti nel database (per evitare duplicati)
      const alreadyExists = allPlayers.some(dbPlayer => 
        dbPlayer.name.toLowerCase() === csvPlayer.name.toLowerCase() &&
        dbPlayer.surname.toLowerCase() === csvPlayer.surname.toLowerCase() &&
        dbPlayer.team === csvPlayer.team &&
        dbPlayer.roleCategory === csvPlayer.role
      );
      
      console.log(`🔍 Giocatore ${csvPlayer.surname} - già presente: ${alreadyExists}`);
      return !alreadyExists;
    });
    
    console.log('🔍 Giocatori disponibili dopo filtro:', filtered.length);
    return filtered;
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Floating orbs */}
      <div className="floating-orb"></div>
      <div className="floating-orb"></div>
      <div className="floating-orb"></div>

      {/* Header */}
      <div className="glass-card border-b border-white/10 backdrop-blur-2xl sticky top-0 z-50 slide-in-up">
        <div className="max-w-7xl mx-auto px-6 py-0.5 flex items-center justify-between min-h-[32px]">
          <div className="flex items-center space-x-2 sm:space-x-4 slide-in-left">
            <div className="w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 flex items-center justify-center">
              <img 
                src="/lovable-uploads/d669915b-abe9-409e-9866-7642ab7cdd29.png" 
                alt="App Logo" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 md:gap-3 slide-in-right flex-wrap">
            <Button
              onClick={() => navigate('/fanta-team')}
              className="glass-button gradient-primary text-white shadow-lg hover:shadow-2xl font-medium px-2 sm:px-4 md:px-6 py-1.5 sm:py-2 text-xs sm:text-sm"
              size="sm"
            >
              <span className="hidden sm:inline">Fanta Team</span>
              <span className="sm:hidden">Team</span>
            </Button>
            <Button
              onClick={() => navigate('/team-prediction')}
              className="glass-button gradient-secondary text-white shadow-lg hover:shadow-2xl font-medium px-2 sm:px-4 md:px-6 py-1.5 sm:py-2 text-xs sm:text-sm"
              size="sm"
            >
              <span className="hidden sm:inline">Team Prediction</span>
              <span className="sm:hidden">Pred</span>
            </Button>
            <Button
              variant="outline"
              onClick={signOut}
              className="glass-button border-white/20 hover:border-white/30 font-medium px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm"
              size="sm"
            >
              <span className="hidden sm:inline">Logout</span>
              <span className="sm:hidden">Exit</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-3 sm:p-6 mt-4 sm:mt-8">
        <div className="glass-card shadow-2xl overflow-hidden fade-in-scale">
          <Tabs value={selectedRole} onValueChange={(value) => setSelectedRole(value as PlayerRole)} className="w-full">
            <div className="glass-card border-b border-white/10 p-4 sm:p-8">
              {/* CSV Upload Section */}
              <div className="mb-4 sm:mb-8">
                <Card className="glass-card p-4 sm:p-6 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl font-bold text-gradient mb-2">Carica Giocatori</h3>
                      <p className="text-muted-foreground text-xs sm:text-sm">
                        {csvPlayers.length > 0 
                          ? `${csvPlayers.length} giocatori caricati dal CSV`
                          : 'Carica un file CSV per importare i giocatori'
                        }
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      {csvLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                          <span className="text-xs sm:text-sm">Caricamento...</span>
                        </div>
                      ) : (
                        <>
                          <Button
                            onClick={triggerFileInput}
                            className="glass-button gradient-secondary font-medium flex-1 sm:flex-none h-10 sm:h-auto px-3 sm:px-4 text-xs sm:text-sm"
                            size="sm"
                          >
                            <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                            <span className="hidden sm:inline">{csvPlayers.length > 0 ? 'Aggiorna CSV' : 'Carica CSV'}</span>
                            <span className="sm:hidden">{csvPlayers.length > 0 ? 'Aggiorna' : 'CSV'}</span>
                          </Button>
                          {csvPlayers.length > 0 && (
                            <Button
                              onClick={resetDatabase}
                              className="glass-button bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-2xl font-medium flex-1 sm:flex-none h-10 sm:h-auto px-3 sm:px-4 text-xs sm:text-sm"
                              size="sm"
                              disabled={csvLoading}
                            >
                              <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                              <span className="hidden sm:inline">Reset Database</span>
                              <span className="sm:hidden">Reset</span>
                            </Button>
                          )}
                          {allPlayers.length > 0 && (
                            <Button
                              onClick={() => generateDatabasePDF(allPlayers)}
                              className="glass-button bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-2xl font-medium flex-1 sm:flex-none h-10 sm:h-auto px-3 sm:px-4 text-xs sm:text-sm"
                              size="sm"
                            >
                              <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                              <span className="hidden sm:inline">Scarica PDF</span>
                              <span className="sm:hidden">PDF</span>
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </Card>
              </div>

              <TabsList className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 max-w-4xl mx-auto h-auto bg-transparent p-0">
                <TabsTrigger 
                  value="Portiere" 
                  className="glass-button data-[state=active]:gradient-primary data-[state=active]:text-white data-[state=active]:shadow-lg p-3 sm:p-6 rounded-xl sm:rounded-2xl font-medium transition-all duration-300 hover:scale-105 h-auto"
                >
                  <div className="flex flex-col items-center space-y-1 sm:space-y-2">
                    <Shield className="w-4 h-4 sm:w-6 sm:h-6" />
                    <span className="text-xs sm:text-sm">Portieri</span>
                    <span className="text-[10px] sm:text-xs opacity-75">({getPlayerCountByRole('Portiere')})</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="Difensore"
                  className="glass-button data-[state=active]:gradient-secondary data-[state=active]:text-white data-[state=active]:shadow-lg p-3 sm:p-6 rounded-xl sm:rounded-2xl font-medium transition-all duration-300 hover:scale-105 h-auto"
                >
                  <div className="flex flex-col items-center space-y-1 sm:space-y-2">
                    <Shield className="w-4 h-4 sm:w-6 sm:h-6" />
                    <span className="text-xs sm:text-sm">Difensori</span>
                    <span className="text-[10px] sm:text-xs opacity-75">({getPlayerCountByRole('Difensore')})</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="Centrocampista"
                  className="glass-button data-[state=active]:gradient-accent data-[state=active]:text-white data-[state=active]:shadow-lg p-3 sm:p-6 rounded-xl sm:rounded-2xl font-medium transition-all duration-300 hover:scale-105 h-auto"
                >
                  <div className="flex flex-col items-center space-y-1 sm:space-y-2">
                    <Sparkles className="w-4 h-4 sm:w-6 sm:h-6" />
                    <span className="text-xs sm:text-sm">Centrocampisti</span>
                    <span className="text-[10px] sm:text-xs opacity-75">({getPlayerCountByRole('Centrocampista')})</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="Attaccante"
                  className="glass-button data-[state=active]:gradient-primary data-[state=active]:text-white data-[state=active]:shadow-lg p-3 sm:p-6 rounded-xl sm:rounded-2xl font-medium transition-all duration-300 hover:scale-105 h-auto"
                >
                  <div className="flex flex-col items-center space-y-1 sm:space-y-2">
                    <Target className="w-4 h-4 sm:w-6 sm:h-6" />
                    <span className="text-xs sm:text-sm">Attaccanti</span>
                    <span className="text-[10px] sm:text-xs opacity-75">({getPlayerCountByRole('Attaccante')})</span>
                  </div>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-4 sm:p-8">
              {(['Portiere', 'Difensore', 'Centrocampista', 'Attaccante'] as PlayerRole[]).map((role) => (
                <TabsContent key={role} value={role} className="mt-0 fade-in-scale">
                  <PlayersList
                    roleCategory={role}
                    onAddPlayer={() => {
                      console.log('🎯 PlayersList.onAddPlayer chiamato per ruolo:', role);
                      handleAddPlayer(role);
                    }}
                    onUpdatePlayer={handleUpdatePlayer}
                    onDeletePlayer={handleDeletePlayer}
                  />
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </div>
      </div>

      {/* CSV Player Selection Modal */}
      <CSVPlayerSelectionModal
        isOpen={showCSVModal}
        onClose={() => {
          console.log('🚪 Chiusura CSV Modal');
          setShowCSVModal(false);
          setSelectedRoleForCSV(null);
        }}
        players={selectedRoleForCSV ? getAvailableCSVPlayersForDatabase(selectedRoleForCSV) : []}
        selectedRole={selectedRoleForCSV}
        onPlayerSelect={handleCSVPlayerSelect}
      />
    </div>
  );
};

export default Index;
