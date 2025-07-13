
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

  const getRoleGradient = (role: PlayerRole) => {
    switch (role) {
      case 'Portiere': return 'from-blue-500 to-cyan-600';
      case 'Difensore': return 'from-green-500 to-emerald-600';
      case 'Centrocampista': return 'from-purple-500 to-pink-600';
      case 'Attaccante': return 'from-red-500 to-orange-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  // Funzione per convertire la fascia in valore numerico per ordinamento
  const getTierValue = (tier: string): number => {
    if (!tier) return 999; // Fasce vuote vanno alla fine
    
    // Estrae il numero dalla stringa (es. "1ª fascia" -> 1)
    const match = tier.match(/(\d+)/);
    if (match) {
      return parseInt(match[1]);
    }
    return 999; // Fallback per fasce non riconosciute
  };

  const sortedPlayers = useMemo(() => {
    // Separa i giocatori vuoti (nuovi) da quelli compilati
    const emptyPlayers = filteredPlayers.filter(p => 
      p.name === 'Nuovo' && p.surname === 'Giocatore' && p.costPercentage === 0
    );
    const compiledPlayers = filteredPlayers.filter(p => 
      !(p.name === 'Nuovo' && p.surname === 'Giocatore' && p.costPercentage === 0)
    );

    // Ordina solo i giocatori compilati
    const sortedCompiled = [...compiledPlayers].sort((a, b) => {
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
        case 'tier':
          // Ordinamento composto: prima per fascia, poi per MFV
          const aTierValue = getTierValue(a.tier);
          const bTierValue = getTierValue(b.tier);
          
          // Se le fasce sono diverse, ordina per fascia
          if (aTierValue !== bTierValue) {
            return sortDirection === 'asc' ? aTierValue - bTierValue : bTierValue - aTierValue;
          }
          
          // Se le fasce sono uguali, ordina per MFV (più alto prima quando asc)
          return sortDirection === 'asc' ? b.fmv - a.fmv : a.fmv - b.fmv;
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

    // Ritorna prima i giocatori vuoti, poi quelli compilati ordinati
    return [...emptyPlayers, ...sortedCompiled];
  }, [filteredPlayers, sortBy, sortDirection, calculateBonusTotal]);

  const handleSortChange = (newSortBy: SortOption, newDirection: 'asc' | 'desc') => {
    setSortBy(newSortBy);
    setSortDirection(newDirection);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold bg-gradient-to-r ${getRoleGradient(roleCategory)} bg-clip-text text-transparent`}>
          {getRoleTitle(roleCategory)}
        </h2>
        <Button 
          onClick={onAddPlayer} 
          className={`bg-gradient-to-r ${getRoleGradient(roleCategory)} hover:opacity-90 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl font-medium`}
        >
          <Plus className="w-4 h-4 mr-2" />
          Aggiungi {roleCategory.toLowerCase()}
        </Button>
      </div>

      <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 shadow-sm">
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
        <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 shadow-sm">
          <SortControls
            roleCategory={roleCategory}
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSortChange={handleSortChange}
          />
        </div>
      )}

      {sortedPlayers.length === 0 ? (
        <div className="text-center py-16 bg-white/40 backdrop-blur-sm rounded-2xl shadow-sm">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center">
            <span className="text-2xl">🔍</span>
          </div>
          <p className="text-lg font-medium text-gray-600 mb-2">Nessun {roleCategory.toLowerCase()} trovato</p>
          <p className="text-sm text-gray-500">Prova a modificare i filtri o aggiungi un nuovo giocatore</p>
        </div>
      ) : (
        <div className="space-y-4">
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
