
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BonusCalculatorProps {
  goals: number;
  assists: number;
  malus: number;
  onChange?: (field: 'goals' | 'assists' | 'malus', value: number) => void;
  readonly?: boolean;
}

const BonusCalculator: React.FC<BonusCalculatorProps> = ({ 
  goals, 
  assists, 
  malus, 
  onChange, 
  readonly = false 
}) => {
  const calculateBonus = () => {
    return (goals * 3) + (assists * 1) + (malus * -0.5);
  };

  const bonus = calculateBonus();

  return (
    <div className="space-y-3">
      {!readonly && (
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label htmlFor="goals">Gol</Label>
            <Input
              id="goals"
              type="number"
              min="0"
              value={goals}
              onChange={(e) => onChange?.('goals', parseInt(e.target.value) || 0)}
              placeholder="0"
            />
          </div>
          <div>
            <Label htmlFor="assists">Assist</Label>
            <Input
              id="assists"
              type="number"
              min="0"
              value={assists}
              onChange={(e) => onChange?.('assists', parseInt(e.target.value) || 0)}
              placeholder="0"
            />
          </div>
          <div>
            <Label htmlFor="malus">Malus</Label>
            <Input
              id="malus"
              type="number"
              min="0"
              value={malus}
              onChange={(e) => onChange?.('malus', parseInt(e.target.value) || 0)}
              placeholder="0"
            />
          </div>
        </div>
      )}
      
      <div className="bg-gradient-to-r from-blue-50 to-green-50 p-3 rounded-lg">
        <div className="text-center">
          <div className="text-lg font-bold text-gray-800">
            Bonus Totale: <span className={bonus >= 0 ? 'text-green-600' : 'text-red-600'}>
              {bonus.toFixed(1)}
            </span>
          </div>
          {!readonly && (
            <div className="text-xs text-gray-600 mt-1">
              ({goals} gol × 3) + ({assists} assist × 1) + ({malus} malus × -0.5)
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BonusCalculator;
