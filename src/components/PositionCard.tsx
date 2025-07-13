
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
      className={`p-4 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 min-h-[200px] flex flex-col backdrop-blur-sm border-0 ${
        player 
          ? 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 shadow-lg ring-1 ring-emerald-200/50' 
          : 'bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50 hover:via-indigo-50 hover:to-blue-100'
      }`}
      onClick={() => onPositionClick(slot, role)}
    >
      <div className="text-center flex-1">
        <div className="text-sm font-bold text-gray-700 mb-3 px-3 py-1 bg-white/70 rounded-full shadow-sm">
          {label}
        </div>
        
        {player ? (
          <div className="space-y-3 h-full flex flex-col">
            <div className="bg-white/60 rounded-xl p-3 shadow-sm">
              <div className="font-bold text-sm flex items-center justify-center gap-2 text-gray-800">
                {player.name} {player.surname}
                {player.isFavorite && (
                  <span className="text-yellow-500 text-base drop-shadow-sm">⭐</span>
                )}
              </div>
              <div className="text-xs text-gray-600 font-medium mt-1">{player.team}</div>
            </div>
            
            <div className="space-y-2 flex-1 bg-white/40 rounded-xl p-3 shadow-sm">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-gray-600">Budget:</span>
                <div className="flex items-center gap-1">
                  {editingPercentage === player.id ? (
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        value={tempPercentage}
                        onChange={(e) => setTempPercentage(e.target.value)}
                        className="w-12 h-6 text-xs p-1 rounded-lg border-gray-300"
                        min="0"
                        max="100"
                        step="0.1"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 hover:bg-green-100 rounded-lg"
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
                        className="h-6 w-6 p-0 hover:bg-red-100 rounded-lg"
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
                      <span className="font-bold text-blue-600">{player.costPercentage}%</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-5 w-5 p-0 hover:bg-blue-100 rounded-lg"
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
                <span className="font-bold text-purple-600">{player.fmv}M</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="font-medium text-gray-600">Tier:</span>
                <Badge variant="secondary" className="text-xs h-5 bg-gray-200/80 text-gray-700">
                  {player.tier}
                </Badge>
              </div>
              {player.roleCategory !== 'Portiere' && (
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-gray-600">Bonus:</span>
                  <span className={`font-bold text-sm ${bonusTotal < 0 ? 'text-red-500' : 'text-emerald-600'}`}>
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
              className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200 rounded-xl shadow-sm font-medium mt-auto"
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
            <div className="bg-white/60 rounded-full p-4 shadow-lg mb-3">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <div className="text-sm text-gray-500 font-medium">Seleziona giocatore</div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default PositionCard;
