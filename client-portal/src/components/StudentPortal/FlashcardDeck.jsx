import React, { useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../../services/api';
import { Layout } from '../shared/Layout';
import { Card } from '../shared/Card';
import { Layers, RotateCcw, Check, X, ChevronRight, Sparkles, Award } from 'lucide-react';

export const FlashcardDeck = () => {
  const [userId, setUserId] = useState(null);
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionStats, setSessionStats] = useState({ reviewed: 0, correct: 0 });
  const [sessionComplete, setSessionComplete] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      const decoded = jwtDecode(token);
      setUserId(decoded.user_id);
    }
  }, []);

  useEffect(() => {
    if (userId) fetchDueCards();
  }, [userId]);

  const fetchDueCards = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/flashcards/due/${userId}`);
      setCards(res.data.data || []);
      setCurrentIndex(0);
      setIsFlipped(false);
      setSessionStats({ reviewed: 0, correct: 0 });
      setSessionComplete(false);
    } catch (err) {
      console.error('Failed to fetch cards:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (quality) => {
    // quality: 1 = Again, 3 = Hard, 4 = Good, 5 = Easy
    const card = cards[currentIndex];
    try {
      await api.put(`/flashcards/${card.id}/review`, { quality });
      setSessionStats(prev => ({
        reviewed: prev.reviewed + 1,
        correct: quality >= 3 ? prev.correct + 1 : prev.correct
      }));

      setIsFlipped(false);
      if (currentIndex + 1 >= cards.length) {
        setSessionComplete(true);
      } else {
        setTimeout(() => setCurrentIndex(prev => prev + 1), 300);
      }
    } catch (err) {
      console.error('Review failed:', err);
    }
  };

  const currentCard = cards[currentIndex];
  const progress = cards.length > 0 ? Math.round(((currentIndex + (sessionComplete ? 1 : 0)) / cards.length) * 100) : 0;

  const difficultyColors = {
    EASY: 'text-emerald-400 bg-emerald-400/10',
    MEDIUM: 'text-amber-400 bg-amber-400/10',
    HARD: 'text-red-400 bg-red-400/10',
  };

  return (
    <Layout title="Flashcards">
      {loading ? (
        <Card><div className="py-20 text-center text-slate-500">Loading flashcards...</div></Card>
      ) : cards.length === 0 ? (
        <Card>
          <div className="py-20 text-center">
            <Sparkles size={48} className="mx-auto text-primary/30 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">All caught up! 🎉</h3>
            <p className="text-slate-400 text-sm">No flashcards due for review right now.</p>
            <p className="text-slate-500 text-xs mt-2">Create notes and generate flashcards from the Notes page.</p>
          </div>
        </Card>
      ) : sessionComplete ? (
        <Card>
          <div className="py-16 text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-3xl font-black text-white mb-2">Session Complete!</h2>
            <p className="text-slate-400 mb-6">You reviewed all {cards.length} cards</p>
            <div className="flex items-center justify-center gap-8 mb-8">
              <div className="text-center">
                <p className="text-3xl font-black text-emerald-400">{sessionStats.correct}</p>
                <p className="text-xs text-slate-500 uppercase">Correct</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-black text-red-400">{sessionStats.reviewed - sessionStats.correct}</p>
                <p className="text-xs text-slate-500 uppercase">Need Review</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-black text-primary">
                  {sessionStats.reviewed > 0 ? Math.round((sessionStats.correct / sessionStats.reviewed) * 100) : 0}%
                </p>
                <p className="text-xs text-slate-500 uppercase">Accuracy</p>
              </div>
            </div>
            <button onClick={fetchDueCards} className="btn-primary">
              <RotateCcw size={18} /> Review Again
            </button>
          </div>
        </Card>
      ) : (
        <>
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-medium">Card {currentIndex + 1} of {cards.length}</span>
              <span className="text-xs text-primary font-bold">{progress}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-purple-400 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* Flashcard */}
          <div
            className="perspective-1000 cursor-pointer mx-auto max-w-2xl"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div className={`relative w-full min-h-[320px] transition-transform duration-500 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
              {/* Front */}
              <div className="absolute inset-0 backface-hidden rounded-3xl border border-white/10 p-8 flex flex-col items-center justify-center text-center"
                style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}
              >
                <span className={`px-3 py-1 rounded-full text-xs font-bold mb-4 ${difficultyColors[currentCard?.difficulty] || difficultyColors.MEDIUM}`}>
                  {currentCard?.difficulty || 'MEDIUM'}
                </span>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">{currentCard?.subject}</p>
                <h2 className="text-xl font-bold text-white leading-relaxed">{currentCard?.front}</h2>
                <p className="text-xs text-slate-600 mt-6">Tap to reveal answer</p>
              </div>

              {/* Back */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-3xl border border-primary/20 p-8 flex flex-col items-center justify-center text-center"
                style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)' }}
              >
                <p className="text-xs text-primary uppercase tracking-wider mb-3 font-bold">Answer</p>
                <h2 className="text-xl font-bold text-white leading-relaxed">{currentCard?.back}</h2>
              </div>
            </div>
          </div>

          {/* Review Buttons */}
          {isFlipped && (
            <div className="flex items-center justify-center gap-3 mt-6 animate-in slide-in-from-bottom-4 duration-300">
              <button onClick={() => handleReview(1)} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all font-bold text-sm">
                <RotateCcw size={16} /> Again
              </button>
              <button onClick={() => handleReview(3)} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-all font-bold text-sm">
                <X size={16} /> Hard
              </button>
              <button onClick={() => handleReview(4)} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all font-bold text-sm">
                <Check size={16} /> Good
              </button>
              <button onClick={() => handleReview(5)} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all font-bold text-sm">
                <Sparkles size={16} /> Easy
              </button>
            </div>
          )}
        </>
      )}
    </Layout>
  );
};
