
import React from 'react';
import { PlayerRole } from '@/types/Player';
import { RealTimeSelection } from '@/pages/RealTimeBuilder';
import RealTimeBudgetWheel from './RealTimeBudgetWheel';
import RealTimeRoleBudgets from './RealTimeRoleBudgets';
import RealTimeSquadGrid from './RealTimeSquadGrid';

interface RealTimeBudgetLayoutProps {
  totalCredits: number;
  maxBudget: number;
  selectedCount: number;
  roleCredits: Record<PlayerRole, number>;
  selections: RealTimeSelection[];
  onPositionClick: (slot: number, role: PlayerRole) => void;
  onRemovePlayer: (slot: number, role: PlayerRole) => void;
}

const RealTimeBudgetLayout: React.FC<RealTimeBudgetLayoutProps> = ({
  totalCredits,
  maxBudget,
  selectedCount,
  roleCredits,
  selections,
  onPositionClick,
  onRemovePlayer
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Budget Wheels */}
      <div className="lg:col-span-1 space-y-8 slide-in-left">
        {/* Total Budget Wheel */}
        <div className="glass-card p-8 shadow-xl pulse-glow">
          <h3 className="text-xl font-bold mb-6 text-center text-gradient">Budget Totale</h3>
          <RealTimeBudgetWheel 
            totalCredits={totalCredits}
            maxBudget={maxBudget}
            selectedCount={selectedCount}
          />
        </div>

        {/* Role Budget Wheels */}
        <RealTimeRoleBudgets 
          roleCredits={roleCredits}
          maxBudget={maxBudget}
        />
      </div>

      {/* Squad Grid */}
      <div className="lg:col-span-3 slide-in-right">
        <div className="glass-card p-8 shadow-2xl">
          <RealTimeSquadGrid
            selections={selections}
            onPositionClick={onPositionClick}
            onRemovePlayer={onRemovePlayer}
          />
        </div>
      </div>
    </div>
  );
};

export default RealTimeBudgetLayout;
