
import React from 'react';
import { PlayerRole } from '@/types/Player';
import { RealTimeSelection } from '@/pages/RealTimeBuilder';
import RealTimeBudgetWheel from './RealTimeBudgetWheel';
import RealTimeRoleBudgets from './RealTimeRoleBudgets';
import RealTimeSquadGrid from './RealTimeSquadGrid';
import BudgetSelector from './BudgetSelector';

interface RealTimeBudgetLayoutProps {
  totalCredits: number;
  maxBudget: number;
  selectedCount: number;
  roleCredits: Record<PlayerRole, number>;
  selections: RealTimeSelection[];
  onPositionClick: (slot: number, role: PlayerRole) => void;
  onRemovePlayer: (slot: number, role: PlayerRole) => void;
  onUpdateCredits: (slot: number, role: PlayerRole, newCredits: number) => void;
  onBudgetChange: (budget: number) => void;
}

const RealTimeBudgetLayout: React.FC<RealTimeBudgetLayoutProps> = ({
  totalCredits,
  maxBudget,
  selectedCount,
  roleCredits,
  selections,
  onPositionClick,
  onRemovePlayer,
  onUpdateCredits,
  onBudgetChange
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-8">
      {/* Budget Controls - Order changed for mobile: budget controls come first */}
      <div className="lg:col-span-1 space-y-4 sm:space-y-8 slide-in-left order-1 lg:order-1">
        {/* Budget Selector */}
        <div className="pulse-glow">
          <BudgetSelector 
            selectedBudget={maxBudget}
            onBudgetChange={onBudgetChange}
          />
        </div>

        {/* Total Budget Wheel */}
        <div className="glass-card p-4 sm:p-8 shadow-xl pulse-glow">
          <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-center text-gradient">Budget Totale</h3>
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

      {/* Squad Grid - Now comes after budget controls on mobile */}
      <div className="lg:col-span-3 slide-in-right order-2 lg:order-2">
        <div className="glass-card p-4 sm:p-8 shadow-2xl">
          <RealTimeSquadGrid
            selections={selections}
            onPositionClick={onPositionClick}
            onRemovePlayer={onRemovePlayer}
            onUpdateCredits={onUpdateCredits}
          />
        </div>
      </div>
    </div>
  );
};

export default RealTimeBudgetLayout;
