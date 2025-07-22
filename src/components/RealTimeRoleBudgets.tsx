
import React from 'react';
import { Card } from "@/components/ui/card";
import { PlayerRole } from '@/types/Player';

interface RealTimeRoleBudgetsProps {
  roleCredits: Record<PlayerRole, number>;
  maxBudget: number;
}

const RealTimeRoleBudgets: React.FC<RealTimeRoleBudgetsProps> = ({ 
  roleCredits, 
  maxBudget 
}) => {
  const roleConfig = [
    { role: 'Portiere' as PlayerRole, label: 'Portieri', emoji: '🥅', color: '#3B82F6' },
    { role: 'Difensore' as PlayerRole, label: 'Difensori', emoji: '🛡️', color: '#10B981' },
    { role: 'Centrocampista' as PlayerRole, label: 'Centrocampisti', emoji: '⚡', color: '#8B5CF6' },
    { role: 'Attaccante' as PlayerRole, label: 'Attaccanti', emoji: '🎯', color: '#EF4444' }
  ];

  return (
    <Card className="p-2 sm:p-4 lg:p-6 shadow-xl bg-white/70 backdrop-blur-sm border-0 rounded-3xl">
      <h3 className="text-sm sm:text-lg lg:text-lg font-bold mb-2 sm:mb-4 text-center text-gray-800">Budget per Ruolo</h3>
      <div className="space-y-2 sm:space-y-3 lg:space-y-4">
        {roleConfig.map(({ role, label, emoji, color }) => {
          const credits = roleCredits[role];
          // Calcola la percentuale basata sul budget totale, non sul totale speso
          const percentage = maxBudget > 0 ? (credits / maxBudget) * 100 : 0;
          
          return (
            <div key={role} className="space-y-1 sm:space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <span className="text-xs sm:text-sm">{emoji}</span>
                  <span className="text-xs sm:text-sm lg:text-sm font-medium text-gray-700 leading-tight">
                    {/* Shortened labels for mobile */}
                    <span className="block sm:hidden">
                      {role === 'Portiere' ? 'Portieri' :
                       role === 'Difensore' ? 'Difensori' :
                       role === 'Centrocampista' ? 'Centroc.' :
                       'Attaccanti'}
                    </span>
                    <span className="hidden sm:block">{label}</span>
                  </span>
                </div>
                <span className="text-xs sm:text-sm font-bold" style={{ color }}>
                  {credits}
                  <span className="hidden sm:inline"> crediti</span>
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                <div
                  className="h-1.5 sm:h-2 rounded-full transition-all duration-500 ease-in-out"
                  style={{
                    width: `${Math.min(percentage, 100)}%`,
                    backgroundColor: color
                  }}
                />
              </div>
              
              <div className="text-xs sm:text-xs text-center text-gray-500 leading-tight">
                <span className="block sm:hidden">{percentage.toFixed(1)}%</span>
                <span className="hidden sm:block">
                  {percentage.toFixed(1)}% del budget totale ({maxBudget} crediti)
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default RealTimeRoleBudgets;
