
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface GoalkeeperStatsProps {
  goalsConceded: number;
  yellowCards: number;
  penaltiesSaved: number;
  onChange?: (field: 'goalsConceded' | 'yellowCards' | 'penaltiesSaved', value: number) => void;
  readonly?: boolean;
}

const GoalkeeperStats: React.FC<GoalkeeperStatsProps> = ({ 
  goalsConceded, 
  yellowCards, 
  penaltiesSaved, 
  onChange, 
  readonly = false 
}) => {
  return (
    <div className="space-y-3">
      {!readonly && (
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label htmlFor="goalsConceded">Gol subiti</Label>
            <Input
              id="goalsConceded"
              type="number"
              min="0"
              value={goalsConceded}
              onChange={(e) => onChange?.('goalsConceded', parseInt(e.target.value) || 0)}
              placeholder="0"
            />
          </div>
          <div>
            <Label htmlFor="yellowCards">Ammonizioni</Label>
            <Input
              id="yellowCards"
              type="number"
              min="0"
              value={yellowCards}
              onChange={(e) => onChange?.('yellowCards', parseInt(e.target.value) || 0)}
              placeholder="0"
            />
          </div>
          <div>
            <Label htmlFor="penaltiesSaved">Rigori parati</Label>
            <Input
              id="penaltiesSaved"
              type="number"
              min="0"
              value={penaltiesSaved}
              onChange={(e) => onChange?.('penaltiesSaved', parseInt(e.target.value) || 0)}
              placeholder="0"
            />
          </div>
        </div>
      )}
      
      {readonly && (
        <div className="bg-gradient-to-r from-blue-50 to-green-50 p-3 rounded-lg">
          <div className="grid grid-cols-3 gap-3 text-center text-sm">
            <div>
              <div className="font-semibold text-gray-700">Gol subiti</div>
              <div className="text-red-600">{goalsConceded}</div>
            </div>
            <div>
              <div className="font-semibold text-gray-700">Ammonizioni</div>
              <div className="text-yellow-600">{yellowCards}</div>
            </div>
            <div>
              <div className="font-semibold text-gray-700">Rigori parati</div>
              <div className="text-green-600">{penaltiesSaved}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalkeeperStats;
