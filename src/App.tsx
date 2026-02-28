import React, { useState } from 'react';
import { ChefHat, ShoppingBag, Settings, Menu, X, Filter } from 'lucide-react';
import Home from './components/Home';
import CookingMode from './components/CookingMode';
import ShoppingList from './components/ShoppingList';
import { Recipe } from './types';

const DIETARY_OPTIONS = [
  'Vegetarian',
  'Vegan',
  'Keto',
  'Paleo',
  'Gluten-Free',
  'Dairy-Free',
  'Nut-Free'
];

type View = 'home' | 'recipe' | 'shopping-list';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [shoppingList, setShoppingList] = useState<string[]>([]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleRecipeSelect = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setCurrentView('recipe');
  };

  const handleAddToShoppingList = (ingredient: string) => {
    if (!shoppingList.includes(ingredient)) {
      setShoppingList([...shoppingList, ingredient]);
    }
  };

  const handleRemoveFromShoppingList = (ingredient: string) => {
    setShoppingList(shoppingList.filter(item => item !== ingredient));
  };

  const toggleDietaryRestriction = (restriction: string) => {
    if (dietaryRestrictions.includes(restriction)) {
      setDietaryRestrictions(dietaryRestrictions.filter(r => r !== restriction));
    } else {
      setDietaryRestrictions([...dietaryRestrictions, restriction]);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f4] flex font-sans text-zinc-900">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-zinc-200 transform transition-transform duration-300 ease-in-out flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3 text-emerald-600">
            <ChefHat className="w-8 h-8" />
            <span className="text-xl font-serif font-bold text-zinc-900">Smart Fridge</span>
          </div>
          <button className="lg:hidden text-zinc-500" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="px-4 py-2 space-y-1 flex-1">
          <button
            onClick={() => { setCurrentView('home'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
              currentView === 'home' || currentView === 'recipe' 
                ? 'bg-zinc-100 text-zinc-900' 
                : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
            }`}
          >
            <ChefHat className="w-5 h-5" />
            Kitchen
          </button>
          
          <button
            onClick={() => { setCurrentView('shopping-list'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
              currentView === 'shopping-list' 
                ? 'bg-zinc-100 text-zinc-900' 
                : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
            }`}
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5" />
              {shoppingList.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {shoppingList.length}
                </span>
              )}
            </div>
            Shopping List
          </button>

          <div className="pt-8 pb-2 px-4">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">
              <Filter className="w-4 h-4" />
              Dietary Filters
            </div>
            <div className="space-y-2">
              {DIETARY_OPTIONS.map(option => (
                <label key={option} className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                    dietaryRestrictions.includes(option) 
                      ? 'bg-emerald-500 border-emerald-500' 
                      : 'border-zinc-300 group-hover:border-emerald-400'
                  }`}>
                    {dietaryRestrictions.includes(option) && <X className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-sm text-zinc-700 group-hover:text-zinc-900">{option}</span>
                </label>
              ))}
            </div>
          </div>
        </nav>
        
        <div className="p-6 border-t border-zinc-100">
          <div className="flex items-center gap-3 text-sm text-zinc-500">
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white/80 backdrop-blur-md border-b border-zinc-200 p-4 flex items-center lg:hidden sticky top-0 z-30">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-zinc-600">
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-serif font-bold text-lg ml-2">Smart Fridge</span>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          {currentView === 'home' && (
            <Home 
              dietaryRestrictions={dietaryRestrictions} 
              onRecipeSelect={handleRecipeSelect} 
            />
          )}
          
          {currentView === 'recipe' && selectedRecipe && (
            <CookingMode 
              recipe={selectedRecipe} 
              onBack={() => setCurrentView('home')}
              onAddToShoppingList={handleAddToShoppingList}
              shoppingList={shoppingList}
            />
          )}

          {currentView === 'shopping-list' && (
            <ShoppingList 
              items={shoppingList}
              onRemoveItem={handleRemoveFromShoppingList}
              onClear={() => setShoppingList([])}
            />
          )}
        </div>
      </main>
    </div>
  );
}
