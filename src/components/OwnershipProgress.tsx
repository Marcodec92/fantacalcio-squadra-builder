
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface OwnershipProgressProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
}

const OwnershipProgress: React.FC<OwnershipProgressProps> = ({ 
  value, 
  onChange, 
  readonly = false 
}) => {
  const getColor = (percentage: number) => {
    if (percentage <= 40) return 'bg-red-500';
    if (percentage <= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getTextColor = (percentage: number) => {
    if (percentage <= 40) return 'text-red-600';
    if (percentage <= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = parseInt(e.target.value) || 0;
    const clampedValue = Math.min(Math.max(inputValue, 0), 100);
    onChange?.(clampedValue);
  };

  return (
    <div className="space-y-2">
      {!readonly && (
        <div>
          <Label htmlFor="ownership">Titolarità (%)</Label>
          <Input
            id="ownership"
            type="number"
            min="0"
            max="100"
            value={value}
            onChange={handleInputChange}
            placeholder="0-100"
          />
        </div>
      )}
      
      <div className="relative bg-gray-200 rounded-full h-3">
        <div
          className={`absolute top-0 left-0 h-full rounded-full transition-all duration-300 ${getColor(value)}`}
          style={{ width: `${value}%` }}
        />
      </div>
      
      <div className={`text-center text-sm font-semibold ${getTextColor(value)}`}>
        {value}% di titolarità
      </div>
    </div>
  );
};

export default OwnershipProgress;
