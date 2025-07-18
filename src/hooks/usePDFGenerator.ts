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
    
    // Imposta sfondo con gradiente (simula il design glassmorphism)
    doc.setFillColor(34, 39, 54); // Background scuro
    doc.rect(0, 0, 210, 297, 'F');
    
    // Titolo con design moderno
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.text(teamName || 'Fanta Team', 105, 20, { align: 'center' });
    
    // Sottotitolo
    doc.setFontSize(12);
    doc.setTextColor(180, 180, 180);
    doc.text('Fantasy Football Team Builder', 105, 28, { align: 'center' });
    
    let yPosition = 45;
    
    const roles: PlayerRole[] = ['Portiere', 'Difensore', 'Centrocampista', 'Attaccante'];
    const roleConfig = {
      'Portiere': { 
        emoji: '🥅', 
        slots: [1, 2, 3], 
        rows: 1, 
        cols: 3,
        color: [59, 130, 246] as [number, number, number], // Blue
        lightColor: [147, 197, 253] as [number, number, number]
      },
      'Difensore': { 
        emoji: '🛡️', 
        slots: [1, 2, 3, 4, 5, 6, 7, 8], 
        rows: 2, 
        cols: 4,
        color: [16, 185, 129] as [number, number, number], // Green
        lightColor: [110, 231, 183] as [number, number, number]
      },
      'Centrocampista': { 
        emoji: '⚡', 
        slots: [1, 2, 3, 4, 5, 6, 7, 8], 
        rows: 2, 
        cols: 4,
        color: [139, 92, 246] as [number, number, number], // Purple
        lightColor: [196, 181, 253] as [number, number, number]
      },
      'Attaccante': { 
        emoji: '🎯', 
        slots: [1, 2, 3, 4, 5, 6], 
        rows: 2, 
        cols: 3,
        color: [239, 68, 68] as [number, number, number], // Red
        lightColor: [252, 165, 165] as [number, number, number]
      }
    };
    
    roles.forEach((role) => {
      const config = roleConfig[role];
      
      // Header colorato per ogni ruolo
      doc.setFillColor(...config.color);
      doc.roundedRect(15, yPosition - 5, 180, 12, 2, 2, 'F');
      
      // Titolo ruolo con emoji
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.text(`${config.emoji} ${role}`, 20, yPosition + 2);
      yPosition += 18;
      
      // Dimensioni per il layout a griglia
      const cardWidth = 42;
      const cardHeight = 20;
      const startX = 20;
      const spacingX = 44;
      const spacingY = 22;
      
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
        
        if (selection?.player) {
          // Carta con giocatore - sfondo colorato
          doc.setFillColor(...config.lightColor);
          doc.roundedRect(x, y, cardWidth, cardHeight, 2, 2, 'F');
          
          // Bordo colorato
          doc.setDrawColor(...config.color);
          doc.setLineWidth(1);
          doc.roundedRect(x, y, cardWidth, cardHeight, 2, 2, 'S');
          
          // Etichetta slot in alto a sinistra
          doc.setFillColor(...config.color);
          doc.roundedRect(x + 1, y + 1, 12, 6, 1, 1, 'F');
          
          doc.setFontSize(7);
          doc.setTextColor(255, 255, 255);
          const roleAbbrev = role === 'Portiere' ? 'P' : 
                            role === 'Difensore' ? 'D' : 
                            role === 'Centrocampista' ? 'C' : 'A';
          doc.text(`${roleAbbrev}${slot}`, x + 2, y + 5);
          
          // Nome giocatore
          doc.setFontSize(8);
          doc.setTextColor(50, 50, 50);
          const playerName = `${selection.player.name} ${selection.player.surname}`.trim();
          const truncatedName = playerName.length > 11 ? playerName.substring(0, 11) + '...' : playerName;
          doc.text(truncatedName, x + 2, y + 10);
          
          // Team in corsivo
          doc.setFontSize(6);
          doc.setTextColor(80, 80, 80);
          doc.text(selection.player.team || '', x + 2, y + 14);
          
          // Badge crediti in basso a destra
          const creditsText = `${selection.player.credits}`;
          const creditsWidth = doc.getTextWidth(creditsText) + 4;
          doc.setFillColor(50, 50, 50);
          doc.roundedRect(x + cardWidth - creditsWidth - 2, y + cardHeight - 8, creditsWidth, 6, 1, 1, 'F');
          
          doc.setFontSize(7);
          doc.setTextColor(255, 255, 255);
          doc.text(creditsText, x + cardWidth - creditsWidth, y + cardHeight - 4);
          
        } else {
          // Slot vuoto - design tratteggiato
          doc.setDrawColor(120, 120, 120);
          doc.setLineWidth(0.5);
          doc.setLineDashPattern([2, 2], 0);
          doc.roundedRect(x, y, cardWidth, cardHeight, 2, 2, 'S');
          doc.setLineDashPattern([], 0); // Reset dash pattern
          
          // Etichetta slot per slot vuoti
          doc.setFillColor(120, 120, 120);
          doc.roundedRect(x + 1, y + 1, 12, 6, 1, 1, 'F');
          
          doc.setFontSize(7);
          doc.setTextColor(255, 255, 255);
          const roleAbbrev = role === 'Portiere' ? 'P' : 
                            role === 'Difensore' ? 'D' : 
                            role === 'Centrocampista' ? 'C' : 'A';
          doc.text(`${roleAbbrev}${slot}`, x + 2, y + 5);
          
          // Testo "Disponibile"
          doc.setFontSize(7);
          doc.setTextColor(120, 120, 120);
          doc.text('Disponibile', x + 2, y + 12);
        }
      });
      
      // Spazio dopo ogni ruolo
      yPosition += config.rows * spacingY + 15;
    });
    
    // Footer con totale crediti
    yPosition += 10;
    
    // Sezione totale crediti con design moderno
    doc.setFillColor(50, 50, 50);
    doc.roundedRect(40, yPosition - 5, 130, 20, 3, 3, 'F');
    
    // Bordo dorato per il totale
    doc.setDrawColor(255, 215, 0);
    doc.setLineWidth(1);
    doc.roundedRect(40, yPosition - 5, 130, 20, 3, 3, 'S');
    
    const totalCredits = selections.reduce((sum, sel) => sum + (sel.player?.credits || 0), 0);
    const filledSlots = selections.filter(s => s.player).length;
    const totalSlots = roles.reduce((sum, role) => sum + roleConfig[role].slots.length, 0);
    
    // Testo totale crediti
    doc.setFontSize(14);
    doc.setTextColor(255, 215, 0);
    doc.text('TOTALE CREDITI', 105, yPosition + 3, { align: 'center' });
    
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text(`${totalCredits}`, 105, yPosition + 10, { align: 'center' });
    
    // Info slot riempiti
    yPosition += 25;
    doc.setFontSize(10);
    doc.setTextColor(180, 180, 180);
    doc.text(`Giocatori selezionati: ${filledSlots}/${totalSlots}`, 105, yPosition, { align: 'center' });
    
    // Footer con data
    yPosition += 15;
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    const now = new Date();
    const dateString = now.toLocaleDateString('it-IT');
    doc.text(`Generato il ${dateString} - Fantasy Football Team Builder`, 105, yPosition, { align: 'center' });
    
    const fileName = teamName ? `${teamName.replace(/\s+/g, '-').toLowerCase()}-team.pdf` : 'fanta-team.pdf';
    doc.save(fileName);
  };

  return {
    generateDatabasePDF,
    generateTeamPDF
  };
};