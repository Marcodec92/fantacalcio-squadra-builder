
import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Search, Check, Filter } from "lucide-react";
import { PlayerRole, PlayerTier } from '@/types/Player';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface CSVPlayerSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: any[];
  selectedRole?: PlayerRole | null;
  onPlayerSelect: (player: any) => void;
}

const CSVPlayerSelectionModal: React.FC<CSVPlayerSelectionModalProps> = ({
  isOpen,
  onClose,
  players,
  selectedRole,
  onPlayerSelect
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTiers, setSelectedTiers] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const getTiersForRole = (role?: PlayerRole | null): PlayerTier[] => {
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
        player.team?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTier = selectedTiers.length === 0 || selectedTiers.includes(player.tier);
      
      return matchesSearch && matchesTier;
    }).sort((a, b) => (b.credits || 0) - (a.credits || 0));
  }, [players, searchTerm, selectedTiers]);

  const getRoleTitle = (role?: PlayerRole | null) => {
    switch (role) {
      case 'Portiere': return 'Portieri';
      case 'Difensore': return 'Difensori';
      case 'Centrocampista': return 'Centrocampisti';
      case 'Attaccante': return 'Attaccanti';
      default: return 'Giocatori';
    }
  };

  const handlePlayerClick = (player: any) => {
    console.log('🎯 CSVPlayerSelectionModal - Player clicked:', player);
    onPlayerSelect(player);
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
          <DialogTitle>
            Seleziona {getRoleTitle(selectedRole)} dal CSV
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
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
              <PopoverContent className="w-80 p-4" align="end">
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
              <div className="text-center py-8 text-gray-500">
                <p className="text-lg font-medium mb-2">Nessun giocatore trovato</p>
                <p className="text-sm">Prova a modificare i filtri di ricerca</p>
              </div>
            ) : (
              filteredPlayers.map((player, index) => (
                <div
                  key={`${player.name}-${player.surname}-${player.team}-${index}`}
                  className="p-4 border border-border rounded-lg cursor-pointer hover:bg-accent/10 transition-colors"
                  onClick={() => handlePlayerClick(player)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{player.name} {player.surname}</h4>
                        <Badge variant="outline">{player.team}</Badge>
                        <Badge variant="secondary">{player.role}</Badge>
                        {player.tier && <Badge variant="outline">{player.tier}</Badge>}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Crediti: </span>
                          <span className="font-semibold">{player.credits || 0}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Quotazione: </span>
                          <span className="font-semibold">{player.quotation || 0}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Ruolo: </span>
                          <span>{player.specificRole || player.role}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Team: </span>
                          <span>{player.team}</span>
                        </div>
                      </div>

                      {player.role !== 'Portiere' ? (
                        <div className="mt-2 flex gap-4 text-sm text-gray-600">
                          <span>Gol: {player.goals || 0}</span>
                          <span>Assist: {player.assists || 0}</span>
                          <span>Amm: {player.yellowCards || 0}</span>
                          <span>Esp: {player.redCards || 0}</span>
                        </div>
                      ) : (
                        <div className="mt-2 flex gap-4 text-sm text-gray-600">
                          <span>Gol subiti: {player.goalsConceded || 0}</span>
                          <span>Rigori parati: {player.penaltiesSaved || 0}</span>
                          <span>Amm: {player.yellowCards || 0}</span>
                          <span>Esp: {player.redCards || 0}</span>
                        </div>
                      )}
                    </div>
                    
                    <Button size="sm" className="ml-4">
                      <Check className="w-4 h-4 mr-1" />
                      Seleziona
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CSVPlayerSelectionModal;
