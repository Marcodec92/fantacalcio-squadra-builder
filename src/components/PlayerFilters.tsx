
import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Search, X, Star, Filter } from "lucide-react";
import { PlayerRole, Team, PlayerTier, PlusCategory } from '@/types/Player';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface PlayerFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  showFavoritesOnly: boolean;
  onFavoritesToggle: () => void;
  selectedTeams: string[];
  onTeamsChange: (teams: string[]) => void;
  selectedTiers: string[];
  onTiersChange: (tiers: string[]) => void;
  selectedPlusCategories: string[];
  onPlusCategoriesChange: (categories: string[]) => void;
  roleCategory: PlayerRole;
}

const teams: Team[] = [
  'Atalanta', 'Bologna', 'Cagliari', 'Como', 'Cremonese', 'Fiorentina',
  'Genoa', 'Inter', 'Juventus', 'Lazio', 'Lecce',
  'Milan', 'Napoli', 'Parma', 'Pisa', 'Roma', 'Sassuolo', 'Torino', 'Udinese', 'Verona'
];

const goalkeeperTiers = ['1ª fascia', '2ª fascia', '3ª fascia'];
const defenderMidfielderTiers = ['1ª fascia', '2ª fascia', '3ª fascia', '4ª fascia', '5ª fascia', '6ª fascia', '7ª fascia', '8ª fascia'];
const attackerTiers = ['1ª fascia', '2ª fascia', '3ª fascia', '4ª fascia', '5ª fascia', '6ª fascia'];

const commonPlusCategories: PlusCategory[] = ['Under 21', 'Under 19', 'Rigorista', 'Calci piazzati', 'Assistman', 'Goleador'];
const goalkeeperPlusCategories: PlusCategory[] = ['Pararigori'];

const PlayerFilters: React.FC<PlayerFiltersProps> = ({
  searchTerm,
  onSearchChange,
  showFavoritesOnly,
  onFavoritesToggle,
  selectedTeams,
  onTeamsChange,
  selectedTiers,
  onTiersChange,
  selectedPlusCategories,
  onPlusCategoriesChange,
  roleCategory
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const getTiersForRole = (role: PlayerRole) => {
    switch (role) {
      case 'Portiere': return goalkeeperTiers;
      case 'Difensore':
      case 'Centrocampista': return defenderMidfielderTiers;
      case 'Attaccante': return attackerTiers;
    }
  };

  const getPlusCategoriesForRole = (role: PlayerRole) => {
    return role === 'Portiere' 
      ? [...commonPlusCategories, ...goalkeeperPlusCategories]
      : commonPlusCategories;
  };

  const toggleTeam = (team: string) => {
    const newTeams = selectedTeams.includes(team)
      ? selectedTeams.filter(t => t !== team)
      : [...selectedTeams, team];
    onTeamsChange(newTeams);
  };

  const toggleTier = (tier: string) => {
    const newTiers = selectedTiers.includes(tier)
      ? selectedTiers.filter(t => t !== tier)
      : [...selectedTiers, tier];
    onTiersChange(newTiers);
  };

  const togglePlusCategory = (category: string) => {
    const newCategories = selectedPlusCategories.includes(category)
      ? selectedPlusCategories.filter(c => c !== category)
      : [...selectedPlusCategories, category];
    onPlusCategoriesChange(newCategories);
  };

  const clearAllFilters = () => {
    onSearchChange('');
    onTeamsChange([]);
    onTiersChange([]);
    onPlusCategoriesChange([]);
  };

  const activeFiltersCount = selectedTeams.length + selectedTiers.length + selectedPlusCategories.length + (showFavoritesOnly ? 1 : 0);

  return (
    <div className="mb-4">
      <div className="space-y-4">
        {/* Search and Favorites */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Cerca per nome..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 bg-transparent border-white/20 text-white placeholder:text-white/60 h-10 sm:h-auto"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={showFavoritesOnly ? "default" : "outline"}
              onClick={onFavoritesToggle}
              className="shrink-0 h-10 px-3 sm:px-4 text-xs sm:text-sm"
              size="sm"
            >
              <Star className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 ${showFavoritesOnly ? 'fill-current' : ''}`} />
              <span className="hidden sm:inline">Preferiti</span>
              <span className="sm:hidden">★</span>
            </Button>
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="shrink-0 h-10 px-3 sm:px-4 text-xs sm:text-sm" size="sm">
                  <Filter className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Filtri</span>
                  <span className="sm:hidden">☰</span>
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-1 sm:ml-2 text-xs">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </CollapsibleTrigger>
            <CollapsibleContent className="mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Teams Filter */}
                <div>
                  <Label className="text-sm font-medium mb-2 block text-white">Squadre</Label>
                  <div className="max-h-32 sm:max-h-40 overflow-y-auto space-y-1">
                    {teams.map((team) => (
                      <div key={team} className="flex items-center space-x-2">
                        <Checkbox
                          id={`team-${team}`}
                          checked={selectedTeams.includes(team)}
                          onCheckedChange={() => toggleTeam(team)}
                        />
                        <Label htmlFor={`team-${team}`} className="text-sm cursor-pointer text-white">
                          {team}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tiers Filter */}
                <div>
                  <Label className="text-sm font-medium mb-2 block text-white">Fasce</Label>
                  <div className="space-y-1">
                    {getTiersForRole(roleCategory).map((tier) => (
                      <div key={tier} className="flex items-center space-x-2">
                        <Checkbox
                          id={`tier-${tier}`}
                          checked={selectedTiers.includes(tier)}
                          onCheckedChange={() => toggleTier(tier)}
                        />
                        <Label htmlFor={`tier-${tier}`} className="text-sm cursor-pointer text-white">
                          {tier}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Plus Categories Filter */}
                <div>
                  <Label className="text-sm font-medium mb-2 block text-white">Categorie Plus</Label>
                  <div className="space-y-1">
                    {getPlusCategoriesForRole(roleCategory).map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={`plus-${category}`}
                          checked={selectedPlusCategories.includes(category)}
                          onCheckedChange={() => togglePlusCategory(category)}
                        />
                        <Label htmlFor={`plus-${category}`} className="text-sm cursor-pointer text-white">
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {activeFiltersCount > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <Button variant="ghost" onClick={clearAllFilters} size="sm">
                    <X className="w-4 h-4 mr-1" />
                    Rimuovi tutti i filtri
                  </Button>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerFilters;
