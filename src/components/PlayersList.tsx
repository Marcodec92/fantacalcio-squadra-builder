
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import PlayerCard from './PlayerCard';
import { Player, PlayerRole } from '@/types/Player';

interface PlayersListProps {
  players: Player[];
  roleCategory: PlayerRole;
  onAddPlayer: () => void;
  onUpdatePlayer: (player: Player) => void;
  onDeletePlayer: (playerId: string) => void;
}

const PlayersList: React.FC<PlayersListProps> = ({
  players,
  roleCategory,
  onAddPlayer,
  onUpdatePlayer,
  onDeletePlayer
}) => {
  const getRoleTitle = (role: PlayerRole) => {
    switch (role) {
      case 'portiere': return 'Portieri';
      case 'difensore': return 'Difensori';
      case 'centrocampista': return 'Centrocampisti';
      case 'attaccante': return 'Attaccanti';
      default: return '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">{getRoleTitle(roleCategory)}</h2>
        <Button onClick={onAddPlayer} className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Aggiungi {roleCategory === 'portiere' ? 'portiere' : 
                   roleCategory === 'difensore' ? 'difensore' :
                   roleCategory === 'centrocampista' ? 'centrocampista' : 'attaccante'}
        </Button>
      </div>

      {players.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">Nessun {roleCategory} inserito</p>
          <p className="text-sm">Clicca su "Aggiungi" per iniziare</p>
        </div>
      ) : (
        <div className="space-y-3">
          {players.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              onUpdate={onUpdatePlayer}
              onDelete={onDeletePlayer}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PlayersList;
