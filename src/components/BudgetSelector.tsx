
import React from 'react';
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
      
      <Select 
        value={selectedBudget.toString()} 
        onValueChange={(value) => onBudgetChange(parseInt(value))}
      >
        <SelectTrigger className="w-full h-12 bg-white/80 border-2 border-white/30 rounded-2xl text-gray-800 font-medium hover:bg-white/90 transition-colors">
          <SelectValue placeholder="Seleziona budget" />
        </SelectTrigger>
        <SelectContent className="bg-white border-2 border-white/30 rounded-2xl shadow-xl backdrop-blur-sm z-50">
          {budgetOptions.map(({ value, label, emoji, description }) => (
            <SelectItem 
              key={value} 
              value={value.toString()}
              className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100 rounded-xl my-1 mx-1 text-gray-800 font-medium"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{emoji}</span>
                  <div>
                    <p className="font-semibold text-gray-800">{label}</p>
                    <p className="text-sm text-gray-600">{description}</p>
                  </div>
                </div>
                <div className="text-lg font-bold text-primary ml-4">
                  {value}
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Card>
  );
};

export default BudgetSelector;
