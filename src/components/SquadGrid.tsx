
import React from 'react';
import { Player, PlayerRole } from '@/types/Player';
import { SquadSelection } from '@/hooks/useSquadSelections';
import RoleSection from './RoleSection';

interface SquadGridProps {
  squadSelections: SquadSelection[];
  players: Player[];
  onPositionClick: (slot: number, role: PlayerRole) => void;
  onRemovePlayer: (selectionId: string) => void;
  calculateBonusTotal: (player: Player) => number;
}

const SquadGrid: React.FC<SquadGridProps> = ({
  squadSelections,
  players,
  onPositionClick,
  onRemovePlayer,
  calculateBonusTotal
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
    <div className="space-y-8">
      {roleConfig.map(({ title, emoji, role, slots, columns }) => (
        <div key={role}>
          <h3 className={`text-xl font-bold mb-4 flex items-center text-gray-800 bg-gradient-to-r ${roleConfig.find(r => r.role === role)?.gradient} bg-clip-text text-transparent`}>
            {emoji} {title}
          </h3>
          <RoleSection
            title={title}
            emoji={emoji}
            role={role}
            slots={slots}
            columns={columns}
            players={players}
            squadSelections={squadSelections}
            onPositionClick={onPositionClick}
            onRemovePlayer={onRemovePlayer}
            calculateBonusTotal={calculateBonusTotal}
          />
        </div>
      ))}
    </div>
  );
};

export default SquadGrid;
