import { createBrowserRouter } from 'react-router';
import { Root } from './pages/Root';
import { Home } from './pages/Home';
import { RecipeDetail } from './pages/RecipeDetail';
import { CreateRecipe } from './pages/CreateRecipe';
import { MealPlanner } from './pages/MealPlanner';
import { ShoppingList } from './pages/ShoppingList';
import { MyRecipes } from './pages/MyRecipes';
import { Login } from './pages/Login';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: 'recipe/:id', Component: RecipeDetail },
      { path: 'login', Component: Login },
      { path: 'create', Component: CreateRecipe },
      { path: 'meal-planner', Component: MealPlanner },
      { path: 'shopping-list', Component: ShoppingList },
      { path: 'my-recipes', Component: MyRecipes },
    ],
  },
]);
