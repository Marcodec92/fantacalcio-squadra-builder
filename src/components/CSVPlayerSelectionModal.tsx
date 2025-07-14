
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Check } from "lucide-react";
import { PlayerRole } from '@/types/Player';

interface CSVPlayer {
  id: string;
  name: string;
  surname: string;
  team: string;
  role: PlayerRole;
}

interface CSVPlayerSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: CSVPlayer[];
  selectedRole?: PlayerRole | null;
  onPlayerSelect: (player: CSVPlayer) => void;
}

const CSVPlayerSelectionModal: React.FC<CSVPlayerSelectionModalProps> = ({
  isOpen,
  onClose,
  players,
  selectedRole,
  onPlayerSelect
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPlayers = players.filter(player =>
    `${player.name} ${player.surname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.team.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleTitle = (role?: PlayerRole | null) => {
    switch (role) {
      case 'Portiere': return 'Portiere';
      case 'Difensore': return 'Difensore';
      case 'Centrocampista': return 'Centrocampista';
      case 'Attaccante': return 'Attaccante';
      default: return 'Giocatore';
    }
  };

  const handlePlayerSelect = (player: CSVPlayer) => {
    onPlayerSelect(player);
    setSearchTerm('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            Seleziona {getRoleTitle(selectedRole)} dal CSV
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Cerca per nome o squadra..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Players List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
            {filteredPlayers.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                {searchTerm ? 'Nessun giocatore trovato' : 'Nessun giocatore disponibile per questo ruolo'}
              </div>
            ) : (
              filteredPlayers.map((player) => (
                <Card 
                  key={player.id} 
                  className="p-4 cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => handlePlayerSelect(player)}
                >
                  <div className="space-y-2">
                    <div className="font-bold text-sm">{player.name} {player.surname}</div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{player.team}</Badge>
                      <Badge variant="secondary" className="text-xs">{player.role}</Badge>
                    </div>
                    <Button size="sm" className="w-full mt-2">
                      <Check className="w-4 h-4 mr-1" />
                      Seleziona
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>

          {players.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Carica un file CSV per vedere i giocatori disponibili
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CSVPlayerSelectionModal;
