import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { RecipeCard } from '../components/RecipeCard';
import { RecipeFilters } from '../components/RecipeFilters';
import { HeroCanvas } from '../components/HeroCanvas';
import { mockRecipes } from '../data/mockRecipes';
import { StorageService } from '../utils/localStorage';
import { filterRecipes, sortRecipes } from '../utils/recipeUtils';
import { Recipe } from '../types/recipe';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { TrendingUp, Star, Clock, ChefHat, PlusCircle, Award, Flame, ArrowRight, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const categoryPills = [
  { label: '🍕 Italian', cuisine: 'Italian' },
  { label: '🌿 Vegetarian', dietType: 'Vegetarian' },
  { label: '⚡ Quick (30m)', maxTime: 30 },
  { label: '🌶️ Indian', cuisine: 'Indian' },
  { label: '🥑 Vegan', dietType: 'Vegan' },
  { label: '🍣 Japanese', cuisine: 'Japanese' },
  { label: '🥑 Keto', dietType: 'Keto' },
];

// Speciality descriptions per recipe
const recipeSpecialties: Record<string, { badge: string; headline: string; lines: string[] }> = {
  '1': { badge: '🇮🇹 Italian Classic', headline: 'The real Roman Carbonara', lines: ['No cream — the magic is in the emulsified egg yolks and pasta water.', 'A dish born in WWII Rome, now beloved across the world.', 'The key is pulling off the heat before adding eggs to avoid scrambling.'] },
  '2': { badge: '🌟 Reader Favourite', headline: 'Our highest-rated curry', lines: ['Marinating overnight transforms the chicken — deeply flavoured and tender.', 'The tangy tomato-cream sauce balances heat and richness perfectly.', 'Grilling the chicken first adds a smoky char that sets this apart from restaurant versions.'] },
  '3': { badge: '🌊 Mediterranean Gem', headline: 'Ultra-fresh in 15 minutes', lines: ['Cold-pressed olive oil makes all the difference — use the best you have.', 'Best served immediately so the vegetables stay crisp and vibrant.', 'Kalamata olives add a briny depth that balances the creamy feta.'] },
  '4': { badge: '🍫 Crowd Pleaser', headline: 'The ultimate chocolate indulgence', lines: ['Dutch-process cocoa gives a deeper, richer chocolate flavour.', 'Over 670 home bakers have rated this 5 stars — it never disappoints.', 'Frost while the cake is still slightly warm to get a glossy, smooth finish.'] },
  '5': { badge: '🔪 Chef\'s Challenge', headline: 'Restaurant-quality sushi at home', lines: ['Sushi-grade fish is non-negotiable — freshness is everything here.', 'Season the rice while it\'s still warm — it absorbs the vinegar better.', 'A sharp, wet knife is the secret to clean, professional-looking cuts.'] },
  '8': { badge: '🔥 Wood-Fired Style', headline: 'Neapolitan perfection', lines: ['A blazing hot oven (475°F+) is the secret to authentic pizza — the crust chars in minutes.', 'Less is more — resist the urge to overload the toppings.', 'Fresh mozzarella torn by hand melts more evenly than sliced.'] },
  '10': { badge: '🏆 Top Rated', headline: '#1 most reviewed recipe', lines: ['Tamarind is the irreplaceable heart of authentic Pad Thai — don\'t substitute.', 'High wok heat creates the prized wok-hei (breath of the wok) smoky flavour.', 'Over 600 cooks have made this — their tip: prep every ingredient before the wok heats up.'] },
};

function getDailyRecipe(recipes: Recipe[]): Recipe {
  // Rotate by day-of-year among top-rated recipes
  const topRecipes = [...recipes].filter(r => r.rating >= 4.7).sort((a, b) => b.rating - a.rating);
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return topRecipes[dayOfYear % topRecipes.length] ?? recipes[0];
}

// Recipe of the Day Modal
const RecipeOfDayModal: React.FC<{ recipe: Recipe; onClose: () => void }> = ({ recipe, onClose }) => {
  const specialty = recipeSpecialties[recipe.id] ?? {
    badge: '⭐ Today\'s Pick',
    headline: `Why you\'ll love ${recipe.name}`,
    lines: [recipe.description, 'A fan-favourite recipe with consistently great reviews.', 'Perfect for any occasion — from weeknight dinners to weekend feasts.'],
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.88, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.88, opacity: 0, y: 30 }}
        transition={{ type: 'spring', stiffness: 280, damping: 25 }}
        className="bg-card rounded-3xl overflow-hidden shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal image */}
        <div className="relative h-56 overflow-hidden">
          <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <button onClick={onClose} className="absolute top-3 right-3 h-8 w-8 rounded-full glass flex items-center justify-center text-white">
            <X className="h-4 w-4" />
          </button>
          <div className="absolute bottom-4 left-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ background: 'var(--brand)' }}>
              {specialty.badge}
            </span>
          </div>
        </div>

        {/* Modal body */}
        <div className="p-6 space-y-4">
          <div>
            <h2 className="text-2xl font-extrabold mb-1">{recipe.name}</h2>
            <p className="text-base font-semibold" style={{ color: 'var(--brand)' }}>{specialty.headline}</p>
          </div>

          {/* Speciality lines */}
          <ul className="space-y-2.5">
            {specialty.lines.map((line, i) => (
              <motion.li key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.08 * i + 0.2 }}
                className="flex gap-3 items-start text-sm leading-relaxed">
                <span className="mt-0.5 flex-shrink-0 h-5 w-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: 'var(--brand)' }}>{i + 1}</span>
                <span>{line}</span>
              </motion.li>
            ))}
          </ul>

          {/* Stats row */}
          <div className="flex gap-3 flex-wrap pt-1">
            <div className="flex items-center gap-1.5 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{recipe.cookingTime} min</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span>{recipe.rating} ({recipe.reviews} reviews)</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <Flame className="h-4 w-4 text-orange-500" />
              <span>{recipe.cuisine} · {recipe.dietType}</span>
            </div>
          </div>

          {/* Instructions preview */}
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2">Quick Steps</p>
            <ol className="space-y-1.5">
              {recipe.instructions.slice(0, 4).map((step, i) => (
                <li key={i} className="flex gap-2.5 items-start text-sm">
                  <span className="flex-shrink-0 h-5 w-5 rounded-full text-xs font-bold flex items-center justify-center" style={{ background: 'var(--accent)', color: 'var(--accent-foreground)' }}>{i + 1}</span>
                  <span className="text-muted-foreground line-clamp-1">{step}</span>
                </li>
              ))}
              {recipe.instructions.length > 4 && (
                <li className="text-xs text-muted-foreground pl-7">+ {recipe.instructions.length - 4} more steps...</li>
              )}
            </ol>
          </div>

          <Link
            to={`/recipe/${recipe.id}`}
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-white shadow-lg"
            style={{ background: 'var(--brand)' }}
          >
            View Full Recipe <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
};


