
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
  onPlayerMove?: (fromSlot: number, fromRole: PlayerRole, toSlot: number, toRole: PlayerRole) => void;
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
  onPlayerMove,
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

        {/* Budget sections side-by-side on mobile, vertical on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-4 lg:gap-8">
          {/* Total Budget Wheel */}
          <div className="glass-card p-2 sm:p-4 lg:p-8 shadow-xl pulse-glow">
            <h3 className="text-sm sm:text-lg lg:text-xl font-bold mb-2 sm:mb-4 lg:mb-6 text-center text-gradient">Budget Totale</h3>
            <RealTimeBudgetWheel 
              totalCredits={totalCredits}
              maxBudget={maxBudget}
              selectedCount={selectedCount}
            />
          </div>

          {/* Role Budget Wheels */}
          <div className="lg:mt-0">
            <RealTimeRoleBudgets 
              roleCredits={roleCredits}
              maxBudget={maxBudget}
            />
          </div>
        </div>
      </div>

      {/* Squad Grid - Now comes after budget controls on mobile */}
      <div className="lg:col-span-3 slide-in-right order-2 lg:order-2">
        <div className="glass-card p-4 sm:p-8 shadow-2xl">
          <RealTimeSquadGrid
            selections={selections}
            onPositionClick={onPositionClick}
            onRemovePlayer={onRemovePlayer}
            onUpdateCredits={onUpdateCredits}
            onPlayerMove={onPlayerMove}
          />
        </div>
      </div>
    </div>
  );
};

export default RealTimeBudgetLayout;
