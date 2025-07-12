
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { Link } from "react-router-dom";
import PlayersList from '@/components/PlayersList';
import AuthForm from '@/components/AuthForm';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { usePlayers } from '@/hooks/usePlayers';

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { 
    addPlayer, 
    updatePlayer, 
    deletePlayer, 
    getPlayersByRole,
    isLoading: playersLoading 
  } = usePlayers();

  // Show loading spinner while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // Show auth form if user is not logged in
  if (!user) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Header />
      
      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-green-800 mb-2">⚽ FantaCalcio Manager</h1>
            <p className="text-gray-600">Gestisci la tua squadra del fantacalcio</p>
            
            {/* Squad Builder Button */}
            <div className="mt-4">
              <Link to="/squad-builder">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <Users className="w-5 h-5 mr-2" />
                  Squad Builder
                </Button>
              </Link>
            </div>
          </div>

          <Card className="p-6 shadow-lg">
            {playersLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                <span className="ml-2 text-gray-600">Caricamento giocatori...</span>
              </div>
            ) : (
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
                    roleCategory="Portiere"
                    onAddPlayer={() => addPlayer('Portiere')}
                    onUpdatePlayer={updatePlayer}
                    onDeletePlayer={deletePlayer}
                  />
                </TabsContent>

                <TabsContent value="Difensore">
                  <PlayersList
                    roleCategory="Difensore"
                    onAddPlayer={() => addPlayer('Difensore')}
                    onUpdatePlayer={updatePlayer}
                    onDeletePlayer={deletePlayer}
                  />
                </TabsContent>

                <TabsContent value="Centrocampista">
                  <PlayersList
                    roleCategory="Centrocampista"
                    onAddPlayer={() => addPlayer('Centrocampista')}
                    onUpdatePlayer={updatePlayer}
                    onDeletePlayer={deletePlayer}
                  />
                </TabsContent>

                <TabsContent value="Attaccante">
                  <PlayersList
                    roleCategory="Attaccante"
                    onAddPlayer={() => addPlayer('Attaccante')}
                    onUpdatePlayer={updatePlayer}
                    onDeletePlayer={deletePlayer}
                  />
                </TabsContent>
              </Tabs>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
