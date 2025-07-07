
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Trash2, Edit, Check, X } from "lucide-react";
import TeamSelect from './TeamSelect';
import RoleSelect from './RoleSelect';
import CostCalculator from './CostCalculator';
import BonusCalculator from './BonusCalculator';
import GoalkeeperStats from './GoalkeeperStats';
import OwnershipProgress from './OwnershipProgress';
import PlusCategoriesSelector from './PlusCategoriesSelector';
import { Player } from '@/types/Player';

interface PlayerCardProps {
  player: Player;
  onUpdate: (player: Player) => void;
  onDelete: (playerId: string) => void;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPlayer, setEditedPlayer] = useState<Player>(player);

  const handleSave = () => {
    onUpdate(editedPlayer);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedPlayer(player);
    setIsEditing(false);
  };

  const updateField = (field: keyof Player, value: any) => {
    setEditedPlayer({ ...editedPlayer, [field]: value });
  };

  const isGoalkeeper = player.roleCategory === 'Portiere';

  if (!isEditing) {
    return (
      <Card className="p-4 hover:shadow-md transition-shadow">
        <div className="grid grid-cols-1 lg:grid-cols-8 gap-4 items-center">
          <div className="lg:col-span-1">
            <div className="font-semibold text-gray-800">
              {player.name} {player.surname}
            </div>
            <div className="text-sm text-gray-600">{player.team}</div>
          </div>
          
          <div className="lg:col-span-1 text-sm text-gray-600">
            {player.role}
          </div>
          
          <div className="lg:col-span-1">
            <CostCalculator percentage={player.costPercentage} readonly />
          </div>
          
          <div className="lg:col-span-2">
            {isGoalkeeper ? (
              <GoalkeeperStats 
                goalsConceded={player.goalsConceded}
                yellowCards={player.yellowCards}
                penaltiesSaved={player.penaltiesSaved}
                xP={player.xP}
                readonly
              />
            ) : (
              <BonusCalculator 
                goals={player.goals}
                assists={player.assists}
                malus={player.malus}
                readonly
              />
            )}
          </div>
          
          <div className="lg:col-span-1">
            <div className="text-sm space-y-1">
              {isGoalkeeper ? (
                <div>xP: {player.xP.toFixed(2)}</div>
              ) : (
                <>
                  <div>xG: {player.xG.toFixed(2)}</div>
                  <div>xA: {player.xA.toFixed(2)}</div>
                </>
              )}
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <OwnershipProgress value={player.ownership} readonly />
          </div>
          
          <div className="lg:col-span-1 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(player.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-2 border-blue-200">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={editedPlayer.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="Nome giocatore"
            />
          </div>
          <div>
            <Label htmlFor="surname">Cognome</Label>
            <Input
              id="surname"
              value={editedPlayer.surname}
              onChange={(e) => updateField('surname', e.target.value)}
              placeholder="Cognome giocatore"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        <div>
          <Label>Costo (percentuale)</Label>
          <CostCalculator
            percentage={editedPlayer.costPercentage}
            onChange={(percentage) => updateField('costPercentage', percentage)}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        <div className="flex gap-2 pt-4">
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
            <Check className="w-4 h-4 mr-2" />
            Salva
          </Button>
          <Button variant="outline" onClick={handleCancel}>
            <X className="w-4 h-4 mr-2" />
            Annulla
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default PlayerCard;
