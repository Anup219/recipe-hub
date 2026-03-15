export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  image: string;
  cookingTime: number; // in minutes
  difficulty: 'Easy' | 'Medium' | 'Hard';
  cuisine: string;
  dietType: 'Vegetarian' | 'Vegan' | 'Non-Vegetarian' | 'Keto' | 'Paleo';
  ingredients: Ingredient[];
  instructions: string[];
  servings: number;
  rating: number;
  reviews: number;
  createdBy?: string;
  isFavorite?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  favorites: string[];
  createdRecipes: string[];
}

export interface MealPlan {
  id: string;
  date: string;
  recipeId: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export interface ShoppingListItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  checked: boolean;
  recipeId?: string;
}
