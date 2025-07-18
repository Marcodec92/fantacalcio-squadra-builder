import { jsPDF } from 'jspdf';
import { Player, PlayerRole } from '@/types/Player';
import { RealTimeSelection } from '@/pages/RealTimeBuilder';

interface UsePDFGeneratorReturn {
  generateDatabasePDF: (players: Player[]) => void;
  generateTeamPDF: (selections: RealTimeSelection[], teamName: string) => void;
}

export const usePDFGenerator = (): UsePDFGeneratorReturn => {
  const generateDatabasePDF = (players: Player[]) => {
    const doc = new jsPDF();
    
    // Titolo
    doc.setFontSize(20);
    doc.text('Database Giocatori', 105, 20, { align: 'center' });
    
    let yPosition = 40;
    
    const roles: PlayerRole[] = ['Portiere', 'Difensore', 'Centrocampista', 'Attaccante'];
    
    roles.forEach((role) => {
      const rolePlayers = players.filter(p => p.roleCategory === role);
      
      if (rolePlayers.length > 0) {
        // Titolo ruolo
        doc.setFontSize(16);
        doc.text(`${role} (${rolePlayers.length})`, 20, yPosition);
        yPosition += 10;
        
        // Header tabella
        doc.setFontSize(10);
        doc.text('Nome', 20, yPosition);
        doc.text('Cognome', 60, yPosition);
        doc.text('Team', 100, yPosition);
        doc.text('FMV', 130, yPosition);
        doc.text('Goals', 150, yPosition);
        doc.text('Assists', 170, yPosition);
        yPosition += 5;
        
        // Linea separatrice
        doc.line(20, yPosition, 190, yPosition);
        yPosition += 5;
        
        // Giocatori
        rolePlayers.forEach((player) => {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
          
          doc.text(player.name || '', 20, yPosition);
          doc.text(player.surname || '', 60, yPosition);
          doc.text(player.team || '', 100, yPosition);
          doc.text((player.fmv || 0).toString(), 130, yPosition);
          doc.text((player.goals || 0).toString(), 150, yPosition);
          doc.text((player.assists || 0).toString(), 170, yPosition);
          yPosition += 5;
        });
        
        yPosition += 10;
      }
    });
    
    doc.save('database-giocatori.pdf');
  };

  const generateTeamPDF = (selections: RealTimeSelection[], teamName: string) => {
    const doc = new jsPDF();
    
    // Titolo con nome squadra
    doc.setFontSize(20);
    doc.text(teamName || 'Fanta Team', 105, 20, { align: 'center' });
    
    let yPosition = 40;
    
    const roles: PlayerRole[] = ['Portiere', 'Difensore', 'Centrocampista', 'Attaccante'];
    const roleConfig = {
      'Portiere': { emoji: '🥅', slots: [1, 2, 3] },
      'Difensore': { emoji: '🛡️', slots: [1, 2, 3, 4, 5, 6, 7, 8] },
      'Centrocampista': { emoji: '⚡', slots: [1, 2, 3, 4, 5, 6, 7, 8] },
      'Attaccante': { emoji: '🎯', slots: [1, 2, 3, 4, 5, 6] }
    };
    
    roles.forEach((role) => {
      const config = roleConfig[role];
      
      // Titolo ruolo con emoji
      doc.setFontSize(16);
      doc.text(`${config.emoji} ${role}`, 20, yPosition);
      yPosition += 15;
      
      // Slot del ruolo
      config.slots.forEach((slot) => {
        const selection = selections.find(s => s.role_category === role && s.position_slot === slot);
        
        // Box per ogni slot
        doc.rect(20, yPosition - 10, 170, 20);
        
        // Etichetta slot
        doc.setFontSize(12);
        const roleAbbrev = role === 'Portiere' ? 'P' : 
                          role === 'Difensore' ? 'D' : 
                          role === 'Centrocampista' ? 'C' : 'A';
        doc.text(`${roleAbbrev}${slot}`, 25, yPosition - 2);
        
        if (selection?.player) {
          // Dati giocatore
          doc.setFontSize(10);
          doc.text(`${selection.player.name} ${selection.player.surname}`, 50, yPosition - 5);
          doc.text(`Team: ${selection.player.team}`, 50, yPosition);
          doc.text(`Crediti: ${selection.player.credits}`, 140, yPosition - 2);
        } else {
          // Slot vuoto
          doc.setFontSize(10);
          doc.text('Slot libero', 50, yPosition - 2);
        }
        
        yPosition += 25;
      });
      
      yPosition += 10;
    });
    
    // Totale crediti
    const totalCredits = selections.reduce((sum, sel) => sum + (sel.player?.credits || 0), 0);
    doc.setFontSize(14);
    doc.text(`Totale Crediti: ${totalCredits}`, 105, yPosition, { align: 'center' });
    
    const fileName = teamName ? `${teamName.replace(/\s+/g, '-').toLowerCase()}-team.pdf` : 'fanta-team.pdf';
    doc.save(fileName);
  };

  return {
    generateDatabasePDF,
    generateTeamPDF
  };
};