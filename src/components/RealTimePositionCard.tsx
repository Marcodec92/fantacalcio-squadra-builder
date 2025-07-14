
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus, Edit2, Check } from "lucide-react";
import { PlayerRole } from '@/types/Player';
import { RealTimeSelection } from '@/pages/RealTimeBuilder';

interface RealTimePositionCardProps {
  slot: number;
  role: PlayerRole;
  label: string;
  selection?: RealTimeSelection;
  onPositionClick: (slot: number, role: PlayerRole) => void;
  onRemovePlayer: (slot: number, role: PlayerRole) => void;
  onUpdateCredits: (slot: number, role: PlayerRole, newCredits: number) => void;
}

const RealTimePositionCard: React.FC<RealTimePositionCardProps> = ({
  slot,
  role,
  label,
  selection,
  onPositionClick,
  onRemovePlayer,
  onUpdateCredits
}) => {
  const [editingCredits, setEditingCredits] = useState(false);
  const [tempCredits, setTempCredits] = useState<string>('');
  
  const player = selection?.player;

  const handleEditCredits = () => {
    if (player) {
      setTempCredits(player.credits.toString());
      setEditingCredits(true);
    }
  };

  const handleSaveCredits = () => {
    const newCredits = parseFloat(tempCredits);
    if (!isNaN(newCredits) && newCredits > 0) {
      onUpdateCredits(slot, role, newCredits);
    }
    setEditingCredits(false);
    setTempCredits('');
  };

  const handleCancelEdit = () => {
    setEditingCredits(false);
    setTempCredits('');
  };

  return (
    <Card className="glass-card p-4 hover:shadow-lg transition-all duration-300 hover:scale-105 relative group">
      {player ? (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
            onClick={() => onRemovePlayer(slot, role)}
          >
            <X className="w-3 h-3" />
          </Button>
          
          <div className="text-center space-y-2">
            <div className="text-xs font-medium text-muted-foreground">{label}</div>
            <div className="font-bold text-sm">{player.name} {player.surname}</div>
            <div className="text-xs text-muted-foreground">{player.team}</div>
            
            {editingCredits ? (
              <div className="flex items-center justify-center space-x-2">
                <Input
                  type="number"
                  value={tempCredits}
                  onChange={(e) => setTempCredits(e.target.value)}
                  className="w-20 h-8 text-center text-sm"
                  min="1"
                  step="0.5"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 hover:bg-green-100"
                  onClick={handleSaveCredits}
                >
                  <Check className="h-3 w-3 text-green-600" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 hover:bg-red-100"
                  onClick={handleCancelEdit}
                >
                  <X className="h-3 w-3 text-red-500" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <div className="text-lg font-bold text-green-600">{player.credits} crediti</div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 hover:bg-blue-100"
                  onClick={handleEditCredits}
                >
                  <Edit2 className="h-3 w-3 text-blue-500" />
                </Button>
              </div>
            )}
          </div>
        </>
      ) : (
        <Button
          variant="ghost"
          className="w-full h-24 flex flex-col items-center justify-center space-y-2 hover:bg-white/10"
          onClick={() => onPositionClick(slot, role)}
        >
          <Plus className="w-6 h-6 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">{label}</span>
        </Button>
      )}
    </Card>
  );
};

export default RealTimePositionCard;
