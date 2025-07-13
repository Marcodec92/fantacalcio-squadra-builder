
import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Search, Check, Filter } from "lucide-react";
import { Player, PlayerRole, PlayerTier } from '@/types/Player';
import { SquadSelection } from '@/hooks/useSquadSelections';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface PlayerSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: Player[];
  selectedRole?: PlayerRole;
  onPlayerSelect: (playerId: string) => void;
  existingSelections: SquadSelection[];
  calculateBonusTotal: (player: Player) => number;
}

const PlayerSelectionModal: React.FC<PlayerSelectionModalProps> = ({
  isOpen,
  onClose,
  players,
  selectedRole,
  onPlayerSelect,
  existingSelections,
  calculateBonusTotal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTiers, setSelectedTiers] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const getTiersForRole = (role?: PlayerRole): PlayerTier[] => {
    switch (role) {
      case 'Portiere': 
        return ['1ª fascia', '2ª fascia', '3ª fascia'];
      case 'Difensore':
      case 'Centrocampista': 
        return ['1ª fascia', '2ª fascia', '3ª fascia', '4ª fascia', '5ª fascia', '6ª fascia', '7ª fascia', '8ª fascia'];
      case 'Attaccante': 
        return ['1ª fascia', '2ª fascia', '3ª fascia', '4ª fascia', '5ª fascia', '6ª fascia'];
      default: 
        return [];
    }
  };

  const toggleTier = (tier: string) => {
    const newTiers = selectedTiers.includes(tier)
      ? selectedTiers.filter(t => t !== tier)
      : [...selectedTiers, tier];
    setSelectedTiers(newTiers);
  };

  const filteredPlayers = useMemo(() => {
    return players.filter(player => {
      const matchesSearch = `${player.name} ${player.surname}`.toLowerCase()
        .includes(searchTerm.toLowerCase()) || 
        player.team.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTier = selectedTiers.length === 0 || selectedTiers.includes(player.tier);
      
      const isAlreadySelected = existingSelections.some(s => s.player_id === player.id);
      
      return matchesSearch && matchesTier && !isAlreadySelected;
    }).sort((a, b) => b.costPercentage - a.costPercentage);
  }, [players, searchTerm, selectedTiers, existingSelections]);

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
    setSearchTerm('');
    setSelectedTiers([]);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTiers([]);
  };

  const hasActiveFilters = searchTerm || selectedTiers.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Seleziona {getRoleTitle(selectedRole)}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Cerca per nome o squadra..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtri
                  {selectedTiers.length > 0 && (
                    <Badge variant="secondary" className="ml-2 text-xs bg-blue-100 text-blue-800">
                      {selectedTiers.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4" align="end">
                <div>
                  <Label className="text-sm font-medium mb-3 block text-gray-900">Fasce</Label>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {getTiersForRole(selectedRole).map((tier) => (
                      <div key={tier} className="flex items-center space-x-2">
                        <Checkbox
                          id={`tier-${tier}`}
                          checked={selectedTiers.includes(tier)}
                          onCheckedChange={() => toggleTier(tier)}
                        />
                        <Label htmlFor={`tier-${tier}`} className="text-sm cursor-pointer text-gray-700">
                          {tier}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {hasActiveFilters && (
                    <Button variant="ghost" onClick={clearFilters} size="sm" className="text-gray-600 hover:text-gray-800">
                      Rimuovi filtri
                    </Button>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Players List */}
          <div className="overflow-y-auto max-h-96 space-y-2">
            {filteredPlayers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Nessun giocatore trovato</p>
              </div>
            ) : (
              filteredPlayers.map((player) => {
                const bonusTotal = calculateBonusTotal(player);

                return (
                  <div
                    key={player.id}
                    className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors bg-white"
                    onClick={() => handlePlayerClick(player.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900">{player.name} {player.surname}</h4>
                          {player.isFavorite && (
                            <span className="text-yellow-500">⭐</span>
                          )}
                          <Badge variant="outline" className="border-gray-300 text-gray-700">{player.team}</Badge>
                          <Badge variant="secondary" className="bg-gray-100 text-gray-700">{player.role}</Badge>
                          {player.tier && <Badge variant="outline" className="border-gray-300 text-gray-700">{player.tier}</Badge>}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Budget: </span>
                            <span className="font-semibold text-gray-900">{player.costPercentage}%</span>
                          </div>
                          <div>
                            <span className="text-gray-600">FMV: </span>
                            <span className="font-semibold text-gray-900">{player.fmv}M</span>
                          </div>
                          {player.roleCategory !== 'Portiere' && (
                            <div>
                              <span className="text-gray-600">Bonus: </span>
                              <span className={`font-semibold ${bonusTotal >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                {bonusTotal > 0 ? '+' : ''}{bonusTotal.toFixed(1)}
                              </span>
                            </div>
                          )}
                          <div>
                            <span className="text-gray-600">Titolarità: </span>
                            <span className="text-gray-900">{player.ownership}%</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Plus: </span>
                            <span className="text-gray-900">{player.plusCategories.length}</span>
                          </div>
                        </div>

                        {player.roleCategory !== 'Portiere' ? (
                          <div className="mt-2 flex gap-4 text-sm text-gray-600">
                            <span>Gol: {player.goals}</span>
                            <span>Assist: {player.assists}</span>
                            <span>Malus: {player.malus}</span>
                            <span>xG: {player.xG.toFixed(2)}</span>
                            <span>xA: {player.xA.toFixed(2)}</span>
                          </div>
                        ) : (
                          <div className="mt-2 flex gap-4 text-sm text-gray-600">
                            <span>Gol subiti: {player.goalsConceded}</span>
                            <span>Rigori parati: {player.penaltiesSaved}</span>
                            <span>xP: {player.xP.toFixed(2)}</span>
                          </div>
                        )}

                        {player.plusCategories.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {player.plusCategories.map((category) => (
                              <Badge key={category} variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                                {category}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <Button size="sm" className="ml-4 bg-blue-600 hover:bg-blue-700 text-white">
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
