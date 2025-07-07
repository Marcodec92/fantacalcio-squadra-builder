
import React from 'react';
import { Slider } from "@/components/ui/slider";
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

  return (
    <div className="space-y-2">
      {!readonly && (
        <>
          <Label>Titolarità: {value}%</Label>
          <Slider
            value={[value]}
            onValueChange={(newValue) => onChange?.(newValue[0])}
            max={100}
            step={1}
            className="w-full"
          />
        </>
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
