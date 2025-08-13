
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PlayerRole } from '@/types/Player';
import { RealTimeSelection } from '@/pages/RealTimeBuilder';

export const useRealTimeSelections = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const saveSelection = async (selection: RealTimeSelection) => {
    if (!user || !selection.player) return;

    try {
      setLoading(true);
      
        // Cerca il giocatore nel database per ottenere la percentuale di budget
        const { data: dbPlayer } = await supabase
          .from('players')
          .select('cost_percentage')
          .eq('user_id', user.id)
          .eq('name', selection.player.name || '')
          .eq('surname', selection.player.surname)
          .eq('team', selection.player.team as any)
          .eq('role_category', selection.role_category as any)
          .single();

        const { error } = await supabase
          .from('realtime_selections')
          .upsert({
            user_id: user.id,
            position_slot: selection.position_slot,
            role_category: selection.role_category,
            player_name: selection.player.name,
            player_surname: selection.player.surname,
            player_team: selection.player.team,
            credits: selection.player.credits,
            cost_percentage: dbPlayer?.cost_percentage || 0
          }, {
            onConflict: 'user_id,position_slot,role_category'
          });

      if (error) {
        console.error('Errore nel salvataggio selezione:', error);
        toast.error('Errore nel salvataggio della selezione');
        return;
      }

      console.log('✅ Selezione salvata nel database');
    } catch (error) {
      console.error('Errore nel salvataggio selezione:', error);
      toast.error('Errore nel salvataggio della selezione');
    } finally {
      setLoading(false);
    }
  };

  const loadSelections = async (): Promise<RealTimeSelection[]> => {
    if (!user) return [];

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('realtime_selections')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Errore nel caricamento selezioni:', error);
        return [];
      }

      if (!data) return [];

      const selections: RealTimeSelection[] = data.map(selection => ({
        id: `${selection.role_category}-${selection.position_slot}`,
        position_slot: selection.position_slot,
        role_category: selection.role_category,
        player: {
          id: selection.id,
          name: selection.player_name,
          surname: selection.player_surname,
          team: selection.player_team || '',
          role: selection.role_category,
          credits: selection.credits,
          costPercentage: selection.cost_percentage || 0
        } as any
      }));

      console.log('📥 Selezioni caricate dal database:', selections.length);
      return selections;
    } catch (error) {
      console.error('Errore nel caricamento selezioni:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const removeSelection = async (slot: number, role: PlayerRole) => {
    if (!user) return;

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('realtime_selections')
        .delete()
        .eq('user_id', user.id)
        .eq('position_slot', slot)
        .eq('role_category', role);

      if (error) {
        console.error('Errore nella rimozione selezione:', error);
        toast.error('Errore nella rimozione della selezione');
        return;
      }

      console.log('🗑️ Selezione rimossa dal database');
    } catch (error) {
      console.error('Errore nella rimozione selezione:', error);
      toast.error('Errore nella rimozione della selezione');
    } finally {
      setLoading(false);
    }
  };

  const clearAllSelections = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('realtime_selections')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Errore nella cancellazione selezioni:', error);
        toast.error('Errore nella cancellazione delle selezioni');
        return;
      }

      console.log('🗑️ Tutte le selezioni cancellate dal database');
      toast.success('Tutte le selezioni sono state cancellate');
    } catch (error) {
      console.error('Errore nella cancellazione selezioni:', error);
      toast.error('Errore nella cancellazione delle selezioni');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    saveSelection,
    loadSelections,
    removeSelection,
    clearAllSelections
  };
};
