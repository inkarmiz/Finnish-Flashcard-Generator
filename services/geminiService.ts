import { GoogleGenAI, Type } from "@google/genai";
import { AppSettings, FlashcardData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateVocabulary = async (settings: AppSettings): Promise<FlashcardData[]> => {
  const model = "gemini-2.5-flash";
  const targetLang = "Finnish";
  const nativeLang = "English";
  
  const prompt = `
    The user wants to learn ${targetLang} vocabulary.
    Category: "${settings.category}".
    User's raw word list: "${settings.customWords}".

    Task:
    1. Analyze the "User's raw word list". It may contain words in ${nativeLang}, ${targetLang}, or both.
    2. For each distinct item/concept in the list, generate a flashcard.
    3. If the input is ${nativeLang}, translate it to ${targetLang} (this is the 'targetWord').
    4. If the input is ${targetLang}, keep it as 'targetWord' and provide the ${nativeLang} meaning ('translation').
    
    For each card, provide:
    1. The word/phrase in ${targetLang} (targetWord). ensure this is the dictionary form (nominative).
    2. The translation in ${nativeLang} (translation).
    3. A simple pronunciation guide (phonetic) for the ${targetLang} word.
    4. A short example sentence using the word in ${targetLang}.
    5. The translation of that example sentence in ${nativeLang}.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            targetWord: { type: Type.STRING, description: `The word in ${targetLang}` },
            translation: { type: Type.STRING, description: `The translation in ${nativeLang}` },
            pronunciation: { type: Type.STRING, description: "Phonetic pronunciation guide" },
            exampleSentence: { type: Type.STRING, description: `Example sentence in ${targetLang}` },
            exampleTranslation: { type: Type.STRING, description: `Translation of the example sentence in ${nativeLang}` }
          },
          required: ["targetWord", "translation", "pronunciation", "exampleSentence", "exampleTranslation"]
        }
      }
    }
  });

  if (response.text) {
    try {
      const data = JSON.parse(response.text);
      return data as FlashcardData[];
    } catch (e) {
      console.error("Failed to parse JSON response", e);
      throw new Error("Failed to parse vocabulary data.");
    }
  }

  throw new Error("No data returned from Gemini.");
};
