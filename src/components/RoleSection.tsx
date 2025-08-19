
import React from 'react';
import { Player, PlayerRole } from '@/types/Player';
import { SquadSelection } from '@/hooks/useSquadSelections';
import PositionCard from './PositionCard';

interface RoleSectionProps {
  role: PlayerRole;
  slots: number[];
  columns: number;
  players: Player[];
  squadSelections: SquadSelection[];
  onPositionClick: (slot: number, role: PlayerRole) => void;
  onRemovePlayer: (selectionId: string) => void;
  onPlayerMove?: (fromSlot: number, fromRole: PlayerRole, toSlot: number, toRole: PlayerRole) => void;
  calculateBonusTotal: (player: Player) => number;
}

const RoleSection: React.FC<RoleSectionProps> = ({
  role,
  slots,
  columns,
  players,
  squadSelections,
  onPositionClick,
  onRemovePlayer,
  onPlayerMove,
  calculateBonusTotal
}) => {
  const getPlayerForPosition = (slot: number, role: PlayerRole) => {
    const selection = squadSelections.find(
      s => s.position_slot === slot && s.role_category === role
    );
    if (!selection) return null;
    return players.find(p => p.id === selection.player_id);
  };

  const getSelectionForPosition = (slot: number, role: PlayerRole) => {
    return squadSelections.find(
      s => s.position_slot === slot && s.role_category === role
    );
  };

  const getSlotLabel = (slot: number) => {
    const roleAbbreviation = {
      'Portiere': 'P',
      'Difensore': 'D',
      'Centrocampista': 'C',
      'Attaccante': 'A'
    }[role];
    return `${roleAbbreviation}${slot}`;
  };

  return (
    <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      {slots.map(slot => (
        <PositionCard
          key={slot}
          slot={slot}
          role={role}
          label={getSlotLabel(slot)}
          player={getPlayerForPosition(slot, role)}
          selection={getSelectionForPosition(slot, role)}
          onPositionClick={onPositionClick}
          onRemovePlayer={onRemovePlayer}
          onPlayerMove={onPlayerMove}
          calculateBonusTotal={calculateBonusTotal}
        />
      ))}
    </div>
  );
};

export default RoleSection;
