
import React, { useRef } from 'react';
import { toast } from 'sonner';
import { useCSVPlayers } from './useCSVPlayers';

export const useCSVFileHandler = (onUploadComplete: () => void) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { csvPlayers, loading, handleCSVUpload, resetDatabase, removeCSVPlayer } = useCSVPlayers();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.log('❌ Nessun file selezionato');
      return;
    }

    console.log('📁 File selezionato:', file.name, 'Tipo:', file.type, 'Dimensione:', file.size);

    // Verifica che sia un file CSV
    if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv' && file.type !== 'application/csv') {
      toast.error('Per favore seleziona un file CSV valido');
      return;
    }

    // Verifica dimensione file (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Il file è troppo grande. Dimensione massima: 5MB');
      return;
    }

    try {
      await handleCSVUpload(file);
      onUploadComplete();
      toast.success(`File CSV caricato con successo!`);
    } catch (error) {
      console.error('Errore nel caricamento del file:', error);
      toast.error('Errore nel caricamento del file CSV');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const processFile = async (file: File) => {
    console.log('📁 File da processare:', file.name);
    
    // Verifica che sia un file CSV
    if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv' && file.type !== 'application/csv') {
      toast.error('Per favore seleziona un file CSV valido');
      return;
    }

    // Verifica dimensione file (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Il file è troppo grande. Dimensione massima: 5MB');
      return;
    }

    try {
      await handleCSVUpload(file);
      onUploadComplete();
      toast.success(`File CSV caricato con successo!`);
    } catch (error) {
      console.error('Errore nel caricamento del file:', error);
      toast.error('Errore nel caricamento del file CSV');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      console.log('📁 File trascinato:', files[0].name);
      await processFile(files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const triggerFileInput = () => {
    console.log('🔄 Apertura dialog di selezione file...');
    if (fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      console.error('❌ Riferimento al file input non trovato');
      toast.error('Errore nel sistema di caricamento file');
    }
  };

  return {
    csvPlayers,
    loading,
    fileInputRef,
    handleFileUpload,
    handleDrop,
    handleDrag,
    triggerFileInput,
    resetDatabase,
    removeCSVPlayer
  };
};
