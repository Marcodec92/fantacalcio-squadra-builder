
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileSpreadsheet, Users, Sparkles, Zap, Target, Shield } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePlayers } from '@/hooks/usePlayers';
import { usePlayersData } from '@/hooks/usePlayersData';
import PlayersList from '@/components/PlayersList';
import { Player, PlayerRole } from '@/types/Player';

const Index = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { addPlayer, updatePlayer, deletePlayer } = usePlayers();
  const { data: allPlayers = [] } = usePlayersData();
  
  const [selectedRole, setSelectedRole] = useState<PlayerRole>('Portiere');

  // Conteggio giocatori per ruolo
  const getPlayerCountByRole = (role: PlayerRole) => {
    return allPlayers.filter(player => player.roleCategory === role).length;
  };

  const handleAddPlayer = (role: PlayerRole) => {
    console.log('handleAddPlayer called with role:', role);
    addPlayer(role);
  };

  const handleUpdatePlayer = (player: Player) => {
    console.log('handleUpdatePlayer called with player:', player);
    updatePlayer(player);
  };

  const handleDeletePlayer = (playerId: string) => {
    deletePlayer(playerId);
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
            <p className="text-sm text-muted-foreground">
              Utilizza l'autenticazione per iniziare
            </p>
          </div>
        </div>
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
        <div className="max-w-7xl mx-auto px-6 py-1 flex items-center justify-between min-h-[40px]">
          <div className="flex items-center space-x-6 slide-in-left">
            <div className="w-60 h-60 flex items-center justify-center">
              <img 
                src="/lovable-uploads/d669915b-abe9-409e-9866-7642ab7cdd29.png" 
                alt="App Logo" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 slide-in-right">
            <Button
              onClick={() => navigate('/squad-builder')}
              className="glass-button gradient-secondary text-white shadow-lg hover:shadow-2xl font-medium px-8 py-3 text-base"
              size="lg"
            >
              <Zap className="w-5 h-5 mr-2" />
              Squad Builder
            </Button>
            <Button
              variant="outline"
              onClick={signOut}
              className="glass-button border-white/20 hover:border-white/30 font-medium px-6 py-3"
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
    </div>
  );
};

export default Index;
