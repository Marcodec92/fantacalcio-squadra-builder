
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
    <div className="space-y-2">
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
      
      <div className="grid grid-cols-3 gap-2 text-sm">
        <div className="bg-gray-50 p-2 rounded text-center">
          <div className="font-semibold text-blue-600">{calculateCost(300)}</div>
          <div className="text-xs text-gray-600">Budget 300</div>
        </div>
        <div className="bg-gray-50 p-2 rounded text-center">
          <div className="font-semibold text-green-600">{calculateCost(500)}</div>
          <div className="text-xs text-gray-600">Budget 500</div>
        </div>
        <div className="bg-gray-50 p-2 rounded text-center">
          <div className="font-semibold text-purple-600">{calculateCost(650)}</div>
          <div className="text-xs text-gray-600">Budget 650</div>
        </div>
      </div>
      
      {readonly && (
        <div className="text-xs text-gray-500 text-center">
          {percentage.toFixed(1)}% del budget
        </div>
      )}
    </div>
  );
};

export default CostCalculator;
