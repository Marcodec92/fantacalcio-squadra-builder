
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
    <Card className="glass-card p-3 sm:p-4 hover:shadow-lg transition-all duration-300 hover:scale-105 relative group min-h-[100px] sm:min-h-[120px]">
      {player ? (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 bg-destructive hover:bg-destructive/80 text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 touch-manipulation"
            onClick={() => onRemovePlayer(slot, role)}
          >
            <X className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          </Button>
          
          <div className="text-center space-y-1 sm:space-y-2">
            <div className="text-[10px] sm:text-xs font-medium text-muted-foreground">{label}</div>
            <div className="font-bold text-xs sm:text-sm leading-tight">{player.name} {player.surname}</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">{player.team}</div>
            
            {editingCredits ? (
              <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                <Input
                  type="number"
                  value={tempCredits}
                  onChange={(e) => setTempCredits(e.target.value)}
                  className="w-16 sm:w-20 h-6 sm:h-8 text-center text-xs sm:text-sm glass-button border-white/20"
                  min="1"
                  step="0.5"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-5 w-5 sm:h-6 sm:w-6 p-0 hover:bg-green-500/10 touch-manipulation"
                  onClick={handleSaveCredits}
                >
                  <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-500" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-5 w-5 sm:h-6 sm:w-6 p-0 hover:bg-red-500/10 touch-manipulation"
                  onClick={handleCancelEdit}
                >
                  <X className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-red-500" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2">
                <div className="text-sm sm:text-lg font-bold text-green-500">{player.credits} crediti</div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-5 w-5 sm:h-6 sm:w-6 p-0 hover:bg-blue-500/10 touch-manipulation"
                  onClick={handleEditCredits}
                >
                  <Edit2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-500" />
                </Button>
              </div>
            )}
          </div>
        </>
      ) : (
        <Button
          variant="ghost"
          className="w-full h-20 sm:h-24 flex flex-col items-center justify-center space-y-1 sm:space-y-2 hover:bg-white/10 touch-manipulation"
          onClick={() => onPositionClick(slot, role)}
        >
          <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
          <span className="text-[10px] sm:text-xs font-medium text-muted-foreground text-center">{label}</span>
        </Button>
      )}
    </Card>
  );
};

export default RealTimePositionCard;
