
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { Player, PlayerRole } from '@/types/Player';
import { SquadSelection } from '@/hooks/useSquadSelections';

interface SquadGridProps {
  squadSelections: SquadSelection[];
  players: Player[];
  onPositionClick: (slot: number, role: PlayerRole) => void;
  onRemovePlayer: (selectionId: string) => void;
}

const SquadGrid: React.FC<SquadGridProps> = ({
  squadSelections,
  players,
  onPositionClick,
  onRemovePlayer
}) => {
  const getPlayerForPosition = (slot: number, role: PlayerRole) => {
    const selection = squadSelections.find(
      s => s.position_slot === slot && s.role_category === role
    );
    if (!selection) return null;
    return players.find(p => p.id === selection.player_id);
  };

  const getSelectionForPosition = (slot: number, role: PlayerRole) => {
    return squadSelections.find(
      s => s.position_slot === slot && s.role_category === role
    );
  };

  const renderPosition = (slot: number, role: PlayerRole, label: string) => {
    const player = getPlayerForPosition(slot, role);
    const selection = getSelectionForPosition(slot, role);
    const bonusTotal = player && player.roleCategory !== 'Portiere' 
      ? player.goals * 3 + player.assists - player.malus 
      : 0;

    return (
      <Card 
        key={`${role}-${slot}`}
        className={`p-3 cursor-pointer transition-all hover:shadow-md ${
          player ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-dashed border-gray-300'
        }`}
        onClick={() => onPositionClick(slot, role)}
      >
        <div className="text-center">
          <div className="text-xs font-medium text-gray-600 mb-1">{label}</div>
          
          {player ? (
            <div className="space-y-2">
              <div>
                <div className="font-semibold text-sm">{player.name} {player.surname}</div>
                <div className="text-xs text-gray-600">{player.team}</div>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Budget:</span>
                  <span className="font-semibold">{player.costPercentage}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Tier:</span>
                  <span>{player.tier}</span>
                </div>
                {player.roleCategory !== 'Portiere' && (
                  <div className="flex justify-between text-xs">
                    <span>Bonus:</span>
                    <span className="font-semibold text-green-600">{bonusTotal}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs">
                  <span>Titolarità:</span>
                  <span>{player.ownership}%</span>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full text-red-600 hover:text-red-700"
                onClick={(e) => {
                  e.stopPropagation();
                  if (selection) onRemovePlayer(selection.id);
                }}
              >
                <X className="w-3 h-3 mr-1" />
                Rimuovi
              </Button>
            </div>
          ) : (
            <div className="py-4">
              <Plus className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <div className="text-xs text-gray-500">Seleziona giocatore</div>
            </div>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Portieri */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          🥅 Portieri (3)
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map(slot => renderPosition(slot, 'Portiere', `P${slot}`))}
        </div>
      </div>

      {/* Difensori */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          🛡️ Difensori (8)
        </h3>
        <div className="grid grid-cols-4 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(slot => renderPosition(slot, 'Difensore', `D${slot}`))}
        </div>
      </div>

      {/* Centrocampisti */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          ⚡ Centrocampisti (8)
        </h3>
        <div className="grid grid-cols-4 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(slot => renderPosition(slot, 'Centrocampista', `C${slot}`))}
        </div>
      </div>

      {/* Attaccanti */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          🎯 Attaccanti (6)
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map(slot => renderPosition(slot, 'Attaccante', `A${slot}`))}
        </div>
      </div>
    </div>
  );
};

export default SquadGrid;
