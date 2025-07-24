-- Prima creo un nuovo enum senza 'Hellas Verona'
CREATE TYPE team_name_new AS ENUM (
  'Atalanta', 'Bologna', 'Cagliari', 'Como', 'Cremonese', 'Fiorentina',
  'Genoa', 'Inter', 'Juventus', 'Lazio', 'Lecce',
  'Milan', 'Napoli', 'Parma', 'Pisa', 'Roma', 'Sassuolo', 'Torino', 'Udinese', 'Verona'
);

-- Aggiorno la colonna per usare il nuovo enum
ALTER TABLE players ALTER COLUMN team TYPE team_name_new USING team::text::team_name_new;

-- Rimuovo il vecchio enum e rinomino il nuovo
DROP TYPE team_name;
ALTER TYPE team_name_new RENAME TO team_name;