
import { Player, PlayerRole } from '@/types/Player';
import { usePlayersData } from './usePlayersData';
import { usePlayerMutations } from './usePlayerMutations';

export const usePlayers = (filters?: {
  showFavoritesOnly?: boolean;
  searchTerm?: string;
  selectedTeams?: string[];
  selectedTiers?: string[];
  selectedPlusCategories?: string[];
}) => {
  const { data: players = [], isLoading, error } = usePlayersData(filters);
  const { addPlayerMutation, updatePlayerMutation, deletePlayerMutation } = usePlayerMutations();

  const addPlayer = (role: PlayerRole) => {
    console.log('addPlayer called with role:', role);
    addPlayerMutation.mutate(role);
  };

  const updatePlayer = (player: Player) => {
    updatePlayerMutation.mutate(player);
  };

  const deletePlayer = (playerId: string) => {
    deletePlayerMutation.mutate(playerId);
  };

  const getPlayersByRole = (role: PlayerRole) => {
    return players.filter(p => p.roleCategory === role);
  };

  // Funzione per calcolare i bonus totali con la formula corretta
  const calculateBonusTotal = (player: Player) => {
    if (player.roleCategory === 'Portiere') return 0;
    return player.goals * 3 + player.assists - (player.malus * 0.5);
  };

  return {
    players,
    isLoading,
    error,
    addPlayer,
    updatePlayer,
    deletePlayer,
    getPlayersByRole,
    calculateBonusTotal,
    isAddingPlayer: addPlayerMutation.isPending,
  };
};
