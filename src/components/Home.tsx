import React, { useState, useRef } from 'react';
import { Camera, Upload, Loader2, ChefHat, Clock, Flame, Info } from 'lucide-react';
import { analyzeFridge } from '../services/geminiService';
import { FridgeAnalysis, Recipe } from '../types';
import { motion } from 'motion/react';

interface HomeProps {
  dietaryRestrictions: string[];
  onRecipeSelect: (recipe: Recipe) => void;
}

export default function Home({ dietaryRestrictions, onRecipeSelect }: HomeProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<FridgeAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        try {
          const result = await analyzeFridge(base64Data, file.type, dietaryRestrictions);
          setAnalysis(result);
        } catch (err: any) {
          console.error(err);
          setError(err.message || 'Failed to analyze image. Please try again.');
        } finally {
          setIsAnalyzing(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setIsAnalyzing(false);
      setError('Error reading file.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 mb-4 font-serif">What's in your fridge?</h1>
        <p className="text-zinc-500 max-w-2xl mx-auto">
          Snap a photo of your open fridge or pantry, and we'll suggest delicious recipes based on what you already have.
        </p>
      </div>

      {!analysis && !isAnalyzing && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-sm border border-zinc-200 p-12 text-center"
        >
          <div className="flex justify-center gap-6 mb-8">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center w-48 h-48 bg-zinc-50 rounded-2xl border-2 border-dashed border-zinc-300 hover:border-emerald-500 hover:bg-emerald-50 transition-colors group"
            >
              <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Camera className="w-8 h-8 text-zinc-400 group-hover:text-emerald-600" />
              </div>
              <span className="font-medium text-zinc-700">Take Photo</span>
            </button>

            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center w-48 h-48 bg-zinc-50 rounded-2xl border-2 border-dashed border-zinc-300 hover:border-emerald-500 hover:bg-emerald-50 transition-colors group"
            >
              <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8 text-zinc-400 group-hover:text-emerald-600" />
              </div>
              <span className="font-medium text-zinc-700">Upload Image</span>
            </button>
          </div>
          
          <input 
            type="file" 
            accept="image/*" 
            capture="environment"
            className="hidden" 
            ref={fileInputRef}
            onChange={handleImageUpload}
          />
          
          <p className="text-sm text-zinc-400">Supported formats: JPG, PNG, WEBP</p>
        </motion.div>
      )}

      {isAnalyzing && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-6" />
          <h3 className="text-xl font-medium text-zinc-800 mb-2">Analyzing your ingredients...</h3>
          <p className="text-zinc-500">Our AI chef is brainstorming recipes for you.</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-8 flex items-start gap-3">
          <Info className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {analysis && !isAnalyzing && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-10"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-serif font-medium text-zinc-900">Detected Ingredients</h2>
              <button 
                onClick={() => setAnalysis(null)}
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Scan Again
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {analysis.detectedIngredients.map((ingredient, idx) => (
                <span key={idx} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium border border-emerald-100">
                  {ingredient}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-serif font-medium text-zinc-900 mb-6">Recipe Suggestions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {analysis.recipes.map((recipe) => (
                <motion.div 
                  key={recipe.id}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col"
                  onClick={() => onRecipeSelect(recipe)}
                >
                  <div className="p-6 flex-1">
                    <h3 className="text-xl font-bold text-zinc-900 mb-2 line-clamp-2">{recipe.title}</h3>
                    <p className="text-zinc-500 text-sm mb-6 line-clamp-3">{recipe.description}</p>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-zinc-600 mb-6">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-zinc-400" />
                        <span>{recipe.prepTime}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Flame className="w-4 h-4 text-zinc-400" />
                        <span>{recipe.calories} kcal</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ChefHat className="w-4 h-4 text-zinc-400" />
                        <span>{recipe.difficulty}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-zinc-50 px-6 py-4 border-t border-zinc-100 flex justify-between items-center">
                    <div className="text-sm text-zinc-500">
                      <span className="font-medium text-zinc-900">
                        {recipe.ingredients.filter(i => i.have).length}
                      </span>
                      /{recipe.ingredients.length} ingredients
                    </div>
                    <span className="text-emerald-600 font-medium text-sm">Let's Cook &rarr;</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
