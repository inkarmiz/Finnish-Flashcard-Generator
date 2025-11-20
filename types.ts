export interface FlashcardData {
  targetWord: string; // Finnish
  translation: string; // English
  pronunciation: string;
  exampleSentence: string;
  exampleTranslation: string;
}

export interface AppSettings {
  category: string;
  customWords: string;
}

export interface SavedList {
  category: string;
  customWords: string;
  cards: FlashcardData[];
  lastUsed: number;
}

export enum AppState {
  SETUP = 'SETUP',
  LOADING = 'LOADING',
  QUIZ = 'QUIZ', // Handles both Study and Test phases
  SUMMARY = 'SUMMARY',
  ERROR = 'ERROR'
}