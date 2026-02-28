import React, { useState, useEffect } from 'react';
import { Recipe, Ingredient } from '../types';
import { ArrowLeft, Volume2, VolumeX, Plus, Check, Play, Pause, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CookingModeProps {
  recipe: Recipe;
  onBack: () => void;
  onAddToShoppingList: (ingredient: string) => void;
  shoppingList: string[];
}

export default function CookingMode({ recipe, onBack, onAddToShoppingList, shoppingList }: CookingModeProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      setSpeechSynthesis(window.speechSynthesis);
    }
    return () => {
      if (speechSynthesis) {
        speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleSpeech = (text: string) => {
    if (!speechSynthesis) return;

    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsSpeaking(false);
      speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  // Stop speaking when changing steps
  useEffect(() => {
    if (speechSynthesis && isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [currentStep]);

  const missingIngredients = recipe.ingredients.filter(i => !i.have);

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 mb-8 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to recipes</span>
      </button>

      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-zinc-900 mb-4">{recipe.title}</h1>
        <p className="text-xl text-zinc-500">{recipe.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1 order-2 lg:order-1">
          <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-200 sticky top-8">
            <h3 className="text-lg font-bold text-zinc-900 mb-4">Ingredients</h3>
            <ul className="space-y-3">
              {recipe.ingredients.map((ing, idx) => {
                const isMissing = !ing.have;
                const inShoppingList = shoppingList.includes(ing.name);
                
                return (
                  <li key={idx} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${isMissing ? 'bg-amber-400' : 'bg-emerald-500'}`} />
                      <span className={`text-zinc-700 ${isMissing ? 'font-medium' : ''}`}>
                        {ing.name}
                      </span>
                    </div>
                    {isMissing && (
                      <button
                        onClick={() => !inShoppingList && onAddToShoppingList(ing.name)}
                        disabled={inShoppingList}
                        className={`p-1.5 rounded-md transition-colors ${
                          inShoppingList 
                            ? 'bg-emerald-100 text-emerald-600' 
                            : 'bg-white border border-zinc-200 text-zinc-400 hover:text-emerald-600 hover:border-emerald-200 shadow-sm'
                        }`}
                        title={inShoppingList ? "In shopping list" : "Add to shopping list"}
                      >
                        {inShoppingList ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
            
            {missingIngredients.length > 0 && (
              <div className="mt-6 pt-6 border-t border-zinc-200">
                <p className="text-sm text-amber-600 font-medium mb-2">
                  You're missing {missingIngredients.length} ingredient{missingIngredients.length > 1 ? 's' : ''}.
                </p>
                <button 
                  onClick={() => {
                    missingIngredients.forEach(ing => {
                      if (!shoppingList.includes(ing.name)) {
                        onAddToShoppingList(ing.name);
                      }
                    });
                  }}
                  className="w-full py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors"
                >
                  Add all missing to list
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 order-1 lg:order-2">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-zinc-900">Step-by-Step</h2>
            <div className="text-sm font-medium text-zinc-500">
              Step {currentStep + 1} of {recipe.steps.length}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-8 md:p-12 min-h-[400px] flex flex-col relative overflow-hidden">
            <div className="flex-1 flex flex-col justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-3xl md:text-4xl font-serif leading-tight text-zinc-900">
                    {recipe.steps[currentStep]}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mt-12 flex items-center justify-between pt-8 border-t border-zinc-100">
              <button
                onClick={() => toggleSpeech(recipe.steps[currentStep])}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors ${
                  isSpeaking 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                }`}
              >
                {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                {isSpeaking ? 'Stop' : 'Read Aloud'}
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0}
                  className="p-3 rounded-full bg-zinc-100 text-zinc-700 hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setCurrentStep(Math.min(recipe.steps.length - 1, currentStep + 1))}
                  disabled={currentStep === recipe.steps.length - 1}
                  className="p-3 rounded-full bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Progress dots */}
          <div className="flex justify-center gap-2 mt-8">
            {recipe.steps.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentStep ? 'w-8 bg-zinc-900' : 'w-2 bg-zinc-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
