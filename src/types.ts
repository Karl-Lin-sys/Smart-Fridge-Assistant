export interface Ingredient {
  name: string;
  have: boolean;
}

export interface Recipe {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | string;
  prepTime: string;
  calories: number;
  description: string;
  ingredients: Ingredient[];
  steps: string[];
}

export interface FridgeAnalysis {
  detectedIngredients: string[];
  recipes: Recipe[];
}
