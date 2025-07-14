
import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { usePlayersData } from './usePlayersData';
import { Player, PlayerRole, PlusCategory, SpecificRole } from '@/types/Player';

interface PlayerFilters {
  showFavoritesOnly?: boolean;
  searchTerm?: string;
  selectedTeams?: string[];
  selectedTiers?: string[];
  selectedPlusCategories?: string[];
}

export const usePlayers = (filters?: PlayerFilters) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: players = [], isLoading, error } = usePlayersData();

  const calculateBonusTotal = (player: Player) => {
    if (player.roleCategory === 'Portiere') {
      return 0; // I portieri non hanno bonus calcolati
    }
    
    const goalBonus = player.goals * 3;
    const assistBonus = player.assists * 1;
    const malusPoints = player.malus * -1;
    
    return goalBonus + assistBonus + malusPoints;
  };

  // Helper function to map role category to a default specific role
  const getDefaultSpecificRole = (roleCategory: PlayerRole): SpecificRole => {
    switch (roleCategory) {
      case 'Portiere':
        return 'Portiere';
      case 'Difensore':
        return 'Difensore centrale';
      case 'Centrocampista':
        return 'Mediano';
      case 'Attaccante':
        return 'Attaccante centrale';
      default:
        return 'Portiere';
    }
  };

  const filteredPlayers = useMemo(() => {
    if (!filters) return players;

    return players.filter(player => {
      if (filters.showFavoritesOnly && !player.isFavorite) return false;
      
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const fullName = `${player.name} ${player.surname}`.toLowerCase();
        const teamName = player.team?.toLowerCase() || '';
        
        if (!fullName.includes(searchLower) && !teamName.includes(searchLower)) {
          return false;
        }
      }
      
      if (filters.selectedTeams && filters.selectedTeams.length > 0) {
        if (!player.team || !filters.selectedTeams.includes(player.team)) {
          return false;
        }
      }
      
      if (filters.selectedTiers && filters.selectedTiers.length > 0) {
        if (!player.tier || !filters.selectedTiers.includes(player.tier)) {
          return false;
        }
      }
      
      if (filters.selectedPlusCategories && filters.selectedPlusCategories.length > 0) {
        const playerCategories = player.plusCategories || [];
        const hasMatchingCategory = filters.selectedPlusCategories.some(category => 
          playerCategories.includes(category as PlusCategory)
        );
        if (!hasMatchingCategory) {
          return false;
        }
      }
      
      return true;
    });
  }, [players, filters]);

  const addPlayer = async (roleCategory: PlayerRole, partialPlayerData?: Partial<Player>) => {
    if (!user) {
      toast.error('Devi essere autenticato per aggiungere giocatori');
      return;
    }

    try {
      // Ensure we have a proper specific role
      const specificRole = partialPlayerData?.role || getDefaultSpecificRole(roleCategory);
      
      // Handle team properly - convert empty string to null
      const teamValue = partialPlayerData?.team && partialPlayerData.team.length > 0 ? partialPlayerData.team : null;

      const basePlayerData = {
        user_id: user.id,
        name: partialPlayerData?.name || 'Nuovo',
        surname: partialPlayerData?.surname || 'Giocatore',
        team: teamValue,
        role_category: roleCategory,
        role: specificRole,
        fmv: partialPlayerData?.fmv || 0,
        cost_percentage: partialPlayerData?.costPercentage || 0,
        goals: partialPlayerData?.goals || 0,
        assists: partialPlayerData?.assists || 0,
        malus: partialPlayerData?.malus || 0,
        goals_conceded: partialPlayerData?.goalsConceded || 0,
        yellow_cards: partialPlayerData?.yellowCards || 0,
        penalties_saved: partialPlayerData?.penaltiesSaved || 0,
        x_g: partialPlayerData?.xG || 0,
        x_a: partialPlayerData?.xA || 0,
        x_p: partialPlayerData?.xP || 0,
        ownership: partialPlayerData?.ownership || 0,
        plus_categories: partialPlayerData?.plusCategories || [],
        tier: partialPlayerData?.tier || '',
        is_favorite: partialPlayerData?.isFavorite || false
      };

      const { error } = await supabase
        .from('players')
        .insert([basePlayerData]);

      if (error) {
        console.error('Errore nell\'aggiungere il giocatore:', error);
        toast.error('Errore nell\'aggiungere il giocatore: ' + error.message);
        return;
      }

      toast.success(partialPlayerData?.name ? 
        `${partialPlayerData.name} ${partialPlayerData.surname} aggiunto con successo!` : 
        'Nuovo giocatore aggiunto con successo!'
      );
      
      queryClient.invalidateQueries({ queryKey: ['players'] });
    } catch (error) {
      console.error('Errore nell\'aggiungere il giocatore:', error);
      toast.error('Errore nell\'aggiungere il giocatore');
    }
  };

  const updatePlayer = async (updatedPlayer: Player) => {
    if (!user) {
      toast.error('Devi essere autenticato per modificare giocatori');
      return;
    }

    try {
      // Handle team properly - convert empty string to null
      const teamValue = updatedPlayer.team && updatedPlayer.team.length > 0 ? updatedPlayer.team : null;

      const { error } = await supabase
        .from('players')
        .update({
          name: updatedPlayer.name,
          surname: updatedPlayer.surname,
          team: teamValue,
          role: updatedPlayer.role,
          role_category: updatedPlayer.roleCategory,
          fmv: updatedPlayer.fmv,
          cost_percentage: updatedPlayer.costPercentage,
          goals: updatedPlayer.goals,
          assists: updatedPlayer.assists,
          malus: updatedPlayer.malus,
          goals_conceded: updatedPlayer.goalsConceded,
          yellow_cards: updatedPlayer.yellowCards,
          penalties_saved: updatedPlayer.penaltiesSaved,
          x_g: updatedPlayer.xG,
          x_a: updatedPlayer.xA,
          x_p: updatedPlayer.xP,
          ownership: updatedPlayer.ownership,
          plus_categories: updatedPlayer.plusCategories,
          tier: updatedPlayer.tier,
          is_favorite: updatedPlayer.isFavorite,
          updated_at: new Date().toISOString()
        })
        .eq('id', updatedPlayer.id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Errore nell\'aggiornare il giocatore:', error);
        toast.error('Errore nell\'aggiornare il giocatore: ' + error.message);
        return;
      }

      toast.success('Giocatore aggiornato con successo!');
      queryClient.invalidateQueries({ queryKey: ['players'] });
    } catch (error) {
      console.error('Errore nell\'aggiornare il giocatore:', error);
      toast.error('Errore nell\'aggiornare il giocatore');
    }
  };

  const deletePlayer = async (playerId: string) => {
    if (!user) {
      toast.error('Devi essere autenticato per eliminare giocatori');
      return;
    }

    try {
      const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', playerId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Errore nell\'eliminare il giocatore:', error);
        toast.error('Errore nell\'eliminare il giocatore: ' + error.message);
        return;
      }

      toast.success('Giocatore eliminato con successo!');
      queryClient.invalidateQueries({ queryKey: ['players'] });
    } catch (error) {
      console.error('Errore nell\'eliminare il giocatore:', error);
      toast.error('Errore nell\'eliminare il giocatore');
    }
  };

  return {
    players: filteredPlayers,
    isLoading,
    error,
    addPlayer,
    updatePlayer,
    deletePlayer,
    calculateBonusTotal
  };
};
