import React from 'react';
import { Link } from 'react-router';
import { Clock, Flame, Star, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Recipe } from '../types/recipe';
import { calculateTotalCalories } from '../utils/recipeUtils';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { StorageService } from '../utils/localStorage';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

interface RecipeCardProps {
  recipe: Recipe;
  onFavoriteChange?: () => void;
  index?: number;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onFavoriteChange, index = 0 }) => {
  const { isAuthenticated } = useAuth();
  const [isFavorite, setIsFavorite] = React.useState(
    StorageService.isFavorite(recipe.id)
  );

  const totalCalories = calculateTotalCalories(recipe.ingredients);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to save favorites');
      return;
    }
    StorageService.toggleFavorite(recipe.id);
    setIsFavorite(!isFavorite);
    onFavoriteChange?.();
    toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
  };

  const getDifficultyStyle = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return { bg: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400', dot: '#10b981' };
      case 'Medium':
        return { bg: 'bg-amber-500/15 text-amber-700 dark:text-amber-400', dot: '#f59e0b' };
      case 'Hard':
        return { bg: 'bg-red-500/15 text-red-600 dark:text-red-400', dot: '#ef4444' };
      default:
        return { bg: '', dot: '#888' };
    }
  };

  const difStyle = getDifficultyStyle(recipe.difficulty);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
      className="group overflow-hidden rounded-2xl bg-card border border-border transition-shadow duration-300 hover:shadow-2xl hover:shadow-black/10 dark:hover:shadow-black/40 flex flex-col"
      style={{ willChange: 'transform' }}
    >
      <Link to={`/recipe/${recipe.id}`} className="flex flex-col flex-1">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={recipe.image}
            alt={recipe.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Difficulty badge */}
          <div className="absolute top-3 right-3">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 backdrop-blur-sm ${difStyle.bg}`}>
              <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: difStyle.dot }} />
              {recipe.difficulty}
            </span>
          </div>

          {/* Favourite button */}
          <motion.button
            onClick={handleToggleFavorite}
            className="absolute top-3 left-3 h-8 w-8 rounded-full flex items-center justify-center glass shadow-md"
            whileTap={{ scale: 0.85 }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={String(isFavorite)}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <Heart
                  className={`h-4 w-4 transition-colors ${
                    isFavorite ? 'fill-red-500 text-red-500' : 'text-white'
                  }`}
                />
              </motion.div>
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <h3 className="text-base font-semibold line-clamp-1 mb-1 group-hover:text-primary transition-colors">
            {recipe.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-1">
            {recipe.description}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{recipe.cookingTime}m</span>
            </div>
            <div className="flex items-center gap-1">
              <Flame className="h-3.5 w-3.5 text-orange-500" />
              <span>{totalCalories} cal</span>
            </div>
            <div className="flex items-center gap-1 ml-auto">
              <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
              <span className="font-medium text-foreground">{recipe.rating}</span>
            </div>
          </div>

          {/* Badges */}
          <div className="mt-3 pt-3 border-t border-border flex gap-1.5 flex-wrap">
            <Badge
              variant="secondary"
              className="text-xs rounded-full px-2.5 py-0.5"
            >
              {recipe.cuisine}
            </Badge>
            <Badge
              variant="outline"
              className="text-xs rounded-full px-2.5 py-0.5"
            >
              {recipe.dietType}
            </Badge>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
