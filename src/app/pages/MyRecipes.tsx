import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { BookOpen, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StorageService } from '../utils/localStorage';
import { RecipeCard } from '../components/RecipeCard';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { toast } from 'sonner';

export const MyRecipes: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [customRecipes, setCustomRecipes] = useState(StorageService.getCustomRecipes());
  const [recipeToDelete, setRecipeToDelete] = useState<string | null>(null);

  React.useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to view your recipes');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleDeleteRecipe = () => {
    if (recipeToDelete) {
      StorageService.deleteCustomRecipe(recipeToDelete);
      setCustomRecipes(customRecipes.filter(r => r.id !== recipeToDelete));
      toast.success('Recipe deleted successfully');
      setRecipeToDelete(null);
    }
  };

  const handleRefresh = () => {
    setCustomRecipes(StorageService.getCustomRecipes());
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Recipes</h1>
          <p className="text-muted-foreground">
            {customRecipes.length} custom {customRecipes.length === 1 ? 'recipe' : 'recipes'}
          </p>
        </div>

        <Button onClick={() => navigate('/create')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Recipe
        </Button>
      </div>

      {customRecipes.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No Custom Recipes Yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first recipe to share your culinary creations with the world.
          </p>
          <Button onClick={() => navigate('/create')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Recipe
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customRecipes.map(recipe => (
            <div key={recipe.id} className="relative group">
              <RecipeCard recipe={recipe} onFavoriteChange={handleRefresh} />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setRecipeToDelete(recipe.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={!!recipeToDelete} onOpenChange={() => setRecipeToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Recipe?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your recipe.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRecipe} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
