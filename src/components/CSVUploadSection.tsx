
import React, { useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, AlertCircle } from "lucide-react";

interface CSVUploadSectionProps {
  maxBudget: number;
  onMaxBudgetChange: (budget: number) => void;
  csvPlayersCount: number;
  loading: boolean;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrag: (e: React.DragEvent<HTMLDivElement>) => void;
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
  return (
    <div className="glass-card mb-8 p-6 shadow-xl">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Budget Massimo
            </label>
            <Select value={maxBudget.toString()} onValueChange={(value) => onMaxBudgetChange(Number(value))}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="300">300 Crediti</SelectItem>
                <SelectItem value="500">500 Crediti</SelectItem>
                <SelectItem value="650">650 Crediti</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {csvPlayersCount > 0 && (
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-green-500" />
              <p>{csvPlayersCount} giocatori caricati</p>
            </div>
          )}
        </div>
        
        <div className="w-full lg:w-auto">
          <div 
            className={`
              relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200
              ${dragActive 
                ? 'border-primary bg-primary/5 scale-105' 
                : 'border-gray-300 hover:border-primary/50 hover:bg-gray-50/50'
              }
              ${loading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
            `}
            onDragEnter={onDrag}
            onDragLeave={onDrag}
            onDragOver={onDrag}
            onDrop={onDrop}
            onClick={onTriggerFileInput}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv,application/csv"
              onChange={onFileUpload}
              className="hidden"
              disabled={loading}
            />
            
            <div className="flex flex-col items-center gap-3">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="text-sm font-medium">Caricamento in corso...</p>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                    <Upload className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">
                      Clicca o trascina il file CSV qui
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Formato: Ruolo,Nome Giocatore,Squadra
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-700">
                <p className="font-medium mb-1">Formato CSV richiesto:</p>
                <p className="font-mono bg-white px-2 py-1 rounded">Ruolo,Nome Giocatore,Squadra</p>
                <p className="mt-1">Ruoli: P/D/C/A (o versioni estese)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CSVUploadSection;
