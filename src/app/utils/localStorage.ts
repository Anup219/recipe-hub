import { User, Recipe, MealPlan, ShoppingListItem } from '../types/recipe';

const STORAGE_KEYS = {
  USER: 'recipe_app_user',
  FAVORITES: 'recipe_app_favorites',
  CUSTOM_RECIPES: 'recipe_app_custom_recipes',
  MEAL_PLANS: 'recipe_app_meal_plans',
  SHOPPING_LIST: 'recipe_app_shopping_list',
  THEME: 'recipe_app_theme',
};

export const StorageService = {
  // User
  getUser(): User | null {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : null;
  },

  setUser(user: User): void {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  clearUser(): void {
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  // Favorites
  getFavorites(): string[] {
    const data = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    return data ? JSON.parse(data) : [];
  },

  toggleFavorite(recipeId: string): void {
    const favorites = this.getFavorites();
    const index = favorites.indexOf(recipeId);
    
    if (index > -1) {
      favorites.splice(index, 1);
    } else {
      favorites.push(recipeId);
    }
    
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
  },

  isFavorite(recipeId: string): boolean {
    return this.getFavorites().includes(recipeId);
  },

  // Custom Recipes
  getCustomRecipes(): Recipe[] {
    const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_RECIPES);
    return data ? JSON.parse(data) : [];
  },

  addCustomRecipe(recipe: Recipe): void {
    const recipes = this.getCustomRecipes();
    recipes.push(recipe);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_RECIPES, JSON.stringify(recipes));
  },

  deleteCustomRecipe(recipeId: string): void {
    const recipes = this.getCustomRecipes();
    const filtered = recipes.filter(r => r.id !== recipeId);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_RECIPES, JSON.stringify(filtered));
  },

  // Meal Plans
  getMealPlans(): MealPlan[] {
    const data = localStorage.getItem(STORAGE_KEYS.MEAL_PLANS);
    return data ? JSON.parse(data) : [];
  },

  addMealPlan(mealPlan: MealPlan): void {
    const plans = this.getMealPlans();
    plans.push(mealPlan);
    localStorage.setItem(STORAGE_KEYS.MEAL_PLANS, JSON.stringify(plans));
  },

  removeMealPlan(id: string): void {
    const plans = this.getMealPlans();
    const filtered = plans.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.MEAL_PLANS, JSON.stringify(filtered));
  },

  // Shopping List
  getShoppingList(): ShoppingListItem[] {
    const data = localStorage.getItem(STORAGE_KEYS.SHOPPING_LIST);
    return data ? JSON.parse(data) : [];
  },

  addToShoppingList(item: ShoppingListItem): void {
    const list = this.getShoppingList();
    list.push(item);
    localStorage.setItem(STORAGE_KEYS.SHOPPING_LIST, JSON.stringify(list));
  },

  toggleShoppingItem(id: string): void {
    const list = this.getShoppingList();
    const item = list.find(i => i.id === id);
    if (item) {
      item.checked = !item.checked;
      localStorage.setItem(STORAGE_KEYS.SHOPPING_LIST, JSON.stringify(list));
    }
  },

  removeFromShoppingList(id: string): void {
    const list = this.getShoppingList();
    const filtered = list.filter(i => i.id !== id);
    localStorage.setItem(STORAGE_KEYS.SHOPPING_LIST, JSON.stringify(filtered));
  },

  clearShoppingList(): void {
    localStorage.setItem(STORAGE_KEYS.SHOPPING_LIST, JSON.stringify([]));
  },

  // Theme
  getTheme(): string {
    return localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
  },

  setTheme(theme: string): void {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  },
};
