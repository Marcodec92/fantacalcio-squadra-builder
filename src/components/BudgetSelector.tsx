
import React from 'react';
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface BudgetSelectorProps {
  selectedBudget: number;
  onBudgetChange: (budget: number) => void;
}

const BudgetSelector: React.FC<BudgetSelectorProps> = ({
  selectedBudget,
  onBudgetChange
}) => {
  const budgetOptions = [
    { value: 300, label: '300 Crediti', emoji: '🥉', description: 'Budget Base' },
    { value: 500, label: '500 Crediti', emoji: '🥈', description: 'Budget Standard' },
    { value: 650, label: '650 Crediti', emoji: '🥇', description: 'Budget Premium' }
  ];

  return (
    <Card className="p-6 shadow-xl bg-white/70 backdrop-blur-sm border-0 rounded-3xl">
      <h3 className="text-xl font-bold mb-4 text-center text-gradient">
        💰 Seleziona Budget Massimo
      </h3>
      
      <RadioGroup 
        value={selectedBudget.toString()} 
        onValueChange={(value) => onBudgetChange(parseInt(value))}
        className="space-y-4"
      >
        {budgetOptions.map(({ value, label, emoji, description }) => (
          <div key={value} className="flex items-center space-x-3">
            <RadioGroupItem 
              value={value.toString()} 
              id={`budget-${value}`}
              className="text-primary"
            />
            <Label 
              htmlFor={`budget-${value}`}
              className="flex-1 cursor-pointer"
            >
              <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/20 transition-colors">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{emoji}</span>
                  <div>
                    <p className="font-semibold text-gray-800">{label}</p>
                    <p className="text-sm text-gray-600">{description}</p>
                  </div>
                </div>
                <div className={`text-lg font-bold ${
                  selectedBudget === value ? 'text-primary' : 'text-gray-500'
                }`}>
                  {value}
                </div>
              </div>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </Card>
  );
};

export default BudgetSelector;
