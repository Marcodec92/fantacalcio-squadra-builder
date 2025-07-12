
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

export type PlusCategory = 'Under 21' | 'Under 19' | 'Rigorista' | 'Calci piazzati' | 'Assistman' | 'Goleador' | 'Pararigori';

export type GoalkeeperTier = '1ª fascia' | '2ª fascia' | '3ª fascia';
export type DefenderMidfielderTier = '1ª fascia' | '2ª fascia' | '3ª fascia' | '4ª fascia' | '5ª fascia' | '6ª fascia' | '7ª fascia' | '8ª fascia';
export type AttackerTier = '1ª fascia' | '2ª fascia' | '3ª fascia' | '4ª fascia' | '5ª fascia' | '6ª fascia';

export type PlayerTier = GoalkeeperTier | DefenderMidfielderTier | AttackerTier;

export type SortOption = 
  | 'name'
  | 'costPercentage'
  | 'fmv'
  | 'goals'
  | 'assists'
  | 'bonusTotal'
  | 'xG'
  | 'xA'
  | 'xP'
  | 'goalsConceded';

export interface Player {
  id: string;
  name: string;
  surname: string;
  team: Team | '';
  role: SpecificRole;
  roleCategory: PlayerRole;
  costPercentage: number;
  fmv: number;
  tier: PlayerTier | '';
  goals: number;
  assists: number;
  malus: number;
  // Statistiche specifiche per portieri
  goalsConceded: number;
  yellowCards: number;
  penaltiesSaved: number;
  xG: number;
  xA: number;
  xP: number;
  ownership: number;
  plusCategories: PlusCategory[];
  isFavorite: boolean;
}
