
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, FileText } from "lucide-react";

interface CSVUploadSectionProps {
  maxBudget: number;
  onMaxBudgetChange: (budget: number) => void;
  csvPlayersCount: number;
  loading: boolean;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  onDrag: (event: React.DragEvent<HTMLDivElement>) => void;
  dragActive: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onTriggerFileInput: () => void;
}

const CSVUploadSection: React.FC<CSVUploadSectionProps> = ({
  maxBudget,
  onMaxBudgetChange,
  csvPlayersCount,
  loading,
  onFileUpload,
  onDrop,
  onDrag,
  dragActive,
  fileInputRef,
  onTriggerFileInput
}) => {
  const budgetOptions = [300, 500, 650];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {/* Budget Selection */}
      <Card className="glass-card p-8 shadow-xl slide-in-left">
        <h3 className="text-2xl font-bold mb-6 text-gradient">Budget Massimo</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {budgetOptions.map((budget) => (
              <Button
                key={budget}
                variant={maxBudget === budget ? "default" : "outline"}
                className="glass-button h-16 text-lg font-bold"
                onClick={() => onMaxBudgetChange(budget)}
              >
                {budget}
              </Button>
            ))}
          </div>
          <div className="text-center">
            <p className="text-muted-foreground">Budget selezionato: <span className="font-bold text-2xl text-gradient">{maxBudget} crediti</span></p>
          </div>
        </div>
      </Card>

      {/* CSV Upload */}
      <Card className="glass-card p-8 shadow-xl slide-in-right">
        <h3 className="text-2xl font-bold mb-6 text-gradient">Carica Giocatori CSV</h3>
        <div 
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
            dragActive 
              ? 'border-blue-400 bg-blue-50/30' 
              : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/10'
          }`}
          onDrop={onDrop}
          onDragOver={onDrag}
          onDragEnter={onDrag}
          onDragLeave={onDrag}
        >
          {loading ? (
            <div className="space-y-4">
              <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-lg font-medium text-blue-600">Caricamento in corso...</p>
            </div>
          ) : csvPlayersCount > 0 ? (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <FileText className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-green-600 mb-2">File CSV caricato!</p>
                <p className="text-lg text-muted-foreground">{csvPlayersCount} giocatori disponibili</p>
                <Button
                  onClick={onTriggerFileInput}
                  className="mt-4 glass-button gradient-secondary"
                >
                  Carica nuovo file
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <p className="text-xl font-bold mb-2">Trascina qui il tuo file CSV</p>
                <p className="text-muted-foreground mb-4">oppure</p>
                <Button
                  onClick={onTriggerFileInput}
                  className="glass-button gradient-primary font-medium"
                >
                  Seleziona File CSV
                </Button>
              </div>
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={onFileUpload}
            className="hidden"
          />
        </div>
      </Card>
    </div>
  );
};

export default CSVUploadSection;
