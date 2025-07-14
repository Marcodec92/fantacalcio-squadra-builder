
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search } from "lucide-react";
import { PlayerRole } from '@/types/Player';
import { RealTimePlayer } from '@/pages/RealTimeBuilder';

interface CSVPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: RealTimePlayer[];
  selectedRole?: PlayerRole;
  onPlayerSelect: (player: RealTimePlayer, credits: number) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const CSVPlayerModal: React.FC<CSVPlayerModalProps> = ({
  isOpen,
  onClose,
  players,
  selectedRole,
  onPlayerSelect,
  searchTerm,
  onSearchChange
}) => {
  const [selectedPlayer, setSelectedPlayer] = useState<RealTimePlayer | null>(null);
  const [credits, setCredits] = useState<number>(0);

  const handlePlayerClick = (player: RealTimePlayer) => {
    setSelectedPlayer(player);
    setCredits(0);
  };

  const handleConfirm = () => {
    if (selectedPlayer && credits > 0) {
      onPlayerSelect(selectedPlayer, credits);
      setSelectedPlayer(null);
      setCredits(0);
    }
  };

  const handleCancel = () => {
    setSelectedPlayer(null);
    setCredits(0);
    onClose();
  };

  if (!selectedRole) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            Seleziona {selectedRole} {selectedPlayer ? `- ${selectedPlayer.name} ${selectedPlayer.surname}` : ''}
          </DialogTitle>
        </DialogHeader>
        
        {!selectedPlayer ? (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Cerca giocatore per nome..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
              {players.map((player) => (
                <Card 
                  key={player.id} 
                  className="p-4 cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => handlePlayerClick(player)}
                >
                  <div className="text-center space-y-1">
                    <div className="font-bold text-sm">{player.name} {player.surname}</div>
                    <div className="text-xs text-muted-foreground">{player.team}</div>
                  </div>
                </Card>
              ))}
            </div>
            
            {players.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? 'Nessun giocatore trovato' : 'Carica un file CSV per vedere i giocatori'}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <Card className="p-6 text-center">
              <h3 className="text-xl font-bold">{selectedPlayer.name} {selectedPlayer.surname}</h3>
              <p className="text-muted-foreground">{selectedPlayer.team}</p>
            </Card>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Crediti spesi per questo giocatore</label>
              <Input
                type="number"
                min="0"
                value={credits}
                onChange={(e) => setCredits(Number(e.target.value))}
                placeholder="Inserisci i crediti spesi"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setSelectedPlayer(null)}>
                Indietro
              </Button>
              <Button 
                onClick={handleConfirm}
                disabled={credits <= 0}
              >
                Conferma
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CSVPlayerModal;
