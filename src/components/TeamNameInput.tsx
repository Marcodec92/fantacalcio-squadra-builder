import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Edit3 } from 'lucide-react';

interface TeamNameInputProps {
  teamName: string;
  onTeamNameChange: (name: string) => void;
}

const TeamNameInput: React.FC<TeamNameInputProps> = ({ teamName, onTeamNameChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localName, setLocalName] = useState(teamName);

  useEffect(() => {
    setLocalName(teamName);
  }, [teamName]);

  const handleSave = () => {
    onTeamNameChange(localName);
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    }
    if (e.key === 'Escape') {
      setLocalName(teamName);
      setIsEditing(false);
    }
  };

  return (
    <Card className="glass-card p-3 sm:p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
        <Label htmlFor="team-name" className="text-xs sm:text-sm font-medium text-muted-foreground whitespace-nowrap">
          Nome Squadra:
        </Label>
        {isEditing ? (
          <Input
            id="team-name"
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyPress}
            className="glass-button border-white/20 bg-white/5 w-full sm:max-w-xs text-sm sm:text-base"
            autoFocus
            placeholder="Inserisci nome squadra..."
          />
        ) : (
          <div
            className="flex items-center space-x-2 cursor-pointer hover:text-primary transition-colors touch-manipulation w-full sm:w-auto"
            onClick={() => setIsEditing(true)}
          >
            <span className="font-medium text-base sm:text-lg truncate">
              {teamName || 'Squadra Senza Nome'}
            </span>
            <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-60 flex-shrink-0" />
          </div>
        )}
      </div>
    </Card>
  );
};

export default TeamNameInput;