import { jsPDF } from 'jspdf';
import { Player, PlayerRole } from '@/types/Player';
import { RealTimeSelection } from '@/pages/RealTimeBuilder';
import { supabase } from '@/integrations/supabase/client';

interface UsePDFGeneratorReturn {
  generateDatabasePDF: (players: Player[]) => void;
  generateTeamPDF: (selections: RealTimeSelection[], teamName: string) => Promise<void>;
}

export const usePDFGenerator = (): UsePDFGeneratorReturn => {
  // Funzione helper per disegnare una carta giocatore
  const drawPlayerCard = (
    doc: jsPDF, 
    player: Player, 
    config: any, 
    x: number, 
    y: number, 
    width: number, 
    role: PlayerRole
  ) => {
    // Background con gradiente e migliore contrasto - stessa forma dell'header
    doc.setFillColor(45, 55, 75, 0.6);
    const capsuleHeight = 13;
    const capsuleRadius = capsuleHeight / 2; // Stessa logica dell'header: raggio = metà altezza
    doc.roundedRect(x, y - 1, width, capsuleHeight, capsuleRadius, capsuleRadius, 'F');
    
    // Layer gradiente per profondità - forma identica all'header
    doc.setFillColor(55, 65, 85, 0.4);
    doc.roundedRect(x + 1, y - 0.5, width - 2, capsuleHeight - 1, capsuleRadius - 0.5, capsuleRadius - 0.5, 'F');
    
    // Bordo colorato molto sottile - forma identica all'header
    doc.setDrawColor(config.color[0], config.color[1], config.color[2]);
    doc.setLineWidth(0.2);
    doc.roundedRect(x, y - 1, width, capsuleHeight, capsuleRadius, capsuleRadius, 'S');
    
    // Forma colorata con gradiente per il ruolo
    doc.setFillColor(config.color[0], config.color[1], config.color[2]);
    doc.circle(x + 10, y + 5.5, 3, 'F');
    
    // Layer gradiente interno
    doc.setFillColor(config.color[0], config.color[1], config.color[2]);
    doc.circle(x + 10, y + 5.5, 2, 'F');
    
    // Bordo del cerchio con leggero glow
    doc.setDrawColor(config.color[0], config.color[1], config.color[2]);
    doc.setLineWidth(0.5);
    doc.circle(x + 10, y + 5.5, 3, 'S');
    
    // Nome e Cognome - compatto accanto al cerchio colorato
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    const fullName = `${player.name || ''} ${player.surname || ''}`.trim();
    doc.text(fullName, x + 17, y + 3);
    
    // Team e Ruolo specifico più compatto
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(200, 200, 200);
    const teamText = player.team || 'N/A';
    const roleText = player.role || 'N/A';
    doc.text(`${teamText} - ${roleText}`, x + 17, y + 7);
    
    // FMV e Tier ultra compatto
    doc.setFontSize(5);
    doc.setTextColor(180, 180, 180);
    const fmvText = `FMV: ${player.fmv || 0}`;
    const tierText = `Tier: ${player.tier || 'N/A'}`;
    doc.text(`${fmvText} | ${tierText}`, x + 17, y + 10);
    
    // Budget percentages compatto - usa il campo costPercentage del giocatore
    const costPercentage = player.costPercentage || 0;
    const fmv = player.fmv || 0;
    const budget300 = fmv > 0 ? ((fmv / 300) * 100).toFixed(1) : '0';
    const budget500 = fmv > 0 ? ((fmv / 500) * 100).toFixed(1) : '0';
    const budget650 = fmv > 0 ? ((fmv / 650) * 100).toFixed(1) : '0';
    doc.setFontSize(5);
    doc.setTextColor(180, 180, 180);
    const budgetX = x + width * 0.35; // 35% della larghezza
    doc.text('Budget:', budgetX, y + 2);
    doc.text(`${costPercentage}% | ${budget300}%(300) ${budget500}%(500) ${budget650}%(650)`, budgetX, y + 6);
    
    // Statistiche compatte per ruolo - posizione proporzionale
    const statsX = x + width * 0.58; // 58% della larghezza
    if (role === 'Portiere') {
      const goalsConceded = player.goalsConceded || 0;
      const penaltiesSaved = player.penaltiesSaved || 0;
      const yellowCards = player.yellowCards || 0;
      const goalsPerGame = goalsConceded > 0 ? (goalsConceded / 30).toFixed(1) : '0';
      
      doc.text('Stats:', statsX, y + 2);
      doc.text(`Sub: ${goalsConceded} | Rig: ${penaltiesSaved} | Cart: ${yellowCards}`, statsX, y + 6);
      doc.text(`Gol/partita: ${goalsPerGame}`, statsX, y + 9);
    } else {
      const goals = player.goals || 0;
      const assists = player.assists || 0;
      const malus = player.malus || 0;
      const xG = player.xG || 0;
      const xA = player.xA || 0;
      const totalBonus = goals + assists - malus;
      
      doc.text('Stats:', statsX, y + 2);
      doc.text(`G: ${goals} | A: ${assists} | M: ${malus} | Tot: ${totalBonus}`, statsX, y + 6);
      doc.text(`xG: ${xG} | xA: ${xA}`, statsX, y + 9);
    }
    
    // Ownership e Plus compatto - posizione proporzionale
    const ownership = player.ownership || 0;
    const plusCategories = player.plusCategories && player.plusCategories.length > 0 
      ? player.plusCategories.join(', ') 
      : 'Nessuna';
    
    const extraX = x + width * 0.82; // 82% della larghezza
    doc.text('Extra:', extraX, y + 2);
    doc.text(`Titolarità: ${ownership}%`, extraX, y + 6);
    const truncatedPlus = plusCategories.length > 20 ? plusCategories.substring(0, 20) + '...' : plusCategories;
    doc.text(`Plus: ${truncatedPlus}`, extraX, y + 9);
  };

  const generateDatabasePDF = (players: Player[]) => {
    // Orientamento landscape (29.7 x 21 cm)
    const doc = new jsPDF('landscape', 'mm', 'a4');
    
    // Imposta sfondo scuro moderno (dimensioni landscape)
    doc.setFillColor(34, 39, 54);
    doc.rect(0, 0, 297, 210, 'F');
    
    // Titolo principale con design moderno (centrato per landscape)
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text('Database Giocatori', 148.5, 15, { align: 'center' });
    
    // Sottotitolo
    doc.setFontSize(8);
    doc.setTextColor(180, 180, 180);
    doc.text('Lista completa dei giocatori del database', 148.5, 21, { align: 'center' });
    
    let yPosition = 30;
    
    const roles: PlayerRole[] = ['Portiere', 'Difensore', 'Centrocampista', 'Attaccante'];
    const roleConfig = {
      'Portiere': { 
        name: 'Portieri',
        color: [34, 197, 94] as [number, number, number], // Modern green
        gradient: [34, 197, 94, 16, 185, 129] as [number, number, number, number, number, number]
      },
      'Difensore': { 
        name: 'Difensori',
        color: [59, 130, 246] as [number, number, number], // Modern blue
        gradient: [59, 130, 246, 37, 99, 235] as [number, number, number, number, number, number]
      },
      'Centrocampista': { 
        name: 'Centrocampisti',
        color: [168, 85, 247] as [number, number, number], // Modern purple
        gradient: [168, 85, 247, 147, 51, 234] as [number, number, number, number, number, number]
      },
      'Attaccante': { 
        name: 'Attaccanti',
        color: [245, 101, 101] as [number, number, number], // Modern red
        gradient: [245, 101, 101, 239, 68, 68] as [number, number, number, number, number, number]
      }
    };
    
    roles.forEach((role) => {
      const config = roleConfig[role];
      const rolePlayers = players.filter(p => p.roleCategory === role);
      
      if (rolePlayers.length > 0) {
        // Header del ruolo con forme più compatte
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        const textWidth = doc.getTextWidth(`${config.name} (${rolePlayers.length})`);
        const rectWidth = textWidth + 24; // Ridotto padding laterale
        const rectHeight = 10; // Ridotto altezza
        const rectX = (297 - rectWidth) / 2;
        const cornerRadius = rectHeight / 2; // Raggio = metà altezza per forma ovale perfetta
        
        // Sfondo con gradiente simulato più vibrante
        doc.setFillColor(config.color[0], config.color[1], config.color[2]);
        doc.roundedRect(rectX, yPosition - 2, rectWidth, rectHeight, cornerRadius, cornerRadius, 'F');
        
        // Layer gradiente centrale più intenso
        doc.setFillColor(config.color[0], config.color[1], config.color[2]);
        doc.roundedRect(rectX + 1, yPosition - 1.5, rectWidth - 2, rectHeight - 1, cornerRadius - 0.5, cornerRadius - 0.5, 'F');
        
        // Layer interno per effetto gradiente
        doc.setFillColor(config.color[0], config.color[1], config.color[2]);
        doc.roundedRect(rectX + 2, yPosition - 1, rectWidth - 4, rectHeight - 2, cornerRadius - 1, cornerRadius - 1, 'F');
        
        // Bordo colorato molto sottile
        doc.setDrawColor(config.color[0], config.color[1], config.color[2]);
        doc.setLineWidth(0.5); // Drasticamente ridotto da 1.5 a 0.5
        doc.roundedRect(rectX, yPosition - 2, rectWidth, rectHeight, cornerRadius, cornerRadius, 'S');
        
        // Titolo perfettamente centrato (X e Y) - Bianco su sfondo colorato
        doc.setTextColor(255, 255, 255); // Testo bianco per massima leggibilità
        const centerY = yPosition + (rectHeight / 2) - 1; // Centro verticale della forma
        doc.text(`${config.name} (${rolePlayers.length})`, 148.5, centerY, { align: 'center' });
        yPosition += 15; // Maggiore spazio per evitare sovrapposizioni
        
        // Giocatori - Layout a due colonne per riga
        for (let i = 0; i < rolePlayers.length; i += 2) {
          // Controlla se serve una nuova pagina
          if (yPosition > 185) {
            doc.addPage();
            // Ripeti il background sulla nuova pagina
            doc.setFillColor(34, 39, 54);
            doc.rect(0, 0, 297, 210, 'F');
            yPosition = 20;
          }
          
          // Prima colonna (giocatore sinistro)
          const leftPlayer = rolePlayers[i];
          if (leftPlayer) {
            drawPlayerCard(doc, leftPlayer, config, 8, yPosition, 138.5, role); // Larghezza metà pagina
          }
          
          // Seconda colonna (giocatore destro)
          const rightPlayer = rolePlayers[i + 1];
          if (rightPlayer) {
            drawPlayerCard(doc, rightPlayer, config, 150.5, yPosition, 138.5, role); // Metà destra
          }
          
          yPosition += 15; // Spazio tra le righe
        }
        
        yPosition += 6; // Spazio ridotto tra ruoli
      }
    });
    
    // Data generazione direttamente senza statistiche
    yPosition += 10;
    if (yPosition > 170) {
      doc.addPage();
      doc.setFillColor(34, 39, 54);
      doc.rect(0, 0, 297, 210, 'F');
      yPosition = 30;
    }
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    const now = new Date();
    const dateString = now.toLocaleDateString('it-IT');
    doc.text(`Generato il ${dateString} - Fantasy Football Database`, 148.5, yPosition, { align: 'center' });
    
    doc.save('database-giocatori.pdf');
  };

  const generateTeamPDF = async (selections: RealTimeSelection[], teamName: string) => {
    // Pre-carica le percentuali dal database per tutti i giocatori selezionati
    const playerPercentages = new Map<string, number>();
    
    for (const selection of selections) {
      if (selection.player) {
        try {
          // Query migliorata per gestire duplicati e trovare il record con la percentuale più alta
          const { data: players } = await supabase
            .from('players')
            .select('cost_percentage, name, surname, team')
            .eq('surname', selection.player.surname)
            .eq('team', selection.player.team as any)
            .order('cost_percentage', { ascending: false })
            .order('name', { ascending: false, nullsFirst: false });
          
          if (players && players.length > 0) {
            // Prende il primo record (quello con percentuale più alta e name più completo)
            const bestMatch = players[0];
            const key = `${selection.player.name}-${selection.player.surname}-${selection.player.team}`;
            playerPercentages.set(key, bestMatch.cost_percentage);
            console.log(`Caricata percentuale per ${selection.player.surname} (${selection.player.team}): ${bestMatch.cost_percentage}%`);
          } else {
            console.warn(`Giocatore non trovato nel database: ${selection.player.name} ${selection.player.surname} (${selection.player.team})`);
          }
        } catch (error) {
          console.error('Errore ricerca giocatore:', error);
        }
      }
    }
    
    const doc = new jsPDF();
    
    // Imposta sfondo con gradiente (simula il design glassmorphism)
    doc.setFillColor(34, 39, 54); // Background scuro
    doc.rect(0, 0, 210, 297, 'F');
    
    // Titolo principale ottimizzato per spazio
    doc.setFontSize(18); // Ridotto da 20 per guadagnare spazio
    doc.setTextColor(255, 255, 255);
    doc.text(teamName || 'Fanta Team', 105, 13, { align: 'center' }); // Ridotto Y da 15
    
    // Sottotitolo compatto
    doc.setFontSize(8); // Ridotto da 9
    doc.setTextColor(180, 180, 180);
    doc.text('Fantasy Football Team Builder', 105, 19, { align: 'center' }); // Ridotto Y da 22
    
    let yPosition = 28; // Ridotto da 35 per guadagnare spazio
    
    const roles: PlayerRole[] = ['Portiere', 'Difensore', 'Centrocampista', 'Attaccante'];
    const roleConfig = {
      'Portiere': { 
        name: 'Portieri',
        slots: [1, 2, 3], 
        rows: 1, 
        cols: 3,
        color: [34, 197, 94] as [number, number, number], // Modern green
        lightColor: [134, 239, 172] as [number, number, number],
        glassColor: [34, 197, 94, 0.15] as [number, number, number, number]
      },
      'Difensore': { 
        name: 'Difensori',
        slots: [1, 2, 3, 4, 5, 6, 7, 8], 
        rows: 2, 
        cols: 4,
        color: [59, 130, 246] as [number, number, number], // Modern blue
        lightColor: [147, 197, 253] as [number, number, number],
        glassColor: [59, 130, 246, 0.15] as [number, number, number, number]
      },
      'Centrocampista': { 
        name: 'Centrocampisti',
        slots: [1, 2, 3, 4, 5, 6, 7, 8], 
        rows: 2, 
        cols: 4,
        color: [168, 85, 247] as [number, number, number], // Modern purple
        lightColor: [196, 181, 253] as [number, number, number],
        glassColor: [168, 85, 247, 0.15] as [number, number, number, number]
      },
      'Attaccante': { 
        name: 'Attaccanti',
        slots: [1, 2, 3, 4, 5, 6], 
        rows: 2, 
        cols: 3,
        color: [245, 101, 101] as [number, number, number], // Modern red
        lightColor: [252, 165, 165] as [number, number, number],
        glassColor: [245, 101, 101, 0.15] as [number, number, number, number]
      }
    };
    
    roles.forEach((role) => {
      const config = roleConfig[role];
      
      // Calcola la larghezza del testo per adattare il rettangolo compatto
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      const textWidth = doc.getTextWidth(config.name);
      const rectWidth = textWidth + 20; // Ridotto padding laterale
      const rectX = (210 - rectWidth) / 2; // Centra il rettangolo nella pagina
      
      // Background con forma ovale più compatta
      const rectHeight = 10; // Ridotto altezza
      const cornerRadius = rectHeight / 2;
      
      // Sfondo con gradiente moderno più intenso
      doc.setFillColor(config.color[0], config.color[1], config.color[2]);
      doc.roundedRect(rectX, yPosition - 2, rectWidth, rectHeight, cornerRadius, cornerRadius, 'F');
      
      // Layer gradiente centrale
      doc.setFillColor(config.color[0], config.color[1], config.color[2]);
      doc.roundedRect(rectX + 1, yPosition - 1.5, rectWidth - 2, rectHeight - 1, cornerRadius - 0.5, cornerRadius - 0.5, 'F');
      
      // Layer interno per massimo effetto gradiente
      doc.setFillColor(config.color[0], config.color[1], config.color[2]);
      doc.roundedRect(rectX + 2, yPosition - 1, rectWidth - 4, rectHeight - 2, cornerRadius - 1, cornerRadius - 1, 'F');
      
      // Bordo colorato molto sottile
      doc.setDrawColor(config.color[0], config.color[1], config.color[2]);
      doc.setLineWidth(0.5); // Drasticamente ridotto
      doc.roundedRect(rectX, yPosition - 2, rectWidth, rectHeight, cornerRadius, cornerRadius, 'S');
      
      // Titolo perfettamente centrato (X e Y) - Bianco su sfondo colorato
      doc.setTextColor(255, 255, 255); // Testo bianco per massima leggibilità
      const centerY = yPosition + (rectHeight / 2) - 1; // Centro verticale della forma
      doc.text(config.name, 105, centerY, { align: 'center' });
      yPosition += 14; // Ridotto da 18 per guadagnare spazio senza compromettere le dimensioni slot
      
      // Dimensioni ben proporzionate per utilizzare meglio lo spazio
      const cardWidth = 40; // Aumentato da 32 a 40
      const cardHeight = 18; // Aumentato da 13 a 18
      const startX = 20;
      const spacingX = 42; // Aumentato da 34 a 42
      const spacingY = 20; // Aumentato da 15 a 20
      
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
          doc.setFillColor(config.lightColor[0], config.lightColor[1], config.lightColor[2]);
          doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3, 'F'); // Aumentato border radius
          
          // Bordo colorato
          doc.setDrawColor(config.color[0], config.color[1], config.color[2]);
          doc.setLineWidth(1);
          doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3, 'S');
          
          // Etichetta slot ridotta - area P1 più piccola
          doc.setFillColor(config.color[0], config.color[1], config.color[2]);
          doc.roundedRect(x + 1, y + 1, 6, 4, 1, 1, 'F'); // Ridotta dimensione
          
          doc.setFontSize(4); // Ridotto per area più piccola
          doc.setTextColor(255, 255, 255);
          const roleAbbrev = role === 'Portiere' ? 'P' : 
                            role === 'Difensore' ? 'D' : 
                            role === 'Centrocampista' ? 'C' : 'A';
          doc.text(`${roleAbbrev}${slot}`, x + 1.5, y + 3.5);
          
          // Cognome e squadra a sinistra
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8); // Cognome più grande
          doc.setTextColor(30, 30, 30);
          const surname = selection.player.surname || '';
          doc.text(surname, x + 2, y + 9);
          
          // Team sotto il cognome
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(5);
          doc.setTextColor(70, 70, 70);
          doc.text(selection.player.team || '', x + 2, y + 12);
          
          // Recupera la percentuale budget dal database pre-caricato
          const key = `${selection.player.name}-${selection.player.surname}-${selection.player.team}`;
          let budgetPercentage = playerPercentages.get(key) || 0;
          
          // Se non trovata nel database, usa i crediti come fallback
          if (budgetPercentage === 0 && selection.player.credits > 0) {
            budgetPercentage = (selection.player.credits / 500) * 100;
          }
          
          // Calcolo crediti per i tre scenari di budget basati sulla percentuale
          const credits300 = Math.round((budgetPercentage / 100) * 300);
          const credits500 = Math.round((budgetPercentage / 100) * 500);
          const credits650 = Math.round((budgetPercentage / 100) * 650);
          
          // Percentuale principale grande a destra
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(config.color[0], config.color[1], config.color[2]);
          const percentageText = `${budgetPercentage.toFixed(1)}%`;
          doc.text(percentageText, x + cardWidth - 15, y + 6);
          
          // Tre ipotesi di crediti in verticale sotto la percentuale
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(4);
          doc.setTextColor(50, 50, 50);
          doc.text(`300: ${credits300}`, x + cardWidth - 15, y + 9);
          doc.text(`500: ${credits500}`, x + cardWidth - 15, y + 12);
          doc.text(`650: ${credits650}`, x + cardWidth - 15, y + 15);
          
        } else {
          // Slot vuoto - design tratteggiato
          doc.setDrawColor(120, 120, 120);
          doc.setLineWidth(0.5);
          doc.setLineDashPattern([2, 2], 0);
          doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3, 'S');
          doc.setLineDashPattern([], 0);
          
          // Etichetta slot per slot vuoti
          doc.setFillColor(120, 120, 120);
          doc.roundedRect(x + 1, y + 1, 10, 5, 1, 1, 'F');
          
          doc.setFontSize(5);
          doc.setTextColor(255, 255, 255);
          const roleAbbrev = role === 'Portiere' ? 'P' : 
                            role === 'Difensore' ? 'D' : 
                            role === 'Centrocampista' ? 'C' : 'A';
          doc.text(`${roleAbbrev}${slot}`, x + 1.5, y + 4);
          
          // Testo "Disponibile"
          doc.setFontSize(6); // Aumentato per leggibilità
          doc.setTextColor(120, 120, 120);
          doc.text('Disponibile', x + 2, y + 12);
        }
      });
      
      yPosition += config.rows * spacingY + 4; // Ridotto da 8 a 4 per guadagnare spazio
    });
    
    // Footer con totale crediti - spazio ultra ridotto
    yPosition += 1; // Ridotto da 2 a 1
    
    // Calcoli per i tre scenari di budget
    const filledSlots = selections.filter(s => s.player).length;
    const totalSlots = roles.reduce((sum, role) => sum + roleConfig[role].slots.length, 0);
    
    // Calcolo totali per i tre budget usando la percentuale corretta
    let total300 = 0, total500 = 0, total650 = 0;
    selections.forEach(sel => {
      if (sel.player) {
        // Recupera la percentuale budget dal database pre-caricato
        const key = `${sel.player.name}-${sel.player.surname}-${sel.player.team}`;
        let budgetPercentage = playerPercentages.get(key) || 0;
        
        // Se non trovata nel database, usa i crediti come fallback
        if (budgetPercentage === 0 && sel.player.credits > 0) {
          budgetPercentage = (sel.player.credits / 500) * 100;
        }
        
        total300 += Math.round((budgetPercentage / 100) * 300);
        total500 += Math.round((budgetPercentage / 100) * 500);
        total650 += Math.round((budgetPercentage / 100) * 650);
      }
    });
    
    // Infografica spesa per ruolo - più compatta
    doc.setFontSize(9); // Ridotto da 10
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('SPESA PER RUOLO', 105, yPosition, { align: 'center' });
    yPosition += 5; // Ultra compatto
    
    // Statistiche per ogni ruolo
    const roleStats = roles.map(role => {
      const config = roleConfig[role];
      const roleSelections = selections.filter(s => s.role_category === role && s.player);
      
      // Calcola crediti per i tre scenari usando la percentuale corretta
      let role300 = 0, role500 = 0, role650 = 0;
      roleSelections.forEach(sel => {
        // Recupera la percentuale budget dal database pre-caricato
        const key = `${sel.player.name}-${sel.player.surname}-${sel.player.team}`;
        let budgetPercentage = playerPercentages.get(key) || 0;
        
        // Se non trovata nel database, usa i crediti come fallback
        if (budgetPercentage === 0 && sel.player.credits > 0) {
          budgetPercentage = (sel.player.credits / 500) * 100;
        }
        
        role300 += Math.round((budgetPercentage / 100) * 300);
        role500 += Math.round((budgetPercentage / 100) * 500);
        role650 += Math.round((budgetPercentage / 100) * 650);
      });
      
      const rolePercentage500 = total500 > 0 ? (role500 / total500 * 100) : 0;
      
      return {
        role,
        name: config.name,
        credits300: role300,
        credits500: role500,
        credits650: role650,
        percentage: rolePercentage500,
        color: config.color,
        players: roleSelections.length,
        maxPlayers: config.slots.length
      };
    });
    
    // Layout a 2x2 per le statistiche dei ruoli - ridimensionato per evitare sovrapposizioni
    const statWidth = 75; // Ridotto da 80 per evitare sovrapposizioni
    const statHeight = 10;
    const statSpacing = 80; // Ridotto da 85
    
    roleStats.forEach((stat, index) => {
      const row = Math.floor(index / 2);
      const col = index % 2;
      const x = 30 + col * statSpacing; // Centrato meglio
      const y = yPosition + row * 12;
      
      // Sfondo colorato per ogni statistica
      doc.setFillColor(stat.color[0], stat.color[1], stat.color[2]);
      doc.roundedRect(x, y, statWidth, statHeight, 2, 2, 'F');
      
      // Bordo colorato
      doc.setDrawColor(stat.color[0], stat.color[1], stat.color[2]);
      doc.setLineWidth(0.5);
      doc.roundedRect(x, y, statWidth, statHeight, 2, 2, 'S');
      
      // Nome ruolo - compatto
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(stat.color[0], stat.color[1], stat.color[2]);
      doc.text(stat.name, x + 2, y + 3);
      
      // Crediti spesi - compatto per budget 500
      doc.setFontSize(6);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(255, 255, 255);
      doc.text(`${stat.credits500} crediti (${stat.percentage.toFixed(1)}%)`, x + 2, y + 6);
      
      // Giocatori selezionati - compatto
      doc.text(`${stat.players}/${stat.maxPlayers} giocatori`, x + 2, y + 9);
    });
    
    yPosition += 30; // Spazio sufficiente per evitare sovrapposizioni con totale crediti
    
    // Sezione totale crediti per i tre scenari - design moderno espanso
    doc.setFillColor(50, 50, 50);
    doc.roundedRect(20, yPosition - 5, 170, 35, 3, 3, 'F'); // Espanso per contenere i tre totali
    
    // Bordo dorato per il totale
    doc.setDrawColor(255, 215, 0);
    doc.setLineWidth(1);
    doc.roundedRect(20, yPosition - 5, 170, 35, 3, 3, 'S');
    
    // Titolo totale crediti
    doc.setFontSize(12);
    doc.setTextColor(255, 215, 0);
    doc.text('TOTALE CREDITI', 105, yPosition + 3, { align: 'center' });
    
    // I tre totali affiancati
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(`Budget 300: ${total300}`, 35, yPosition + 12, { align: 'left' });
    doc.text(`Budget 500: ${total500}`, 105, yPosition + 12, { align: 'center' });
    doc.text(`Budget 650: ${total650}`, 175, yPosition + 12, { align: 'right' });
    
    // Percentuali di utilizzo
    doc.setFontSize(7);
    doc.setTextColor(180, 180, 180);
    const perc300 = total300 > 0 ? ((total300 / 300) * 100).toFixed(1) : '0';
    const perc500 = total500 > 0 ? ((total500 / 500) * 100).toFixed(1) : '0';
    const perc650 = total650 > 0 ? ((total650 / 650) * 100).toFixed(1) : '0';
    doc.text(`(${perc300}%)`, 35, yPosition + 18, { align: 'left' });
    doc.text(`(${perc500}%)`, 105, yPosition + 18, { align: 'center' });
    doc.text(`(${perc650}%)`, 175, yPosition + 18, { align: 'right' });
    
    // Info slot riempiti - ben spaziato
    yPosition += 40; // Spazio adeguato dopo la sezione crediti espansa
    doc.setFontSize(10); // Ripristinato per leggibilità
    doc.setTextColor(180, 180, 180);
    doc.text(`Giocatori selezionati: ${filledSlots}/${totalSlots}`, 105, yPosition, { align: 'center' });
    
    // Footer con data - spazio finale adeguato
    yPosition += 15; // Spazio finale equilibrato
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