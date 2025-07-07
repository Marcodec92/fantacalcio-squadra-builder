
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
      role: role === 'portiere' ? 'portiere' : 
            role === 'difensore' ? 'difensore centrale' :
            role === 'centrocampista' ? 'mediano' : 'attaccante centrale',
      roleCategory: role,
      costPercentage: 0,
      goals: 0,
      assists: 0,
      malus: 0,
      xG: 0,
      xA: 0,
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
          <Tabs defaultValue="portiere" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="portiere" className="text-sm font-medium">
                🥅 Portieri ({getPlayersByRole('portiere').length})
              </TabsTrigger>
              <TabsTrigger value="difensore" className="text-sm font-medium">
                🛡️ Difensori ({getPlayersByRole('difensore').length})
              </TabsTrigger>
              <TabsTrigger value="centrocampista" className="text-sm font-medium">
                ⚡ Centrocampisti ({getPlayersByRole('centrocampista').length})
              </TabsTrigger>
              <TabsTrigger value="attaccante" className="text-sm font-medium">
                🎯 Attaccanti ({getPlayersByRole('attaccante').length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="portiere">
              <PlayersList
                players={getPlayersByRole('portiere')}
                roleCategory="portiere"
                onAddPlayer={() => addPlayer('portiere')}
                onUpdatePlayer={updatePlayer}
                onDeletePlayer={deletePlayer}
              />
            </TabsContent>

            <TabsContent value="difensore">
              <PlayersList
                players={getPlayersByRole('difensore')}
                roleCategory="difensore"
                onAddPlayer={() => addPlayer('difensore')}
                onUpdatePlayer={updatePlayer}
                onDeletePlayer={deletePlayer}
              />
            </TabsContent>

            <TabsContent value="centrocampista">
              <PlayersList
                players={getPlayersByRole('centrocampista')}
                roleCategory="centrocampista"
                onAddPlayer={() => addPlayer('centrocampista')}
                onUpdatePlayer={updatePlayer}
                onDeletePlayer={deletePlayer}
              />
            </TabsContent>

            <TabsContent value="attaccante">
              <PlayersList
                players={getPlayersByRole('attaccante')}
                roleCategory="attaccante"
                onAddPlayer={() => addPlayer('attaccante')}
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
