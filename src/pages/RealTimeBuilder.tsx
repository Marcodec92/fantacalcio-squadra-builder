
import React, { useState, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, Search, X } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PlayerRole } from '@/types/Player';
import RealTimeSquadGrid from '@/components/RealTimeSquadGrid';
import RealTimeBudgetWheel from '@/components/RealTimeBudgetWheel';
import RealTimeRoleBudgets from '@/components/RealTimeRoleBudgets';
import CSVPlayerModal from '@/components/CSVPlayerModal';
import { toast } from 'sonner';

export interface RealTimePlayer {
  id: string;
  name: string;
  surname: string;
  team: string;
  role: PlayerRole;
  credits: number;
}

export interface RealTimeSelection {
  id: string;
  position_slot: number;
  role_category: PlayerRole;
  player?: RealTimePlayer;
}

const RealTimeBuilder = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [maxBudget, setMaxBudget] = useState<number>(500);
  const [csvPlayers, setCsvPlayers] = useState<RealTimePlayer[]>([]);
  const [selections, setSelections] = useState<RealTimeSelection[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<{
    slot: number;
    role: PlayerRole;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      try {
        const lines = text.split('\n').filter(line => line.trim());
        const players: RealTimePlayer[] = [];
        
        // Skip header row
        for (let i = 1; i < lines.length; i++) {
          const [name, surname, team, role] = lines[i].split(',').map(s => s.trim());
          if (name && surname && team && role) {
            const playerRole = role as PlayerRole;
            if (['Portiere', 'Difensore', 'Centrocampista', 'Attaccante'].includes(playerRole)) {
              players.push({
                id: `csv-${i}`,
                name,
                surname,
                team,
                role: playerRole,
                credits: 0
              });
            }
          }
        }
        
        // Clear previous CSV data and replace with new data
        setCsvPlayers(players);
        
        // Clear existing selections since player IDs might have changed
        setSelections([]);
        
        toast.success(`${players.length} giocatori caricati dal CSV`);
        console.log('CSV caricato con successo:', players);
      } catch (error) {
        toast.error('Errore nel parsing del file CSV');
        console.error('Errore nel parsing del CSV:', error);
      }
    };
    reader.readAsText(file);
    
    // Reset the input value to allow uploading the same file again
    event.target.value = '';
  };

  const handlePositionClick = (slot: number, role: PlayerRole) => {
    setSelectedPosition({ slot, role });
    setSearchTerm('');
    setIsModalOpen(true);
  };

  const handlePlayerSelect = (player: RealTimePlayer, credits: number) => {
    if (!selectedPosition) return;
    
    const newSelection: RealTimeSelection = {
      id: `${selectedPosition.role}-${selectedPosition.slot}`,
      position_slot: selectedPosition.slot,
      role_category: selectedPosition.role,
      player: { ...player, credits }
    };

    setSelections(prev => {
      const filtered = prev.filter(
        s => !(s.position_slot === selectedPosition.slot && s.role_category === selectedPosition.role)
      );
      return [...filtered, newSelection];
    });
    
    setIsModalOpen(false);
    setSelectedPosition(null);
    console.log('Giocatore selezionato:', newSelection);
  };

  const handleRemovePlayer = (slot: number, role: PlayerRole) => {
    setSelections(prev => 
      prev.filter(s => !(s.position_slot === slot && s.role_category === role))
    );
    console.log('Giocatore rimosso dalla posizione:', slot, role);
  };

  const calculateTotalCredits = () => {
    return selections.reduce((total, selection) => {
      return total + (selection.player?.credits || 0);
    }, 0);
  };

  const calculateRoleCredits = () => {
    const roleCredits = {
      Portiere: 0,
      Difensore: 0,
      Centrocampista: 0,
      Attaccante: 0
    };

    selections.forEach(selection => {
      if (selection.player) {
        roleCredits[selection.role_category] += selection.player.credits;
      }
    });

    return roleCredits;
  };

  const getFilteredPlayers = (role: PlayerRole) => {
    return csvPlayers
      .filter(p => p.role === role)
      .filter(p => 
        searchTerm === '' || 
        `${p.name} ${p.surname}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
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
          <p className="text-muted-foreground text-lg">Devi effettuare l'accesso per utilizzare il Real Time Builder</p>
        </div>
      </div>
    );
  }

  const totalCredits = calculateTotalCredits();
  const roleCredits = calculateRoleCredits();

  return (
    <div className="min-h-screen relative overflow-hidden p-4">
      <div className="floating-orb"></div>
      <div className="floating-orb"></div>
      <div className="floating-orb"></div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="glass-card mb-8 p-8 shadow-2xl slide-in-up">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="glass-button border-white/20 hover:border-white/30 font-medium px-6 py-3 slide-in-left"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Torna al Database
            </Button>
            <div className="text-center">
              <h1 className="text-5xl font-bold text-gradient mb-3">
                ⚡ Real Time Builder
              </h1>
              <p className="text-muted-foreground font-medium text-lg">Costruisci la squadra in base ai crediti spesi</p>
            </div>
            <div className="w-40"></div>
          </div>
        </div>

        {/* Budget Selection and CSV Upload */}
        <div className="glass-card mb-8 p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Budget Massimo
                </label>
                <Select value={maxBudget.toString()} onValueChange={(value) => setMaxBudget(Number(value))}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="300">300 Crediti</SelectItem>
                    <SelectItem value="500">500 Crediti</SelectItem>
                    <SelectItem value="650">650 Crediti</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="glass-button gradient-accent text-white shadow-lg hover:shadow-2xl font-medium px-6 py-3"
              >
                <Upload className="w-5 h-5 mr-2" />
                Carica CSV
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Budget Wheels */}
          <div className="lg:col-span-1 space-y-8 slide-in-left">
            {/* Total Budget Wheel */}
            <div className="glass-card p-8 shadow-xl pulse-glow">
              <h3 className="text-xl font-bold mb-6 text-center text-gradient">Budget Totale</h3>
              <RealTimeBudgetWheel 
                totalCredits={totalCredits}
                maxBudget={maxBudget}
                selectedCount={selections.length}
              />
            </div>

            {/* Role Budget Wheels */}
            <RealTimeRoleBudgets 
              roleCredits={roleCredits}
              maxBudget={maxBudget}
            />
          </div>

          {/* Squad Grid */}
          <div className="lg:col-span-3 slide-in-right">
            <div className="glass-card p-8 shadow-2xl">
              <RealTimeSquadGrid
                selections={selections}
                onPositionClick={handlePositionClick}
                onRemovePlayer={handleRemovePlayer}
              />
            </div>
          </div>
        </div>

        {/* CSV Player Selection Modal */}
        <CSVPlayerModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          players={selectedPosition ? getFilteredPlayers(selectedPosition.role) : []}
          selectedRole={selectedPosition?.role}
          onPlayerSelect={handlePlayerSelect}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      </div>
    </div>
  );
};

export default RealTimeBuilder;
