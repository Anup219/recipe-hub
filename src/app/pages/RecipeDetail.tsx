import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Heart, Clock, Flame, Users, ChefHat, ArrowLeft, ShoppingCart,
  Calendar, Star, Share2, Printer, ChevronDown, ChevronUp, X, ZoomIn
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { mockRecipes } from '../data/mockRecipes';
import { StorageService } from '../utils/localStorage';
import { calculateTotalCalories, calculateTotalNutrition, adjustServingSize } from '../utils/recipeUtils';
import { NutritionChart } from '../components/NutritionChart';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { ShoppingListItem } from '../types/recipe';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../components/ui/select';

// ── Instruction tips ─────────────────────────────────────────────────────────
function getStepTip(instruction: string): string {
  const lower = instruction.toLowerCase();
  if (lower.includes('marinate') || lower.includes('marinat')) return '💡 Longer marination = deeper flavour. Overnight in the fridge is ideal. Use a zip-lock bag for even coverage.';
  if (lower.includes('boil') || lower.includes('salted water')) return '💡 Salt the water generously — it should taste like the sea. This is the only chance to season the pasta itself.';
  if (lower.includes('preheat') || lower.includes('oven')) return '💡 A fully preheated oven is critical for even baking. Use an oven thermometer to verify the actual temperature.';
  if (lower.includes('whisk') || lower.includes('mix')) return '💡 Avoid over-mixing — stop when ingredients are just combined. Over-mixing develops gluten and makes baked goods tough.';
  if (lower.includes('rest') || lower.includes('cool')) return '💡 Resting allows juices to redistribute inside meat, and lets baked goods firm up. Never skip this step!';
  if (lower.includes('season') || lower.includes('salt') || lower.includes('pepper')) return '💡 Taste as you season. Add in small amounts and adjust — you can always add more but can\'t take it away.';
  if (lower.includes('sauté') || lower.includes('fry') || lower.includes('heat oil')) return '💡 Make sure the pan is hot before adding oil, and the oil hot before adding food. This prevents sticking.';
  if (lower.includes('grill') || lower.includes('grates')) return '💡 Oil the grates (not the food) and don\'t move the food too soon — let it release naturally to avoid sticking.';
  if (lower.includes('slice') || lower.includes('cut') || lower.includes('dice')) return '💡 A sharp knife makes cutting safer and easier. Wet the knife slightly when slicing delicate items like sushi.';
  if (lower.includes('serve') || lower.includes('garnish')) return '💡 Warm plates keep food hot longer. Garnish right before serving for freshest appearance and aroma.';
  if (lower.includes('roll') || lower.includes('nori')) return '💡 Use light, even pressure when rolling. Too tight and it splits; too loose and it falls apart when cut.';
  if (lower.includes('drain') || lower.includes('reserve')) return '💡 Always save a cup of pasta water before draining — the starchy liquid is liquid gold for silky sauces.';
  if (lower.includes('roast') || lower.includes('bake')) return '💡 Don\'t overcrowd the pan — food steams instead of roasting when crowded. Use two pans if needed.';
  if (lower.includes('soak') || lower.includes('soften')) return '💡 Use warm (not boiling) water for soaking noodles. Boiling water makes them mushy and hard to stir-fry.';
  if (lower.includes('wok') || lower.includes('high heat')) return '💡 Wok cooking relies on very high heat. Work in batches if needed — a full wok lowers temperature and causes steaming.';
  return '💡 Take your time with this step. Rushing can affect the final texture and flavour. Mise en place — have everything ready before you start.';
}

// Gallery: generate 2 crop variants of the recipe's own main image
// so all 3 thumbnails always show the exact same dish
function getGalleryImages(imageUrl: string): string[] {
  // Extract the base Unsplash photo URL (before query params)
  const match = imageUrl.match(/(https:\/\/images\.unsplash\.com\/photo-[^?]+)/);
  const base = match ? match[1] : imageUrl;
  return [
    `${base}?w=800&q=80&fit=crop&crop=top`,
    `${base}?w=800&q=80&fit=crop&crop=bottom`,
  ];
}



