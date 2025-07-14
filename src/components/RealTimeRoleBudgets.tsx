
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
    <Card className="p-6 shadow-xl bg-white/70 backdrop-blur-sm border-0 rounded-3xl">
      <h3 className="text-lg font-bold mb-4 text-center text-gray-800">Budget per Ruolo</h3>
      <div className="space-y-4">
        {roleConfig.map(({ role, label, emoji, color }) => {
          const credits = roleCredits[role];
          // Calcola la percentuale basata sul budget totale, non sul totale speso
          const percentage = maxBudget > 0 ? (credits / maxBudget) * 100 : 0;
          
          return (
            <div key={role} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span>{emoji}</span>
                  <span className="text-sm font-medium text-gray-700">{label}</span>
                </div>
                <span className="text-sm font-bold" style={{ color }}>
                  {credits} crediti
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-500 ease-in-out"
                  style={{
                    width: `${Math.min(percentage, 100)}%`,
                    backgroundColor: color
                  }}
                />
              </div>
              
              <div className="text-xs text-center text-gray-500">
                {percentage.toFixed(1)}% del budget totale ({maxBudget} crediti)
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default RealTimeRoleBudgets;
