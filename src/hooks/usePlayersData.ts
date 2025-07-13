
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Player, PlayerRole, Team } from '@/types/Player';
import { useAuth } from '@/contexts/AuthContext';

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

export const usePlayersData = (filters?: {
  showFavoritesOnly?: boolean;
  searchTerm?: string;
  selectedTeams?: string[];
  selectedTiers?: string[];
  selectedPlusCategories?: string[];
}) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['players', user?.id, filters],
    queryFn: async () => {
      if (!user) return [];
      
      console.log('Fetching players for user:', user.id);
      
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
        query = query.in('team', filters.selectedTeams as Team[]);
      }

      if (filters?.selectedTiers && filters.selectedTiers.length > 0) {
        query = query.in('tier', filters.selectedTiers);
      }

      // Ordina per created_at decrescente per mostrare i nuovi giocatori in cima
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching players:', error);
        throw error;
      }

      console.log('Raw players data from DB:', data);

      let filteredData = data.map(convertDbPlayerToPlayer);

      // Filter by plus categories (client-side because of array handling)
      if (filters?.selectedPlusCategories && filters.selectedPlusCategories.length > 0) {
        filteredData = filteredData.filter(player => 
          filters.selectedPlusCategories!.some(category => 
            player.plusCategories.includes(category as any)
          )
        );
      }

      console.log('Processed players data:', filteredData);

      return filteredData;
    },
    enabled: !!user,
  });
};
