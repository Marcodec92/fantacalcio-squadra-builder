
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
    <div className="space-y-4">
      {!readonly && (
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="goals" className="text-sm font-medium text-gray-700">Gol</Label>
            <Input
              id="goals"
              type="number"
              min="0"
              value={goals}
              onChange={(e) => onChange?.('goals', parseInt(e.target.value) || 0)}
              placeholder="0"
              className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl shadow-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="assists" className="text-sm font-medium text-gray-700">Assist</Label>
            <Input
              id="assists"
              type="number"
              min="0"
              value={assists}
              onChange={(e) => onChange?.('assists', parseInt(e.target.value) || 0)}
              placeholder="0"
              className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl shadow-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="malus" className="text-sm font-medium text-gray-700">Malus</Label>
            <Input
              id="malus"
              type="number"
              min="0"
              value={malus}
              onChange={(e) => onChange?.('malus', parseInt(e.target.value) || 0)}
              placeholder="0"
              className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl shadow-sm"
            />
          </div>
        </div>
      )}
      
      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 rounded-2xl border border-gray-100 shadow-lg backdrop-blur-sm">
        <div className="text-center">
          <div className="text-xl font-bold text-gray-800 mb-1">
            Bonus Totale: <span className={bonus < 0 ? 'text-red-500' : 'text-emerald-600'}>
              {bonus > 0 ? '+' : ''}{bonus.toFixed(1)}
            </span>
          </div>
          {!readonly && (
            <div className="text-xs text-gray-500 mt-2 font-medium">
              ({goals} gol × 3) + ({assists} assist × 1) + ({malus} malus × -0.5)
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BonusCalculator;
