
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlayerRole, PlayerTier, GoalkeeperTier, DefenderMidfielderTier, AttackerTier } from '@/types/Player';

const tierOptions: Record<PlayerRole, PlayerTier[]> = {
  Portiere: ['1ª fascia', '2ª fascia', '3ª fascia'] as GoalkeeperTier[],
  Difensore: ['1ª fascia', '2ª fascia', '3ª fascia', '4ª fascia', '5ª fascia', '6ª fascia', '7ª fascia', '8ª fascia'] as DefenderMidfielderTier[],
  Centrocampista: ['1ª fascia', '2ª fascia', '3ª fascia', '4ª fascia', '5ª fascia', '6ª fascia', '7ª fascia', '8ª fascia'] as DefenderMidfielderTier[],
  Attaccante: ['1ª fascia', '2ª fascia', '3ª fascia', '4ª fascia', '5ª fascia', '6ª fascia'] as AttackerTier[]
};

const getTierColor = (tier: PlayerTier): string => {
  const tierNumber = parseInt(tier.charAt(0));
  const colors = [
    'bg-red-100 border-red-300 text-red-800',     // 1ª fascia
    'bg-orange-100 border-orange-300 text-orange-800', // 2ª fascia
    'bg-yellow-100 border-yellow-300 text-yellow-800', // 3ª fascia
    'bg-lime-100 border-lime-300 text-lime-800',   // 4ª fascia
    'bg-green-100 border-green-300 text-green-800', // 5ª fascia
    'bg-cyan-100 border-cyan-300 text-cyan-800',   // 6ª fascia
    'bg-blue-100 border-blue-300 text-blue-800',   // 7ª fascia
    'bg-purple-100 border-purple-300 text-purple-800' // 8ª fascia
  ];
  return colors[tierNumber - 1] || 'bg-gray-100 border-gray-300 text-gray-800';
};

interface TierSelectProps {
  roleCategory: PlayerRole;
  value: PlayerTier | '';
  onChange?: (tier: PlayerTier) => void;
  readonly?: boolean;
}

const TierSelect: React.FC<TierSelectProps> = ({ roleCategory, value, onChange, readonly = false }) => {
  const availableTiers = tierOptions[roleCategory];
  const colorClass = value ? getTierColor(value) : '';

  if (readonly) {
    return (
      <div className="space-y-1">
        <div className="text-xs font-medium text-gray-700">Fascia</div>
        <div className={`px-2 py-1 rounded text-xs font-medium ${colorClass || 'bg-gray-100 text-gray-600'}`}>
          {value || 'Non assegnata'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-gray-700">Fascia</div>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={`bg-white ${colorClass}`}>
          <SelectValue placeholder="Seleziona fascia" />
        </SelectTrigger>
        <SelectContent className="bg-white border shadow-lg z-50">
          {availableTiers.map((tier) => (
            <SelectItem 
              key={tier} 
              value={tier} 
              className={`hover:bg-gray-100 ${getTierColor(tier)}`}
            >
              {tier}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default TierSelect;
