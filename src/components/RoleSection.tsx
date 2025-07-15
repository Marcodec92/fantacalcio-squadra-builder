
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
    <div className="flex flex-wrap gap-4 justify-center">
      {slots.map(slot => (
        <div key={slot} className="flex-shrink-0" style={{ minWidth: '280px', maxWidth: '320px' }}>
          <PositionCard
            slot={slot}
            role={role}
            label={getSlotLabel(slot)}
            player={getPlayerForPosition(slot, role)}
            selection={getSelectionForPosition(slot, role)}
            onPositionClick={onPositionClick}
            onRemovePlayer={onRemovePlayer}
            calculateBonusTotal={calculateBonusTotal}
          />
        </div>
      ))}
    </div>
  );
};

export default RoleSection;
