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
    doc.setFontSize(18);
    doc.text(teamName || 'Fanta Team', 105, 15, { align: 'center' });
    
    let yPosition = 30;
    
    const roles: PlayerRole[] = ['Portiere', 'Difensore', 'Centrocampista', 'Attaccante'];
    const roleConfig = {
      'Portiere': { emoji: '🥅', slots: [1, 2, 3], rows: 1, cols: 3 },
      'Difensore': { emoji: '🛡️', slots: [1, 2, 3, 4, 5, 6, 7, 8], rows: 2, cols: 4 },
      'Centrocampista': { emoji: '⚡', slots: [1, 2, 3, 4, 5, 6, 7, 8], rows: 2, cols: 4 },
      'Attaccante': { emoji: '🎯', slots: [1, 2, 3, 4, 5, 6], rows: 2, cols: 3 }
    };
    
    roles.forEach((role) => {
      const config = roleConfig[role];
      
      // Titolo ruolo con emoji
      doc.setFontSize(14);
      doc.text(`${config.emoji} ${role}`, 20, yPosition);
      yPosition += 8;
      
      // Dimensioni per il layout a griglia
      const cardWidth = 45;
      const cardHeight = 18;
      const startX = 20;
      const spacingX = 47;
      const spacingY = 20;
      
      // Disposizione dei giocatori in griglia
      config.slots.forEach((slot, index) => {
        const selection = selections.find(s => s.role_category === role && s.position_slot === slot);
        
        // Calcolo posizione nella griglia
        const row = Math.floor(index / config.cols);
        const col = index % config.cols;
        
        // Centrare la griglia nella pagina
        const totalGridWidth = config.cols * spacingX - 2;
        const offsetX = (170 - totalGridWidth) / 2;
        
        const x = startX + offsetX + col * spacingX;
        const y = yPosition + row * spacingY;
        
        // Box per ogni slot
        doc.rect(x, y, cardWidth, cardHeight);
        
        // Etichetta slot
        doc.setFontSize(8);
        const roleAbbrev = role === 'Portiere' ? 'P' : 
                          role === 'Difensore' ? 'D' : 
                          role === 'Centrocampista' ? 'C' : 'A';
        doc.text(`${roleAbbrev}${slot}`, x + 2, y + 6);
        
        if (selection?.player) {
          // Nome giocatore
          doc.setFontSize(7);
          const playerName = `${selection.player.name} ${selection.player.surname}`.trim();
          doc.text(playerName.length > 12 ? playerName.substring(0, 12) + '...' : playerName, x + 2, y + 10);
          
          // Team
          doc.setFontSize(6);
          doc.text(`${selection.player.team || ''}`, x + 2, y + 13);
          
          // Crediti
          doc.setFontSize(7);
          doc.text(`${selection.player.credits}`, x + cardWidth - 8, y + 10);
        } else {
          // Slot vuoto
          doc.setFontSize(6);
          doc.text('Vuoto', x + 2, y + 10);
        }
      });
      
      // Spazio dopo ogni ruolo
      yPosition += config.rows * spacingY + 15;
    });
    
    // Totale crediti
    const totalCredits = selections.reduce((sum, sel) => sum + (sel.player?.credits || 0), 0);
    doc.setFontSize(12);
    doc.text(`Totale Crediti: ${totalCredits}`, 105, yPosition, { align: 'center' });
    
    const fileName = teamName ? `${teamName.replace(/\s+/g, '-').toLowerCase()}-team.pdf` : 'fanta-team.pdf';
    doc.save(fileName);
  };

  return {
    generateDatabasePDF,
    generateTeamPDF
  };
};