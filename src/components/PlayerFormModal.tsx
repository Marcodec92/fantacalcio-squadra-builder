
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Player, PlayerRole } from '@/types/Player';
import TeamSelect from './TeamSelect';
import RoleSelect from './RoleSelect';
import TierSelect from './TierSelect';
import PlusCategoriesSelector from './PlusCategoriesSelector';

interface PlayerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (playerData: Omit<Player, 'id' | 'userId'>) => void;
  player?: Player | null;
  defaultRole: PlayerRole;
}

const PlayerFormModal: React.FC<PlayerFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  player,
  defaultRole
}) => {
  const [formData, setFormData] = useState<Omit<Player, 'id' | 'userId'>>({
    name: '',
    surname: '',
    team: '',
    role: defaultRole === 'Portiere' ? 'Portiere' : 
          defaultRole === 'Difensore' ? 'Difensore centrale' :
          defaultRole === 'Centrocampista' ? 'Mediano' : 'Attaccante centrale',
    roleCategory: defaultRole,
    costPercentage: 0,
    fmv: 0,
    tier: '',
    goals: 0,
    assists: 0,
    malus: 0,
    goalsConceded: 0,
    yellowCards: 0,
    penaltiesSaved: 0,
    xG: 0,
    xA: 0,
    xP: 0,
    ownership: 0,
    plusCategories: [],
    isFavorite: false
  });

  useEffect(() => {
    if (player) {
      setFormData({
        name: player.name,
        surname: player.surname,
        team: player.team,
        role: player.role,
        roleCategory: player.roleCategory,
        costPercentage: player.costPercentage,
        fmv: player.fmv,
        tier: player.tier,
        goals: player.goals,
        assists: player.assists,
        malus: player.malus,
        goalsConceded: player.goalsConceded,
        yellowCards: player.yellowCards,
        penaltiesSaved: player.penaltiesSaved,
        xG: player.xG,
        xA: player.xA,
        xP: player.xP,
        ownership: player.ownership,
        plusCategories: player.plusCategories || [],
        isFavorite: player.isFavorite
      });
    } else {
      setFormData({
        name: '',
        surname: '',
        team: '',
        role: defaultRole === 'Portiere' ? 'Portiere' : 
              defaultRole === 'Difensore' ? 'Difensore centrale' :
              defaultRole === 'Centrocampista' ? 'Mediano' : 'Attaccante centrale',
        roleCategory: defaultRole,
        costPercentage: 0,
        fmv: 0,
        tier: '',
        goals: 0,
        assists: 0,
        malus: 0,
        goalsConceded: 0,
        yellowCards: 0,
        penaltiesSaved: 0,
        xG: 0,
        xA: 0,
        xP: 0,
        ownership: 0,
        plusCategories: [],
        isFavorite: false
      });
    }
  }, [player, defaultRole, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {player ? 'Modifica Giocatore' : 'Aggiungi Nuovo Giocatore'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="surname">Cognome</Label>
              <Input
                id="surname"
                value={formData.surname}
                onChange={(e) => handleInputChange('surname', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Squadra</Label>
              <TeamSelect
                value={formData.team}
                onChange={(value) => handleInputChange('team', value)}
              />
            </div>
            <div>
              <Label>Ruolo</Label>
              <RoleSelect
                value={formData.role}
                onChange={(value) => handleInputChange('role', value)}
                roleCategory={formData.roleCategory}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Fascia</Label>
              <TierSelect
                value={formData.tier}
                onChange={(value) => handleInputChange('tier', value)}
                roleCategory={formData.roleCategory}
              />
            </div>
            <div>
              <Label htmlFor="costPercentage">Costo %</Label>
              <Input
                id="costPercentage"
                type="number"
                step="0.1"
                value={formData.costPercentage}
                onChange={(e) => handleInputChange('costPercentage', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fmv">FMV</Label>
              <Input
                id="fmv"
                type="number"
                step="0.1"
                value={formData.fmv}
                onChange={(e) => handleInputChange('fmv', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="ownership">Ownership %</Label>
              <Input
                id="ownership"
                type="number"
                value={formData.ownership}
                onChange={(e) => handleInputChange('ownership', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="goals">Gol</Label>
              <Input
                id="goals"
                type="number"
                value={formData.goals}
                onChange={(e) => handleInputChange('goals', parseInt(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="assists">Assist</Label>
              <Input
                id="assists"
                type="number"
                value={formData.assists}
                onChange={(e) => handleInputChange('assists', parseInt(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="malus">Malus</Label>
              <Input
                id="malus"
                type="number"
                value={formData.malus}
                onChange={(e) => handleInputChange('malus', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          {formData.roleCategory === 'Portiere' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="goalsConceded">Gol Subiti</Label>
                <Input
                  id="goalsConceded"
                  type="number"
                  value={formData.goalsConceded}
                  onChange={(e) => handleInputChange('goalsConceded', parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="penaltiesSaved">Rigori Parati</Label>
                <Input
                  id="penaltiesSaved"
                  type="number"
                  value={formData.penaltiesSaved}
                  onChange={(e) => handleInputChange('penaltiesSaved', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="xG">xG</Label>
              <Input
                id="xG"
                type="number"
                step="0.01"
                value={formData.xG}
                onChange={(e) => handleInputChange('xG', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="xA">xA</Label>
              <Input
                id="xA"
                type="number"
                step="0.01"
                value={formData.xA}
                onChange={(e) => handleInputChange('xA', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="xP">xP</Label>
              <Input
                id="xP"
                type="number"
                step="0.01"
                value={formData.xP}
                onChange={(e) => handleInputChange('xP', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex-1">
              <PlusCategoriesSelector
                selected={formData.plusCategories || []}
                onChange={(categories) => handleInputChange('plusCategories', categories)}
                playerRole={formData.roleCategory}
              />
            </div>
            <div className="flex items-center space-x-2 pt-8">
              <input
                type="checkbox"
                id="isFavorite"
                checked={formData.isFavorite}
                onChange={(e) => handleInputChange('isFavorite', e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <Label htmlFor="isFavorite" className="text-sm font-medium cursor-pointer">
                Aggiungi ai preferiti
              </Label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annulla
            </Button>
            <Button type="submit">
              {player ? 'Aggiorna' : 'Aggiungi'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PlayerFormModal;
