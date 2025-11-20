import React, { useState, useEffect } from 'react';
import { SetupScreen } from './components/SetupScreen';
import { QuizScreen } from './components/QuizScreen';
import { generateVocabulary } from './services/geminiService';
import { AppSettings, AppState, FlashcardData, SavedList } from './types';
import { Loader2, Trophy, RefreshCw, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.SETUP);
  const [cards, setCards] = useState<FlashcardData[]>([]);
  const [score, setScore] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string>("");
  
  // Storage & Settings State
  const [savedLists, setSavedLists] = useState<SavedList[]>([]);
  const [currentSettings, setCurrentSettings] = useState<AppSettings | undefined>(undefined);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('flashlingo_saved_lists');
    if (saved) {
      try {
        setSavedLists(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load saved lists", e);
      }
    }
  }, []);

  // Save helper
  const persistLists = (lists: SavedList[]) => {
    setSavedLists(lists);
    localStorage.setItem('flashlingo_saved_lists', JSON.stringify(lists));
  };

  const handleDeleteList = (category: string) => {
    const updated = savedLists.filter(l => l.category !== category);
    persistLists(updated);
  };

  const handleStart = async (settings: AppSettings) => {
    setCurrentSettings(settings);
    setErrorMsg("");

    // 1. Check Cache
    // We match by Category AND raw words. If words changed, we re-generate.
    const cachedList = savedLists.find(l => 
      l.category.toLowerCase() === settings.category.toLowerCase() && 
      l.customWords === settings.customWords
    );

    if (cachedList && cachedList.cards && cachedList.cards.length > 0) {
      // Hit! Use cached cards
      setCards(cachedList.cards);
      setState(AppState.QUIZ);
      
      // Update 'lastUsed' timestamp for this list
      const updatedLists = savedLists.map(l => 
        l.category === cachedList.category ? { ...l, lastUsed: Date.now() } : l
      );
      // Sort by last used (optional, but nice)
      updatedLists.sort((a, b) => b.lastUsed - a.lastUsed);
      persistLists(updatedLists);
      return;
    }

    // 2. Miss! Generate new cards
    setState(AppState.LOADING);
    try {
      const generatedCards = await generateVocabulary(settings);
      if (!generatedCards || generatedCards.length === 0) {
         throw new Error("No cards were generated.");
      }
      
      setCards(generatedCards);
      
      // Save to storage
      const newList: SavedList = {
        category: settings.category,
        customWords: settings.customWords,
        cards: generatedCards,
        lastUsed: Date.now()
      };

      // Remove any existing list with same category name to overwrite it
      const others = savedLists.filter(l => l.category.toLowerCase() !== settings.category.toLowerCase());
      const updatedLists = [newList, ...others];
      persistLists(updatedLists);

      setState(AppState.QUIZ);
    } catch (error) {
      console.error(error);
      setErrorMsg("We couldn't generate your cards right now. Please check your inputs or connection and try again.");
      setState(AppState.ERROR);
    }
  };

  const handleComplete = (finalScore: number) => {
    setScore(finalScore);
    setState(AppState.SUMMARY);
  };

  const handleRestart = () => {
    setState(AppState.SETUP);
    setCards([]);
    setScore(0);
    // We keep currentSettings so SetupScreen can pre-fill
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 md:p-8">
      
      {state === AppState.SETUP && (
        <SetupScreen 
          onStart={handleStart} 
          savedLists={savedLists}
          onDeleteList={handleDeleteList}
          initialSettings={currentSettings}
        />
      )}

      {state === AppState.LOADING && (
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-sm w-full">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75"></div>
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto relative z-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mt-6 mb-2">Building Your Set</h2>
          <p className="text-slate-500">
            Translating and preparing flashcards...
          </p>
        </div>
      )}

      {state === AppState.QUIZ && cards.length > 0 && (
        <QuizScreen 
          cards={cards} 
          onComplete={handleComplete} 
          onExit={handleRestart}
        />
      )}

      {state === AppState.SUMMARY && (
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center animate-fade-in-up">
          <div className="mx-auto bg-yellow-100 w-20 h-20 rounded-full flex items-center justify-center mb-6">
            <Trophy className="w-10 h-10 text-yellow-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Great Job!</h2>
          <p className="text-slate-500 mb-8">You've completed the test.</p>
          
          <div className="bg-slate-50 rounded-xl p-6 mb-8">
            <p className="text-sm text-slate-500 uppercase font-semibold tracking-wider mb-1">Final Score</p>
            <div className="text-5xl font-bold text-blue-600">
              {score}<span className="text-2xl text-slate-400 font-normal">/{cards.length}</span>
            </div>
          </div>

          <button 
            onClick={handleRestart}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transform transition-transform active:scale-95 flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Edit or New Set
          </button>
        </div>
      )}

      {state === AppState.ERROR && (
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mx-auto bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Oops!</h2>
          <p className="text-slate-500 mb-6">{errorMsg}</p>
          <button 
            onClick={handleRestart}
            className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      <footer className="fixed bottom-4 text-slate-400 text-xs text-center w-full pointer-events-none">
        Powered by Gemini AI
      </footer>
    </div>
  );
};

export default App;