
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
      className={`p-2 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 min-h-[120px] flex flex-col backdrop-blur-sm border-0 relative group ${
        player 
          ? 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 shadow-md ring-1 ring-emerald-200/50' 
          : 'bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50 hover:via-indigo-50 hover:to-blue-100'
      }`}
      onClick={() => onPositionClick(slot, role)}
    >
      <div className="h-full flex flex-col">
        <div className="text-xs font-bold text-gray-700 mb-1 px-2 py-1 bg-white/70 rounded-lg shadow-sm text-center">
          {label}
        </div>
        
        {player ? (
          <>
            {/* Bottone X in alto a destra */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
              onClick={(e) => {
                e.stopPropagation();
                if (selection) onRemovePlayer(selection.id);
              }}
            >
              <X className="w-3 h-3" />
            </Button>

            <div className="space-y-1 flex-1 flex flex-col">
              <div className="bg-white/60 rounded-lg p-2 shadow-sm">
                <div className="font-bold text-base flex items-center justify-center gap-1 text-gray-800">
                  {player.name} {player.surname}
                  {player.isFavorite && (
                    <span className="text-yellow-500 text-sm drop-shadow-sm">⭐</span>
                  )}
                </div>
                <div className="text-xs text-gray-600 font-medium text-center">{player.team}</div>
                
                {/* Fascia spostata sotto la squadra */}
                <div className="flex justify-center mt-1">
                  <Badge variant="secondary" className="text-xs h-4 bg-gray-200/80 text-gray-700">
                    {player.tier}
                  </Badge>
                </div>
                
                {/* FMV e Budget distribuiti meglio orizzontalmente */}
                <div className="flex justify-between items-center gap-2 mt-1 pt-1 border-t border-gray-200/50">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-medium text-gray-600">FMV:</span>
                    <span className="font-bold text-purple-600 text-xs">{player.fmv}M</span>
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
                            className="w-12 h-5 text-xs p-1 rounded-md border-gray-300"
                            min="0"
                            max="100"
                            step="0.1"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-5 w-5 p-0 hover:bg-green-100 rounded-md"
                            onClick={(e) => handleSavePercentage(player, e)}
                          >
                            <Check className="h-2 w-2 text-green-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-5 w-5 p-0 hover:bg-red-100 rounded-md"
                            onClick={handleCancelEdit}
                          >
                            <X className="h-2 w-2 text-red-500" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div 
                            className="font-bold text-blue-600 cursor-pointer hover:text-blue-700 transition-colors px-1 py-0.5 rounded bg-blue-50 border border-blue-200 text-xs"
                            onClick={(e) => toggleBudgetBreakdown(player.id, e)}
                          >
                            {player.costPercentage}%
                          </div>
                          {showBudgetBreakdown === player.id && (
                            <div className="flex items-center gap-1 ml-1 animate-slide-in-right" onClick={handleBudgetSectionClick}>
                               <div className="flex items-center gap-0.5 text-xs bg-green-50 px-1 py-0.5 rounded border border-green-200 shadow-sm">
                                 <span className="text-green-600 font-medium text-xs">300:</span>
                                 <span className="text-green-700 font-bold text-xs">{calculateCreditBreakdown(player.costPercentage).credits300}</span>
                               </div>
                               <div className="flex items-center gap-0.5 text-xs bg-amber-50 px-1 py-0.5 rounded border border-amber-200 shadow-sm">
                                 <span className="text-amber-600 font-medium text-xs">500:</span>
                                 <span className="text-amber-700 font-bold text-xs">{calculateCreditBreakdown(player.costPercentage).credits500}</span>
                               </div>
                               <div className="flex items-center gap-0.5 text-xs bg-red-50 px-1 py-0.5 rounded border border-red-200 shadow-sm">
                                 <span className="text-red-600 font-medium text-xs">650:</span>
                                 <span className="text-green-700 font-bold text-xs">{calculateCreditBreakdown(player.costPercentage).credits650}</span>
                               </div>
                            </div>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-4 w-4 p-0 hover:bg-blue-100 rounded-md ml-1"
                            onClick={(e) => handleEditPercentage(player, e)}
                          >
                            <Edit2 className="h-2 w-2 text-blue-500" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Sezioni tutte in orizzontale - layout ultra compatto */}
              <div className="grid grid-cols-4 gap-1 flex-1">
                {/* Statistiche */}
                <div className="bg-white/40 rounded-md p-1">
                  <div className="text-xs font-bold text-gray-700 mb-1 text-center">Stats</div>
                  <div className="space-y-0.5">
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
                        <span className="text-gray-600">Bonus tot:</span>
                        <span className={`font-bold ${bonusTotal < 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                          {bonusTotal > 0 ? '+' : ''}{bonusTotal.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Expected */}
                <div className="bg-white/40 rounded-md p-1">
                  <div className="text-xs font-bold text-gray-700 mb-1 text-center">Exp</div>
                  <div className="space-y-0.5">
                    {player.roleCategory === 'Portiere' ? (
                      <>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Sub:</span>
                          <span className="font-semibold text-orange-600">{player.goalsConceded || 0}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">xP:</span>
                          <span className="font-semibold text-indigo-600">{(player.xP || 0).toFixed(1)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Rig:</span>
                          <span className="font-semibold text-purple-600">{player.penaltiesSaved || 0}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">xG:</span>
                          <span className="font-semibold text-green-600">{(player.xG || 0).toFixed(1)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">xA:</span>
                          <span className="font-semibold text-blue-600">{(player.xA || 0).toFixed(1)}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Titolarità con colori aggiornati */}
                <div className="bg-white/40 rounded-md p-1">
                  <div className="text-xs font-bold text-gray-700 mb-1 text-center">Titolarità</div>
                  <div className="space-y-0.5">
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mb-0.5">
                      <div 
                        className={`h-1.5 rounded-full transition-all duration-300 ${getOwnershipColor(player.ownership)}`}
                        style={{ width: `${player.ownership}%` }}
                      ></div>
                    </div>
                    <div className="text-center">
                      <span className={`font-bold text-xs ${getOwnershipTextColor(player.ownership)}`}>{player.ownership}%</span>
                    </div>
                  </div>
                </div>

                {/* Categoria Plus - tutte le categorie in verticale */}
                <div className="bg-white/40 rounded-md p-1">
                  <div className="text-xs font-bold text-gray-700 mb-1 text-center">Plus</div>
                  <div className="space-y-0.5">
                    {player.plusCategories && player.plusCategories.length > 0 ? (
                      <div className="flex flex-col gap-0.5">
                        {player.plusCategories.map((category, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary" 
                            className="text-xs bg-blue-100 text-blue-700 px-1 py-0 h-auto text-xs text-center"
                          >
                            {category.length > 6 ? category.substring(0, 6) + '...' : category}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center">
                        <span className="text-xs text-gray-500">-</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="py-4 flex-1 flex flex-col items-center justify-center">
            <div className="bg-white/60 rounded-full p-3 shadow-lg mb-2">
              <Plus className="w-6 h-6 text-gray-400" />
            </div>
            <div className="text-xs text-gray-500 font-medium">Seleziona giocatore</div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default PositionCard;
