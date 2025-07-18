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
    
    // Imposta sfondo scuro moderno come nel Real Time Builder
    doc.setFillColor(34, 39, 54);
    doc.rect(0, 0, 210, 297, 'F');
    
    // Titolo principale con design moderno
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text('Database Giocatori', 105, 15, { align: 'center' });
    
    // Sottotitolo
    doc.setFontSize(8);
    doc.setTextColor(180, 180, 180);
    doc.text('Lista completa dei giocatori del database', 105, 21, { align: 'center' });
    
    let yPosition = 30;
    
    const roles: PlayerRole[] = ['Portiere', 'Difensore', 'Centrocampista', 'Attaccante'];
    const roleConfig = {
      'Portiere': { 
        name: 'Portieri',
        color: [59, 130, 246] as [number, number, number] // Blue
      },
      'Difensore': { 
        name: 'Difensori',
        color: [16, 185, 129] as [number, number, number] // Green
      },
      'Centrocampista': { 
        name: 'Centrocampisti',
        color: [139, 92, 246] as [number, number, number] // Purple
      },
      'Attaccante': { 
        name: 'Attaccanti',
        color: [239, 68, 68] as [number, number, number] // Red
      }
    };
    
    roles.forEach((role) => {
      const config = roleConfig[role];
      const rolePlayers = players.filter(p => p.roleCategory === role);
      
      if (rolePlayers.length > 0) {
        // Header del ruolo con design moderno
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        const textWidth = doc.getTextWidth(`${config.name} (${rolePlayers.length})`);
        const rectWidth = textWidth + 30;
        const rectX = (210 - rectWidth) / 2;
        
        // Sfondo scuro per il titolo
        doc.setFillColor(20, 20, 20);
        doc.roundedRect(rectX, yPosition - 3, rectWidth, 12, 4, 4, 'F');
        
        // Bordo colorato
        doc.setDrawColor(...config.color);
        doc.setLineWidth(2);
        doc.roundedRect(rectX, yPosition - 3, rectWidth, 12, 4, 4, 'S');
        
        // Overlay colorato semi-trasparente
        doc.setFillColor(...config.color, 0.2);
        doc.roundedRect(rectX, yPosition - 3, rectWidth, 12, 4, 4, 'F');
        
        // Titolo centrato
        doc.setTextColor(255, 255, 255);
        doc.text(`${config.name} (${rolePlayers.length})`, 105, yPosition + 3, { align: 'center' });
        yPosition += 18;
        
        // Header tabella con design moderno
        doc.setFillColor(50, 50, 50);
        doc.roundedRect(15, yPosition - 2, 180, 8, 2, 2, 'F');
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(200, 200, 200);
        doc.text('Nome', 20, yPosition + 2);
        doc.text('Cognome', 55, yPosition + 2);
        doc.text('Team', 90, yPosition + 2);
        doc.text('FMV', 125, yPosition + 2);
        doc.text('Goals', 145, yPosition + 2);
        doc.text('Assists', 165, yPosition + 2);
        yPosition += 10;
        
        // Giocatori - TUTTI inclusi
        rolePlayers.forEach((player, index) => {
          // Controlla se serve una nuova pagina
          if (yPosition > 270) {
            doc.addPage();
            // Ripeti il background sulla nuova pagina
            doc.setFillColor(34, 39, 54);
            doc.rect(0, 0, 210, 297, 'F');
            yPosition = 20;
          }
          
          // Alterna i colori delle righe per migliore leggibilità
          if (index % 2 === 0) {
            doc.setFillColor(40, 40, 40, 0.3);
            doc.roundedRect(15, yPosition - 2, 180, 6, 1, 1, 'F');
          }
          
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7);
          doc.setTextColor(255, 255, 255);
          
          doc.text(player.name || '', 20, yPosition + 1);
          doc.text(player.surname || '', 55, yPosition + 1);
          doc.text(player.team || '', 90, yPosition + 1);
          doc.text((player.fmv || 0).toString(), 125, yPosition + 1);
          doc.text((player.goals || 0).toString(), 145, yPosition + 1);
          doc.text((player.assists || 0).toString(), 165, yPosition + 1);
          yPosition += 6;
        });
        
        yPosition += 8; // Spazio tra ruoli
      }
    });
    
    // Footer con statistiche
    yPosition += 10;
    if (yPosition > 250) {
      doc.addPage();
      doc.setFillColor(34, 39, 54);
      doc.rect(0, 0, 210, 297, 'F');
      yPosition = 30;
    }
    
    // Box statistiche finali
    doc.setFillColor(50, 50, 50);
    doc.roundedRect(40, yPosition, 130, 25, 3, 3, 'F');
    
    doc.setDrawColor(255, 215, 0);
    doc.setLineWidth(1);
    doc.roundedRect(40, yPosition, 130, 25, 3, 3, 'S');
    
    doc.setFontSize(12);
    doc.setTextColor(255, 215, 0);
    doc.text('STATISTICHE DATABASE', 105, yPosition + 8, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(`Totale giocatori: ${players.length}`, 105, yPosition + 15, { align: 'center' });
    
    // Data generazione
    yPosition += 35;
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    const now = new Date();
    const dateString = now.toLocaleDateString('it-IT');
    doc.text(`Generato il ${dateString} - Fantasy Football Database`, 105, yPosition, { align: 'center' });
    
    doc.save('database-giocatori.pdf');
  };

  const generateTeamPDF = (selections: RealTimeSelection[], teamName: string) => {
    const doc = new jsPDF();
    
    // Imposta sfondo con gradiente (simula il design glassmorphism)
    doc.setFillColor(34, 39, 54); // Background scuro
    doc.rect(0, 0, 210, 297, 'F');
    
    // Titolo con design moderno - più compatto
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text(teamName || 'Fanta Team', 105, 13, { align: 'center' });
    
    // Sottotitolo più piccolo
    doc.setFontSize(8);
    doc.setTextColor(180, 180, 180);
    doc.text('Fantasy Football Team Builder', 105, 19, { align: 'center' });
    
    let yPosition = 28; // Iniziamo ancora più in alto
    
    const roles: PlayerRole[] = ['Portiere', 'Difensore', 'Centrocampista', 'Attaccante'];
    const roleConfig = {
      'Portiere': { 
        name: 'Portieri',
        slots: [1, 2, 3], 
        rows: 1, 
        cols: 3,
        color: [59, 130, 246] as [number, number, number], // Blue
        lightColor: [147, 197, 253] as [number, number, number],
        glassColor: [59, 130, 246, 0.1] as [number, number, number, number]
      },
      'Difensore': { 
        name: 'Difensori',
        slots: [1, 2, 3, 4, 5, 6, 7, 8], 
        rows: 2, 
        cols: 4,
        color: [16, 185, 129] as [number, number, number], // Green
        lightColor: [110, 231, 183] as [number, number, number],
        glassColor: [16, 185, 129, 0.1] as [number, number, number, number]
      },
      'Centrocampista': { 
        name: 'Centrocampisti',
        slots: [1, 2, 3, 4, 5, 6, 7, 8], 
        rows: 2, 
        cols: 4,
        color: [139, 92, 246] as [number, number, number], // Purple
        lightColor: [196, 181, 253] as [number, number, number],
        glassColor: [139, 92, 246, 0.1] as [number, number, number, number]
      },
      'Attaccante': { 
        name: 'Attaccanti',
        slots: [1, 2, 3, 4, 5, 6], 
        rows: 2, 
        cols: 3,
        color: [239, 68, 68] as [number, number, number], // Red
        lightColor: [252, 165, 165] as [number, number, number],
        glassColor: [239, 68, 68, 0.1] as [number, number, number, number]
      }
    };
    
    roles.forEach((role) => {
      const config = roleConfig[role];
      
      // Calcola la larghezza del testo per adattare il rettangolo
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      const textWidth = doc.getTextWidth(config.name);
      const rectWidth = textWidth + 30; // Padding laterale
      const rectX = (210 - rectWidth) / 2; // Centra il rettangolo nella pagina
      
      doc.setFillColor(20, 20, 20); // Background molto scuro per contrasto
      doc.roundedRect(rectX, yPosition - 3, rectWidth, 12, 4, 4, 'F');
      
      // Bordo colorato del ruolo con opacità
      doc.setDrawColor(...config.color);
      doc.setLineWidth(2);
      doc.roundedRect(rectX, yPosition - 3, rectWidth, 12, 4, 4, 'S');
      
      // Overlay colorato semi-trasparente
      doc.setFillColor(...config.color, 0.2);
      doc.roundedRect(rectX, yPosition - 3, rectWidth, 12, 4, 4, 'F');
      
      // Titolo ruolo PERFETTAMENTE CENTRATO nel rettangolo (sia X che Y)
      doc.setTextColor(255, 255, 255);
      // Centrato orizzontalmente e verticalmente nel rettangolo di altezza 12
      doc.text(config.name, 105, yPosition + 3, { align: 'center' }); // Aggiustato Y per centraggio perfetto
      yPosition += 15;
      
      // Dimensioni ottimizzate - etichette più piccole, nomi più grandi
      const cardWidth = 36;
      const cardHeight = 15;
      const startX = 20;
      const spacingX = 38;
      const spacingY = 17;
      
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
          
          // Etichetta slot in alto a sinistra - MOLTO PIÙ PICCOLA
          doc.setFillColor(...config.color);
          doc.roundedRect(x + 1, y + 1, 8, 4, 1, 1, 'F');
          
          doc.setFontSize(4); // Ulteriormente ridotto
          doc.setTextColor(255, 255, 255);
          const roleAbbrev = role === 'Portiere' ? 'P' : 
                            role === 'Difensore' ? 'D' : 
                            role === 'Centrocampista' ? 'C' : 'A';
          doc.text(`${roleAbbrev}${slot}`, x + 1.2, y + 3.5);
          
          // Nome giocatore - ANCORA PIÙ GRANDE E BOLD
          doc.setFont('helvetica', 'bold'); // Imposta font bold
          doc.setFontSize(10); // Aumentato ulteriormente da 9 a 10
          doc.setTextColor(30, 30, 30); // Più scuro per maggior contrasto
          const playerName = `${selection.player.name} ${selection.player.surname}`.trim();
          const truncatedName = playerName.length > 9 ? playerName.substring(0, 9) + '...' : playerName;
          doc.text(truncatedName, x + 2, y + 9); // Aggiustato Y per spazio etichetta più piccola
          
          // Team in corsivo - più piccolo per dare spazio al nome
          doc.setFont('helvetica', 'normal'); // Reset font
          doc.setFontSize(5); // Ridotto da 6
          doc.setTextColor(70, 70, 70);
          doc.text(selection.player.team || '', x + 2, y + 13);
          
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
          
          // Etichetta slot per slot vuoti - MOLTO PIÙ PICCOLA
          doc.setFillColor(120, 120, 120);
          doc.roundedRect(x + 1, y + 1, 8, 4, 1, 1, 'F');
          
          doc.setFontSize(4); // Ulteriormente ridotto
          doc.setTextColor(255, 255, 255);
          const roleAbbrev = role === 'Portiere' ? 'P' : 
                            role === 'Difensore' ? 'D' : 
                            role === 'Centrocampista' ? 'C' : 'A';
          doc.text(`${roleAbbrev}${slot}`, x + 1.2, y + 3.5);
          
          // Testo "Disponibile"
          doc.setFontSize(5); // Ulteriormente ridotto
          doc.setTextColor(120, 120, 120);
          doc.text('Disponibile', x + 2, y + 10);
        }
      });
      
      // Spazio dopo ogni ruolo - ulteriormente ridotto
      yPosition += config.rows * spacingY + 5; // Ridotto da 8 a 5
    });
    
    // Footer con totale crediti - spazio ridotto
    yPosition += 2;
    
    // Calcoli per le statistiche per ruolo
    const totalCredits = selections.reduce((sum, sel) => sum + (sel.player?.credits || 0), 0);
    const filledSlots = selections.filter(s => s.player).length;
    const totalSlots = roles.reduce((sum, role) => sum + roleConfig[role].slots.length, 0);
    
    // Infografica spesa per ruolo
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('SPESA PER RUOLO', 105, yPosition, { align: 'center' });
    yPosition += 8;
    
    // Statistiche per ogni ruolo
    const roleStats = roles.map(role => {
      const config = roleConfig[role];
      const roleSelections = selections.filter(s => s.role_category === role && s.player);
      const roleCredits = roleSelections.reduce((sum, sel) => sum + (sel.player?.credits || 0), 0);
      const rolePercentage = totalCredits > 0 ? (roleCredits / totalCredits * 100) : 0;
      
      return {
        role,
        name: config.name,
        credits: roleCredits,
        percentage: rolePercentage,
        color: config.color,
        players: roleSelections.length,
        maxPlayers: config.slots.length
      };
    });
    
    // Layout a 2x2 per le statistiche dei ruoli
    const statWidth = 85;
    const statHeight = 12;
    const statSpacing = 90;
    
    roleStats.forEach((stat, index) => {
      const row = Math.floor(index / 2);
      const col = index % 2;
      const x = 20 + col * statSpacing;
      const y = yPosition + row * 16;
      
      // Sfondo colorato per ogni statistica
      doc.setFillColor(...stat.color, 0.3);
      doc.roundedRect(x, y, statWidth, statHeight, 2, 2, 'F');
      
      // Bordo colorato
      doc.setDrawColor(...stat.color);
      doc.setLineWidth(0.5);
      doc.roundedRect(x, y, statWidth, statHeight, 2, 2, 'S');
      
      // Nome ruolo
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...stat.color);
      doc.text(stat.name, x + 2, y + 4);
      
      // Crediti spesi
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(255, 255, 255);
      doc.text(`${stat.credits} crediti (${stat.percentage.toFixed(1)}%)`, x + 2, y + 8);
      
      // Giocatori selezionati
      doc.text(`${stat.players}/${stat.maxPlayers} giocatori`, x + 2, y + 11);
    });
    
    yPosition += 40; // Spazio per le 2 righe di statistiche
    
    // Sezione totale crediti con design moderno
    doc.setFillColor(50, 50, 50);
    doc.roundedRect(40, yPosition - 5, 130, 20, 3, 3, 'F');
    
    // Bordo dorato per il totale
    doc.setDrawColor(255, 215, 0);
    doc.setLineWidth(1);
    doc.roundedRect(40, yPosition - 5, 130, 20, 3, 3, 'S');
    
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