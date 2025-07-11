
import React from 'react';

interface BudgetWheelProps {
  totalBudget: number;
  selectedCount: number;
}

const BudgetWheel: React.FC<BudgetWheelProps> = ({ totalBudget, selectedCount }) => {
  const maxBudget = 100;
  const percentage = Math.min((totalBudget / maxBudget) * 100, 100);
  
  // Color logic based on budget usage
  const getColor = () => {
    if (totalBudget <= 70) return '#10B981'; // Green - Safe
    if (totalBudget <= 85) return '#F59E0B'; // Yellow - Warning  
    if (totalBudget <= 95) return '#EF4444'; // Red - Danger
    return '#7C2D12'; // Dark red - Critical
  };

  const color = getColor();
  const strokeDasharray = `${percentage * 2.51} 251.2`; // Circumference of circle is ~251.2

  return (
    <div className="relative w-40 h-40 mx-auto">
      {/* Background circle */}
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="8"
        />
        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset="0"
          className="transition-all duration-500 ease-in-out"
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-2xl font-bold" style={{ color }}>
          {totalBudget.toFixed(1)}%
        </div>
        <div className="text-xs text-gray-600 text-center">
          {selectedCount}/25 giocatori
        </div>
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
          {totalBudget <= 70 && 'Budget sicuro'}
          {totalBudget > 70 && totalBudget <= 85 && 'Attenzione budget'}
          {totalBudget > 85 && totalBudget <= 95 && 'Budget alto'}
          {totalBudget > 95 && 'Budget critico'}
        </div>
      </div>
    </div>
  );
};

export default BudgetWheel;
