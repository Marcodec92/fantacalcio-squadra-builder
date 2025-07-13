
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CostCalculatorProps {
  percentage: number;
  onChange?: (percentage: number) => void;
  readonly?: boolean;
}

const CostCalculator: React.FC<CostCalculatorProps> = ({ 
  percentage, 
  onChange, 
  readonly = false 
}) => {
  const calculateCost = (budget: number) => {
    return Math.round((percentage / 100) * budget);
  };

  return (
    <div className="space-y-3">
      {!readonly && (
        <div>
          <Label htmlFor="percentage">Percentuale (%)</Label>
          <Input
            id="percentage"
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={percentage}
            onChange={(e) => onChange?.(parseFloat(e.target.value) || 0)}
            placeholder="0"
          />
        </div>
      )}
      
      <div className="space-y-2">
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-gray-600">Budget 300 crediti:</span>
            <span className="font-bold text-blue-600 text-base">{calculateCost(300)}</span>
          </div>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-gray-600">Budget 500 crediti:</span>
            <span className="font-bold text-green-600 text-base">{calculateCost(500)}</span>
          </div>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-gray-600">Budget 650 crediti:</span>
            <span className="font-bold text-purple-600 text-base">{calculateCost(650)}</span>
          </div>
        </div>
      </div>
      
      {readonly && (
        <div className="text-xs text-gray-500 text-center mt-2">
          {percentage.toFixed(1)}% del budget
        </div>
      )}
    </div>
  );
};

export default CostCalculator;
