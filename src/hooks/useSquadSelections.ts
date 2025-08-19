import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { PlayerRole } from '@/types/Player';

export interface SquadSelection {
  id: string;
  user_id: string;
  player_id: string;
  position_slot: number;
  role_category: PlayerRole;
  created_at: string;
  updated_at: string;
}

export interface NewSquadSelection {
  player_id: string;
  position_slot: number;
  role_category: PlayerRole;
}

export const useSquadSelections = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch squad selections from Supabase
  const { data: squadSelections = [], isLoading, error } = useQuery({
    queryKey: ['squadSelections', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('squad_selections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching squad selections:', error);
        throw error;
      }

      return data as SquadSelection[];
    },
    enabled: !!user,
  });

  // Add selection mutation
  const addSelectionMutation = useMutation({
    mutationFn: async (selection: NewSquadSelection) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('squad_selections')
        .insert([{
          ...selection,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      return data as SquadSelection;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['squadSelections', user?.id] });
      toast.success('Giocatore aggiunto alla squadra!');
    },
    onError: (error) => {
      console.error('Error adding squad selection:', error);
      toast.error('Errore nell\'aggiunta del giocatore');
    },
  });

  // Update selection mutation
  const updateSelectionMutation = useMutation({
    mutationFn: async ({ selectionId, playerId }: { selectionId: string; playerId: string }) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('squad_selections')
        .update({ player_id: playerId })
        .eq('id', selectionId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data as SquadSelection;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['squadSelections', user?.id] });
      toast.success('Giocatore sostituito!');
    },
    onError: (error) => {
      console.error('Error updating squad selection:', error);
      toast.error('Errore nella sostituzione del giocatore');
    },
  });

  // Delete selection mutation
  const deleteSelectionMutation = useMutation({
    mutationFn: async (selectionId: string) => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('squad_selections')
        .delete()
        .eq('id', selectionId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['squadSelections', user?.id] });
      toast.success('Giocatore rimosso dalla squadra!');
    },
    onError: (error) => {
      console.error('Error deleting squad selection:', error);
      toast.error('Errore nella rimozione del giocatore');
    },
  });

  // Clear all selections mutation
  const clearAllSelectionsMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('squad_selections')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['squadSelections', user?.id] });
      toast.success('Team Prediction resettata! Tutti i giocatori sono stati rimossi.');
    },
    onError: (error) => {
      console.error('Error clearing all squad selections:', error);
      toast.error('Errore nel reset di Team Prediction');
    },
  });

  const addSelection = (selection: NewSquadSelection) => {
    addSelectionMutation.mutate(selection);
  };

  const updateSelection = (selectionId: string, playerId: string) => {
    updateSelectionMutation.mutate({ selectionId, playerId });
  };

  const deleteSelection = (selectionId: string) => {
    deleteSelectionMutation.mutate(selectionId);
  };

  const clearAllSelections = () => {
    clearAllSelectionsMutation.mutate();
  };

  // Move player between slots mutation
  const movePlayerMutation = useMutation({
    mutationFn: async ({ 
      fromSlot, 
      fromRole, 
      toSlot, 
      toRole 
    }: { 
      fromSlot: number; 
      fromRole: PlayerRole; 
      toSlot: number; 
      toRole: PlayerRole; 
    }) => {
      if (!user) throw new Error('User not authenticated');
      
      // Find the selection to move
      const selectionToMove = squadSelections.find(
        s => s.position_slot === fromSlot && s.role_category === fromRole
      );
      
      if (!selectionToMove) throw new Error('Selection not found');
      
      // Check if target slot is empty
      const targetSlotOccupied = squadSelections.find(
        s => s.position_slot === toSlot && s.role_category === toRole
      );
      
      if (targetSlotOccupied) throw new Error('Target slot is occupied');
      
      // Update the selection with new position
      const { data, error } = await supabase
        .from('squad_selections')
        .update({ 
          position_slot: toSlot,
          role_category: toRole
        })
        .eq('id', selectionToMove.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data as SquadSelection;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['squadSelections', user?.id] });
      toast.success('Giocatore spostato!');
    },
    onError: (error) => {
      console.error('Error moving player:', error);
      toast.error('Errore nello spostamento del giocatore');
    },
  });

  const movePlayer = (fromSlot: number, fromRole: PlayerRole, toSlot: number, toRole: PlayerRole) => {
    movePlayerMutation.mutate({ fromSlot, fromRole, toSlot, toRole });
  };

  return {
    squadSelections,
    isLoading,
    error,
    addSelection,
    updateSelection,
    deleteSelection,
    clearAllSelections,
    movePlayer,
  };
};
