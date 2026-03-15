import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ShoppingCart, Plus, Trash2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StorageService } from '../utils/localStorage';
import { ShoppingListItem } from '../types/recipe';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Checkbox } from '../components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';

export const ShoppingList: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>(
    StorageService.getShoppingList()
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('1');
  const [newItemUnit, setNewItemUnit] = useState('piece');

  React.useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to use shopping list');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleToggleItem = (id: string) => {
    StorageService.toggleShoppingItem(id);
    const updated = shoppingList.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setShoppingList(updated);
  };

  const handleRemoveItem = (id: string) => {
    StorageService.removeFromShoppingList(id);
    setShoppingList(shoppingList.filter(item => item.id !== id));
    toast.success('Item removed from list');
  };

  const handleAddItem = () => {
    if (!newItemName.trim()) {
      toast.error('Please enter an item name');
      return;
    }

    const newItem: ShoppingListItem = {
      id: `custom_${Date.now()}`,
      name: newItemName.trim(),
      quantity: Number(newItemQuantity),
      unit: newItemUnit,
      checked: false,
    };

    StorageService.addToShoppingList(newItem);
    setShoppingList([...shoppingList, newItem]);
    
    setNewItemName('');
    setNewItemQuantity('1');
    setNewItemUnit('piece');
    setIsDialogOpen(false);
    
    toast.success('Item added to shopping list');
  };

  const handleClearCompleted = () => {
    const completedIds = shoppingList.filter(item => item.checked).map(item => item.id);
    
    completedIds.forEach(id => {
      StorageService.removeFromShoppingList(id);
    });
    
    setShoppingList(shoppingList.filter(item => !item.checked));
    toast.success('Completed items removed');
  };

  const handleClearAll = () => {
    StorageService.clearShoppingList();
    setShoppingList([]);
    toast.success('Shopping list cleared');
  };

  const uncheckedItems = shoppingList.filter(item => !item.checked);
  const checkedItems = shoppingList.filter(item => item.checked);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Shopping List</h1>
          <p className="text-muted-foreground">
            {uncheckedItems.length} item{uncheckedItems.length !== 1 ? 's' : ''} remaining
          </p>
        </div>

        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Shopping Item</DialogTitle>
                <DialogDescription>
                  Add a new item to your shopping list
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Item Name</Label>
                  <Input
                    placeholder="e.g., Tomatoes"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={newItemQuantity}
                      onChange={(e) => setNewItemQuantity(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Unit</Label>
                    <Input
                      placeholder="e.g., kg, pieces"
                      value={newItemUnit}
                      onChange={(e) => setNewItemUnit(e.target.value)}
                    />
                  </div>
                </div>

                <Button onClick={handleAddItem} className="w-full">
                  Add to List
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {shoppingList.length > 0 && (
            <>
              {checkedItems.length > 0 && (
                <Button variant="outline" onClick={handleClearCompleted}>
                  <X className="h-4 w-4 mr-2" />
                  Clear Completed
                </Button>
              )}
              <Button variant="outline" onClick={handleClearAll}>
                Clear All
              </Button>
            </>
          )}
        </div>
      </div>

      {shoppingList.length === 0 ? (
        <Card className="p-12 text-center">
          <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">Your Shopping List is Empty</h3>
          <p className="text-muted-foreground mb-4">
            Add items manually or add ingredients from a recipe to get started.
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
            <Button variant="outline" onClick={() => navigate('/')}>
              Browse Recipes
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Unchecked Items */}
          {uncheckedItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">To Buy ({uncheckedItems.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {uncheckedItems.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <Checkbox
                      checked={item.checked}
                      onCheckedChange={() => handleToggleItem(item.id)}
                    />
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} {item.unit}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Checked Items */}
          {checkedItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Completed ({checkedItems.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {checkedItems.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors opacity-60"
                  >
                    <Checkbox
                      checked={item.checked}
                      onCheckedChange={() => handleToggleItem(item.id)}
                    />
                    <div className="flex-1">
                      <p className="font-medium line-through">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} {item.unit}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
