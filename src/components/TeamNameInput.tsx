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
    <Card className="glass-card p-4">
      <div className="flex items-center space-x-3">
        <Label htmlFor="team-name" className="text-sm font-medium text-muted-foreground">
          Nome Squadra:
        </Label>
        {isEditing ? (
          <Input
            id="team-name"
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyPress}
            className="glass-button border-white/20 bg-white/5 max-w-xs"
            autoFocus
            placeholder="Inserisci nome squadra..."
          />
        ) : (
          <div
            className="flex items-center space-x-2 cursor-pointer hover:text-primary transition-colors"
            onClick={() => setIsEditing(true)}
          >
            <span className="font-medium text-lg">
              {teamName || 'Squadra Senza Nome'}
            </span>
            <Edit3 className="w-4 h-4 opacity-60" />
          </div>
        )}
      </div>
    </Card>
  );
};

export default TeamNameInput;