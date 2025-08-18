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

    // Auto-assegna giocatori alle posizioni
    const usedPlayerIds = new Set<string>();
    const filledPositions = positions.map(pos => {
      const availablePlayer = allPlayers.find(p => 
        p.role === pos.role && !usedPlayerIds.has(p.id)
      );
      
      if (availablePlayer) {
        usedPlayerIds.add(availablePlayer.id);
        return { ...pos, player: availablePlayer };
      }
      
      return pos;
    });

    setLineupPlayers(filledPositions);
    
    // Resto in panchina
    const bench = allPlayers.filter(p => !usedPlayerIds.has(p.id));
    setBenchPlayers(bench);
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

  const swapPlayerWithBench = (positionIndex: number, benchPlayerIndex: number) => {
    const newLineup = [...lineupPlayers];
    const newBench = [...benchPlayers];
    
    const currentPlayer = newLineup[positionIndex].player;
    const benchPlayer = newBench[benchPlayerIndex];
    
    // Verifica che i ruoli corrispondano
    if (newLineup[positionIndex].role !== benchPlayer.role) {
      return; // Non permette il cambio se i ruoli non corrispondono
    }
    
    newLineup[positionIndex] = { ...newLineup[positionIndex], player: benchPlayer };
    
    if (currentPlayer) {
      newBench[benchPlayerIndex] = currentPlayer;
    } else {
      newBench.splice(benchPlayerIndex, 1);
    }
    
    setLineupPlayers(newLineup);
    setBenchPlayers(newBench);
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

  const getPositionStyle = (role: PlayerRole, index: number, total: number) => {
    const baseStyle = "absolute transform -translate-x-1/2 -translate-y-1/2";
    
    if (role === "Portiere") {
      return `${baseStyle} bottom-4 left-1/2`;
    }
    
    if (role === "Difensore") {
      const spacing = 100 / (total + 1);
      const leftPos = spacing * (index + 1);
      return `${baseStyle} bottom-20 left-[${leftPos}%]`;
    }
    
    if (role === "Centrocampista") {
      const spacing = 100 / (total + 1);
      const leftPos = spacing * (index + 1);
      return `${baseStyle} bottom-40 left-[${leftPos}%]`;
    }
    
    if (role === "Attaccante") {
      const spacing = 100 / (total + 1);
      const leftPos = spacing * (index + 1);
      return `${baseStyle} bottom-60 left-[${leftPos}%]`;
    }
    
    return baseStyle;
  };

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
              <p className="text-muted-foreground font-medium text-sm sm:text-base lg:text-lg">Disponi i giocatori in campo</p>
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

        {/* Campo da calcio */}
        <Card className="glass-card mb-6 p-4" style={{ minHeight: '500px' }}>
          <div className="relative w-full h-96 bg-green-600/20 rounded-lg border-2 border-white/30" style={{ 
            backgroundImage: `
              linear-gradient(90deg, rgba(255,255,255,0.1) 50%, transparent 50%),
              linear-gradient(rgba(255,255,255,0.1) 50%, transparent 50%)
            `,
            backgroundSize: '40px 40px'
          }}>
            {/* Portiere */}
            {roleGroups.Portiere.map((pos, index) => (
              <div
                key={`gk-${index}`}
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              >
                <div className="glass-card p-2 text-center min-w-16 cursor-pointer hover:scale-105 transition-transform">
                  <div className="w-8 h-8 mx-auto mb-1 bg-yellow-500 rounded-full flex items-center justify-center text-xs font-bold text-black">
                    P
                  </div>
                  {pos.player ? (
                    <div className="text-xs">
                      <div className="font-semibold">{pos.player.surname}</div>
                      <div className="text-muted-foreground text-[10px]">{pos.player.team}</div>
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground">Vuoto</div>
                  )}
                </div>
              </div>
            ))}

            {/* Difensori */}
            {roleGroups.Difensore.map((pos, index) => {
              const total = roleGroups.Difensore.length;
              const spacing = 80 / (total + 1);
              const leftPos = 10 + spacing * (index + 1);
              
              return (
                <div
                  key={`def-${index}`}
                  className="absolute bottom-20 transform -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${leftPos}%` }}
                >
                  <div className="glass-card p-2 text-center min-w-16 cursor-pointer hover:scale-105 transition-transform">
                    <div className="w-8 h-8 mx-auto mb-1 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                      D
                    </div>
                    {pos.player ? (
                      <div className="text-xs">
                        <div className="font-semibold">{pos.player.surname}</div>
                        <div className="text-muted-foreground text-[10px]">{pos.player.team}</div>
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground">Vuoto</div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Centrocampisti */}
            {roleGroups.Centrocampista.map((pos, index) => {
              const total = roleGroups.Centrocampista.length;
              const spacing = 80 / (total + 1);
              const leftPos = 10 + spacing * (index + 1);
              
              return (
                <div
                  key={`mid-${index}`}
                  className="absolute bottom-40 transform -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${leftPos}%` }}
                >
                  <div className="glass-card p-2 text-center min-w-16 cursor-pointer hover:scale-105 transition-transform">
                    <div className="w-8 h-8 mx-auto mb-1 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                      C
                    </div>
                    {pos.player ? (
                      <div className="text-xs">
                        <div className="font-semibold">{pos.player.surname}</div>
                        <div className="text-muted-foreground text-[10px]">{pos.player.team}</div>
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground">Vuoto</div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Attaccanti */}
            {roleGroups.Attaccante.map((pos, index) => {
              const total = roleGroups.Attaccante.length;
              const spacing = 80 / (total + 1);
              const leftPos = 10 + spacing * (index + 1);
              
              return (
                <div
                  key={`att-${index}`}
                  className="absolute bottom-60 transform -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${leftPos}%` }}
                >
                  <div className="glass-card p-2 text-center min-w-16 cursor-pointer hover:scale-105 transition-transform">
                    <div className="w-8 h-8 mx-auto mb-1 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                      A
                    </div>
                    {pos.player ? (
                      <div className="text-xs">
                        <div className="font-semibold">{pos.player.surname}</div>
                        <div className="text-muted-foreground text-[10px]">{pos.player.team}</div>
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground">Vuoto</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Panchina */}
        <Card className="glass-card p-4">
          <h3 className="text-lg font-bold mb-4 text-gradient">Panchina ({benchPlayers.length} giocatori)</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {benchPlayers.map((player, index) => (
              <div key={player.id} className="glass-card p-3 text-center cursor-pointer hover:scale-105 transition-transform">
                <div className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                  player.role === 'Portiere' ? 'bg-yellow-500 text-black' :
                  player.role === 'Difensore' ? 'bg-green-500' :
                  player.role === 'Centrocampista' ? 'bg-blue-500' :
                  'bg-red-500'
                }`}>
                  {player.role.charAt(0)}
                </div>
                <div className="text-xs">
                  <div className="font-semibold">{player.surname}</div>
                  <div className="text-muted-foreground text-[10px]">{player.team}</div>
                  <div className="text-muted-foreground text-[10px]">{player.credits}cr</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Formation;