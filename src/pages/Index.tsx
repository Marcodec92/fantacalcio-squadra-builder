
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FileSpreadsheet, Users, Sparkles, Zap, Target, Shield, Timer, Upload } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePlayers } from '@/hooks/usePlayers';
import { usePlayersData } from '@/hooks/usePlayersData';
import PlayersList from '@/components/PlayersList';
import AuthModal from '@/components/AuthModal';
import CSVPlayerSelectionModal from '@/components/CSVPlayerSelectionModal';
import { Player, PlayerRole } from '@/types/Player';
import { useCSVFileHandler } from '@/hooks/useCSVFileHandler';

const Index = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { addPlayer, updatePlayer, deletePlayer } = usePlayers();
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
    triggerFileInput
  } = useCSVFileHandler(() => {});

  // Conteggio giocatori per ruolo
  const getPlayerCountByRole = (role: PlayerRole) => {
    return allPlayers.filter(player => player.roleCategory === role).length;
  };

  const handleAddPlayer = (role: PlayerRole) => {
    console.log('handleAddPlayer called with role:', role);
    if (csvPlayers.length > 0) {
      setSelectedRoleForCSV(role);
      setShowCSVModal(true);
    } else {
      addPlayer(role);
    }
  };

  const handleCSVPlayerSelect = (csvPlayer: any) => {
    // Crea un nuovo giocatore con i dati dal CSV (solo nome, cognome, ruolo e squadra)
    const newPlayer: Partial<Player> = {
      name: csvPlayer.name,
      surname: csvPlayer.surname,
      roleCategory: csvPlayer.role,
      role: csvPlayer.role,
      team: csvPlayer.team,
      // I restanti campi rimangono con i valori di default
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
    
    addPlayer(selectedRoleForCSV!, newPlayer);
    setShowCSVModal(false);
    setSelectedRoleForCSV(null);
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
                          ? `${csvPlayers.length} giocatori caricati dal CSV`
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
                        <Button
                          onClick={triggerFileInput}
                          className="glass-button gradient-secondary font-medium"
                          size="sm"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {csvPlayers.length > 0 ? 'Aggiorna CSV' : 'Carica CSV'}
                        </Button>
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
                      console.log('PlayersList onAddPlayer triggered for role:', role);
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
          setShowCSVModal(false);
          setSelectedRoleForCSV(null);
        }}
        players={csvPlayers.filter(p => selectedRoleForCSV ? p.role === selectedRoleForCSV : false)}
        selectedRole={selectedRoleForCSV}
        onPlayerSelect={handleCSVPlayerSelect}
      />
    </div>
  );
};

export default Index;
