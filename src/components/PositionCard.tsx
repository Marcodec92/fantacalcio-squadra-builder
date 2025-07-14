import React, { useState, useEffect } from 'react';
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
  const [showBudgetBreakdown, setShowBudgetBreakdown] = useState<string | null>(null);
  const { updatePlayer } = usePlayers();

  const bonusTotal = player ? calculateBonusTotal(player) : 0;

  // Funzioni per i colori della titolarità basate sulle stesse regole di OwnershipProgress
  const getOwnershipColor = (percentage: number) => {
    if (percentage <= 40) return 'bg-red-500';
    if (percentage <= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getOwnershipTextColor = (percentage: number) => {
    if (percentage <= 40) return 'text-red-600';
    if (percentage <= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  const handleEditPercentage = (player: Player, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingPercentage(player.id);
    setTempPercentage(player.costPercentage.toString());
  };

  const handleSavePercentage = (player: Player, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newPercentage = parseFloat(tempPercentage);
    if (!isNaN(newPercentage) && newPercentage >= 0 && newPercentage <= 100) {
      const updatedPlayer = { ...player, costPercentage: newPercentage };
      updatePlayer(updatedPlayer);
    }
    setEditingPercentage(null);
    setTempPercentage('');
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingPercentage(null);
    setTempPercentage('');
  };

  const toggleBudgetBreakdown = (playerId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (showBudgetBreakdown === playerId) {
      setShowBudgetBreakdown(null);
    } else {
      setShowBudgetBreakdown(playerId);
    }
  };

  const calculateCreditBreakdown = (costPercentage: number) => {
    return {
      credits300: ((costPercentage / 100) * 300).toFixed(1),
      credits500: ((costPercentage / 100) * 500).toFixed(1), 
      credits650: ((costPercentage / 100) * 650).toFixed(1)
    };
  };

  // Handle clicks on the budget section to prevent propagation
  const handleBudgetSectionClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Card 
      className={`p-4 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 min-h-[320px] flex flex-col backdrop-blur-sm border-0 ${
        player 
          ? 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 shadow-lg ring-1 ring-emerald-200/50' 
          : 'bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50 hover:via-indigo-50 hover:to-blue-100'
      }`}
      onClick={() => onPositionClick(slot, role)}
    >
      <div className="h-full flex flex-col">
        <div className="text-sm font-bold text-gray-700 mb-3 px-3 py-1 bg-white/70 rounded-full shadow-sm text-center">
          {label}
        </div>
        
        {player ? (
          <div className="space-y-3 flex-1 flex flex-col">
            <div className="bg-white/60 rounded-xl p-3 shadow-sm">
              <div className="font-bold text-lg flex items-center justify-center gap-2 text-gray-800">
                {player.name} {player.surname}
                {player.isFavorite && (
                  <span className="text-yellow-500 text-xl drop-shadow-sm">⭐</span>
                )}
              </div>
              <div className="text-sm text-gray-600 font-medium mt-1 text-center">{player.team}</div>
              
              {/* Fascia spostata sotto la squadra */}
              <div className="flex justify-center mt-2">
                <Badge variant="secondary" className="text-xs h-5 bg-gray-200/80 text-gray-700">
                  {player.tier}
                </Badge>
              </div>
              
              {/* FMV e Budget distribuiti meglio orizzontalmente */}
              <div className="flex justify-between items-center gap-3 mt-3 pt-2 border-t border-gray-200/50">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-medium text-gray-600">FMV:</span>
                  <span className="font-bold text-purple-600 text-sm">{player.fmv}M</span>
                </div>
                <div className="flex items-center gap-1" onClick={handleBudgetSectionClick}>
                  <span className="text-xs font-medium text-gray-600">Budget:</span>
                  <div className="flex items-center gap-1">
                    {editingPercentage === player.id ? (
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={tempPercentage}
                          onChange={(e) => setTempPercentage(e.target.value)}
                          className="w-16 h-6 text-xs p-1 rounded-lg border-gray-300"
                          min="0"
                          max="100"
                          step="0.1"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 hover:bg-green-100 rounded-lg"
                          onClick={(e) => handleSavePercentage(player, e)}
                        >
                          <Check className="h-3 w-3 text-green-600" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 hover:bg-red-100 rounded-lg"
                          onClick={handleCancelEdit}
                        >
                          <X className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div 
                          className="font-bold text-blue-600 cursor-pointer hover:text-blue-700 transition-colors px-2 py-1 rounded bg-blue-50 border border-blue-200 text-xs"
                          onClick={(e) => toggleBudgetBreakdown(player.id, e)}
                        >
                          {player.costPercentage}%
                        </div>
                        {showBudgetBreakdown === player.id && (
                          <div className="flex items-center gap-1 ml-1 animate-slide-in-right" onClick={handleBudgetSectionClick}>
                             <div className="flex items-center gap-1 text-xs bg-green-50 px-1 py-0.5 rounded border border-green-200 shadow-sm">
                               <span className="text-green-600 font-medium text-xs">300:</span>
                               <span className="text-green-700 font-bold text-xs">{calculateCreditBreakdown(player.costPercentage).credits300}</span>
                             </div>
                             <div className="flex items-center gap-1 text-xs bg-amber-50 px-1 py-0.5 rounded border border-amber-200 shadow-sm">
                               <span className="text-amber-600 font-medium text-xs">500:</span>
                               <span className="text-amber-700 font-bold text-xs">{calculateCreditBreakdown(player.costPercentage).credits500}</span>
                             </div>
                             <div className="flex items-center gap-1 text-xs bg-red-50 px-1 py-0.5 rounded border border-red-200 shadow-sm">
                               <span className="text-red-600 font-medium text-xs">650:</span>
                               <span className="text-green-700 font-bold text-xs">{calculateCreditBreakdown(player.costPercentage).credits650}</span>
                             </div>
                          </div>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-5 w-5 p-0 hover:bg-blue-100 rounded-lg ml-1"
                          onClick={(e) => handleEditPercentage(player, e)}
                        >
                          <Edit2 className="h-3 w-3 text-blue-500" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sezioni allineate alla stessa altezza - layout migliorato */}
            <div className="grid grid-cols-2 gap-2 flex-1">
              {/* Statistiche */}
              <div className="bg-white/40 rounded-lg p-2">
                <div className="text-xs font-bold text-gray-700 mb-2 text-center">Statistiche</div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Gol:</span>
                    <span className="font-semibold text-green-600">{player.goals || 0}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Assist:</span>
                    <span className="font-semibold text-blue-600">{player.assists || 0}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Malus:</span>
                    <span className="font-semibold text-red-600">{player.malus || 0}</span>
                  </div>
                  {player.roleCategory !== 'Portiere' && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Bonus:</span>
                      <span className={`font-bold ${bonusTotal < 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                        {bonusTotal > 0 ? '+' : ''}{bonusTotal.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Expected */}
              <div className="bg-white/40 rounded-lg p-2">
                <div className="text-xs font-bold text-gray-700 mb-2 text-center">Expected</div>
                <div className="space-y-1">
                  {player.roleCategory === 'Portiere' ? (
                    <>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Subiti:</span>
                        <span className="font-semibold text-orange-600">{player.goalsConceded || 0}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">xP:</span>
                        <span className="font-semibold text-indigo-600">{(player.xP || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Rigori:</span>
                        <span className="font-semibold text-purple-600">{player.penaltiesSaved || 0}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">xG:</span>
                        <span className="font-semibold text-green-600">{(player.xG || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">xA:</span>
                        <span className="font-semibold text-blue-600">{(player.xA || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Amm.:</span>
                        <span className="font-semibold text-yellow-600">{player.yellowCards || 0}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Titolarità con colori aggiornati */}
              <div className="bg-white/40 rounded-lg p-2">
                <div className="text-xs font-bold text-gray-700 mb-2 text-center">Titolarità</div>
                <div className="space-y-1">
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getOwnershipColor(player.ownership)}`}
                      style={{ width: `${player.ownership}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">%:</span>
                    <span className={`font-bold ${getOwnershipTextColor(player.ownership)}`}>{player.ownership}%</span>
                  </div>
                </div>
              </div>

              {/* Categoria Plus */}
              <div className="bg-white/40 rounded-lg p-2">
                <div className="text-xs font-bold text-gray-700 mb-2 text-center">Plus</div>
                <div className="space-y-1">
                  {player.plusCategories && player.plusCategories.length > 0 ? (
                    <div className="flex flex-wrap gap-1 justify-center">
                      {player.plusCategories.slice(0, 2).map((category, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary" 
                          className="text-xs bg-blue-100 text-blue-700 px-1 py-0.5 h-auto"
                        >
                          {category.length > 8 ? category.substring(0, 8) + '...' : category}
                        </Badge>
                      ))}
                      {player.plusCategories.length > 2 && (
                        <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600 px-1 py-0.5 h-auto">
                          +{player.plusCategories.length - 2}
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <div className="text-center">
                      <span className="text-xs text-gray-500">Nessuna</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200 rounded-xl shadow-sm font-medium h-8"
                onClick={(e) => {
                  e.stopPropagation();
                  if (selection) onRemovePlayer(selection.id);
                }}
              >
                <X className="w-4 h-4 mr-2" />
                Rimuovi
              </Button>
            </div>
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
