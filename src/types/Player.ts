
export type PlayerRole = 'portiere' | 'difensore' | 'centrocampista' | 'attaccante';

export type SpecificRole = 
  | 'portiere'
  | 'difensore centrale' | 'esterno offensivo' | 'braccetto'
  | 'mediano' | 'regista' | 'mezzala' | 'trequartista' | 'ala offensiva'
  | 'attaccante centrale' | 'seconda punta' | 'mezzapunta';

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
  xG: number;
  xA: number;
  ownership: number;
  plusCategories: PlusCategory[];
}
