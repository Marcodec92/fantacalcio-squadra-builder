
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
      addPlayer(selectedRole);
    }
    setIsModalOpen(false);
  };

  const handleDeletePlayer = (playerId: string) => {
    deletePlayer(playerId);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="p-8 text-center max-w-md w-full border-0 shadow-sm">
          <div className="w-16 h-16 mx-auto mb-6 bg-blue-600 rounded-xl flex items-center justify-center">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-semibold mb-3 text-gray-900">
            ⚽ FantaCalcio Database
          </h1>
          <p className="text-gray-600 mb-6">
            Accedi per gestire i tuoi giocatori e costruire la tua formazione perfetta
          </p>
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              Utilizza l'autenticazione per iniziare
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  ⚽ FantaCalcio Database
                </h1>
                <p className="text-sm text-gray-500">Gestisci i tuoi giocatori</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => navigate('/squad-builder')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg"
              >
                🏗️ Squad Builder
              </Button>
              <Button
                variant="outline"
                onClick={signOut}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 font-medium px-4 py-2 rounded-lg"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Card className="border-0 shadow-sm">
          <Tabs value={selectedRole} onValueChange={(value) => setSelectedRole(value as PlayerRole)} className="w-full">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <TabsList className="grid w-full grid-cols-4 bg-white border border-gray-200 p-1 rounded-lg">
                <TabsTrigger 
                  value="Portiere" 
                  className="rounded-md font-medium data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
                >
                  🥅 Portieri
                </TabsTrigger>
                <TabsTrigger 
                  value="Difensore"
                  className="rounded-md font-medium data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
                >
                  🛡️ Difensori
                </TabsTrigger>
                <TabsTrigger 
                  value="Centrocampista"
                  className="rounded-md font-medium data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
                >
                  ⚡ Centrocampisti
                </TabsTrigger>
                <TabsTrigger 
                  value="Attaccante"
                  className="rounded-md font-medium data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
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
