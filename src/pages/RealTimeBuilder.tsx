import React, { useState, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, Search, X, FileText, AlertCircle } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PlayerRole } from '@/types/Player';
import RealTimeSquadGrid from '@/components/RealTimeSquadGrid';
import RealTimeBudgetWheel from '@/components/RealTimeBudgetWheel';
import RealTimeRoleBudgets from '@/components/RealTimeRoleBudgets';
import CSVPlayerModal from '@/components/CSVPlayerModal';
import { useCSVPlayers } from '@/hooks/useCSVPlayers';
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
  const { csvPlayers, loading, handleCSVUpload } = useCSVPlayers();
  
  const [maxBudget, setMaxBudget] = useState<number>(500);
  const [selections, setSelections] = useState<RealTimeSelection[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<{
    slot: number;
    role: PlayerRole;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.log('❌ Nessun file selezionato');
      return;
    }

    console.log('📁 File selezionato:', file.name, 'Tipo:', file.type, 'Dimensione:', file.size);

    // Verifica che sia un file CSV
    if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv' && file.type !== 'application/csv') {
      toast.error('Per favore seleziona un file CSV valido');
      return;
    }

    // Verifica dimensione file (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Il file è troppo grande. Dimensione massima: 5MB');
      return;
    }

    try {
      await handleCSVUpload(file);
      
      // Clear existing selections since player data has changed
      setSelections([]);
      
      toast.success(`File CSV caricato con successo!`);
    } catch (error) {
      console.error('Errore nel caricamento del file:', error);
      toast.error('Errore nel caricamento del file CSV');
    } finally {
      // Reset the input value to allow uploading the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      console.log('📁 File trascinato:', files[0].name);
      
      // Simula l'evento change per riutilizzare la logica esistente
      const mockEvent = {
        target: { files: [files[0]] }
      } as React.ChangeEvent<HTMLInputElement>;
      
      await handleFileUpload(mockEvent);
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const triggerFileInput = () => {
    console.log('🔄 Apertura dialog di selezione file...');
    if (fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      console.error('❌ Riferimento al file input non trovato');
      toast.error('Errore nel sistema di caricamento file');
    }
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
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
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
              {csvPlayers.length > 0 && (
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4 text-green-500" />
                  <p>{csvPlayers.length} giocatori caricati</p>
                </div>
              )}
            </div>
            
            {/* Enhanced CSV Upload Area */}
            <div className="w-full lg:w-auto">
              <div 
                className={`
                  relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200
                  ${dragActive 
                    ? 'border-primary bg-primary/5 scale-105' 
                    : 'border-gray-300 hover:border-primary/50 hover:bg-gray-50/50'
                  }
                  ${loading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
                `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={triggerFileInput}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv,application/csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={loading}
                />
                
                <div className="flex flex-col items-center gap-3">
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <p className="text-sm font-medium">Caricamento in corso...</p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                        <Upload className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">
                          Clicca o trascina il file CSV qui
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Formato: Ruolo,Nome Giocatore,Squadra
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {/* File format help */}
              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-blue-700">
                    <p className="font-medium mb-1">Formato CSV richiesto:</p>
                    <p className="font-mono bg-white px-2 py-1 rounded">Ruolo,Nome Giocatore,Squadra</p>
                    <p className="mt-1">Ruoli: P/D/C/A (o versioni estese)</p>
                  </div>
                </div>
              </div>
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