// ── Star Rating Component ─────────────────────────────────────────────────────
const StarRating: React.FC<{ recipeName: string }> = ({ recipeName }) => {
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [review, setReview] = useState('');
  const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  const handleSubmit = () => {
    if (!selected) { toast.error('Please select a star rating first!'); return; }
    setSubmitted(true);
    toast.success(`Thanks for rating ${recipeName} ${selected} ⭐`);
  };

  if (submitted) {
    return (
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-8">
        <div className="text-5xl mb-3">🎉</div>
        <p className="text-xl font-bold mb-1">Thank you for your rating!</p>
        <p className="text-muted-foreground">You gave <strong>{recipeName}</strong> {selected} star{selected > 1 ? 's' : ''}.</p>
        <div className="flex justify-center gap-1 mt-3">
          {[1,2,3,4,5].map(s => (
            <Star key={s} className={`h-6 w-6 ${s <= selected ? 'text-yellow-500 fill-yellow-500' : 'text-muted'}`} />
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-center gap-3">
        <p className="text-sm text-muted-foreground">Tap a star to rate this recipe</p>
        <div className="flex gap-2">
          {[1,2,3,4,5].map(star => (
            <motion.button key={star} whileHover={{ scale: 1.25 }} whileTap={{ scale: 0.9 }}
              onMouseEnter={() => setHovered(star)} onMouseLeave={() => setHovered(0)}
              onClick={() => setSelected(star)} className="focus:outline-none">
              <Star className={`h-9 w-9 transition-all duration-150 ${
                star <= (hovered || selected)
                  ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.7)]'
                  : 'text-muted-foreground/40'
              }`} />
            </motion.button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          {(hovered || selected) > 0 && (
            <motion.span key={hovered || selected} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }} className="text-sm font-semibold" style={{ color: 'var(--brand)' }}>
              {labels[hovered || selected]}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <textarea value={review} onChange={e => setReview(e.target.value)}
        placeholder="Share your experience with this recipe (optional)..." rows={3}
        className="w-full rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 transition-all"
      />
      <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleSubmit}
        className="w-full py-3 rounded-xl font-semibold text-white shadow-lg" style={{ background: 'var(--brand)' }}>
        Submit Rating
      </motion.button>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
export const RecipeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const allRecipes = useMemo(() => {
    const customRecipes = StorageService.getCustomRecipes();
    return [...mockRecipes, ...customRecipes];
  }, []);

  const recipe = allRecipes.find(r => r.id === id);
  const [servings, setServings] = useState(recipe?.servings || 4);
  const [isFavorite, setIsFavorite] = useState(recipe ? StorageService.isFavorite(recipe.id) : false);
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  if (!recipe) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🍽️</div>
        <h2 className="text-2xl font-bold mb-2">Recipe not found</h2>
        <p className="text-muted-foreground mb-6">The recipe you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/')} style={{ background: 'var(--brand)' }}>Back to Home</Button>
      </div>
    );
  }

  const adjustedIngredients = useMemo(() => adjustServingSize(recipe.ingredients, recipe.servings, servings), [recipe, servings]);
  const totalCalories = calculateTotalCalories(adjustedIngredients);
  const nutrition = calculateTotalNutrition(adjustedIngredients);

  // Gallery: main image + 2 crop variants of the same dish photo
  const galleryImages = [recipe.image, ...getGalleryImages(recipe.image)];


  const handleToggleFavorite = () => {
    if (!isAuthenticated) { toast.error('Please login to save favorites'); return; }
    StorageService.toggleFavorite(recipe.id);
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
  };
  const handleAddToShoppingList = () => {
    if (!isAuthenticated) { toast.error('Please login to use shopping list'); return; }
    adjustedIngredients.forEach(ing => {
      StorageService.addToShoppingList({
        id: `${recipe.id}_${ing.id}_${Date.now()}`,
        name: ing.name, quantity: ing.quantity, unit: ing.unit, checked: false, recipeId: recipe.id,
      } as ShoppingListItem);
    });
    toast.success('Ingredients added to shopping list!');
  };
  const handleAddToMealPlan = () => {
    if (!isAuthenticated) { toast.error('Please login to use meal planner'); return; }
    navigate('/meal-planner', { state: { recipeId: recipe.id } });
  };
  const handleShare = () => {
    if (navigator.share) navigator.share({ title: recipe.name, text: recipe.description, url: window.location.href });
    else { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }
  };

  const statCards = [
    { icon: <Clock className="h-5 w-5 text-blue-500" />, label: 'Cook Time', value: `${recipe.cookingTime} min` },
    { icon: <Flame className="h-5 w-5 text-orange-500" />, label: 'Calories', value: `${totalCalories} cal` },
    { icon: <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />, label: 'Rating', value: `${recipe.rating} (${recipe.reviews})` },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Back */}
      <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
        <Button variant="ghost" onClick={() => navigate(-1)} className="rounded-xl group">
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back
        </Button>
      </motion.div>

      {/* ── Hero + Gallery ─────────────────────────────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-3"
        >
          {/* Main image */}
          <div
            className="relative aspect-[4/3] rounded-2xl overflow-hidden cursor-zoom-in group"
            onClick={() => setLightboxOpen(true)}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImage}
                src={galleryImages[activeImage]}
                alt={recipe.name}
                className="w-full h-full object-cover"
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-3 right-3 glass rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              <ZoomIn className="h-3.5 w-3.5" /> Click to enlarge
            </div>
            <div className="absolute bottom-3 left-3 glass rounded-lg px-2.5 py-1.5 text-white text-xs font-medium">
              {activeImage + 1} / {galleryImages.length}
            </div>
          </div>

          {/* Thumbnail strip */}
          <div className="flex gap-2">
            {galleryImages.map((img, i) => (
              <motion.button
                key={i}
                onClick={() => setActiveImage(i)}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
                className={`flex-1 aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all ${
                  activeImage === i ? 'shadow-md' : 'border-transparent opacity-60 hover:opacity-90'
                }`}
                style={activeImage === i ? { borderColor: 'var(--brand)' } : { borderColor: 'transparent' }}
              >
                <img src={img} alt={`${recipe.name} view ${i + 1}`} className="w-full h-full object-cover" />
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Info panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-5"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-2 leading-tight">{recipe.name}</h1>
            <p className="text-muted-foreground">{recipe.description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className="rounded-full px-3" style={{ background: 'var(--brand)', color: '#fff' }}>{recipe.cuisine}</Badge>
            <Badge variant="secondary" className="rounded-full px-3">{recipe.dietType}</Badge>
            <Badge variant="outline" className="rounded-full px-3">{recipe.difficulty}</Badge>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {statCards.map(({ icon, label, value }, i) => (
              <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
                className="flex flex-col items-center p-3 rounded-2xl bg-muted/60 border border-border text-center gap-1">
                {icon}
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-semibold">{value}</p>
              </motion.div>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Servings:</span>
            <Select value={servings.toString()} onValueChange={v => setServings(Number(v))}>
              <SelectTrigger className="w-24 h-8 rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent className="rounded-xl">
                {[1,2,4,6,8,10,12].map(n => <SelectItem key={n} value={n.toString()}>{n}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Separator />
          <div className="flex flex-wrap gap-2">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Button onClick={handleToggleFavorite} className="rounded-xl"
                style={isFavorite ? { background: 'var(--brand)', color: '#fff' } : {}}
                variant={isFavorite ? 'default' : 'outline'}>
                <Heart className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
                {isFavorite ? 'Saved' : 'Save Recipe'}
              </Button>
            </motion.div>
            <Button onClick={handleAddToShoppingList} variant="outline" className="rounded-xl">
              <ShoppingCart className="h-4 w-4 mr-2" /> Shopping List
            </Button>
            <Button onClick={handleAddToMealPlan} variant="outline" className="rounded-xl">
              <Calendar className="h-4 w-4 mr-2" /> Meal Plan
            </Button>
            <Button onClick={handleShare} variant="outline" size="icon" className="rounded-xl">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button onClick={() => window.print()} variant="outline" size="icon" className="rounded-xl">
              <Printer className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </div>

      {/* ── Lightbox ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.92)' }}
            onClick={() => setLightboxOpen(false)}
          >
            <motion.img
              src={galleryImages[activeImage]} alt={recipe.name}
              initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }} transition={{ duration: 0.3 }}
              className="max-h-[85vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
              onClick={e => e.stopPropagation()}
            />
            <button onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 h-10 w-10 rounded-full glass flex items-center justify-center text-white hover:bg-white/20 transition-colors">
              <X className="h-5 w-5" />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {galleryImages.map((_, i) => (
                <button key={i} onClick={e => { e.stopPropagation(); setActiveImage(i); }}
                  className={`h-2.5 rounded-full transition-all ${i === activeImage ? 'w-6 bg-white' : 'w-2.5 bg-white/40'}`}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Instructions + Sidebar ────────────────────────────────────────── */}
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card className="rounded-2xl border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChefHat className="h-5 w-5" style={{ color: 'var(--brand)' }} />
                Instructions
              </CardTitle>
              <p className="text-xs text-muted-foreground">Click a step to reveal a detailed chef tip</p>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {recipe.instructions.map((instruction, index) => {
                  const isExpanded = expandedStep === index;
                  return (
                    <motion.li key={index} initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.4, delay: index * 0.05 }}>
                      <button
                        onClick={() => setExpandedStep(isExpanded ? null : index)}
                        className={`w-full text-left rounded-xl border transition-all duration-200 ${
                          isExpanded ? 'bg-accent/60' : 'border-transparent hover:border-border hover:bg-muted/40'
                        }`}
                        style={isExpanded ? { borderColor: 'color-mix(in srgb, var(--brand) 30%, transparent)' } : {}}
                      >
                        <div className="flex gap-4 items-start p-4">
                          <motion.div animate={isExpanded ? { scale: 1.1 } : { scale: 1 }}
                            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all"
                            style={{
                              background: isExpanded ? 'var(--brand)' : 'var(--muted)',
                              color: isExpanded ? '#fff' : 'var(--muted-foreground)',
                            }}>
                            {index + 1}
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm leading-relaxed font-medium">{instruction}</p>
                          </div>
                          <div className="flex-shrink-0 mt-0.5 text-muted-foreground">
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </div>
                        </div>
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25, ease: 'easeOut' }}
                              className="overflow-hidden"
                            >
                              <div className="mx-4 mb-4 px-4 py-3 rounded-xl text-sm leading-relaxed"
                                style={{ background: 'var(--accent)', color: 'var(--accent-foreground)' }}>
                                {getStepTip(instruction)}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </button>
                    </motion.li>
                  );
                })}
              </ol>
            </CardContent>
          </Card>
        </div>

        {/* Sticky sidebar */}
        <div className="space-y-6 md:sticky md:top-24 self-start">
          <Card className="rounded-2xl border-border">
            <CardHeader>
              <CardTitle>Ingredients</CardTitle>
              <p className="text-sm text-muted-foreground">For {servings} servings</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2.5">
                {adjustedIngredients.map(ingredient => (
                  <li key={ingredient.id} className="flex justify-between items-start gap-2 text-sm py-1.5 border-b border-border last:border-0">
                    <span className="flex-1 font-medium">{ingredient.name}</span>
                    <span className="text-muted-foreground whitespace-nowrap text-xs">{ingredient.quantity} {ingredient.unit}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border">
            <CardHeader><CardTitle>Nutrition / Serving</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Calories', value: Math.round(totalCalories / servings), unit: '', color: 'var(--brand)' },
                  { label: 'Protein', value: Math.round(nutrition.protein / servings), unit: 'g', color: '#3b82f6' },
                  { label: 'Carbs', value: Math.round(nutrition.carbs / servings), unit: 'g', color: '#f59e0b' },
                  { label: 'Fat', value: Math.round(nutrition.fat / servings), unit: 'g', color: '#10b981' },
                ].map(({ label, value, unit, color }, i) => (
                  <motion.div key={label} initial={{ opacity: 0, scale: 0.85 }} whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                    className="p-3 rounded-xl bg-muted/50 text-center border border-border">
                    <p className="text-xl font-extrabold" style={{ color }}>{value}{unit}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Nutrition chart */}
      <Card className="rounded-2xl border-border">
        <CardHeader><CardTitle>Macronutrient Distribution</CardTitle></CardHeader>
        <CardContent>
          <NutritionChart protein={nutrition.protein} carbs={nutrition.carbs} fat={nutrition.fat} />
        </CardContent>
      </Card>

      {/* Ingredient breakdown table */}
      <Card className="rounded-2xl border-border">
        <CardHeader><CardTitle>Ingredient Breakdown</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  {['Ingredient','Qty','Cal','Protein','Carbs','Fat'].map(h => (
                    <th key={h} className={`py-3 px-4 font-semibold ${h === 'Ingredient' ? 'text-left' : 'text-right'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {adjustedIngredients.map(ing => (
                  <tr key={ing.id} className="border-b hover:bg-muted/40 transition-colors">
                    <td className="py-3 px-4">{ing.name}</td>
                    <td className="text-right py-3 px-4 text-muted-foreground">{ing.quantity} {ing.unit}</td>
                    <td className="text-right py-3 px-4">{ing.calories}</td>
                    <td className="text-right py-3 px-4">{ing.protein}g</td>
                    <td className="text-right py-3 px-4">{ing.carbs}g</td>
                    <td className="text-right py-3 px-4">{ing.fat}g</td>
                  </tr>
                ))}
                <tr className="font-bold" style={{ background: 'var(--accent)' }}>
                  <td className="py-3 px-4">Total</td><td className="text-right py-3 px-4">—</td>
                  <td className="text-right py-3 px-4">{totalCalories}</td>
                  <td className="text-right py-3 px-4">{Math.round(nutrition.protein)}g</td>
                  <td className="text-right py-3 px-4">{Math.round(nutrition.carbs)}g</td>
                  <td className="text-right py-3 px-4">{Math.round(nutrition.fat)}g</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ── Rate This Recipe ──────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.5 }}>
        <Card className="rounded-2xl border-border overflow-hidden">
          <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, var(--brand), #fbbf24)' }} />
          <CardHeader className="text-center pb-2">
            <div className="text-3xl mb-1">⭐</div>
            <CardTitle className="text-xl">Rate This Recipe</CardTitle>
            <p className="text-sm text-muted-foreground">
              Tried <strong>{recipe.name}</strong>? Tell the community what you thought!
            </p>
          </CardHeader>
          <CardContent className="max-w-md mx-auto pb-8">
            <StarRating recipeName={recipe.name} />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
