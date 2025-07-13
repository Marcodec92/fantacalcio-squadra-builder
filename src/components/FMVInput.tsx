
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FMVInputProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
}

const getFMVColor = (value: number): string => {
  if (value >= 5.60 && value <= 5.80) return 'bg-red-100 border-red-300 text-red-800';
  if (value >= 5.81 && value <= 6.19) return 'bg-yellow-100 border-yellow-300 text-yellow-800';
  if (value >= 6.20 && value <= 20) return 'bg-green-100 border-green-300 text-green-800';
  return 'bg-gray-100 border-gray-300 text-gray-800';
};

const FMVInput: React.FC<FMVInputProps> = ({ value, onChange, readonly = false }) => {
  const colorClass = getFMVColor(value);

  if (readonly) {
    return (
      <div className="space-y-1">
        <div className="text-xs font-medium text-gradient">FMV</div>
        <div className={`px-3 py-2 rounded-md text-sm font-medium ${colorClass}`}>
          {value.toFixed(2)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="fmv">FMV (Fair Market Value)</Label>
      <Input
        id="fmv"
        type="number"
        step="0.01"
        min="0"
        max="20"
        value={value}
        onChange={(e) => onChange?.(parseFloat(e.target.value) || 0)}
        className={colorClass}
        placeholder="0.00"
      />
    </div>
  );
};

export default FMVInput;
