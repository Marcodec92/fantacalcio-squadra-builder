
import React from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { PlayerRole, SortOption } from '@/types/Player';

interface SortControlsProps {
  roleCategory: PlayerRole;
  sortBy: SortOption;
  sortDirection: 'asc' | 'desc';
  onSortChange: (sortBy: SortOption, direction: 'asc' | 'desc') => void;
}

const getSortOptions = (roleCategory: PlayerRole): { value: SortOption; label: string }[] => {
  const baseOptions = [
    { value: 'name' as SortOption, label: 'Nome' },
    { value: 'costPercentage' as SortOption, label: 'Budget %' },
    { value: 'fmv' as SortOption, label: 'FMV' },
    { value: 'tier' as SortOption, label: 'Fascia' }
  ];

  if (roleCategory === 'Portiere') {
    return [
      ...baseOptions,
      { value: 'xP' as SortOption, label: 'xP (Expected Points)' },
      { value: 'goalsConceded' as SortOption, label: 'Gol subiti' }
    ];
  }

  return [
    ...baseOptions,
    { value: 'bonusTotal' as SortOption, label: 'Bonus totale' },
    { value: 'xG' as SortOption, label: 'xG' },
    { value: 'xA' as SortOption, label: 'xA' }
  ];
};

const SortControls: React.FC<SortControlsProps> = ({ 
  roleCategory, 
  sortBy, 
  sortDirection, 
  onSortChange 
}) => {
  const sortOptions = getSortOptions(roleCategory);

  const handleSortByChange = (value: SortOption) => {
    onSortChange(value, sortDirection);
  };

  const toggleSortDirection = () => {
    onSortChange(sortBy, sortDirection === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-foreground">Ordina per:</span>
        <Select value={sortBy} onValueChange={handleSortByChange}>
          <SelectTrigger className="w-48 bg-white text-black border-gray-300">
            <SelectValue className="text-black" />
          </SelectTrigger>
          <SelectContent className="bg-white border shadow-lg z-50">
            {sortOptions.map(option => (
              <SelectItem 
                key={option.value} 
                value={option.value}
                className="text-black hover:bg-gray-100 focus:bg-gray-100 cursor-pointer font-medium"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={toggleSortDirection}
        className="flex items-center gap-2"
      >
        {sortDirection === 'desc' ? (
          <>
            <ArrowDown className="w-4 h-4" />
            Decrescente
          </>
        ) : (
          <>
            <ArrowUp className="w-4 h-4" />
            Crescente
          </>
        )}
      </Button>
    </div>
  );
};

export default SortControls;
