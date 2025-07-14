
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Player, PlayerTier } from '@/types/Player';

// Helper function to validate if a string is a valid PlayerTier
const isValidPlayerTier = (tier: string | null): tier is PlayerTier => {
  if (!tier) return false;
  
  const validTiers: PlayerTier[] = [
    '1ª fascia', '2ª fascia', '3ª fascia', '4ª fascia', '5ª fascia', '6ª fascia', '7ª fascia', '8ª fascia'
  ];
  
  return validTiers.includes(tier as PlayerTier);
};

export const usePlayersData = (includeCSVPlayers: boolean = false) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['players', user?.id, includeCSVPlayers],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from('players')
        .select('*')
        .eq('user_id', user.id);

      // Per default, ESCLUDI i giocatori CSV dal database
      // Solo il Real Time Builder può includere tutti i giocatori
      if (!includeCSVPlayers) {
        // Esclude i giocatori con tier 'CSV' - questi sono solo per Real Time Builder
        query = query.neq('tier', 'CSV');
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching players:', error);
        throw error;
      }

      const players: Player[] = data.map(player => ({
        id: player.id,
        name: player.name,
        surname: player.surname,
        team: player.team,
        roleCategory: player.role_category,
        role: player.role,
        tier: isValidPlayerTier(player.tier) ? player.tier : '',
        costPercentage: player.cost_percentage || 0,
        fmv: player.fmv || 0,
        goals: player.goals || 0,
        assists: player.assists || 0,
        malus: player.malus || 0,
        goalsConceded: player.goals_conceded || 0,
        yellowCards: player.yellow_cards || 0,
        penaltiesSaved: player.penalties_saved || 0,
        xG: player.x_g || 0,
        xA: player.x_a || 0,
        xP: player.x_p || 0,
        ownership: player.ownership || 0,
        plusCategories: player.plus_categories || [],
        isFavorite: player.is_favorite || false
      }));

      console.log('🎯 Players loaded:', players.length, 'includeCSVPlayers:', includeCSVPlayers);
      
      return players;
    },
    enabled: !!user,
  });
};