const tabVariants = {
  initial: { opacity: 0, x: 12 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
  exit: { opacity: 0, x: -12, transition: { duration: 0.18 } },
};

export const Home: React.FC = () => {
  const [searchParams] = useSearchParams();
  const showFavoritesOnly = searchParams.get('favorites') === 'true';
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [activePill, setActivePill] = useState<number | null>(null);
  const [showRotdModal, setShowRotdModal] = useState(false);

  const [filters, setFilters] = useState({
    search: '',
    maxCalories: 5000,
    cuisine: 'all',
    dietType: 'all',
    maxTime: 300,
    difficulty: 'all',
  });

  const [sortBy, setSortBy] = useState<'name' | 'calories' | 'time' | 'rating'>('rating');
  const [refreshKey, setRefreshKey] = useState(0);

  const allRecipes = useMemo(() => {
    const customRecipes = StorageService.getCustomRecipes();
    return [...mockRecipes, ...customRecipes];
  }, [refreshKey]);

  const recipeOfDay = useMemo(() => getDailyRecipe(allRecipes), [allRecipes]);

  const filteredRecipes = useMemo(() => {
    let recipes = allRecipes;
    if (showFavoritesOnly) {
      const favorites = StorageService.getFavorites();
      recipes = recipes.filter(r => favorites.includes(r.id));
    }
    const filtered = filterRecipes(recipes, filters);
    return sortRecipes(filtered, sortBy);
  }, [allRecipes, filters, sortBy, showFavoritesOnly, refreshKey]);

  const trendingRecipes = useMemo(() =>
    [...allRecipes].sort((a, b) => b.rating * b.reviews - a.rating * a.reviews).slice(0, 6),
    [allRecipes]);

  const quickRecipes = useMemo(() =>
    [...allRecipes].filter(r => r.cookingTime <= 30).sort((a, b) => a.cookingTime - b.cookingTime).slice(0, 6),
    [allRecipes]);

  const topRatedRecipes = useMemo(() =>
    [...allRecipes].sort((a, b) => b.rating - a.rating).slice(0, 6),
    [allRecipes]);

  const handleFavoriteChange = () => setRefreshKey(prev => prev + 1);

  const handlePillClick = (pill: typeof categoryPills[0], idx: number) => {
    if (activePill === idx) {
      setActivePill(null);
      setFilters(f => ({ ...f, cuisine: 'all', dietType: 'all', maxTime: 300 }));
    } else {
      setActivePill(idx);
      setFilters(f => ({
        ...f,
        cuisine: (pill as any).cuisine ?? 'all',
        dietType: (pill as any).dietType ?? 'all',
        maxTime: (pill as any).maxTime ?? 300,
      }));
    }
  };

  const RecipeGrid = ({ recipes }: { recipes: Recipe[] }) => (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe, i) => (
          <RecipeCard key={recipe.id} recipe={recipe} onFavoriteChange={handleFavoriteChange} index={i} />
        ))}
      </div>
      {recipes.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <div className="text-5xl mb-4">🍽️</div>
          <p className="text-xl font-semibold mb-1">No recipes found</p>
          <p className="text-muted-foreground">Try adjusting your filters</p>
        </motion.div>
      )}
    </>
  );

  return (
    <div className="space-y-10">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      {!showFavoritesOnly && (
        <div
          className="relative overflow-hidden rounded-3xl mx-4 md:mx-0"
          style={{ minHeight: 340, background: 'var(--hero-gradient)' }}
        >
          <HeroCanvas />

          {/* Hero content */}
          <div className="relative z-10 flex flex-col items-center text-center px-4 py-16 md:py-24 max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium"
              style={{ background: 'rgba(249,115,22,0.12)', color: 'var(--brand)' }}
            >
              <ChefHat className="h-4 w-4" />
              Welcome to RecipeHub
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 leading-tight"
            >
              Discover{' '}
              <span className="text-gradient">Amazing</span>{' '}
              Recipes
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground max-w-xl mb-8"
            >
              Thousands of recipes with nutrition info, step-by-step guides, and smart meal planning.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="flex flex-wrap gap-3 justify-center"
            >
              <motion.a
                href="#recipes"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="px-6 py-3 rounded-2xl font-semibold text-white shadow-lg shadow-orange-500/30 transition-all"
                style={{ background: 'var(--brand)' }}
              >
                Browse Recipes
              </motion.a>
              {isAuthenticated && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    to="/create"
                    className="px-6 py-3 rounded-2xl font-semibold border border-border bg-background/70 backdrop-blur-sm flex items-center gap-2 hover:bg-background transition-all"
                  >
                    <PlusCircle className="h-4 w-4" style={{ color: 'var(--brand)' }} />
                    Create Recipe
                  </Link>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      )}

      {/* ── Recipe of the Day ────────────────────────────────────────────── */}
      {!showFavoritesOnly && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <div
            className="relative overflow-hidden rounded-3xl cursor-pointer"
            onClick={() => setShowRotdModal(true)}
          >
            {/* Background image with overlay */}
            <div className="absolute inset-0">
              <img src={recipeOfDay.image} alt={recipeOfDay.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.35) 60%, transparent 100%)' }} />
            </div>

            {/* Content */}
            <div className="relative z-10 p-6 md:p-10 flex flex-col md:flex-row items-start md:items-center gap-6 min-h-[200px]">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                  >
                    <Award className="h-6 w-6" style={{ color: '#fbbf24' }} />
                  </motion.div>
                  <span className="text-xs font-bold uppercase tracking-widest text-yellow-400">Recipe of the Day</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">{recipeOfDay.name}</h2>
                <p className="text-white/80 text-sm max-w-lg line-clamp-2">{recipeOfDay.description}</p>
                <div className="flex flex-wrap gap-3">
                  <span className="flex items-center gap-1.5 text-white/90 text-sm">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" /> {recipeOfDay.rating} ({recipeOfDay.reviews} reviews)
                  </span>
                  <span className="flex items-center gap-1.5 text-white/90 text-sm">
                    <Clock className="h-4 w-4" /> {recipeOfDay.cookingTime} min
                  </span>
                  <span className="flex items-center gap-1.5 text-white/90 text-sm">
                    <Flame className="h-4 w-4 text-orange-400" /> {recipeOfDay.cuisine}
                  </span>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.06, x: 4 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-white shadow-xl flex-shrink-0"
                style={{ background: 'var(--brand)' }}
              >
                See the Recipe <ArrowRight className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ROTD Modal */}
      <AnimatePresence>
        {showRotdModal && (
          <RecipeOfDayModal recipe={recipeOfDay} onClose={() => setShowRotdModal(false)} />
        )}
      </AnimatePresence>

      {/* ── Favorites header ─────────────────────────────────────────────── */}
      {showFavoritesOnly && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-1">My Favorite Recipes</h1>
          <p className="text-muted-foreground">
            {filteredRecipes.length} favourite {filteredRecipes.length === 1 ? 'recipe' : 'recipes'}
          </p>
        </motion.div>
      )}

      {/* ── Category pills ───────────────────────────────────────────────── */}
      {!showFavoritesOnly && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hidden" id="recipes">
          {categoryPills.map((pill, idx) => (
            <motion.button
              key={idx}
              onClick={() => handlePillClick(pill, idx)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
                activePill === idx
                  ? 'text-white border-transparent shadow-md'
                  : 'bg-background border-border text-muted-foreground hover:border-primary hover:text-foreground'
              }`}
              style={activePill === idx ? { background: 'var(--brand)', borderColor: 'var(--brand)' } : {}}
            >
              {pill.label}
            </motion.button>
          ))}
        </div>
      )}

      {/* ── Filters + Sort ───────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
        <div className="flex-1 w-full">
          <RecipeFilters filters={filters} onFilterChange={setFilters} />
        </div>
        <div className="w-full md:w-48">
          <Label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground font-semibold">Sort By</Label>
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="rating">⭐ Rating</SelectItem>
              <SelectItem value="name">🔤 Name</SelectItem>
              <SelectItem value="calories">🔥 Calories</SelectItem>
              <SelectItem value="time">⏱️ Cooking Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ── Recipe content ───────────────────────────────────────────────── */}
      {!showFavoritesOnly ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex w-full max-w-lg gap-1 rounded-2xl p-1 h-auto mb-2">
            <TabsTrigger value="all" className="flex-1 rounded-xl py-2">All</TabsTrigger>
            <TabsTrigger value="trending" className="flex-1 rounded-xl py-2">
              <TrendingUp className="h-3.5 w-3.5 mr-1" />Trending
            </TabsTrigger>
            <TabsTrigger value="quick" className="flex-1 rounded-xl py-2">
              <Clock className="h-3.5 w-3.5 mr-1" />Quick
            </TabsTrigger>
            <TabsTrigger value="top" className="flex-1 rounded-xl py-2">
              <Star className="h-3.5 w-3.5 mr-1" />Top Rated
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div key={activeTab} {...tabVariants}>
              <TabsContent value="all" className="mt-4" forceMount hidden={activeTab !== 'all'}>
                <RecipeGrid recipes={filteredRecipes} />
              </TabsContent>
              <TabsContent value="trending" className="mt-4" forceMount hidden={activeTab !== 'trending'}>
                <RecipeGrid recipes={trendingRecipes} />
              </TabsContent>
              <TabsContent value="quick" className="mt-4" forceMount hidden={activeTab !== 'quick'}>
                <RecipeGrid recipes={quickRecipes} />
              </TabsContent>
              <TabsContent value="top" className="mt-4" forceMount hidden={activeTab !== 'top'}>
                <RecipeGrid recipes={topRatedRecipes} />
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      ) : (
        <RecipeGrid recipes={filteredRecipes} />
      )}
    </div>
  );
};
