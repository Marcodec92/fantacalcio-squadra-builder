
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

  const getStatusText = () => {
    if (totalBudget <= 70) return 'Budget sicuro';
    if (totalBudget <= 85) return 'Attenzione budget';
    if (totalBudget <= 95) return 'Budget alto';
    return 'Budget critico';
  };

  const color = getColor();
  const statusText = getStatusText();
  const strokeDasharray = `${percentage * 2.51} 251.2`; // Circumference of circle is ~251.2

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Circular Progress */}
      <div className="relative w-40 h-40">
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
          <div className="text-3xl font-bold" style={{ color }}>
            {totalBudget.toFixed(1)}%
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {selectedCount}/25
          </div>
        </div>
      </div>
      
      {/* Status text positioned below the wheel */}
      <div className="text-center">
        <div 
          className="inline-block px-4 py-2 rounded-full text-sm font-semibold"
          style={{ 
            backgroundColor: `${color}20`, 
            color: color 
          }}
        >
          {statusText}
        </div>
      </div>
    </div>
  );
};

export default BudgetWheel;
