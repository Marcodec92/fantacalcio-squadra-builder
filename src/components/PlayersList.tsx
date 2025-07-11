
import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import PlayerCard from './PlayerCard';
import SortControls from './SortControls';
import { Player, PlayerRole, SortOption } from '@/types/Player';

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
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const getRoleTitle = (role: PlayerRole) => {
    switch (role) {
      case 'Portiere': return 'Portieri';
      case 'Difensore': return 'Difensori';
      case 'Centrocampista': return 'Centrocampisti';
      case 'Attaccante': return 'Attaccanti';
      default: return '';
    }
  };

  const sortedPlayers = useMemo(() => {
    const sorted = [...players].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = `${a.name} ${a.surname}`.toLowerCase();
          bValue = `${b.name} ${b.surname}`.toLowerCase();
          break;
        case 'costPercentage':
          aValue = a.costPercentage;
          bValue = b.costPercentage;
          break;
        case 'fmv':
          aValue = a.fmv;
          bValue = b.fmv;
          break;
        case 'bonusTotal':
          if (roleCategory === 'Portiere') {
            aValue = 0;
            bValue = 0;
          } else {
            aValue = a.goals * 3 + a.assists - a.malus;
            bValue = b.goals * 3 + b.assists - b.malus;
          }
          break;
        case 'xG':
          aValue = a.xG;
          bValue = b.xG;
          break;
        case 'xA':
          aValue = a.xA;
          bValue = b.xA;
          break;
        case 'xP':
          aValue = a.xP;
          bValue = b.xP;
          break;
        case 'goalsConceded':
          aValue = a.goalsConceded;
          bValue = b.goalsConceded;
          break;
        default:
          aValue = 0;
          bValue = 0;
      }

      if (typeof aValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return sorted;
  }, [players, sortBy, sortDirection, roleCategory]);

  const handleSortChange = (newSortBy: SortOption, newDirection: 'asc' | 'desc') => {
    setSortBy(newSortBy);
    setSortDirection(newDirection);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">{getRoleTitle(roleCategory)}</h2>
        <Button onClick={onAddPlayer} className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Aggiungi {roleCategory.toLowerCase()}
        </Button>
      </div>

      {players.length > 0 && (
        <SortControls
          roleCategory={roleCategory}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSortChange={handleSortChange}
        />
      )}

      {sortedPlayers.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">Nessun {roleCategory.toLowerCase()} inserito</p>
          <p className="text-sm">Clicca su "Aggiungi" per iniziare</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedPlayers.map((player) => (
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
