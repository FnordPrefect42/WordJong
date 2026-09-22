import React from 'react';
import { X, Trophy, BookOpen, Award, CheckCircle2 } from 'lucide-react';
import { PlayerStats } from '../utils/storage.ts';
import { SubmittedWord } from '../types.ts';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: PlayerStats;
  submittedWords: SubmittedWord[];
  currentScore: number;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  stats,
  submittedWords,
  currentScore,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="stats-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-stone-900 border border-stone-800 rounded-3xl p-6 text-stone-200 shadow-2xl overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl font-black text-stone-100">Player Stats & Words</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Lifetime Stats */}
        <div className="py-4">
          <h3 className="text-xs uppercase font-bold text-stone-400 tracking-wider mb-2">
            Overall Career
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="bg-stone-950 p-3 rounded-2xl border border-stone-800">
              <span className="block text-2xl font-black text-amber-400">
                {stats.highestScore}
              </span>
              <span className="text-[11px] font-medium text-stone-400">High Score</span>
            </div>
            <div className="bg-stone-950 p-3 rounded-2xl border border-stone-800">
              <span className="block text-2xl font-black text-emerald-400">
                {stats.gamesCompleted}
              </span>
              <span className="text-[11px] font-medium text-stone-400">Cleared</span>
            </div>
            <div className="bg-stone-950 p-3 rounded-2xl border border-stone-800">
              <span className="block text-2xl font-black text-sky-400">
                {stats.totalWordsSpelled}
              </span>
              <span className="text-[11px] font-medium text-stone-400">Total Words</span>
            </div>
            <div className="bg-stone-950 p-3 rounded-2xl border border-stone-800">
              <span className="block text-2xl font-black text-purple-400">
                {stats.gamesPlayed}
              </span>
              <span className="text-[11px] font-medium text-stone-400">Games Played</span>
            </div>
          </div>
        </div>

        {/* Today's Words List */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs uppercase font-bold text-stone-400 tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              Words Found Today ({submittedWords.length})
            </h3>
            <span className="text-xs font-bold text-amber-400">Score: {currentScore}</span>
          </div>

          <div className="bg-stone-950/70 border border-stone-800 rounded-2xl p-3 min-h-[120px] max-h-[220px] overflow-y-auto">
            {submittedWords.length === 0 ? (
              <div className="text-center py-6 text-sm text-stone-500 italic">
                No words spelled yet today. Start by tapping free tiles!
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {submittedWords.map((item, idx) => (
                  <div
                    key={`${item.id}-${idx}`}
                    className="flex items-center gap-1.5 px-3 py-1 bg-stone-900 border border-stone-700/80 rounded-xl text-sm"
                  >
                    <span className="font-bold tracking-wide text-stone-100">{item.word}</span>
                    <span className="text-xs font-black text-emerald-400">+{item.points}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Close Button */}
        <div className="pt-5">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-stone-800 hover:bg-stone-700 font-bold text-stone-200 text-center transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
