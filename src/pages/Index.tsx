
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileSpreadsheet, Users } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePlayers } from '@/hooks/usePlayers';
import PlayersList from '@/components/PlayersList';
import PlayerFormModal from '@/components/PlayerFormModal';
import { Player, PlayerRole } from '@/types/Player';

const Index = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { addPlayer, updatePlayer, deletePlayer } = usePlayers();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [selectedRole, setSelectedRole] = useState<PlayerRole>('Portiere');

  const handleAddPlayer = () => {
    setEditingPlayer(null);
    setIsModalOpen(true);
  };

  const handleEditPlayer = (player: Player) => {
    setEditingPlayer(player);
    setIsModalOpen(true);
  };

  const handleSavePlayer = (playerData: Omit<Player, 'id' | 'userId'>) => {
    if (editingPlayer) {
      updatePlayer({ ...editingPlayer, ...playerData });
    } else {
      addPlayer(playerData);
    }
    setIsModalOpen(false);
  };

  const handleDeletePlayer = (playerId: string) => {
    deletePlayer(playerId);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center p-4">
        <Card className="p-8 text-center shadow-xl bg-white/80 backdrop-blur-sm border-0 rounded-3xl max-w-md w-full">
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            ⚽ FantaCalcio Database
          </h1>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Accedi per gestire i tuoi giocatori e costruire la tua formazione perfetta
          </p>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4">
            <p className="text-sm text-gray-700">
              Utilizza l'autenticazione per iniziare
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
      {/* Header */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  ⚽ FantaCalcio Database
                </h1>
                <p className="text-gray-600 text-sm">Gestisci i tuoi giocatori</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate('/squad-builder')}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl font-medium"
              >
                🏗️ Squad Builder
              </Button>
              <Button
                variant="outline"
                onClick={signOut}
                className="bg-white/80 hover:bg-white border-gray-200 rounded-2xl shadow-sm font-medium"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Card className="shadow-xl bg-white/70 backdrop-blur-sm border-0 rounded-3xl overflow-hidden">
          <Tabs value={selectedRole} onValueChange={(value) => setSelectedRole(value as PlayerRole)} className="w-full">
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-6 border-b border-white/20">
              <TabsList className="grid w-full grid-cols-4 bg-white/60 backdrop-blur-sm rounded-2xl p-1 shadow-sm">
                <TabsTrigger 
                  value="Portiere" 
                  className="rounded-xl font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
                >
                  🥅 Portieri
                </TabsTrigger>
                <TabsTrigger 
                  value="Difensore"
                  className="rounded-xl font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
                >
                  🛡️ Difensori
                </TabsTrigger>
                <TabsTrigger 
                  value="Centrocampista"
                  className="rounded-xl font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
                >
                  ⚡ Centrocampisti
                </TabsTrigger>
                <TabsTrigger 
                  value="Attaccante"
                  className="rounded-xl font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
                >
                  🎯 Attaccanti
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              {(['Portiere', 'Difensore', 'Centrocampista', 'Attaccante'] as PlayerRole[]).map((role) => (
                <TabsContent key={role} value={role} className="mt-0">
                  <PlayersList
                    roleCategory={role}
                    onAddPlayer={() => {
                      setSelectedRole(role);
                      handleAddPlayer();
                    }}
                    onUpdatePlayer={handleEditPlayer}
                    onDeletePlayer={handleDeletePlayer}
                  />
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </Card>
      </div>

      <PlayerFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePlayer}
        player={editingPlayer}
        defaultRole={selectedRole}
      />
    </div>
  );
};

export default Index;
