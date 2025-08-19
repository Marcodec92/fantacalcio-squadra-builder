
import React from 'react';
import { Player, PlayerRole } from '@/types/Player';
import { SquadSelection } from '@/hooks/useSquadSelections';
import RoleSection from './RoleSection';

interface SquadGridProps {
  squadSelections: SquadSelection[];
  players: Player[];
  onPositionClick: (slot: number, role: PlayerRole) => void;
  onRemovePlayer: (selectionId: string) => void;
  onPlayerMove?: (fromSlot: number, fromRole: PlayerRole, toSlot: number, toRole: PlayerRole) => void;
  calculateBonusTotal: (player: Player) => number;
}

const SquadGrid: React.FC<SquadGridProps> = ({
  squadSelections,
  players,
  onPositionClick,
  onRemovePlayer,
  onPlayerMove,
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
      columns: 3,
      gradient: "from-green-600 to-emerald-600"
    },
    {
      title: "Centrocampisti (8)",
      emoji: "⚡",
      role: "Centrocampista" as PlayerRole,
      slots: [1, 2, 3, 4, 5, 6, 7, 8],
      columns: 3,
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
    <div className="space-y-4">
      {roleConfig.map(({ title, emoji, role, slots, columns, gradient }) => (
        <div key={role}>
          <h3 className={`text-lg font-bold mb-2 flex items-center text-gray-800 bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
            {emoji} {title}
          </h3>
          <RoleSection
            role={role}
            slots={slots}
            columns={columns}
            players={players}
            squadSelections={squadSelections}
            onPositionClick={onPositionClick}
            onRemovePlayer={onRemovePlayer}
            onPlayerMove={onPlayerMove}
            calculateBonusTotal={calculateBonusTotal}
          />
        </div>
      ))}
    </div>
  );
};

export default SquadGrid;
