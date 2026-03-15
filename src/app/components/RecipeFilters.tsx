import React from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'motion/react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Slider } from './ui/slider';
import { Label } from './ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';

interface Filters {
  search: string;
  maxCalories: number;
  cuisine: string;
  dietType: string;
  maxTime: number;
  difficulty: string;
}

interface RecipeFiltersProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
}

export const RecipeFilters: React.FC<RecipeFiltersProps> = ({ filters, onFilterChange }) => {
  const [localFilters, setLocalFilters] = React.useState(filters);
  const [isOpen, setIsOpen] = React.useState(false);
  const [focused, setFocused] = React.useState(false);

  const updateFilter = (key: keyof Filters, value: string | number) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const defaultFilters: Filters = {
      search: '',
      maxCalories: 5000,
      cuisine: 'all',
      dietType: 'all',
      maxTime: 300,
      difficulty: 'all',
    };
    setLocalFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const hasActiveFilters =
    localFilters.search ||
    localFilters.maxCalories < 5000 ||
    localFilters.cuisine !== 'all' ||
    localFilters.dietType !== 'all' ||
    localFilters.maxTime < 300 ||
    localFilters.difficulty !== 'all';

  const activeChips = [
    localFilters.search && { label: `"${localFilters.search}"`, key: 'search', resetVal: '' },
    localFilters.cuisine !== 'all' && { label: localFilters.cuisine, key: 'cuisine', resetVal: 'all' },
    localFilters.dietType !== 'all' && { label: localFilters.dietType, key: 'dietType', resetVal: 'all' },
    localFilters.difficulty !== 'all' && { label: localFilters.difficulty, key: 'difficulty', resetVal: 'all' },
  ].filter(Boolean) as { label: string; key: keyof Filters; resetVal: string }[];

  return (
    <div className="w-full space-y-3">
      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <motion.div
            animate={focused ? { scale: 1.01 } : { scale: 1 }}
            transition={{ duration: 0.15 }}
          >
            <Input
              type="text"
              placeholder="Search recipes or ingredients..."
              value={localFilters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              className={`pl-10 rounded-xl transition-all duration-200 ${
                focused ? 'ring-2 shadow-md' : ''
              }`}
              style={focused ? { ringColor: 'var(--brand)', boxShadow: '0 0 0 3px var(--brand-glow)' } : {}}
            />
          </motion.div>
        </div>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="relative rounded-xl flex-shrink-0">
              <SlidersHorizontal className="h-4 w-4" />
              {hasActiveFilters && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 h-3 w-3 rounded-full"
                  style={{ background: 'var(--brand)' }}
                />
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="rounded-l-2xl">
            <SheetHeader>
              <SheetTitle className="text-lg font-bold">Filter Recipes</SheetTitle>
              <SheetDescription>Refine your search</SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Cuisine</Label>
                <Select value={localFilters.cuisine} onValueChange={(v) => updateFilter('cuisine', v)}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">All Cuisines</SelectItem>
                    <SelectItem value="Italian">🍕 Italian</SelectItem>
                    <SelectItem value="Indian">🌶️ Indian</SelectItem>
                    <SelectItem value="Mediterranean">🫒 Mediterranean</SelectItem>
                    <SelectItem value="American">🍔 American</SelectItem>
                    <SelectItem value="Japanese">🍣 Japanese</SelectItem>
                    <SelectItem value="Mexican">🌮 Mexican</SelectItem>
                    <SelectItem value="Asian">🥢 Asian</SelectItem>
                    <SelectItem value="Thai">🍜 Thai</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Diet Type</Label>
                <Select value={localFilters.dietType} onValueChange={(v) => updateFilter('dietType', v)}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Vegetarian">🌿 Vegetarian</SelectItem>
                    <SelectItem value="Vegan">🥦 Vegan</SelectItem>
                    <SelectItem value="Non-Vegetarian">🥩 Non-Vegetarian</SelectItem>
                    <SelectItem value="Keto">🥑 Keto</SelectItem>
                    <SelectItem value="Paleo">🍖 Paleo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Difficulty</Label>
                <Select value={localFilters.difficulty} onValueChange={(v) => updateFilter('difficulty', v)}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="Easy">😊 Easy</SelectItem>
                    <SelectItem value="Medium">🧑‍🍳 Medium</SelectItem>
                    <SelectItem value="Hard">👨‍🍳 Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Max Calories</Label>
                  <span className="text-sm font-semibold" style={{ color: 'var(--brand)' }}>{localFilters.maxCalories} cal</span>
                </div>
                <Slider
                  value={[localFilters.maxCalories]}
                  onValueChange={(v) => updateFilter('maxCalories', v[0])}
                  max={5000} min={100} step={100}
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Max Cook Time</Label>
                  <span className="text-sm font-semibold" style={{ color: 'var(--brand)' }}>{localFilters.maxTime} min</span>
                </div>
                <Slider
                  value={[localFilters.maxTime]}
                  onValueChange={(v) => updateFilter('maxTime', v[0])}
                  max={300} min={5} step={5}
                />
              </div>

              {hasActiveFilters && (
                <Button variant="outline" className="w-full rounded-xl" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-2" /> Clear All Filters
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active filter chips with AnimatePresence */}
      <div className="flex flex-wrap gap-2 min-h-0">
        <AnimatePresence>
          {activeChips.map((chip) => (
            <motion.button
              key={chip.key}
              initial={{ opacity: 0, scale: 0.8, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -6 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              onClick={() => updateFilter(chip.key, chip.resetVal)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive"
              style={{ background: 'var(--accent)', color: 'var(--accent-foreground)', borderColor: 'var(--border)' }}
            >
              {chip.label}
              <X className="h-3 w-3" />
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
