
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Player, PlayerRole, Team } from '@/types/Player';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Helper function to convert database row to Player type
const convertDbPlayerToPlayer = (dbPlayer: any): Player => {
  return {
    id: dbPlayer.id,
    name: dbPlayer.name,
    surname: dbPlayer.surname,
    team: dbPlayer.team || '',
    role: dbPlayer.role,
    roleCategory: dbPlayer.role_category,
    costPercentage: parseFloat(dbPlayer.cost_percentage || 0),
    fmv: parseFloat(dbPlayer.fmv || 0),
    tier: dbPlayer.tier || '',
    goals: dbPlayer.goals || 0,
    assists: dbPlayer.assists || 0,
    malus: dbPlayer.malus || 0,
    goalsConceded: dbPlayer.goals_conceded || 0,
    yellowCards: dbPlayer.yellow_cards || 0,
    penaltiesSaved: dbPlayer.penalties_saved || 0,
    xG: parseFloat(dbPlayer.x_g || 0),
    xA: parseFloat(dbPlayer.x_a || 0),
    xP: parseFloat(dbPlayer.x_p || 0),
    ownership: dbPlayer.ownership || 0,
    plusCategories: dbPlayer.plus_categories || [],
    isFavorite: dbPlayer.is_favorite || false
  };
};

// Helper function to convert Player type to database format
const convertPlayerToDbFormat = (player: Player, userId: string) => {
  return {
    id: player.id,
    user_id: userId,
    name: player.name,
    surname: player.surname,
    team: player.team || null,
    role: player.role,
    role_category: player.roleCategory,
    cost_percentage: player.costPercentage,
    fmv: player.fmv,
    tier: player.tier,
    goals: player.goals,
    assists: player.assists,
    malus: player.malus,
    goals_conceded: player.goalsConceded,
    yellow_cards: player.yellowCards,
    penalties_saved: player.penaltiesSaved,
    x_g: player.xG,
    x_a: player.xA,
    x_p: player.xP,
    ownership: player.ownership,
    plus_categories: player.plusCategories,
    is_favorite: player.isFavorite
  };
};

export const usePlayers = (filters?: {
  showFavoritesOnly?: boolean;
  searchTerm?: string;
  selectedTeams?: string[];
  selectedTiers?: string[];
  selectedPlusCategories?: string[];
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch players from Supabase with filters
  const { data: players = [], isLoading, error } = useQuery({
    queryKey: ['players', user?.id, filters],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from('players')
        .select('*')
        .eq('user_id', user.id);

      // Apply filters
      if (filters?.showFavoritesOnly) {
        query = query.eq('is_favorite', true);
      }

      if (filters?.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase();
        query = query.or(`name.ilike.%${searchTerm}%,surname.ilike.%${searchTerm}%`);
      }

      if (filters?.selectedTeams && filters.selectedTeams.length > 0) {
        // Cast to Team[] to satisfy TypeScript
        query = query.in('team', filters.selectedTeams as Team[]);
      }

      if (filters?.selectedTiers && filters.selectedTiers.length > 0) {
        query = query.in('tier', filters.selectedTiers);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching players:', error);
        throw error;
      }

      let filteredData = data.map(convertDbPlayerToPlayer);

      // Filter by plus categories (client-side because of array handling)
      if (filters?.selectedPlusCategories && filters.selectedPlusCategories.length > 0) {
        filteredData = filteredData.filter(player => 
          filters.selectedPlusCategories!.some(category => 
            player.plusCategories.includes(category as any)
          )
        );
      }

      return filteredData;
    },
    enabled: !!user,
  });

  const addPlayerMutation = useMutation({
    mutationFn: async (player: Player) => {
      if (!user) throw new Error('User not authenticated');
      
      const dbPlayer = convertPlayerToDbFormat(player, user.id);
      const { data, error } = await supabase
        .from('players')
        .insert([dbPlayer])
        .select()
        .single();

      if (error) throw error;
      return convertDbPlayerToPlayer(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players', user?.id] });
      toast.success('Giocatore aggiunto con successo!');
    },
    onError: (error) => {
      console.error('Error adding player:', error);
      toast.error('Errore nell\'aggiunta del giocatore');
    },
  });

  const updatePlayerMutation = useMutation({
    mutationFn: async (player: Player) => {
      if (!user) throw new Error('User not authenticated');
      
      const dbPlayer = convertPlayerToDbFormat(player, user.id);
      const { data, error } = await supabase
        .from('players')
        .update(dbPlayer)
        .eq('id', player.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return convertDbPlayerToPlayer(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players', user?.id] });
      toast.success('Giocatore aggiornato con successo!');
    },
    onError: (error) => {
      console.error('Error updating player:', error);
      toast.error('Errore nell\'aggiornamento del giocatore');
    },
  });

  const deletePlayerMutation = useMutation({
    mutationFn: async (playerId: string) => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', playerId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players', user?.id] });
      toast.success('Giocatore eliminato con successo!');
    },
    onError: (error) => {
      console.error('Error deleting player:', error);
      toast.error('Errore nell\'eliminazione del giocatore');
    },
  });

  const addPlayer = (role: PlayerRole) => {
    const newPlayer: Player = {
      id: crypto.randomUUID(),
      name: '',
      surname: '',
      team: '',
      role: role === 'Portiere' ? 'Portiere' : 
            role === 'Difensore' ? 'Difensore centrale' :
            role === 'Centrocampista' ? 'Mediano' : 'Attaccante centrale',
      roleCategory: role,
      costPercentage: 0,
      fmv: 0,
      tier: '',
      goals: 0,
      assists: 0,
      malus: 0,
      goalsConceded: 0,
      yellowCards: 0,
      penaltiesSaved: 0,
      xG: 0,
      xA: 0,
      xP: 0,
      ownership: 0,
      plusCategories: [],
      isFavorite: false
    };
    
    addPlayerMutation.mutate(newPlayer);
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

  // Funzione per calcolare i bonus con la nuova formula
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
  };
};
