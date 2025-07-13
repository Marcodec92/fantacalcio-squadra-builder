
import React from 'react';
import { Card } from "@/components/ui/card";

interface BudgetInfographicProps {
  totalBudgetPercentage: number;
}

const BudgetInfographic: React.FC<BudgetInfographicProps> = ({ totalBudgetPercentage }) => {
  const budgets = [
    { credits: 300, label: '300 Crediti' },
    { credits: 500, label: '500 Crediti' },
    { credits: 650, label: '650 Crediti' }
  ];

  const calculateCost = (budgetCredits: number) => {
    return Math.round((totalBudgetPercentage / 100) * budgetCredits);
  };

  const isOverBudget = (budgetCredits: number, cost: number) => {
    return cost > budgetCredits;
  };

  const getStatusColor = (budgetCredits: number, cost: number) => {
    return isOverBudget(budgetCredits, cost) ? '#EF4444' : '#10B981'; // Red if over, Green if within
  };

  return (
    <Card className="p-6 shadow-xl bg-white/70 backdrop-blur-sm border-0 rounded-3xl">
      <h3 className="text-lg font-bold mb-4 text-center text-gray-800">Costo Squadra</h3>
      <div className="space-y-4">
        {budgets.map(({ credits, label }) => {
          const cost = calculateCost(credits);
          const isOver = isOverBudget(credits, cost);
          const color = getStatusColor(credits, cost);
          
          return (
            <div key={credits} className="relative">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">{label}</span>
                <span 
                  className="text-sm font-bold"
                  style={{ color }}
                >
                  {cost}/{credits}
                </span>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-in-out"
                  style={{
                    width: `${Math.min((cost / credits) * 100, 100)}%`,
                    backgroundColor: color
                  }}
                />
              </div>
              
              {/* Status indicator */}
              <div className="mt-2 text-center">
                <div 
                  className="inline-block px-2 py-1 rounded-full text-xs font-medium"
                  style={{ 
                    backgroundColor: `${color}20`, 
                    color: color 
                  }}
                >
                  {isOver ? '⚠️ Limite superato' : '✅ Nei limiti'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default BudgetInfographic;
