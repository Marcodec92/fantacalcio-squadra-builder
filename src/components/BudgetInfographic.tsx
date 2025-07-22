
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
    <Card className="p-2 sm:p-4 lg:p-6 shadow-xl bg-white/70 backdrop-blur-sm border-0 rounded-3xl h-full flex flex-col">
      <h3 className="text-sm sm:text-lg lg:text-lg font-bold mb-2 sm:mb-4 text-center text-gray-800">Costo Squadra</h3>
      <div className="space-y-2 sm:space-y-3 lg:space-y-4 flex-1 flex flex-col justify-center">
        {budgets.map(({ credits, label }) => {
          const cost = calculateCost(credits);
          const isOver = isOverBudget(credits, cost);
          const color = getStatusColor(credits, cost);
          
          return (
            <div key={credits} className="relative">
              <div className="flex justify-between items-center mb-1 sm:mb-2">
                <span className="text-xs sm:text-sm font-medium text-gray-700 leading-tight">
                  {/* Shortened labels for mobile */}
                  <span className="block sm:hidden">{credits}cr</span>
                  <span className="hidden sm:block">{label}</span>
                </span>
                <span 
                  className="text-xs sm:text-sm font-bold"
                  style={{ color }}
                >
                  {cost}/{credits}
                </span>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-in-out"
                  style={{
                    width: `${Math.min((cost / credits) * 100, 100)}%`,
                    backgroundColor: color
                  }}
                />
              </div>
              
              {/* Status indicator - more compact on mobile */}
              <div className="mt-1 sm:mt-2 text-center">
                <div 
                  className="inline-block px-1 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium leading-tight"
                  style={{ 
                    backgroundColor: `${color}20`, 
                    color: color 
                  }}
                >
                  <span className="block sm:hidden">{isOver ? '⚠️' : '✅'}</span>
                  <span className="hidden sm:block">{isOver ? '⚠️ Limite superato' : '✅ Nei limiti'}</span>
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
