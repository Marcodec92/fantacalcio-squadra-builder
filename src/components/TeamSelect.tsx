
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Team } from '@/types/Player';

const teams: Team[] = [
  'Atalanta', 'Bologna', 'Cagliari', 'Como', 'Cremonese', 'Fiorentina',
  'Genoa', 'Inter', 'Juventus', 'Lazio', 'Lecce',
  'Milan', 'Napoli', 'Parma', 'Pisa', 'Roma', 'Sassuolo', 'Torino', 'Udinese', 'Verona'
];

interface TeamSelectProps {
  value: Team | '';
  onChange: (team: Team) => void;
}

const TeamSelect: React.FC<TeamSelectProps> = ({ value, onChange }) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="bg-white text-black border-gray-300">
        <SelectValue placeholder="Seleziona squadra" />
      </SelectTrigger>
      <SelectContent>
        {teams.map((team) => (
          <SelectItem key={team} value={team} className="text-black font-medium hover:bg-gray-100">
            {team}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default TeamSelect;
