
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
    <Card className="glass-card p-4 sm:p-6 shadow-xl rounded-2xl sm:rounded-3xl border border-white/10 bg-background/80">
      <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-center text-gradient">
        💰 Seleziona Budget Massimo
      </h3>
      
      <Select 
        value={selectedBudget.toString()} 
        onValueChange={(value) => onBudgetChange(parseInt(value))}
      >
        <SelectTrigger className="w-full h-10 sm:h-12 glass-button border-white/20 rounded-xl sm:rounded-2xl text-foreground font-medium hover:border-white/30 transition-colors">
          <SelectValue placeholder="Seleziona budget" />
        </SelectTrigger>
        <SelectContent className="glass-card border-white/20 rounded-xl sm:rounded-2xl shadow-xl backdrop-blur-xl z-[100] min-w-[280px] sm:min-w-[320px] bg-background/95">
          {budgetOptions.map(({ value, label, emoji, description }) => (
            <SelectItem 
              key={value} 
              value={value.toString()}
              className="cursor-pointer hover:bg-white/10 focus:bg-white/10 rounded-lg sm:rounded-xl my-1 mx-1 text-foreground font-medium touch-manipulation p-2 sm:p-3"
            >
              <div className="flex items-center justify-between w-full min-w-0">
                <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                  <span className="text-lg sm:text-2xl flex-shrink-0">{emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm sm:text-base truncate">{label}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">{description}</p>
                  </div>
                </div>
                <div className="text-base sm:text-lg font-bold text-primary ml-2 sm:ml-4 flex-shrink-0">
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
