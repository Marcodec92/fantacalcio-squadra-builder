
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FileSpreadsheet, Users, Sparkles, Zap, Target, Shield, Timer, Upload, RotateCcw } from "lucide-react";
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
import { toast } from "@/components/ui/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { addPlayer, updatePlayer, deletePlayer } = usePlayers();
  const { importSingleCSVPlayer } = useCSVPlayerImport();
  const { data: allPlayers = [] } = usePlayersData();
  
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
          <div className="flex items-center space-x-4 slide-in-left">
            <div className="w-40 h-40 flex items-center justify-center">
              <img 
                src="/lovable-uploads/d669915b-abe9-409e-9866-7642ab7cdd29.png" 
                alt="App Logo" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 slide-in-right">
            <Button
              onClick={() => navigate('/real-time-builder')}
              className="glass-button gradient-primary text-white shadow-lg hover:shadow-2xl font-medium px-6 py-2 text-sm"
              size="sm"
            >
              <Timer className="w-4 h-4 mr-2" />
              Real Time Builder
            </Button>
            <Button
              onClick={() => navigate('/squad-builder')}
              className="glass-button gradient-secondary text-white shadow-lg hover:shadow-2xl font-medium px-6 py-2 text-sm"
              size="sm"
            >
              <Zap className="w-4 h-4 mr-2" />
              Squad Builder
            </Button>
            <Button
              variant="outline"
              onClick={signOut}
              className="glass-button border-white/20 hover:border-white/30 font-medium px-4 py-2 text-sm"
              size="sm"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6 mt-8">
        <div className="glass-card shadow-2xl overflow-hidden fade-in-scale">
          <Tabs value={selectedRole} onValueChange={(value) => setSelectedRole(value as PlayerRole)} className="w-full">
            <div className="glass-card border-b border-white/10 p-8">
              {/* CSV Upload Section */}
              <div className="mb-8">
                <Card className="glass-card p-6 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gradient mb-2">Carica Giocatori</h3>
                      <p className="text-muted-foreground text-sm">
                        {csvPlayers.length > 0 
                          ? `${csvPlayers.length} giocatori caricati dal CSV - Disponibili anche per Real Time Builder`
                          : 'Carica un file CSV per importare i giocatori'
                        }
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {csvLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                          <span className="text-sm">Caricamento...</span>
                        </div>
                      ) : (
                        <>
                          <Button
                            onClick={triggerFileInput}
                            className="glass-button gradient-secondary font-medium"
                            size="sm"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            {csvPlayers.length > 0 ? 'Aggiorna CSV' : 'Carica CSV'}
                          </Button>
                          {csvPlayers.length > 0 && (
                            <Button
                              onClick={resetDatabase}
                              className="glass-button bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-2xl font-medium"
                              size="sm"
                              disabled={csvLoading}
                            >
                              <RotateCcw className="w-4 h-4 mr-2" />
                              Reset Database
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

              <TabsList className="grid grid-cols-4 gap-4 max-w-4xl mx-auto h-auto bg-transparent p-0">
                <TabsTrigger 
                  value="Portiere" 
                  className="glass-button data-[state=active]:gradient-primary data-[state=active]:text-white data-[state=active]:shadow-lg p-6 rounded-2xl font-medium transition-all duration-300 hover:scale-105 h-auto"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <Shield className="w-6 h-6" />
                    <span>Portieri</span>
                    <span className="text-xs opacity-75">({getPlayerCountByRole('Portiere')} giocatori)</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="Difensore"
                  className="glass-button data-[state=active]:gradient-secondary data-[state=active]:text-white data-[state=active]:shadow-lg p-6 rounded-2xl font-medium transition-all duration-300 hover:scale-105 h-auto"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <Shield className="w-6 h-6" />
                    <span>Difensori</span>
                    <span className="text-xs opacity-75">({getPlayerCountByRole('Difensore')} giocatori)</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="Centrocampista"
                  className="glass-button data-[state=active]:gradient-accent data-[state=active]:text-white data-[state=active]:shadow-lg p-6 rounded-2xl font-medium transition-all duration-300 hover:scale-105 h-auto"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <Sparkles className="w-6 h-6" />
                    <span>Centrocampisti</span>
                    <span className="text-xs opacity-75">({getPlayerCountByRole('Centrocampista')} giocatori)</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="Attaccante"
                  className="glass-button data-[state=active]:gradient-primary data-[state=active]:text-white data-[state=active]:shadow-lg p-6 rounded-2xl font-medium transition-all duration-300 hover:scale-105 h-auto"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <Target className="w-6 h-6" />
                    <span>Attaccanti</span>
                    <span className="text-xs opacity-75">({getPlayerCountByRole('Attaccante')} giocatori)</span>
                  </div>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-8">
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
