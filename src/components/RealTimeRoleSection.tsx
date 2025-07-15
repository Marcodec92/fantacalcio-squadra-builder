
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
  onUpdateCredits: (slot: number, role: PlayerRole, newCredits: number) => void;
}

const RealTimeRoleSection: React.FC<RealTimeRoleSectionProps> = ({
  role,
  slots,
  columns,
  selections,
  onPositionClick,
  onRemovePlayer,
  onUpdateCredits
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
    <div className="flex flex-wrap gap-4 justify-center">
      {slots.map(slot => (
        <div key={slot} className="flex-shrink-0" style={{ minWidth: '280px', maxWidth: '320px' }}>
          <RealTimePositionCard
            slot={slot}
            role={role}
            label={getSlotLabel(slot)}
            selection={getSelectionForPosition(slot, role)}
            onPositionClick={onPositionClick}
            onRemovePlayer={onRemovePlayer}
            onUpdateCredits={onUpdateCredits}
          />
        </div>
      ))}
    </div>
  );
};

export default RealTimeRoleSection;
