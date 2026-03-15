import { Recipe, Ingredient } from '../types/recipe';

export const calculateTotalCalories = (ingredients: Ingredient[]): number => {
  return ingredients.reduce((total, ing) => total + ing.calories, 0);
};

export const calculateTotalNutrition = (ingredients: Ingredient[]) => {
  return ingredients.reduce(
    (total, ing) => ({
      protein: total.protein + ing.protein,
      carbs: total.carbs + ing.carbs,
      fat: total.fat + ing.fat,
    }),
    { protein: 0, carbs: 0, fat: 0 }
  );
};

export const adjustServingSize = (
  ingredients: Ingredient[],
  originalServings: number,
  newServings: number
): Ingredient[] => {
  const ratio = newServings / originalServings;
  
  return ingredients.map(ing => ({
    ...ing,
    quantity: Math.round(ing.quantity * ratio * 100) / 100,
    calories: Math.round(ing.calories * ratio),
    protein: Math.round(ing.protein * ratio * 100) / 100,
    carbs: Math.round(ing.carbs * ratio * 100) / 100,
    fat: Math.round(ing.fat * ratio * 100) / 100,
  }));
};

export const filterRecipes = (
  recipes: Recipe[],
  filters: {
    search?: string;
    maxCalories?: number;
    cuisine?: string;
    dietType?: string;
    maxTime?: number;
    difficulty?: string;
  }
): Recipe[] => {
  return recipes.filter(recipe => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesName = recipe.name.toLowerCase().includes(searchLower);
      const matchesIngredient = recipe.ingredients.some(ing =>
        ing.name.toLowerCase().includes(searchLower)
      );
      if (!matchesName && !matchesIngredient) return false;
    }

    // Calorie filter
    if (filters.maxCalories) {
      const totalCalories = calculateTotalCalories(recipe.ingredients);
      if (totalCalories > filters.maxCalories) return false;
    }

    // Cuisine filter
    if (filters.cuisine && filters.cuisine !== 'all') {
      if (recipe.cuisine !== filters.cuisine) return false;
    }

    // Diet type filter
    if (filters.dietType && filters.dietType !== 'all') {
      if (recipe.dietType !== filters.dietType) return false;
    }

    // Cooking time filter
    if (filters.maxTime) {
      if (recipe.cookingTime > filters.maxTime) return false;
    }

    // Difficulty filter
    if (filters.difficulty && filters.difficulty !== 'all') {
      if (recipe.difficulty !== filters.difficulty) return false;
    }

    return true;
  });
};

export const sortRecipes = (
  recipes: Recipe[],
  sortBy: 'name' | 'calories' | 'time' | 'rating'
): Recipe[] => {
  return [...recipes].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'calories':
        return calculateTotalCalories(a.ingredients) - calculateTotalCalories(b.ingredients);
      case 'time':
        return a.cookingTime - b.cookingTime;
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });
};

export const generateRecipeId = (): string => {
  return `recipe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const generateIngredientId = (): string => {
  return `ing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
