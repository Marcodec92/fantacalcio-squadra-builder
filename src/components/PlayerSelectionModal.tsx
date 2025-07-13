
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
      
      // Exclude players already selected in squad
      const isAlreadySelected = existingSelections.some(s => s.player_id === player.id);
      
      return matchesSearch && matchesTier && !isAlreadySelected;
    }).sort((a, b) => b.costPercentage - a.costPercentage); // Sort by budget descending
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
    setSearchTerm(''); // Reset search
    setSelectedTiers([]); // Reset tier filter
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTiers([]);
  };

  const hasActiveFilters = searchTerm || selectedTiers.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden glass-card border-white/20 backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle>
            Seleziona {getRoleTitle(selectedRole)}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Cerca per nome o squadra..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtri
                  {selectedTiers.length > 0 && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {selectedTiers.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4 glass-card border-white/20 backdrop-blur-2xl" align="end">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Fasce</Label>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {getTiersForRole(selectedRole).map((tier) => (
                      <div key={tier} className="flex items-center space-x-2">
                        <Checkbox
                          id={`tier-${tier}`}
                          checked={selectedTiers.includes(tier)}
                          onCheckedChange={() => toggleTier(tier)}
                        />
                        <Label htmlFor={`tier-${tier}`} className="text-sm cursor-pointer">
                          {tier}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {hasActiveFilters && (
                    <Button variant="ghost" onClick={clearFilters} size="sm">
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
              <div className="text-center py-8 text-muted-foreground">
                <p>Nessun giocatore trovato</p>
              </div>
            ) : (
              filteredPlayers.map((player) => {
                const bonusTotal = calculateBonusTotal(player);

                return (
                  <div
                    key={player.id}
                    className="p-4 glass-card cursor-pointer hover:bg-white/10 hover:border-white/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                    onClick={() => handlePlayerClick(player.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{player.name} {player.surname}</h4>
                          {player.isFavorite && (
                            <span className="text-yellow-500">⭐</span>
                          )}
                          <Badge variant="outline">{player.team}</Badge>
                          <Badge variant="secondary">{player.role}</Badge>
                          {player.tier && <Badge variant="outline">{player.tier}</Badge>}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Budget: </span>
                            <span className="font-semibold text-primary">{player.costPercentage}%</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">FMV: </span>
                            <span className="font-semibold text-accent">{player.fmv}M</span>
                          </div>
                          {player.roleCategory !== 'Portiere' && (
                            <div>
                              <span className="text-muted-foreground">Bonus: </span>
                              <span className={`font-semibold ${bonusTotal >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {bonusTotal > 0 ? '+' : ''}{bonusTotal.toFixed(1)}
                              </span>
                            </div>
                          )}
                          <div>
                            <span className="text-muted-foreground">Titolarità: </span>
                            <span className="text-foreground font-medium">{player.ownership}%</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Plus: </span>
                            <span className="text-foreground font-medium">{player.plusCategories.length}</span>
                          </div>
                        </div>

                        {player.roleCategory !== 'Portiere' ? (
                          <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
                            <span className="text-foreground">Gol: <span className="text-primary font-medium">{player.goals}</span></span>
                            <span className="text-foreground">Assist: <span className="text-accent font-medium">{player.assists}</span></span>
                            <span className="text-foreground">Malus: <span className="text-destructive font-medium">{player.malus}</span></span>
                            <span className="text-foreground">xG: <span className="text-secondary-foreground font-medium">{player.xG.toFixed(2)}</span></span>
                            <span className="text-foreground">xA: <span className="text-secondary-foreground font-medium">{player.xA.toFixed(2)}</span></span>
                          </div>
                        ) : (
                          <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
                            <span className="text-foreground">Gol subiti: <span className="text-destructive font-medium">{player.goalsConceded}</span></span>
                            <span className="text-foreground">Rigori parati: <span className="text-primary font-medium">{player.penaltiesSaved}</span></span>
                            <span className="text-foreground">xP: <span className="text-secondary-foreground font-medium">{player.xP.toFixed(2)}</span></span>
                          </div>
                        )}

                        {player.plusCategories.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {player.plusCategories.map((category) => (
                              <Badge key={category} variant="secondary" className="text-xs">
                                {category}
                              </Badge>
                            ))}
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
