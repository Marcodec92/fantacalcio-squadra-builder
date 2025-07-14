
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";
import { PlayerRole } from '@/types/Player';
import { RealTimeSelection } from '@/pages/RealTimeBuilder';

interface RealTimePositionCardProps {
  slot: number;
  role: PlayerRole;
  label: string;
  selection?: RealTimeSelection;
  onPositionClick: (slot: number, role: PlayerRole) => void;
  onRemovePlayer: (slot: number, role: PlayerRole) => void;
}

const RealTimePositionCard: React.FC<RealTimePositionCardProps> = ({
  slot,
  role,
  label,
  selection,
  onPositionClick,
  onRemovePlayer
}) => {
  const player = selection?.player;

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
            <div className="text-lg font-bold text-green-600">{player.credits} crediti</div>
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
