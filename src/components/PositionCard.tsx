
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Edit2, Check } from "lucide-react";
import { Player, PlayerRole } from '@/types/Player';
import { SquadSelection } from '@/hooks/useSquadSelections';
import { usePlayers } from '@/hooks/usePlayers';

interface PositionCardProps {
  slot: number;
  role: PlayerRole;
  label: string;
  player: Player | null;
  selection: SquadSelection | null;
  onPositionClick: (slot: number, role: PlayerRole) => void;
  onRemovePlayer: (selectionId: string) => void;
  calculateBonusTotal: (player: Player) => number;
}

const PositionCard: React.FC<PositionCardProps> = ({
  slot,
  role,
  label,
  player,
  selection,
  onPositionClick,
  onRemovePlayer,
  calculateBonusTotal
}) => {
  const [editingPercentage, setEditingPercentage] = useState<string | null>(null);
  const [tempPercentage, setTempPercentage] = useState<string>('');
  const { updatePlayer } = usePlayers();

  const bonusTotal = player ? calculateBonusTotal(player) : 0;

  const handleEditPercentage = (player: Player) => {
    setEditingPercentage(player.id);
    setTempPercentage(player.costPercentage.toString());
  };

  const handleSavePercentage = (player: Player) => {
    const newPercentage = parseFloat(tempPercentage);
    if (!isNaN(newPercentage) && newPercentage >= 0 && newPercentage <= 100) {
      const updatedPlayer = { ...player, costPercentage: newPercentage };
      updatePlayer(updatedPlayer);
    }
    setEditingPercentage(null);
    setTempPercentage('');
  };

  const handleCancelEdit = () => {
    setEditingPercentage(null);
    setTempPercentage('');
  };

  return (
    <Card 
      className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md min-h-[180px] flex flex-col border ${
        player 
          ? 'bg-white border-gray-200 shadow-sm' 
          : 'bg-gray-50 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50'
      }`}
      onClick={() => onPositionClick(slot, role)}
    >
      <div className="text-center flex-1">
        <div className="text-xs font-semibold text-gray-700 mb-3 px-2 py-1 bg-gray-100 rounded-md">
          {label}
        </div>
        
        {player ? (
          <div className="space-y-3 h-full flex flex-col">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="font-semibold text-sm flex items-center justify-center gap-2 text-gray-900">
                {player.name} {player.surname}
                {player.isFavorite && (
                  <span className="text-yellow-500 text-base">⭐</span>
                )}
              </div>
              <div className="text-xs text-gray-600 font-medium mt-1">{player.team}</div>
            </div>
            
            <div className="space-y-2 flex-1 bg-white rounded-lg p-3 border border-gray-100">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-gray-600">Budget:</span>
                <div className="flex items-center gap-1">
                  {editingPercentage === player.id ? (
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        value={tempPercentage}
                        onChange={(e) => setTempPercentage(e.target.value)}
                        className="w-12 h-5 text-xs p-1 rounded border-gray-300"
                        min="0"
                        max="100"
                        step="0.1"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-5 w-5 p-0 hover:bg-green-100 rounded"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSavePercentage(player);
                        }}
                      >
                        <Check className="h-3 w-3 text-green-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-5 w-5 p-0 hover:bg-red-100 rounded"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelEdit();
                        }}
                      >
                        <X className="h-3 w-3 text-red-500" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-blue-600">{player.costPercentage}%</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-4 w-4 p-0 hover:bg-blue-100 rounded"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditPercentage(player);
                        }}
                      >
                        <Edit2 className="h-3 w-3 text-blue-500" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-between text-xs">
                <span className="font-medium text-gray-600">FMV:</span>
                <span className="font-semibold text-purple-600">{player.fmv}M</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="font-medium text-gray-600">Tier:</span>
                <Badge variant="secondary" className="text-xs h-4 bg-gray-100 text-gray-700 border-gray-200">
                  {player.tier}
                </Badge>
              </div>
              {player.roleCategory !== 'Portiere' && (
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-gray-600">Bonus:</span>
                  <span className={`font-semibold text-sm ${bonusTotal < 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                    {bonusTotal > 0 ? '+' : ''}{bonusTotal.toFixed(1)}
                  </span>
                </div>
              )}
              {player.roleCategory === 'Portiere' && (
                <>
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-gray-600">Gol subiti:</span>
                    <span className="font-semibold text-orange-600">{player.goalsConceded}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-gray-600">xP:</span>
                    <span className="font-semibold text-indigo-600">{player.xP.toFixed(2)}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between text-xs">
                <span className="font-medium text-gray-600">Titolarità:</span>
                <span className="font-semibold text-cyan-600">{player.ownership}%</span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200 rounded-lg font-medium mt-auto"
              onClick={(e) => {
                e.stopPropagation();
                if (selection) onRemovePlayer(selection.id);
              }}
            >
              <X className="w-4 h-4 mr-2" />
              Rimuovi
            </Button>
          </div>
        ) : (
          <div className="py-8 flex-1 flex flex-col items-center justify-center">
            <div className="bg-white rounded-full p-4 shadow-sm mb-3 border border-gray-200">
              <Plus className="w-6 h-6 text-gray-400" />
            </div>
            <div className="text-sm text-gray-500 font-medium">Seleziona giocatore</div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default PositionCard;
