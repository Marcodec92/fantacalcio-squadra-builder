import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useRealTimeSelections } from '@/hooks/useRealTimeSelections';
import { RealTimeSelection } from '@/pages/RealTimeBuilder';
import { PlayerRole } from '@/types/Player';

interface FormationConfig {
  name: string;
  defenders: number;
  midfielders: number;
  forwards: number;
}

const formations: FormationConfig[] = [
  { name: "3-4-3", defenders: 3, midfielders: 4, forwards: 3 },
  { name: "4-3-3", defenders: 4, midfielders: 3, forwards: 3 },
  { name: "3-5-2", defenders: 3, midfielders: 5, forwards: 2 },
  { name: "5-4-1", defenders: 5, midfielders: 4, forwards: 1 },
  { name: "4-5-1", defenders: 4, midfielders: 5, forwards: 1 },
  { name: "5-3-2", defenders: 5, midfielders: 3, forwards: 2 }
];

interface LineupPlayer {
  id: string;
  name: string;
  surname: string;
  team: string;
  role: PlayerRole;
  credits: number;
}

interface FieldPosition {
  role: PlayerRole;
  index: number;
  player?: LineupPlayer;
}

const Formation = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedFormation, setSelectedFormation] = useState<FormationConfig>(formations[0]);
  const [lineupPlayers, setLineupPlayers] = useState<FieldPosition[]>([]);
  const [benchPlayers, setBenchPlayers] = useState<LineupPlayer[]>([]);
  const [selections, setSelections] = useState<RealTimeSelection[]>([]);
  const { loadSelections } = useRealTimeSelections();

  useEffect(() => {
    const loadData = async () => {
      const savedSelections = await loadSelections();
      setSelections(savedSelections);
      
      // Converti le selezioni in giocatori
      const players: LineupPlayer[] = savedSelections
        .filter(s => s.player)
        .map(s => ({
          id: s.player!.id,
          name: s.player!.name,
          surname: s.player!.surname,
          team: s.player!.team,
          role: s.player!.role,
          credits: s.player!.credits
        }));
      
      initializeFormation(selectedFormation, players);
    };
    
    loadData();
  }, []);

  const initializeFormation = (formation: FormationConfig, allPlayers: LineupPlayer[]) => {
    const positions: FieldPosition[] = [];
    
    // Portiere (sempre 1)
    positions.push({ role: "Portiere", index: 0 });
    
    // Difensori
    for (let i = 0; i < formation.defenders; i++) {
      positions.push({ role: "Difensore", index: i });
    }
    
    // Centrocampisti  
    for (let i = 0; i < formation.midfielders; i++) {
      positions.push({ role: "Centrocampista", index: i });
    }
    
    // Attaccanti
    for (let i = 0; i < formation.forwards; i++) {
      positions.push({ role: "Attaccante", index: i });
    }

    // Lascia tutti gli slot vuoti - l'utente sceglierà manualmente
    setLineupPlayers(positions);
    
    // Tutti i giocatori vanno in panchina inizialmente
    setBenchPlayers(allPlayers);
  };

  const handleFormationChange = (formationName: string) => {
    const formation = formations.find(f => f.name === formationName)!;
    setSelectedFormation(formation);
    
    // Raccogli tutti i giocatori (titolari + panchina)
    const allPlayers: LineupPlayer[] = [
      ...lineupPlayers.filter(p => p.player).map(p => p.player!),
      ...benchPlayers
    ];
    
    initializeFormation(formation, allPlayers);
  };

  const handleSlotClick = (positionIndex: number) => {
    // Se lo slot ha già un giocatore, rimuovilo e rimettilo in panchina
    const currentPlayer = lineupPlayers[positionIndex].player;
    if (currentPlayer) {
      const newLineup = [...lineupPlayers];
      newLineup[positionIndex] = { ...newLineup[positionIndex], player: undefined };
      setLineupPlayers(newLineup);
      
      // Inserisci il giocatore nella panchina mantenendo l'ordine gerarchico
      const newBench = [...benchPlayers, currentPlayer];
      const sortedBench = newBench.sort((a, b) => {
        const roleOrder = { "Portiere": 0, "Difensore": 1, "Centrocampista": 2, "Attaccante": 3 };
        return roleOrder[a.role] - roleOrder[b.role];
      });
      setBenchPlayers(sortedBench);
    }
  };

  const handleDragStart = (e: React.DragEvent, player: LineupPlayer, fromBench: boolean, benchIndex?: number) => {
    e.dataTransfer.setData('player', JSON.stringify(player));
    e.dataTransfer.setData('fromBench', fromBench.toString());
    if (benchIndex !== undefined) {
      e.dataTransfer.setData('benchIndex', benchIndex.toString());
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetSlotIndex: number) => {
    e.preventDefault();
    
    const playerData = e.dataTransfer.getData('player');
    const fromBench = e.dataTransfer.getData('fromBench') === 'true';
    const benchIndex = parseInt(e.dataTransfer.getData('benchIndex'));
    
    if (!playerData) return;
    
    const draggedPlayer: LineupPlayer = JSON.parse(playerData);
    const targetSlot = lineupPlayers[targetSlotIndex];
    
    // Verifica che i ruoli corrispondano
    if (draggedPlayer.role !== targetSlot.role) {
      return;
    }
    
    // Se lo slot è già occupato, non fare nulla
    if (targetSlot.player) {
      return;
    }
    
    if (fromBench) {
      // Sposta dalla panchina al campo
      const newLineup = [...lineupPlayers];
      newLineup[targetSlotIndex] = { ...newLineup[targetSlotIndex], player: draggedPlayer };
      setLineupPlayers(newLineup);
      
      // Rimuovi dalla panchina
      const newBench = benchPlayers.filter((_, index) => index !== benchIndex);
      setBenchPlayers(newBench);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
        <div className="floating-orb"></div>
        <div className="floating-orb"></div>
        <div className="floating-orb"></div>
        
        <div className="glass-card p-12 text-center max-w-md w-full fade-in-scale">
          <div className="w-20 h-20 mx-auto mb-8 gradient-accent rounded-3xl flex items-center justify-center pulse-glow">
            <span className="text-3xl">🔒</span>
          </div>
          <h2 className="text-3xl font-bold mb-6 text-gradient-secondary">Accesso richiesto</h2>
          <p className="text-muted-foreground text-lg">Devi effettuare l'accesso per utilizzare la formazione</p>
        </div>
      </div>
    );
  }

  const roleGroups = {
    Portiere: lineupPlayers.filter(p => p.role === "Portiere"),
    Difensore: lineupPlayers.filter(p => p.role === "Difensore"),
    Centrocampista: lineupPlayers.filter(p => p.role === "Centrocampista"),
    Attaccante: lineupPlayers.filter(p => p.role === "Attaccante")
  };

  return (
    <div className="min-h-screen relative overflow-hidden p-2 sm:p-4">
      <div className="floating-orb"></div>
      <div className="floating-orb"></div>
      <div className="floating-orb"></div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="glass-card mb-4 sm:mb-8 p-4 sm:p-8 shadow-2xl slide-in-up">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/fanta-team')}
              className="glass-button border-white/20 hover:border-white/30 font-medium px-4 sm:px-6 py-2 sm:py-3 slide-in-left text-xs sm:text-sm"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
              Torna al Fanta Team
            </Button>
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-gradient mb-2 sm:mb-3">
                Schiera la tua squadra
              </h1>
              <p className="text-muted-foreground font-medium text-sm sm:text-base lg:text-lg">Trascina i giocatori dalla panchina al campo</p>
            </div>
            <div className="w-32"></div>
          </div>
        </div>

        {/* Selezione modulo */}
        <div className="glass-card mb-6 p-4">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-muted-foreground">Moduli:</label>
            <Select value={selectedFormation.name} onValueChange={handleFormationChange}>
              <SelectTrigger className="w-32 glass-button">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {formations.map(formation => (
                  <SelectItem key={formation.name} value={formation.name}>
                    {formation.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Layout principale: Campo e Panchina affiancati */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Campo da calcio */}
          <div className="flex-1">
            <Card className="glass-card p-6" style={{ minHeight: '700px' }}>
              <div className="relative w-full h-[600px] rounded-lg border-4 border-white overflow-hidden" style={{
                background: `
                  linear-gradient(to bottom, 
                    #2d5a2d 0%, 
                    #3a7a3a 20%, 
                    #2d5a2d 40%, 
                    #3a7a3a 60%, 
                    #2d5a2d 80%, 
                    #3a7a3a 100%
                  )
                `
              }}>
                {/* Linee del campo */}
                <div className="absolute inset-0">
                  {/* Linea di metà campo */}
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white transform -translate-y-0.5"></div>
                  {/* Cerchio di centrocampo */}
                  <div className="absolute top-1/2 left-1/2 w-24 h-24 border-2 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                  {/* Area di rigore */}
                  <div className="absolute bottom-0 left-1/2 w-32 h-16 border-2 border-white border-b-0 transform -translate-x-1/2"></div>
                  {/* Area piccola */}
                  <div className="absolute bottom-0 left-1/2 w-16 h-8 border-2 border-white border-b-0 transform -translate-x-1/2"></div>
                </div>

                {/* Portiere - Bottom sector */}
                {roleGroups.Portiere.map((pos, index) => (
                  <div
                    key={`gk-${index}`}
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, lineupPlayers.findIndex(p => p.role === "Portiere" && p.index === index))}
                  >
                    <div 
                      className="glass-card p-3 text-center w-20 h-24 cursor-pointer hover:scale-105 transition-transform border-2 border-dashed border-white/40 flex flex-col justify-center"
                      onClick={() => handleSlotClick(lineupPlayers.findIndex(p => p.role === "Portiere" && p.index === index))}
                    >
                      <div className="w-10 h-10 mx-auto mb-2 bg-yellow-500 rounded-full flex items-center justify-center text-sm font-bold text-black">
                        P
                      </div>
                      {pos.player ? (
                        <div className="text-xs">
                          <div className="font-semibold truncate">{pos.player.surname}</div>
                          <div className="text-muted-foreground text-[10px] truncate">{pos.player.team}</div>
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground">Drop here</div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Difensori - Settore 2 */}
                {roleGroups.Difensore.map((pos, index) => {
                  const total = roleGroups.Difensore.length;
                  let leftPos = 50;
                  
                  if (total === 3) {
                    leftPos = [25, 50, 75][index];
                  } else if (total === 4) {
                    leftPos = [18, 38, 62, 82][index];
                  } else if (total === 5) {
                    leftPos = [12, 28, 50, 72, 88][index];
                  }
                  
                  return (
                    <div
                      key={`def-${index}`}
                      className="absolute bottom-28 transform -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${leftPos}%` }}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, lineupPlayers.findIndex(p => p.role === "Difensore" && p.index === index))}
                    >
                      <div 
                        className="glass-card p-3 text-center w-20 h-24 cursor-pointer hover:scale-105 transition-transform border-2 border-dashed border-white/40 flex flex-col justify-center"
                        onClick={() => handleSlotClick(lineupPlayers.findIndex(p => p.role === "Difensore" && p.index === index))}
                      >
                        <div className="w-10 h-10 mx-auto mb-2 bg-green-500 rounded-full flex items-center justify-center text-sm font-bold text-white">
                          D
                        </div>
                        {pos.player ? (
                          <div className="text-xs">
                            <div className="font-semibold truncate">{pos.player.surname}</div>
                            <div className="text-muted-foreground text-[10px] truncate">{pos.player.team}</div>
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground">Drop here</div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Centrocampisti - Settore 3 */}
                {roleGroups.Centrocampista.map((pos, index) => {
                  const total = roleGroups.Centrocampista.length;
                  let leftPos = 50;
                  
                  if (total === 3) {
                    leftPos = [25, 50, 75][index];
                  } else if (total === 4) {
                    leftPos = [18, 38, 62, 82][index];
                  } else if (total === 5) {
                    leftPos = [12, 28, 50, 72, 88][index];
                  }
                  
                  return (
                    <div
                      key={`mid-${index}`}
                      className="absolute bottom-64 transform -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${leftPos}%` }}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, lineupPlayers.findIndex(p => p.role === "Centrocampista" && p.index === index))}
                    >
                      <div 
                        className="glass-card p-3 text-center w-20 h-24 cursor-pointer hover:scale-105 transition-transform border-2 border-dashed border-white/40 flex flex-col justify-center"
                        onClick={() => handleSlotClick(lineupPlayers.findIndex(p => p.role === "Centrocampista" && p.index === index))}
                      >
                        <div className="w-10 h-10 mx-auto mb-2 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold text-white">
                          C
                        </div>
                        {pos.player ? (
                          <div className="text-xs">
                            <div className="font-semibold truncate">{pos.player.surname}</div>
                            <div className="text-muted-foreground text-[10px] truncate">{pos.player.team}</div>
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground">Drop here</div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Attaccanti - Settore 4 */}
                {roleGroups.Attaccante.map((pos, index) => {
                  const total = roleGroups.Attaccante.length;
                  let leftPos = 50;
                  
                  if (total === 1) {
                    leftPos = 50;
                  } else if (total === 2) {
                    leftPos = [35, 65][index];
                  } else if (total === 3) {
                    leftPos = [25, 50, 75][index];
                  }
                  
                  return (
                    <div
                      key={`att-${index}`}
                      className="absolute bottom-96 transform -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${leftPos}%` }}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, lineupPlayers.findIndex(p => p.role === "Attaccante" && p.index === index))}
                    >
                      <div 
                        className="glass-card p-3 text-center w-20 h-24 cursor-pointer hover:scale-105 transition-transform border-2 border-dashed border-white/40 flex flex-col justify-center"
                        onClick={() => handleSlotClick(lineupPlayers.findIndex(p => p.role === "Attaccante" && p.index === index))}
                      >
                        <div className="w-10 h-10 mx-auto mb-2 bg-red-500 rounded-full flex items-center justify-center text-sm font-bold text-white">
                          A
                        </div>
                        {pos.player ? (
                          <div className="text-xs">
                            <div className="font-semibold truncate">{pos.player.surname}</div>
                            <div className="text-muted-foreground text-[10px] truncate">{pos.player.team}</div>
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground">Drop here</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Panchina */}
          <div className="w-full lg:w-80 lg:flex-shrink-0">
            <Card className="glass-card p-4 h-fit">
              <h3 className="text-lg font-bold mb-4 text-gradient">Panchina ({benchPlayers.length} giocatori)</h3>
              <div className="grid grid-cols-3 gap-2 max-h-[600px] overflow-y-auto">
                {benchPlayers.map((player, index) => (
                  <div 
                    key={player.id} 
                    className="glass-card p-2 cursor-move hover:scale-105 transition-transform border-2 hover:border-primary/50 flex flex-col items-center text-center"
                    draggable
                    onDragStart={(e) => handleDragStart(e, player, true, index)}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white mb-1 ${
                      player.role === 'Portiere' ? 'bg-yellow-500 text-black' :
                      player.role === 'Difensore' ? 'bg-green-500' :
                      player.role === 'Centrocampista' ? 'bg-blue-500' :
                      'bg-red-500'
                    }`}>
                      {player.role.charAt(0)}
                    </div>
                    <div className="text-xs font-semibold truncate w-full">{player.surname}</div>
                    <div className="text-muted-foreground text-[10px] truncate w-full">{player.team}</div>
                    <div className="text-muted-foreground text-[10px]">{player.credits}cr</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Formation;