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

  // Calcolo del bonus totale per i giocatori non portieri
  const bonusTotal = isGoalkeeper ? 0 : player.goals * 3 + player.assists - player.malus;

  if (!isEditing) {
    return (
      <div className="glass-card p-6 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] fade-in-scale">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Nome e squadra */}
          <div className="lg:col-span-2">
            <div className="font-bold text-lg text-gradient mb-1">
              {player.name} {player.surname}
            </div>
            <div className="text-sm text-muted-foreground mb-2">{player.team}</div>
            <div className="glass-card px-3 py-1 text-xs font-medium text-gradient-secondary inline-block">
              {player.role}
            </div>
          </div>
          
          {/* Costo e FMV */}
          <div className="lg:col-span-2">
            <div className="glass-card p-4">
              <CostCalculator percentage={player.costPercentage} readonly />
              <div className="mt-3">
                <FMVInput value={player.fmv} readonly />
              </div>
            </div>
          </div>
          
          {/* Tier */}
          <div className="lg:col-span-1">
            <TierSelect 
              roleCategory={player.roleCategory} 
              value={player.tier} 
              readonly 
            />
          </div>
          
          {/* Statistiche principali */}
          <div className="lg:col-span-2">
            {isGoalkeeper ? (
              <div className="glass-card p-4">
                <GoalkeeperStats 
                  goalsConceded={player.goalsConceded}
                  yellowCards={player.yellowCards}
                  penaltiesSaved={player.penaltiesSaved}
                  xP={player.xP}
                  readonly
                />
              </div>
            ) : (
              <div className="glass-card p-4">
                <div className="text-xs font-medium text-gradient mb-2">Statistiche</div>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span>Gol:</span>
                    <span className="font-bold text-gradient-accent">{player.goals}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Assist:</span>
                    <span className="font-bold text-gradient-secondary">{player.assists}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Malus:</span>
                    <span className="font-bold text-red-400">{player.malus}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Expected Stats e Bonus Totali */}
          <div className="lg:col-span-2">
            <div className="glass-card p-4">
              <div className="text-xs font-medium text-gradient mb-2">
                {isGoalkeeper ? 'Performance' : 'Expected & Bonus'}
              </div>
              <div className="text-sm space-y-2">
                {isGoalkeeper ? (
                  <div className="flex items-center">
                    <Zap className="w-4 h-4 mr-2 text-blue-400" />
                    <span className="font-bold text-gradient">
                      xP: {player.xP.toFixed(2)}
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span>xG:</span>
                      <span className="font-semibold">{player.xG.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>xA:</span>
                      <span className="font-semibold">{player.xA.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                      <span className="text-xs">Bonus Totali:</span>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 mr-1 text-yellow-400" />
                        <span className="font-bold text-gradient text-lg">
                          {bonusTotal}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Titolarità */}
          <div className="lg:col-span-1">
            <div className="text-xs font-medium text-gradient mb-2">Titolarità</div>
            <OwnershipProgress value={player.ownership} readonly />
          </div>
          
          {/* Categorie Plus */}
          <div className="lg:col-span-1">
            <div className="text-xs font-medium text-gradient mb-2">Plus</div>
            <PlusCategoriesSelector 
              selected={player.plusCategories} 
              onChange={() => {}} 
              readonly 
            />
          </div>
          
          {/* Azioni */}
          <div className="lg:col-span-1 flex gap-2 justify-end">
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

        <div>
          <Label>Categorie Plus</Label>
          <PlusCategoriesSelector
            selected={editedPlayer.plusCategories}
            onChange={(categories) => updateField('plusCategories', categories)}
          />
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
