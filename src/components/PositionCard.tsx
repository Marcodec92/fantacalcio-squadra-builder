
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
  const [isExiting, setIsExiting] = useState<string | null>(null);
  const { updatePlayer } = usePlayers();

  const bonusTotal = player ? calculateBonusTotal(player) : 0;
  
  console.log('PositionCard rendered for player:', player?.name, 'ID:', player?.id);

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

  const toggleBudgetBreakdown = (playerId: string) => {
    console.log('Toggle budget breakdown clicked for player:', playerId);
    console.log('Current showBudgetBreakdown:', showBudgetBreakdown);
    
    if (showBudgetBreakdown === playerId) {
      // Nasconde il breakdown
      setShowBudgetBreakdown(null);
      setIsExiting(null);
    } else {
      // Mostra il breakdown
      setShowBudgetBreakdown(playerId);
      setIsExiting(null);
    }
  };

  const calculateCreditBreakdown = (costPercentage: number) => {
    // Calcola quanti crediti effettivi costa il giocatore su diversi budget totali
    return {
      credits300: ((costPercentage / 100) * 300).toFixed(1),
      credits500: ((costPercentage / 100) * 500).toFixed(1), 
      credits650: ((costPercentage / 100) * 650).toFixed(1)
    };
  };

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const budgetElement = target.closest('[data-action="budget-toggle"]');
      
      if (budgetElement) {
        const playerId = budgetElement.getAttribute('data-player-id');
        if (playerId) {
          console.log('GLOBAL CLICK DETECTED for player:', playerId);
          toggleBudgetBreakdown(playerId);
        }
      }
    };

    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, [showBudgetBreakdown]);

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
          <div className="space-y-3 flex-1 flex flex-col pb-2">
            <div className="bg-white/60 rounded-xl p-3 shadow-sm">
              <div className="font-bold text-lg flex items-center justify-center gap-2 text-gray-800">
                {player.name} {player.surname}
                {player.isFavorite && (
                  <span className="text-yellow-500 text-xl drop-shadow-sm">⭐</span>
                )}
              </div>
              <div className="text-sm text-gray-600 font-medium mt-1 text-center">{player.team}</div>
              
              {/* FMV e Budget orizzontali */}
              <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-200/50">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-medium text-gray-600">FMV:</span>
                  <span className="font-bold text-purple-600 text-sm">{player.fmv}M</span>
                </div>
                <div className="flex items-center gap-1">
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
                      <>
                          <div className="relative inline-block">
                            <span className="font-bold text-blue-600">{player.costPercentage}%</span>
                            <div
                              className="absolute inset-0 cursor-pointer"
                              onClick={() => {
                                console.log('DIRECT CLICK TRIGGERED!', player.id);
                                toggleBudgetBreakdown(player.id);
                              }}
                              title="Clicca per vedere breakdown crediti"
                            />
                          </div>
                         <small className="text-red-500 text-xs">Debug: {showBudgetBreakdown || 'none'}</small>
                        {showBudgetBreakdown === player.id && (
                          <div className="flex items-center gap-2 ml-2 animate-slide-in-right">
                             <div className="flex items-center gap-1 text-xs bg-green-50 px-2 py-1 rounded-lg border border-green-200 shadow-sm">
                               <span className="text-green-600 font-medium">300:</span>
                               <span className="text-green-700 font-bold">{calculateCreditBreakdown(player.costPercentage).credits300}</span>
                             </div>
                             <div className="flex items-center gap-1 text-xs bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 shadow-sm">
                               <span className="text-amber-600 font-medium">500:</span>
                               <span className="text-amber-700 font-bold">{calculateCreditBreakdown(player.costPercentage).credits500}</span>
                             </div>
                             <div className="flex items-center gap-1 text-xs bg-red-50 px-2 py-1 rounded-lg border border-red-200 shadow-sm">
                               <span className="text-red-600 font-medium">650:</span>
                               <span className="text-green-700 font-bold">{calculateCreditBreakdown(player.costPercentage).credits650}</span>
                             </div>
                          </div>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-5 w-5 p-0 hover:bg-blue-100 rounded-lg ml-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditPercentage(player);
                          }}
                        >
                          <Edit2 className="h-3 w-3 text-blue-500" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-auto">
                  <span className="text-xs font-medium text-gray-600">Fascia:</span>
                  <Badge variant="secondary" className="text-xs h-5 bg-gray-200/80 text-gray-700">
                    {player.tier}
                  </Badge>
                </div>
              </div>
            </div>
            
            {/* Sezioni allineate alla stessa altezza - tutte e 4 insieme */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              {/* Statistiche */}
              <div className="bg-white/40 rounded-xl p-3 shadow-sm">
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
              <div className="bg-white/40 rounded-xl p-3 shadow-sm">
                <div className="text-xs font-bold text-gray-700 mb-2 text-center">Expected</div>
                <div className="space-y-1">
                  {player.roleCategory === 'Portiere' ? (
                    <>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Gol subiti:</span>
                        <span className="font-semibold text-orange-600">{player.goalsConceded || 0}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">xP:</span>
                        <span className="font-semibold text-indigo-600">{(player.xP || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Rigori parati:</span>
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
                        <span className="text-gray-600">Ammonizioni:</span>
                        <span className="font-semibold text-yellow-600">{player.yellowCards || 0}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Titolarità */}
              <div className="bg-white/40 rounded-xl p-3 shadow-sm">
                <div className="text-xs font-bold text-gray-700 mb-2 text-center">Titolarità</div>
                <div className="space-y-1">
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                    <div 
                      className="bg-gradient-to-r from-amber-400 to-amber-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${player.ownership}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Percentuale:</span>
                    <span className="font-bold text-amber-600">{player.ownership}%</span>
                  </div>
                </div>
              </div>

              {/* Categoria Plus */}
              <div className="bg-white/40 rounded-xl p-3 shadow-sm">
                <div className="text-xs font-bold text-gray-700 mb-2 text-center">Plus</div>
                <div className="space-y-1">
                  {player.plusCategories && player.plusCategories.length > 0 ? (
                    <div className="flex flex-wrap gap-1 justify-center">
                      {player.plusCategories.map((category, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary" 
                          className="text-xs bg-blue-100 text-blue-700 px-2 py-1"
                        >
                          {category}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Categorie:</span>
                      <span className="text-xs text-gray-500">Nessuna</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Tasto Rimuovi posizionato sotto titolarità con distanza corretta */}
            <div className="mt-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200 rounded-xl shadow-sm font-medium"
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
