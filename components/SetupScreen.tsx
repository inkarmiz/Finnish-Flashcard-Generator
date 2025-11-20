import React, { useState, useEffect } from 'react';
import { AppSettings, SavedList } from '../types';
import { Sparkles, ListPlus, Tag, Type, History, Trash2, Clock, ArrowUpRight } from 'lucide-react';

interface SetupScreenProps {
  onStart: (settings: AppSettings) => void;
  savedLists: SavedList[];
  onDeleteList: (category: string) => void;
  initialSettings?: AppSettings;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({ 
  onStart, 
  savedLists, 
  onDeleteList, 
  initialSettings 
}) => {
  const [category, setCategory] = useState(initialSettings?.category || "");
  const [customWords, setCustomWords] = useState(initialSettings?.customWords || "");

  // Update state if initialSettings change (e.g. when returning from quiz)
  useEffect(() => {
    if (initialSettings) {
      setCategory(initialSettings.category);
      setCustomWords(initialSettings.customWords);
    }
  }, [initialSettings]);

  const loadList = (list: SavedList) => {
    setCategory(list.category);
    setCustomWords(list.customWords);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category.trim() || !customWords.trim()) return;
    
    onStart({ 
      category: category.trim(), 
      customWords: customWords.trim() 
    });
  };

  const formatDate = (ts: number) => {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(ts));
  };

  return (
    <div className="max-w-md mx-auto w-full space-y-8">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-blue-600 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
          <div className="mx-auto bg-white w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <span className="text-3xl">🇫🇮</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Finnish Builder</h1>
          <p className="text-blue-100 text-sm">Create your own study sets</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
               <Tag className="w-4 h-4 text-blue-500" />
               Category Name
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Kitchen Items"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              required
            />
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
               <ListPlus className="w-4 h-4 text-blue-500" />
               Your Words
            </label>
            <textarea
              value={customWords}
              onChange={(e) => setCustomWords(e.target.value)}
              placeholder="Type words in English or Finnish...&#10;e.g. Cat, Dog, House&#10;or&#10;Kissa, Koira, Talo"
              className="w-full p-3 h-40 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none font-medium"
              required
            />
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <Type className="w-3 h-3" />
              Separate words with commas or new lines
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={!category || !customWords}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl shadow-lg transform transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
              Create Flashcards
              <Sparkles className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>

      {/* Saved Lists Section */}
      {savedLists.length > 0 && (
        <div className="animate-fade-in-up">
          <div className="flex items-center gap-2 mb-4 px-2">
            <History className="w-5 h-5 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Your Library</h3>
          </div>
          
          <div className="grid gap-3">
            {savedLists.map((list) => (
              <div 
                key={list.category}
                onClick={() => loadList(list)}
                className="group bg-white p-4 rounded-xl shadow-sm hover:shadow-md border border-slate-100 cursor-pointer transition-all flex items-center justify-between"
              >
                <div className="flex flex-col overflow-hidden">
                  <span className="font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">{list.category}</span>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(list.lastUsed)}</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                    <span className="truncate max-w-[150px]">{list.customWords.split(/[\n,]/).filter(w => w.trim()).length} words</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                     onClick={(e) => {
                       e.stopPropagation();
                       onDeleteList(list.category);
                     }}
                     className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                     title="Delete list"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};