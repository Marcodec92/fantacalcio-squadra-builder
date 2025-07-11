
import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Check } from "lucide-react";
import { Player, PlayerRole } from '@/types/Player';
import { SquadSelection } from '@/hooks/useSquadSelections';

interface PlayerSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: Player[];
  selectedRole?: PlayerRole;
  onPlayerSelect: (playerId: string) => void;
  existingSelections: SquadSelection[];
}

const PlayerSelectionModal: React.FC<PlayerSelectionModalProps> = ({
  isOpen,
  onClose,
  players,
  selectedRole,
  onPlayerSelect,
  existingSelections
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPlayers = useMemo(() => {
    return players.filter(player => {
      const matchesSearch = `${player.name} ${player.surname}`.toLowerCase()
        .includes(searchTerm.toLowerCase()) || 
        player.team.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Exclude players already selected in squad
      const isAlreadySelected = existingSelections.some(s => s.player_id === player.id);
      
      return matchesSearch && !isAlreadySelected;
    }).sort((a, b) => b.costPercentage - a.costPercentage); // Sort by budget descending
  }, [players, searchTerm, existingSelections]);

  const getRoleTitle = (role?: PlayerRole) => {
    switch (role) {
      case 'Portiere': return 'Portieri';
      case 'Difensore': return 'Difensori';
      case 'Centrocampista': return 'Centrocampisti';
      case 'Attaccante': return 'Attaccanti';
      default: return 'Giocatori';
    }
  };

  const handlePlayerClick = (playerId: string) => {
    onPlayerSelect(playerId);
    setSearchTerm(''); // Reset search
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            Seleziona {getRoleTitle(selectedRole)}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Cerca per nome o squadra..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Players List */}
          <div className="overflow-y-auto max-h-96 space-y-2">
            {filteredPlayers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Nessun giocatore trovato</p>
              </div>
            ) : (
              filteredPlayers.map((player) => {
                const bonusTotal = player.roleCategory !== 'Portiere' 
                  ? player.goals * 3 + player.assists - player.malus 
                  : 0;

                return (
                  <div
                    key={player.id}
                    className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handlePlayerClick(player.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{player.name} {player.surname}</h4>
                          <Badge variant="outline">{player.team}</Badge>
                          <Badge variant="secondary">{player.role}</Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Budget: </span>
                            <span className="font-semibold">{player.costPercentage}%</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Tier: </span>
                            <span>{player.tier}</span>
                          </div>
                          {player.roleCategory !== 'Portiere' && (
                            <div>
                              <span className="text-gray-600">Bonus Totali: </span>
                              <span className="font-semibold text-green-600">{bonusTotal}</span>
                            </div>
                          )}
                          <div>
                            <span className="text-gray-600">Titolarità: </span>
                            <span>{player.ownership}%</span>
                          </div>
                        </div>

                        {player.roleCategory !== 'Portiere' && (
                          <div className="mt-2 flex gap-4 text-sm text-gray-600">
                            <span>Gol: {player.goals}</span>
                            <span>Assist: {player.assists}</span>
                            <span>Malus: {player.malus}</span>
                            <span>xG: {player.xG.toFixed(2)}</span>
                            <span>xA: {player.xA.toFixed(2)}</span>
                          </div>
                        )}

                        {player.roleCategory === 'Portiere' && (
                          <div className="mt-2 flex gap-4 text-sm text-gray-600">
                            <span>Gol subiti: {player.goalsConceded}</span>
                            <span>Rigori parati: {player.penaltiesSaved}</span>
                            <span>xP: {player.xP.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                      
                      <Button size="sm" className="ml-4">
                        <Check className="w-4 h-4 mr-1" />
                        Seleziona
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlayerSelectionModal;
