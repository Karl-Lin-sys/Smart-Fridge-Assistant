import { GoogleGenAI, Type } from "@google/genai";
import { FridgeAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzeFridge(imageBase64: string, mimeType: string, dietaryRestrictions: string[]): Promise<FridgeAnalysis> {
  const prompt = `Analyze this image of a fridge or ingredients.
1. Identify all visible ingredients.
2. Suggest 3-5 recipes that can be made primarily using these ingredients.
${dietaryRestrictions.length > 0 ? `3. MUST adhere to these dietary restrictions: ${dietaryRestrictions.join(', ')}.` : ''}
4. For each recipe, list the required ingredients and indicate if they are present in the image ('have': true) or missing ('have': false).
5. Provide step-by-step cooking instructions.`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: [
      {
        inlineData: {
          data: imageBase64,
          mimeType: mimeType,
        }
      },
      { text: prompt }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          detectedIngredients: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List of ingredients detected in the image."
          },
          recipes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                difficulty: { type: Type.STRING, description: "Easy, Medium, or Hard" },
                prepTime: { type: Type.STRING, description: "e.g., 15 mins" },
                calories: { type: Type.INTEGER },
                description: { type: Type.STRING },
                ingredients: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      have: { type: Type.BOOLEAN, description: "True if detected in image, false if missing" }
                    },
                    required: ["name", "have"]
                  }
                },
                steps: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Step-by-step cooking instructions."
                }
              },
              required: ["id", "title", "difficulty", "prepTime", "calories", "description", "ingredients", "steps"]
            }
          }
        },
        required: ["detectedIngredients", "recipes"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}
