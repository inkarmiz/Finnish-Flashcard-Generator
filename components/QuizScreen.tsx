import React, { useState } from 'react';
import { FlashcardData } from '../types';
import { Flashcard } from './Flashcard';
import { ArrowRight, BookOpen, PenTool, Check, X, ArrowLeft } from 'lucide-react';

interface QuizScreenProps {
  cards: FlashcardData[];
  onComplete: (score: number) => void;
  onExit: () => void;
}

type SessionPhase = 'STUDY' | 'TEST';

export const QuizScreen: React.FC<QuizScreenProps> = ({ cards, onComplete, onExit }) => {
  const [phase, setPhase] = useState<SessionPhase>('STUDY');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Test State
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [score, setScore] = useState(0);

  const currentCard = cards[currentIndex];
  const progress = ((currentIndex) / cards.length) * 100;

  // --- Study Logic ---
  const handleStudyNext = () => {
    setIsFlipped(false);
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleStudyPrev = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const startTest = () => {
    setPhase('TEST');
    setCurrentIndex(0);
    setIsFlipped(false);
    setScore(0);
    setUserAnswer("");
    setFeedback('idle');
  };

  // --- Test Logic ---
  const handleCheckAnswer = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!userAnswer.trim()) return;

    const correct = currentCard.targetWord.toLowerCase().trim();
    const user = userAnswer.toLowerCase().trim();

    if (user === correct) {
      setFeedback('correct');
      setScore(s => s + 1);
    } else {
      setFeedback('incorrect');
    }
  };

  const handleTestNext = () => {
    setFeedback('idle');
    setUserAnswer("");
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      // Focus back on input handled via autoFocus or effect if needed, 
      // but simple re-render usually works with autoFocus
    } else {
      onComplete(feedback === 'correct' ? score + 1 : score); // Add last point if valid
    }
  };

  const insertChar = (char: string) => {
    setUserAnswer(prev => prev + char);
    // Keep focus on input logic would ideally go here using a ref
  };

  if (phase === 'STUDY') {
    return (
      <div className="flex flex-col items-center w-full max-w-md mx-auto min-h-[600px]">
        <div className="w-full mb-6 flex justify-between items-center">
           <button onClick={onExit} className="text-slate-400 hover:text-slate-600 text-sm">Back to Setup</button>
           <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
             <BookOpen className="w-4 h-4" /> Study Mode
           </div>
        </div>

        <div className="w-full mb-4">
          <div className="flex justify-between text-xs text-slate-400 mb-1 uppercase tracking-wider font-semibold">
            <span>Card</span>
            <span>{currentIndex + 1} / {cards.length}</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        <div className="w-full flex justify-center mb-8">
          <Flashcard 
            data={currentCard} 
            isFlipped={isFlipped} 
            onFlip={() => setIsFlipped(!isFlipped)} 
          />
        </div>

        <div className="w-full flex gap-3 mt-auto">
          <button 
            onClick={handleStudyPrev}
            disabled={currentIndex === 0}
            className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium disabled:opacity-50 hover:bg-slate-50 transition-colors"
          >
            Previous
          </button>
          
          {currentIndex === cards.length - 1 ? (
             <button 
               onClick={startTest}
               className="flex-[2] py-3 rounded-xl bg-blue-600 text-white font-bold shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
             >
               Start Test <PenTool className="w-4 h-4" />
             </button>
          ) : (
            <button 
              onClick={handleStudyNext}
              className="flex-[2] py-3 rounded-xl bg-slate-800 text-white font-bold shadow-md hover:bg-slate-900 transition-all flex items-center justify-center gap-2"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // TEST PHASE
  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto min-h-[500px]">
      <div className="w-full mb-6 flex justify-between items-center">
        <button onClick={onExit} className="text-slate-400 hover:text-slate-600 text-sm">Quit</button>
        <div className="flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium">
          <PenTool className="w-4 h-4" /> Test Mode
        </div>
      </div>

      <div className="w-full mb-8">
        <div className="flex justify-between text-xs text-slate-400 mb-1 uppercase tracking-wider font-semibold">
          <span>Progress</span>
          <span>{currentIndex + 1} / {cards.length}</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div className="bg-purple-500 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      {/* Question Card */}
      <div className="w-full bg-white rounded-2xl shadow-xl p-8 mb-6 text-center relative overflow-hidden border border-slate-100">
        <span className="text-xs font-bold text-slate-400 tracking-widest uppercase block mb-4">Translate to Finnish</span>
        <h2 className="text-3xl font-bold text-slate-800 mb-2">{currentCard.translation}</h2>
      </div>

      {/* Answer Section */}
      <div className="w-full space-y-4">
        <form onSubmit={handleCheckAnswer} className="relative">
           <input
             type="text"
             value={userAnswer}
             onChange={(e) => setUserAnswer(e.target.value)}
             disabled={feedback !== 'idle'}
             placeholder="Type Finnish translation..."
             className={`w-full p-4 text-lg text-center font-medium bg-white border-2 rounded-xl outline-none transition-all ${
               feedback === 'idle' ? 'border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200' :
               feedback === 'correct' ? 'border-green-500 bg-green-50 text-green-800' :
               'border-red-500 bg-red-50 text-red-800'
             }`}
             autoFocus
           />
           
           {/* Special Characters */}
           {feedback === 'idle' && (
             <div className="flex justify-center gap-2 mt-3">
               {['ä', 'ö'].map(char => (
                 <button
                   key={char}
                   type="button"
                   onClick={() => insertChar(char)}
                   className="w-10 h-10 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold shadow-sm transition-colors"
                 >
                   {char.toUpperCase()}
                 </button>
               ))}
             </div>
           )}
        </form>

        {/* Feedback Area */}
        {feedback !== 'idle' && (
           <div className={`p-4 rounded-xl flex items-start gap-3 animate-fade-in ${
             feedback === 'correct' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
           }`}>
              {feedback === 'correct' ? <Check className="w-6 h-6 flex-shrink-0" /> : <X className="w-6 h-6 flex-shrink-0" />}
              <div className="text-left">
                <p className="font-bold">{feedback === 'correct' ? 'Correct!' : 'Not quite right'}</p>
                {feedback === 'incorrect' && (
                  <p className="text-sm mt-1">
                    Correct answer: <span className="font-bold">{currentCard.targetWord}</span>
                  </p>
                )}
              </div>
           </div>
        )}

        {/* Actions */}
        <div className="mt-4">
          {feedback === 'idle' ? (
             <button 
               onClick={handleCheckAnswer}
               disabled={!userAnswer.trim()}
               className="w-full py-4 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg transition-all active:scale-95"
             >
               Check Answer
             </button>
          ) : (
            <button 
               onClick={handleTestNext}
               className={`w-full py-4 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${
                 feedback === 'correct' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
               }`}
             >
               Continue <ArrowRight className="w-5 h-5" />
             </button>
          )}
        </div>
      </div>

    </div>
  );
};
