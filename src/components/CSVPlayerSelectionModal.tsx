
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Check, UserCheck } from "lucide-react";
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
    console.log('🎯 Giocatore selezionato nel modal:', player);
    onPlayerSelect(player);
    setSearchTerm('');
  };

  const handleClose = () => {
    setSearchTerm('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
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
          <div className="max-h-96 overflow-y-auto">
            {players.length === 0 ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                  <UserCheck className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Tutti i {getRoleTitle(selectedRole).toLowerCase()}i sono stati aggiunti!
                  </p>
                  <p className="text-sm text-gray-500">
                    Non ci sono più giocatori di questo ruolo disponibili dal file CSV.
                  </p>
                </div>
              </div>
            ) : filteredPlayers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-lg font-medium mb-2">Nessun giocatore trovato</p>
                <p className="text-sm">Prova a modificare i termini di ricerca</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredPlayers.map((player) => (
                  <Card 
                    key={player.id} 
                    className="p-4 cursor-pointer hover:bg-accent transition-colors border border-border hover:border-primary/50"
                    onClick={() => handlePlayerSelect(player)}
                  >
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="font-bold text-sm">
                          {player.name ? `${player.name} ${player.surname}` : player.surname}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">{player.team}</Badge>
                          <Badge variant="secondary" className="text-xs">{player.role}</Badge>
                        </div>
                      </div>
                      <Button size="sm" className="w-full" variant="default">
                        <Check className="w-4 h-4 mr-1" />
                        Seleziona e Aggiungi
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {players.length === 0 && (
            <div className="text-center pt-4">
              <Button onClick={handleClose} variant="outline">
                Chiudi
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CSVPlayerSelectionModal;
