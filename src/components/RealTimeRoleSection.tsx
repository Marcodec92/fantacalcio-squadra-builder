
import React from 'react';
import { PlayerRole } from '@/types/Player';
import { RealTimeSelection } from '@/pages/RealTimeBuilder';
import RealTimePositionCard from './RealTimePositionCard';

interface RealTimeRoleSectionProps {
  role: PlayerRole;
  slots: number[];
  columns: number;
  selections: RealTimeSelection[];
  onPositionClick: (slot: number, role: PlayerRole) => void;
  onRemovePlayer: (slot: number, role: PlayerRole) => void;
}

const RealTimeRoleSection: React.FC<RealTimeRoleSectionProps> = ({
  role,
  slots,
  columns,
  selections,
  onPositionClick,
  onRemovePlayer
}) => {
  const getSelectionForPosition = (slot: number, role: PlayerRole) => {
    return selections.find(
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
    <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      {slots.map(slot => (
        <RealTimePositionCard
          key={slot}
          slot={slot}
          role={role}
          label={getSlotLabel(slot)}
          selection={getSelectionForPosition(slot, role)}
          onPositionClick={onPositionClick}
          onRemovePlayer={onRemovePlayer}
        />
      ))}
    </div>
  );
};

export default RealTimeRoleSection;
