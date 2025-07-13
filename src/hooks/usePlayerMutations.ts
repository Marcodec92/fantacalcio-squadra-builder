
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Player, PlayerRole, SpecificRole } from '@/types/Player';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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

export const usePlayerMutations = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const addPlayerMutation = useMutation({
    mutationFn: async (role: PlayerRole) => {
      if (!user) throw new Error('User not authenticated');
      
      console.log('Adding new player with role:', role);
      
      const playerId = crypto.randomUUID();
      
      // Map PlayerRole to SpecificRole with proper typing
      const getSpecificRole = (roleCategory: PlayerRole): SpecificRole => {
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
      
      const dbPlayerData = {
        id: playerId,
        user_id: user.id,
        name: 'Nuovo',
        surname: 'Giocatore',
        team: null,
        role: getSpecificRole(role),
        role_category: role,
        cost_percentage: 0,
        fmv: 0,
        tier: '',
        goals: 0,
        assists: 0,
        malus: 0,
        goals_conceded: 0,
        yellow_cards: 0,
        penalties_saved: 0,
        x_g: 0,
        x_a: 0,
        x_p: 0,
        ownership: 0,
        plus_categories: [],
        is_favorite: false
      };
      
      console.log('Inserting player data:', dbPlayerData);
      
      const { data, error } = await supabase
        .from('players')
        .insert(dbPlayerData)
        .select()
        .single();

      if (error) {
        console.error('Error inserting player:', error);
        throw error;
      }
      
      console.log('Player inserted successfully:', data);
      return convertDbPlayerToPlayer(data);
    },
    onSuccess: (newPlayer) => {
      console.log('Player added successfully:', newPlayer);
      queryClient.invalidateQueries({ queryKey: ['players', user?.id] });
      toast.success('Nuovo giocatore aggiunto! Puoi modificarlo direttamente nella lista.');
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

  return {
    addPlayerMutation,
    updatePlayerMutation,
    deletePlayerMutation,
  };
};
