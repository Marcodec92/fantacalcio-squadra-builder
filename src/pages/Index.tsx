import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import PlayersList from '@/components/PlayersList';
import { Player, PlayerRole } from '@/types/Player';

const Index = () => {
  const [players, setPlayers] = useState<Player[]>([]);

  const addPlayer = (role: PlayerRole) => {
    const newPlayer: Player = {
      id: Date.now().toString(),
      name: '',
      surname: '',
      team: '',
      role: role === 'Portiere' ? 'Portiere' : 
            role === 'Difensore' ? 'Difensore centrale' :
            role === 'Centrocampista' ? 'Mediano' : 'Attaccante centrale',
      roleCategory: role,
      costPercentage: 0,
      goals: 0,
      assists: 0,
      malus: 0,
      goalsConceded: 0,
      yellowCards: 0,
      penaltiesSaved: 0,
      xG: 0,
      xA: 0,
      xP: 0, // Nuovo campo inizializzato
      ownership: 0,
      plusCategories: []
    };
    setPlayers([...players, newPlayer]);
  };

  const updatePlayer = (updatedPlayer: Player) => {
    setPlayers(players.map(p => p.id === updatedPlayer.id ? updatedPlayer : p));
  };

  const deletePlayer = (playerId: string) => {
    setPlayers(players.filter(p => p.id !== playerId));
  };

  const getPlayersByRole = (role: PlayerRole) => {
    return players.filter(p => p.roleCategory === role);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-800 mb-2">⚽ FantaCalcio Manager</h1>
          <p className="text-gray-600">Gestisci la tua squadra del fantacalcio</p>
        </div>

        <Card className="p-6 shadow-lg">
          <Tabs defaultValue="Portiere" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="Portiere" className="text-sm font-medium">
                🥅 Portieri ({getPlayersByRole('Portiere').length})
              </TabsTrigger>
              <TabsTrigger value="Difensore" className="text-sm font-medium">
                🛡️ Difensori ({getPlayersByRole('Difensore').length})
              </TabsTrigger>
              <TabsTrigger value="Centrocampista" className="text-sm font-medium">
                ⚡ Centrocampisti ({getPlayersByRole('Centrocampista').length})
              </TabsTrigger>
              <TabsTrigger value="Attaccante" className="text-sm font-medium">
                🎯 Attaccanti ({getPlayersByRole('Attaccante').length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="Portiere">
              <PlayersList
                players={getPlayersByRole('Portiere')}
                roleCategory="Portiere"
                onAddPlayer={() => addPlayer('Portiere')}
                onUpdatePlayer={updatePlayer}
                onDeletePlayer={deletePlayer}
              />
            </TabsContent>

            <TabsContent value="Difensore">
              <PlayersList
                players={getPlayersByRole('Difensore')}
                roleCategory="Difensore"
                onAddPlayer={() => addPlayer('Difensore')}
                onUpdatePlayer={updatePlayer}
                onDeletePlayer={deletePlayer}
              />
            </TabsContent>

            <TabsContent value="Centrocampista">
              <PlayersList
                players={getPlayersByRole('Centrocampista')}
                roleCategory="Centrocampista"
                onAddPlayer={() => addPlayer('Centrocampista')}
                onUpdatePlayer={updatePlayer}
                onDeletePlayer={deletePlayer}
              />
            </TabsContent>

            <TabsContent value="Attaccante">
              <PlayersList
                players={getPlayersByRole('Attaccante')}
                roleCategory="Attaccante"
                onAddPlayer={() => addPlayer('Attaccante')}
                onUpdatePlayer={updatePlayer}
                onDeletePlayer={deletePlayer}
              />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Index;
