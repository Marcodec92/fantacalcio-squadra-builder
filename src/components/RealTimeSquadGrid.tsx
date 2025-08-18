
import React from 'react';
import { PlayerRole } from '@/types/Player';
import { RealTimeSelection } from '@/pages/RealTimeBuilder';
import RealTimeRoleSection from './RealTimeRoleSection';

interface RealTimeSquadGridProps {
  selections: RealTimeSelection[];
  onPositionClick: (slot: number, role: PlayerRole) => void;
  onRemovePlayer: (slot: number, role: PlayerRole) => void;
  onUpdateCredits: (slot: number, role: PlayerRole, newCredits: number) => void;
}

const RealTimeSquadGrid: React.FC<RealTimeSquadGridProps> = ({
  selections,
  onPositionClick,
  onRemovePlayer,
  onUpdateCredits
}) => {
  const roleConfig = [
    {
      title: "Portieri (3)",
      emoji: "🥅",
      role: "Portiere" as PlayerRole,
      slots: [1, 2, 3],
      columns: 3,
      gradient: "from-blue-600 to-cyan-600"
    },
    {
      title: "Difensori (8)",
      emoji: "🛡️",
      role: "Difensore" as PlayerRole,
      slots: [1, 2, 3, 4, 5, 6, 7, 8],
      columns: 4,
      gradient: "from-green-600 to-emerald-600"
    },
    {
      title: "Centrocampisti (8)",
      emoji: "⚡",
      role: "Centrocampista" as PlayerRole,
      slots: [1, 2, 3, 4, 5, 6, 7, 8],
      columns: 4,
      gradient: "from-purple-600 to-pink-600"
    },
    {
      title: "Attaccanti (6)",
      emoji: "🎯",
      role: "Attaccante" as PlayerRole,
      slots: [1, 2, 3, 4, 5, 6],
      columns: 3,
      gradient: "from-red-600 to-orange-600"
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-8">
      {roleConfig.map(({ title, emoji, role, slots, columns, gradient }) => (
        <div key={role}>
          <h3 className={`text-lg sm:text-xl font-bold mb-3 sm:mb-4 flex items-center text-foreground bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
            {emoji} {title}
          </h3>
          <RealTimeRoleSection
            role={role}
            slots={slots}
            columns={columns}
            selections={selections}
            onPositionClick={onPositionClick}
            onRemovePlayer={onRemovePlayer}
            onUpdateCredits={onUpdateCredits}
          />
        </div>
      ))}
    </div>
  );
};

export default RealTimeSquadGrid;
