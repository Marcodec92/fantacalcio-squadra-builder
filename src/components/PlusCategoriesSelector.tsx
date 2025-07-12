
import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { PlusCategory, PlayerRole } from '@/types/Player';

interface PlusCategoriesSelectorProps {
  selected: PlusCategory[];
  onChange: (categories: PlusCategory[]) => void;
  readonly?: boolean;
  playerRole?: PlayerRole;
}

const PlusCategoriesSelector: React.FC<PlusCategoriesSelectorProps> = ({ 
  selected, 
  onChange, 
  readonly = false,
  playerRole
}) => {
  // Categorie comuni per tutti i ruoli
  const commonCategories: PlusCategory[] = [
    'Under 21',
    'Under 19',
    'Rigorista', 
    'Calci piazzati',
    'Assistman',
    'Goleador'
  ];

  // Categorie specifiche per portieri
  const goalkeeperCategories: PlusCategory[] = ['Pararigori'];

  const availableCategories = playerRole === 'Portiere' 
    ? [...commonCategories, ...goalkeeperCategories]
    : commonCategories;

  const toggleCategory = (category: PlusCategory) => {
    if (readonly) return;
    
    const newSelected = selected.includes(category)
      ? selected.filter(c => c !== category)
      : [...selected, category];
    
    onChange(newSelected);
  };

  if (readonly && selected.length === 0) {
    return <div className="text-sm text-gray-500">Nessuna categoria</div>;
  }

  if (readonly) {
    return (
      <div className="flex flex-wrap gap-1">
        {selected.map((category) => (
          <span
            key={category}
            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
          >
            {category}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>Categorie Plus</Label>
      <div className="grid grid-cols-2 gap-2">
        {availableCategories.map((category) => (
          <div key={category} className="flex items-center space-x-2">
            <Checkbox
              id={category}
              checked={selected.includes(category)}
              onCheckedChange={() => toggleCategory(category)}
            />
            <Label
              htmlFor={category}
              className="text-sm font-normal cursor-pointer"
            >
              {category}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlusCategoriesSelector;
