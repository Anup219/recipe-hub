import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { format, startOfWeek, addDays } from 'date-fns';
import { Calendar, Plus, Trash2, ChefHat } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StorageService } from '../utils/localStorage';
import { mockRecipes } from '../data/mockRecipes';
import { MealPlan } from '../types/recipe';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';

export const MealPlanner: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mealPlans, setMealPlans] = useState<MealPlan[]>(StorageService.getMealPlans());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const [selectedRecipeId, setSelectedRecipeId] = useState('');

  React.useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to use meal planner');
      navigate('/login');
      return;
    }

    // If coming from recipe detail page with a recipe
    if (location.state?.recipeId) {
      setSelectedRecipeId(location.state.recipeId);
      setIsDialogOpen(true);
    }
  }, [isAuthenticated, navigate, location.state]);

  const allRecipes = useMemo(() => {
    const customRecipes = StorageService.getCustomRecipes();
    return [...mockRecipes, ...customRecipes];
  }, []);

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getMealsForDate = (date: Date, mealType: string) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return mealPlans.filter(plan => plan.date === dateStr && plan.mealType === mealType);
  };

  const handleAddMeal = () => {
    if (!selectedDate || !selectedRecipeId) {
      toast.error('Please select a date and recipe');
      return;
    }

    const newPlan: MealPlan = {
      id: `meal_${Date.now()}`,
      date: selectedDate,
      recipeId: selectedRecipeId,
      mealType: selectedMealType,
    };

    StorageService.addMealPlan(newPlan);
    setMealPlans([...mealPlans, newPlan]);
    toast.success('Meal added to plan!');
    
    setIsDialogOpen(false);
    setSelectedDate('');
    setSelectedRecipeId('');
  };

  const handleRemoveMeal = (planId: string) => {
    StorageService.removeMealPlan(planId);
    setMealPlans(mealPlans.filter(p => p.id !== planId));
    toast.success('Meal removed from plan');
  };

  const mealTypes: Array<'breakfast' | 'lunch' | 'dinner' | 'snack'> = ['breakfast', 'lunch', 'dinner', 'snack'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Meal Planner</h1>
          <p className="text-muted-foreground">Plan your meals for the week</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Meal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Meal to Plan</DialogTitle>
              <DialogDescription>
                Choose a recipe and when you want to make it
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Select value={selectedDate} onValueChange={setSelectedDate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a date" />
                  </SelectTrigger>
                  <SelectContent>
                    {weekDays.map(day => (
                      <SelectItem key={format(day, 'yyyy-MM-dd')} value={format(day, 'yyyy-MM-dd')}>
                        {format(day, 'EEEE, MMM dd')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Meal Type</Label>
                <Select value={selectedMealType} onValueChange={(v: any) => setSelectedMealType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                    <SelectItem value="snack">Snack</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Recipe</Label>
                <Select value={selectedRecipeId} onValueChange={setSelectedRecipeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a recipe" />
                  </SelectTrigger>
                  <SelectContent>
                    {allRecipes.map(recipe => (
                      <SelectItem key={recipe.id} value={recipe.id}>
                        {recipe.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleAddMeal} className="w-full">
                Add to Plan
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Week View */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekDays.map(day => (
          <div key={format(day, 'yyyy-MM-dd')} className="space-y-2">
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="font-semibold">{format(day, 'EEE')}</p>
              <p className="text-2xl font-bold">{format(day, 'd')}</p>
              <p className="text-sm text-muted-foreground">{format(day, 'MMM')}</p>
            </div>

            {mealTypes.map(mealType => {
              const meals = getMealsForDate(day, mealType);
              
              return (
                <Card key={mealType} className="min-h-[100px]">
                  <CardHeader className="p-3 pb-2">
                    <CardTitle className="text-sm capitalize">{mealType}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 space-y-2">
                    {meals.map(plan => {
                      const recipe = allRecipes.find(r => r.id === plan.recipeId);
                      
                      return recipe ? (
                        <div
                          key={plan.id}
                          className="group relative p-2 bg-muted rounded text-xs hover:bg-muted/80 cursor-pointer"
                          onClick={() => navigate(`/recipe/${recipe.id}`)}
                        >
                          <p className="font-medium line-clamp-2 pr-6">{recipe.name}</p>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveMeal(plan.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : null;
                    })}

                    {meals.length === 0 && (
                      <div className="text-center py-4 text-muted-foreground">
                        <ChefHat className="h-6 w-6 mx-auto mb-1 opacity-30" />
                        <p className="text-xs">No meal</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ))}
      </div>

      {mealPlans.length === 0 && (
        <Card className="p-12 text-center">
          <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No Meals Planned Yet</h3>
          <p className="text-muted-foreground mb-4">
            Start planning your meals for the week to stay organized and eat healthier.
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Meal
          </Button>
        </Card>
      )}
    </div>
  );
};
