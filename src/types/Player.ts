
export type PlayerRole = 'Portiere' | 'Difensore' | 'Centrocampista' | 'Attaccante';

export type SpecificRole = 
  | 'Portiere'
  | 'Difensore centrale' | 'Esterno offensivo' | 'Braccetto'
  | 'Mediano' | 'Regista' | 'Mezzala' | 'Trequartista' | 'Ala offensiva'
  | 'Attaccante centrale' | 'Seconda punta' | 'Mezzapunta';

export type Team = 
  | 'Atalanta' | 'Bologna' | 'Cagliari' | 'Como' | 'Cremonese' | 'Fiorentina'
  | 'Genoa' | 'Hellas Verona' | 'Inter' | 'Juventus' | 'Lazio' | 'Lecce'
  | 'Milan' | 'Napoli' | 'Parma' | 'Pisa' | 'Roma' | 'Sassuolo' | 'Torino' | 'Udinese';

export type PlusCategory = 'Under 21' | 'Rigorista' | 'Calci piazzati' | 'Assistman' | 'Goleador';

export interface Player {
  id: string;
  name: string;
  surname: string;
  team: Team | '';
  role: SpecificRole;
  roleCategory: PlayerRole;
  costPercentage: number;
  goals: number;
  assists: number;
  malus: number;
  // Statistiche specifiche per portieri
  goalsConceded: number;
  yellowCards: number;
  penaltiesSaved: number;
  xG: number;
  xA: number;
  xP: number; // Nuovo campo per i portieri
  ownership: number;
  plusCategories: PlusCategory[];
}
