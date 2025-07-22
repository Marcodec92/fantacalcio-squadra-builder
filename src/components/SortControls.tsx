
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
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-4">
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <span className="text-sm font-medium text-white">Ordina per:</span>
        <Select value={sortBy} onValueChange={handleSortByChange}>
          <SelectTrigger className="w-full sm:w-48 bg-transparent border-white/20 text-white">
            <SelectValue className="text-white" />
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
        className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto justify-center h-10 px-3 text-xs sm:text-sm"
      >
        {sortDirection === 'desc' ? (
          <>
            <ArrowDown className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Decrescente</span>
            <span className="sm:hidden">↓</span>
          </>
        ) : (
          <>
            <ArrowUp className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Crescente</span>
            <span className="sm:hidden">↑</span>
          </>
        )}
      </Button>
    </div>
  );
};

export default SortControls;
