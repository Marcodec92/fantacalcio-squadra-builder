
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlayerRole, SpecificRole } from '@/types/Player';

const roleOptions: Record<PlayerRole, SpecificRole[]> = {
  portiere: ['portiere'],
  difensore: ['difensore centrale', 'esterno offensivo', 'braccetto'],
  centrocampista: ['mediano', 'regista', 'mezzala', 'trequartista', 'ala offensiva'],
  attaccante: ['attaccante centrale', 'seconda punta', 'mezzapunta', 'ala offensiva']
};

interface RoleSelectProps {
  roleCategory: PlayerRole;
  value: SpecificRole;
  onChange: (role: SpecificRole) => void;
}

const RoleSelect: React.FC<RoleSelectProps> = ({ roleCategory, value, onChange }) => {
  const availableRoles = roleOptions[roleCategory];

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Seleziona ruolo" />
      </SelectTrigger>
      <SelectContent>
        {availableRoles.map((role) => (
          <SelectItem key={role} value={role}>
            {role}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default RoleSelect;
