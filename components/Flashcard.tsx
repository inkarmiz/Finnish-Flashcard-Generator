import React from 'react';
import { FlashcardData } from '../types';
import { Volume2, RotateCw } from 'lucide-react';

interface FlashcardProps {
  data: FlashcardData;
  isFlipped: boolean;
  onFlip: () => void;
}

export const Flashcard: React.FC<FlashcardProps> = ({ data, isFlipped, onFlip }) => {
  
  const handleSpeak = (e: React.MouseEvent, text: string, lang: string = 'fi-FI') => {
    e.stopPropagation();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    speechSynthesis.speak(utterance);
  };

  return (
    <div 
      className="perspective-1000 w-full max-w-sm h-96 cursor-pointer group"
      onClick={onFlip}
    >
      <div 
        className={`relative w-full h-full transition-transform duration-700 transform-style-3d shadow-2xl rounded-2xl ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* Front Side */}
        <div className="absolute w-full h-full bg-white rounded-2xl backface-hidden flex flex-col items-center justify-center p-8 border-2 border-slate-100">
          <div className="absolute top-4 right-4">
            <span className="text-xs font-bold text-slate-400 tracking-widest uppercase">Finnish</span>
          </div>
          
          <div className="flex flex-col items-center text-center space-y-4">
            <h2 className="text-4xl font-bold text-slate-800 mb-2">{data.targetWord}</h2>
            <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-medium font-mono">
              /{data.pronunciation}/
            </div>
            <button 
              onClick={(e) => handleSpeak(e, data.targetWord, 'fi-FI')}
              className="mt-4 p-3 rounded-full bg-slate-100 hover:bg-blue-100 text-slate-500 hover:text-blue-600 transition-colors"
              aria-label="Pronounce word"
            >
              <Volume2 className="w-6 h-6" />
            </button>
          </div>
          
          <div className="absolute bottom-6 text-slate-400 text-sm flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
             <RotateCw className="w-4 h-4" />
             Tap to reveal
          </div>
        </div>

        {/* Back Side */}
        <div className="absolute w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl backface-hidden rotate-y-180 flex flex-col items-center justify-center p-8 text-white">
          <div className="absolute top-4 right-4">
            <span className="text-xs font-bold text-blue-200 tracking-widest uppercase">English</span>
          </div>

          <div className="text-center space-y-6 w-full">
            <div>
              <h3 className="text-3xl font-bold mb-1">{data.translation}</h3>
              <p className="text-blue-200 text-sm">Meaning</p>
            </div>

            <div className="w-full border-t border-white/20 my-4"></div>

            <div className="text-left bg-white/10 p-4 rounded-xl backdrop-blur-sm">
              <p className="text-lg font-medium italic mb-2">"{data.exampleSentence}"</p>
              <p className="text-blue-200 text-sm">{data.exampleTranslation}</p>
            </div>
            
            <button 
              onClick={(e) => handleSpeak(e, data.exampleSentence, 'fi-FI')}
              className="p-2 rounded-full hover:bg-white/20 text-blue-100 transition-colors"
              aria-label="Pronounce sentence"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};