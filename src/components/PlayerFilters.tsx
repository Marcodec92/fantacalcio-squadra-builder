
import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
  'Genoa', 'Hellas Verona', 'Inter', 'Juventus', 'Lazio', 'Lecce',
  'Milan', 'Napoli', 'Parma', 'Pisa', 'Roma', 'Sassuolo', 'Torino', 'Udinese'
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
    <Card className="p-4 mb-4">
      <div className="space-y-4">
        {/* Search and Favorites */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Cerca per nome..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant={showFavoritesOnly ? "default" : "outline"}
            onClick={onFavoritesToggle}
            className="shrink-0"
          >
            <Star className={`w-4 h-4 mr-2 ${showFavoritesOnly ? 'fill-current' : ''}`} />
            Preferiti
          </Button>
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="shrink-0">
                <Filter className="w-4 h-4 mr-2" />
                Filtri
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Teams Filter */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Squadre</Label>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {teams.map((team) => (
                      <div key={team} className="flex items-center space-x-2">
                        <Checkbox
                          id={`team-${team}`}
                          checked={selectedTeams.includes(team)}
                          onCheckedChange={() => toggleTeam(team)}
                        />
                        <Label htmlFor={`team-${team}`} className="text-sm cursor-pointer">
                          {team}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tiers Filter */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Fasce</Label>
                  <div className="space-y-1">
                    {getTiersForRole(roleCategory).map((tier) => (
                      <div key={tier} className="flex items-center space-x-2">
                        <Checkbox
                          id={`tier-${tier}`}
                          checked={selectedTiers.includes(tier)}
                          onCheckedChange={() => toggleTier(tier)}
                        />
                        <Label htmlFor={`tier-${tier}`} className="text-sm cursor-pointer">
                          {tier}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Plus Categories Filter */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Categorie Plus</Label>
                  <div className="space-y-1">
                    {getPlusCategoriesForRole(roleCategory).map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={`plus-${category}`}
                          checked={selectedPlusCategories.includes(category)}
                          onCheckedChange={() => togglePlusCategory(category)}
                        />
                        <Label htmlFor={`plus-${category}`} className="text-sm cursor-pointer">
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {activeFiltersCount > 0 && (
                <div className="mt-4 pt-4 border-t">
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
    </Card>
  );
};

export default PlayerFilters;
