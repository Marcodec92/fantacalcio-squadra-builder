import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Trash2, Edit, Check, X, Star, Zap } from "lucide-react";
import TeamSelect from './TeamSelect';
import RoleSelect from './RoleSelect';
import CostCalculator from './CostCalculator';
import BonusCalculator from './BonusCalculator';
import GoalkeeperStats from './GoalkeeperStats';
import OwnershipProgress from './OwnershipProgress';
import PlusCategoriesSelector from './PlusCategoriesSelector';
import FMVInput from './FMVInput';
import TierSelect from './TierSelect';
import { Player } from '@/types/Player';

interface PlayerCardProps {
  player: Player;
  onUpdate: (player: Player) => void;
  onDelete: (playerId: string) => void;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player, onUpdate, onDelete }) => {
  // Determina se questo è un nuovo giocatore appena creato
  const isNewPlayer = player.name === 'Nuovo' && player.surname === 'Giocatore' && player.costPercentage === 0;
  
  // Inizia in modalità editing se è un nuovo giocatore
  const [isEditing, setIsEditing] = useState(isNewPlayer);
  const [editedPlayer, setEditedPlayer] = useState<Player>(player);
  const [showBudgetBreakdown, setShowBudgetBreakdown] = useState(false);

  console.log('🚨 PLAYER CARD RENDERING!!! 🚨', {
    playerName: player?.name,
    playerId: player?.id,
    timestamp: Date.now()
  });

  // Aggiorna lo stato quando cambiano i props del player
  useEffect(() => {
    setEditedPlayer(player);
    // Se è un nuovo giocatore, assicurati che sia in editing
    if (isNewPlayer && !isEditing) {
      setIsEditing(true);
    }
  }, [player, isNewPlayer, isEditing]);

  const handleSave = () => {
    onUpdate(editedPlayer);
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Per i nuovi giocatori, se cancellano, elimina il giocatore
    if (isNewPlayer) {
      onDelete(player.id);
    } else {
      setEditedPlayer(player);
      setIsEditing(false);
    }
  };

  const updateField = (field: keyof Player, value: any) => {
    setEditedPlayer({ ...editedPlayer, [field]: value });
  };

  const isGoalkeeper = player.roleCategory === 'Portiere';

  // Funzione per arrotondamento personalizzato
  const customRound = (num: number) => {
    const decimal = num - Math.floor(num);
    return decimal >= 0.5 ? Math.ceil(num) : Math.floor(num);
  };

  // Funzione per calcolare il breakdown dei crediti
  const calculateCreditBreakdown = (costPercentage: number) => {
    const credits300 = (costPercentage / 100) * 300;
    const credits500 = (costPercentage / 100) * 500;
    const credits650 = (costPercentage / 100) * 650;
    
    return {
      credits300: customRound(credits300),
      credits500: customRound(credits500),
      credits650: customRound(credits650)
    };
  };

  // Calcolo dei bonus totali per i giocatori non portieri - FORMULA CORRETTA
  const bonusTotal = isGoalkeeper ? 0 : player.goals * 3 + player.assists - player.malus * 0.5;

  if (!isEditing) {
    return (
      <div className="glass-card p-4 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] fade-in-scale">
        <div className="space-y-3">
          {/* Prima riga: Nome più grande, Fascia e MFV a destra e Azioni */}
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="font-bold text-2xl text-gradient leading-tight break-words flex items-center gap-2">
                {player.name} {player.surname}
                {player.isFavorite && (
                  <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" style={{
                    filter: 'drop-shadow(0 0 4px rgba(251, 191, 36, 0.5))'
                  }} />
                )}
              </div>
              <div className="text-lg text-muted-foreground mt-1 font-medium">{player.team}</div>
              <div className="glass-card px-3 py-1 text-sm font-semibold text-gradient-secondary inline-block mt-1">
                {player.role}
              </div>
            </div>
            {/* Fascia e MFV valorizzati e centrati con più spazio */}
            <div className="flex items-center gap-8 mt-2 mr-8"> {/* Gap aumentato e margine maggiore */}
              <div className="transform scale-125"> {/* Ingrandimento della fascia */}
                <TierSelect 
                  roleCategory={player.roleCategory} 
                  value={player.tier} 
                  readonly 
                />
              </div>
              <div className="glass-card px-4 py-2 text-base font-bold text-gradient"> {/* MFV ingrandito */}
                MFV: {player.fmv.toFixed(2)}
              </div>
            </div>
            {/* Azioni */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="glass-button border-white/20 hover:border-white/30"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(player.id)}
                className="glass-button border-red-500/20 hover:border-red-500/40 text-red-400 hover:text-red-300"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Budget compatto sotto il nome - SOLO BUDGET */}
          <div className="relative">
            <div className="flex gap-2 text-xs h-8"> {/* Altezza fissa - SOLO BUDGET */}
              <div 
                className="glass-card px-2 py-1 text-xs text-muted-foreground cursor-pointer hover:bg-blue-100/20 transition-colors min-w-[120px]"
                onClick={() => {
                  console.log('🎯 BUDGET CLICKED!!!', player.name);
                  setShowBudgetBreakdown(!showBudgetBreakdown);
                }}
                title="Clicca per vedere breakdown crediti"
              >
                {player.costPercentage}% del budget
              </div>
            </div>
            {/* Breakdown posizionato più vicino al budget percentage */}
            {showBudgetBreakdown && (
              <div className="absolute top-0 left-[140px] z-10 flex gap-2 animate-slide-in-right">
                <div className="text-xs px-3 py-2 rounded-lg font-medium text-white bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                  {calculateCreditBreakdown(player.costPercentage).credits300} su 300 cr.
                </div>
                <div className="text-xs px-3 py-2 rounded-lg font-medium text-white bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
                  {calculateCreditBreakdown(player.costPercentage).credits500} su 500 cr.
                </div>
                <div className="text-xs px-3 py-2 rounded-lg font-medium text-white bg-gradient-to-br from-red-500 to-rose-600 shadow-lg">
                  {calculateCreditBreakdown(player.costPercentage).credits650} su 650 cr.
                </div>
              </div>
            )}
          </div>

          {/* Tutte le altre informazioni uniformemente in orizzontale - ALLINEATE IN ALTO */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
          
            {/* Statistiche */}
            <div>
            {isGoalkeeper ? (
              <div className="glass-card p-3">
                <div className="text-xs font-medium text-gradient mb-1">Statistiche</div>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-xs">Gol subiti:</span>
                    <span className="font-bold text-red-400 text-sm">{player.goalsConceded}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs">Rigori parati:</span>
                    <span className="font-bold text-green-400 text-sm">{player.penaltiesSaved}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs">Cartellini:</span>
                    <span className="font-bold text-yellow-400 text-sm">{player.yellowCards}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-card p-3">
                <div className="text-xs font-medium text-gradient mb-1">Statistiche</div>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-xs">Gol:</span>
                    <span className="font-bold text-gradient-accent text-sm">{player.goals}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs">Assist:</span>
                    <span className="font-bold text-gradient-secondary text-sm">{player.assists}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs">Malus:</span>
                    <span className="font-bold text-red-400 text-sm">{player.malus}</span>
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-1 mt-1">
                    <span className="text-xs font-medium">Bonus Totali:</span>
                    <span className={`font-bold text-sm ${bonusTotal >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {bonusTotal >= 0 ? '+' : ''}{bonusTotal.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
            {/* Expected/Performance */}
            <div>
            <div className="glass-card p-3">
              <div className="text-xs font-medium text-gradient mb-1">
                {isGoalkeeper ? 'Performance' : 'Expected'}
              </div>
              <div className="text-sm space-y-1">
                {isGoalkeeper ? (
                  <div className="flex items-center justify-center">
                    <Zap className="w-4 h-4 mr-2 text-blue-400" />
                    <span className="font-bold text-gradient text-base">
                      {player.xP.toFixed(2)}
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-xs">xG:</span>
                      <span className="font-semibold text-sm">{player.xG.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs">xA:</span>
                      <span className="font-semibold text-sm">{player.xA.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          
            {/* Titolarità e Plus con design uniforme */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="glass-card p-3">
                  <div className="text-xs font-medium text-gradient mb-1">Titolarità</div>
                  <OwnershipProgress value={player.ownership} readonly />
                </div>
              </div>
              <div>
                <div className="glass-card p-3">
                  <div className="text-xs font-medium text-gradient mb-1">Plus</div>
                  <PlusCategoriesSelector 
                    selected={player.plusCategories} 
                    onChange={() => {}} 
                    readonly 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-8 border-2 border-white/20 fade-in-scale">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="name" className="text-gradient font-medium">Nome</Label>
            <Input
              id="name"
              value={editedPlayer.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="Nome giocatore"
              className="glass-button border-white/20 mt-2"
            />
          </div>
          <div>
            <Label htmlFor="surname" className="text-gradient font-medium">Cognome</Label>
            <Input
              id="surname"
              value={editedPlayer.surname}
              onChange={(e) => updateField('surname', e.target.value)}
              placeholder="Cognome giocatore"
              className="glass-button border-white/20 mt-2"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Squadra</Label>
            <TeamSelect
              value={editedPlayer.team}
              onChange={(team) => updateField('team', team)}
            />
          </div>
          <div>
            <Label>Ruolo specifico</Label>
            <RoleSelect
              roleCategory={editedPlayer.roleCategory}
              value={editedPlayer.role}
              onChange={(role) => updateField('role', role)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Costo (percentuale)</Label>
            <CostCalculator
              percentage={editedPlayer.costPercentage}
              onChange={(percentage) => updateField('costPercentage', percentage)}
            />
          </div>
          <div>
            <FMVInput
              value={editedPlayer.fmv}
              onChange={(fmv) => updateField('fmv', fmv)}
            />
          </div>
        </div>

        <div>
          <TierSelect
            roleCategory={editedPlayer.roleCategory}
            value={editedPlayer.tier}
            onChange={(tier) => updateField('tier', tier)}
          />
        </div>

        <div>
          <Label>{isGoalkeeper ? 'Statistiche portiere' : 'Statistiche bonus'}</Label>
          {isGoalkeeper ? (
            <GoalkeeperStats
              goalsConceded={editedPlayer.goalsConceded}
              yellowCards={editedPlayer.yellowCards}
              penaltiesSaved={editedPlayer.penaltiesSaved}
              xP={editedPlayer.xP}
              onChange={(field, value) => updateField(field, value)}
            />
          ) : (
            <BonusCalculator
              goals={editedPlayer.goals}
              assists={editedPlayer.assists}
              malus={editedPlayer.malus}
              onChange={(field, value) => updateField(field, value)}
            />
          )}
        </div>

        {!isGoalkeeper && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="xG">xG (Expected Goals)</Label>
              <Input
                id="xG"
                type="number"
                step="0.01"
                value={editedPlayer.xG}
                onChange={(e) => updateField('xG', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="xA">xA (Expected Assists)</Label>
              <Input
                id="xA"
                type="number"
                step="0.01"
                value={editedPlayer.xA}
                onChange={(e) => updateField('xA', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
          </div>
        )}

        <div>
          <Label>Titolarità</Label>
          <OwnershipProgress
            value={editedPlayer.ownership}
            onChange={(ownership) => updateField('ownership', ownership)}
          />
        </div>

        <div className="flex gap-6">
          <div className="flex-1">
            <Label>Categorie Plus</Label>
            <PlusCategoriesSelector
              selected={editedPlayer.plusCategories}
              onChange={(categories) => updateField('plusCategories', categories)}
              playerRole={editedPlayer.roleCategory}
            />
          </div>
          <div className="flex items-center space-x-2 pt-8">
            <input
              type="checkbox"
              id="editFavorite"
              checked={editedPlayer.isFavorite}
              onChange={(e) => updateField('isFavorite', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <Label htmlFor="editFavorite" className="text-sm font-medium cursor-pointer">
              Aggiungi ai preferiti
            </Label>
          </div>
        </div>

        <div className="flex gap-4 pt-6 border-t border-white/10">
          <Button 
            onClick={handleSave} 
            className="glass-button gradient-primary text-white shadow-lg hover:shadow-2xl font-medium px-8 py-3"
          >
            <Check className="w-5 h-5 mr-2" />
            Salva
          </Button>
          <Button 
            variant="outline" 
            onClick={handleCancel}
            className="glass-button border-white/20 hover:border-white/30 font-medium px-8 py-3"
          >
            <X className="w-5 h-5 mr-2" />
            {isNewPlayer ? 'Elimina' : 'Annulla'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PlayerCard;
