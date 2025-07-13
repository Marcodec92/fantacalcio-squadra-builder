
import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import PlayerCard from './PlayerCard';
import SortControls from './SortControls';
import PlayerFilters from './PlayerFilters';
import { Player, PlayerRole, SortOption } from '@/types/Player';
import { usePlayers } from '@/hooks/usePlayers';

interface PlayersListProps {
  roleCategory: PlayerRole;
  onAddPlayer: () => void;
  onUpdatePlayer: (player: Player) => void;
  onDeletePlayer: (playerId: string) => void;
}

const PlayersList: React.FC<PlayersListProps> = ({
  roleCategory,
  onAddPlayer,
  onUpdatePlayer,
  onDeletePlayer
}) => {
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [selectedTiers, setSelectedTiers] = useState<string[]>([]);
  const [selectedPlusCategories, setSelectedPlusCategories] = useState<string[]>([]);

  const { players, calculateBonusTotal } = usePlayers({
    showFavoritesOnly,
    searchTerm,
    selectedTeams,
    selectedTiers,
    selectedPlusCategories
  });

  const filteredPlayers = players.filter(p => p.roleCategory === roleCategory);

  const getRoleTitle = (role: PlayerRole) => {
    switch (role) {
      case 'Portiere': return 'Portieri';
      case 'Difensore': return 'Difensori';
      case 'Centrocampista': return 'Centrocampisti';
      case 'Attaccante': return 'Attaccanti';
      default: return '';
    }
  };

  const getRoleColor = (role: PlayerRole) => {
    switch (role) {
      case 'Portiere': return 'text-blue-600';
      case 'Difensore': return 'text-emerald-600';
      case 'Centrocampista': return 'text-purple-600';
      case 'Attaccante': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getRoleBgColor = (role: PlayerRole) => {
    switch (role) {
      case 'Portiere': return 'bg-blue-600 hover:bg-blue-700';
      case 'Difensore': return 'bg-emerald-600 hover:bg-emerald-700';
      case 'Centrocampista': return 'bg-purple-600 hover:bg-purple-700';
      case 'Attaccante': return 'bg-red-600 hover:bg-red-700';
      default: return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  const sortedPlayers = useMemo(() => {
    const sorted = [...filteredPlayers].sort((a, b) => {
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
          aValue = calculateBonusTotal(a);
          bValue = calculateBonusTotal(b);
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
  }, [filteredPlayers, sortBy, sortDirection, calculateBonusTotal]);

  const handleSortChange = (newSortBy: SortOption, newDirection: 'asc' | 'desc') => {
    setSortBy(newSortBy);
    setSortDirection(newDirection);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`text-xl font-semibold ${getRoleColor(roleCategory)}`}>
          {getRoleTitle(roleCategory)}
        </h2>
        <Button 
          onClick={onAddPlayer} 
          className={`${getRoleBgColor(roleCategory)} text-white font-medium px-4 py-2 rounded-lg shadow-sm`}
        >
          <Plus className="w-4 h-4 mr-2" />
          Aggiungi {roleCategory.toLowerCase()}
        </Button>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <PlayerFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          showFavoritesOnly={showFavoritesOnly}
          onFavoritesToggle={() => setShowFavoritesOnly(!showFavoritesOnly)}
          selectedTeams={selectedTeams}
          onTeamsChange={setSelectedTeams}
          selectedTiers={selectedTiers}
          onTiersChange={setSelectedTiers}
          selectedPlusCategories={selectedPlusCategories}
          onPlusCategoriesChange={setSelectedPlusCategories}
          roleCategory={roleCategory}
        />
      </div>

      {filteredPlayers.length > 0 && (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <SortControls
            roleCategory={roleCategory}
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSortChange={handleSortChange}
          />
        </div>
      )}

      {sortedPlayers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
            <span className="text-xl">🔍</span>
          </div>
          <p className="text-lg font-medium text-gray-900 mb-2">Nessun {roleCategory.toLowerCase()} trovato</p>
          <p className="text-sm text-gray-500">Prova a modificare i filtri o aggiungi un nuovo giocatore</p>
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
