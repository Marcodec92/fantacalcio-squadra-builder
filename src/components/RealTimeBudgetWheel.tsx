
import React from 'react';

interface RealTimeBudgetWheelProps {
  totalCredits: number;
  maxBudget: number;
  selectedCount: number;
}

const RealTimeBudgetWheel: React.FC<RealTimeBudgetWheelProps> = ({ 
  totalCredits, 
  maxBudget, 
  selectedCount 
}) => {
  const percentage = Math.min((totalCredits / maxBudget) * 100, 100);
  
  const getColor = () => {
    if (percentage <= 70) return '#10B981'; // Green - Safe
    if (percentage <= 85) return '#F59E0B'; // Yellow - Warning  
    if (percentage <= 95) return '#EF4444'; // Red - Danger
    return '#7C2D12'; // Dark red - Critical
  };

  const getStatusText = () => {
    if (percentage <= 70) return 'Budget sicuro';
    if (percentage <= 85) return 'Attenzione budget';
    if (percentage <= 95) return 'Budget alto';
    return 'Budget critico';
  };

  const color = getColor();
  const statusText = getStatusText();
  const strokeDasharray = `${percentage * 2.51} 251.2`;

  return (
    <div className="flex flex-col items-center space-y-4">
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
        
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold" style={{ color }}>
            {totalCredits}
          </div>
          <div className="text-xs text-muted-foreground">/ {maxBudget}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {selectedCount}/25
          </div>
        </div>
      </div>
      
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

export default RealTimeBudgetWheel;
