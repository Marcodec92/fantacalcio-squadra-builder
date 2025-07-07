
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlayerRole, SpecificRole } from '@/types/Player';

const roleOptions: Record<PlayerRole, SpecificRole[]> = {
  Portiere: ['Portiere'],
  Difensore: ['Difensore centrale', 'Esterno offensivo', 'Braccetto'],
  Centrocampista: ['Mediano', 'Regista', 'Mezzala', 'Trequartista', 'Ala offensiva'],
  Attaccante: ['Attaccante centrale', 'Seconda punta', 'Mezzapunta', 'Ala offensiva']
};

interface RoleSelectProps {
  roleCategory: PlayerRole;
  value: SpecificRole;
  onChange: (role: SpecificRole) => void;
}

const RoleSelect: React.FC<RoleSelectProps> = ({ roleCategory, value, onChange }) => {
  const availableRoles = roleOptions[roleCategory];

  // Verifica se il valore corrente è valido per la categoria selezionata
  const isValidValue = availableRoles.includes(value);
  const displayValue = isValidValue ? value : '';

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-gray-700">
        Ruoli disponibili per {roleCategory}:
      </div>
      <Select value={displayValue} onValueChange={onChange}>
        <SelectTrigger className="bg-white">
          <SelectValue placeholder={`Seleziona ruolo specifico per ${roleCategory.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent className="bg-white border shadow-lg z-50">
          {availableRoles.map((role) => (
            <SelectItem key={role} value={role} className="hover:bg-gray-100">
              {role}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default RoleSelect;
