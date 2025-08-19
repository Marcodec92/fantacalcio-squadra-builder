
import React from 'react';
import { Card } from "@/components/ui/card";
import { PlayerRole } from '@/types/Player';

interface RoleBudgetWheelsProps {
  roleBudgets: Record<PlayerRole, number>;
  roleCounts: Record<PlayerRole, number>;
}

const RoleBudgetWheels: React.FC<RoleBudgetWheelsProps> = ({
  roleBudgets,
  roleCounts
}) => {
  const maxCounts = {
    Portiere: 3,
    Difensore: 8,
    Centrocampista: 8,
    Attaccante: 6
  };

  const roleIcons = {
    Portiere: '🥅',
    Difensore: '🛡️',
    Centrocampista: '⚡',
    Attaccante: '🎯'
  };

  const getColor = (budget: number) => {
    if (budget <= 15) return '#10B981'; // Green
    if (budget <= 25) return '#F59E0B'; // Yellow
    if (budget <= 35) return '#EF4444'; // Red
    return '#7C2D12'; // Dark red
  };

  const renderMiniWheel = (role: PlayerRole) => {
    const budget = roleBudgets[role];
    const count = roleCounts[role];
    const maxCount = maxCounts[role];
    const percentage = Math.min((budget / 40) * 100, 100); // Assuming max ~40% per role
    const color = getColor(budget);
    const strokeDasharray = `${percentage * 1.26} 125.6`; // Circumference of smaller circle

    return (
      <Card key={role} className="p-4">
        <div className="text-center">
          <div className="text-lg mb-2">{roleIcons[role]}</div>
          <div className="relative w-20 h-20 mx-auto mb-2">
            {/* Background circle */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 50 50">
              <circle
                cx="25"
                cy="25"
                r="20"
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="4"
              />
              {/* Progress circle */}
              <circle
                cx="25"
                cy="25"
                r="20"
                fill="none"
                stroke={color}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={strokeDasharray}
                strokeDashoffset="0"
                className="transition-all duration-500 ease-in-out"
              />
            </svg>
            
            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-sm font-bold" style={{ color }}>
                {budget.toFixed(1)}%
              </div>
            </div>
          </div>
          
          <div className="text-xs text-gray-600">
            {count}/{maxCount}
          </div>
          <div className="text-xs text-gray-500 capitalize">
            {role}
          </div>
          <div className="text-xs text-gray-600 mt-2 space-y-1">
            <div className="font-medium">Spesa stimata:</div>
            <div className="space-y-0.5">
              <div>300cr: {Math.round((budget / 100) * 300)}</div>
              <div>500cr: {Math.round((budget / 100) * 500)}</div>
              <div>650cr: {Math.round((budget / 100) * 650)}</div>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-center text-gray-700 mb-3">
        Budget per Ruolo
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {(Object.keys(roleBudgets) as PlayerRole[]).map(renderMiniWheel)}
      </div>
    </div>
  );
};

export default RoleBudgetWheels;
