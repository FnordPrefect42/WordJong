import React, { useState } from 'react';
import { Trophy, Share2, Check, RefreshCw, X } from 'lucide-react';
import { SubmittedWord } from '../types.ts';

interface WinModalProps {
  isOpen: boolean;
  score: number;
  submittedWords: SubmittedWord[];
  dateKey: string;
  onPlayAgain: () => void;
  onClose: () => void;
}

export const WinModal: React.FC<WinModalProps> = ({
  isOpen,
  score,
  submittedWords,
  dateKey,
  onPlayAgain,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleShare = () => {
    const text = `🀄 WordJong (${dateKey})\nCleared all 72 tiles!\n🏆 Score: ${score} pts\n📖 Words: ${submittedWords.length}\nPlay: ${window.location.href}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      id="win-modal"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in"
    >
      <div className="w-full max-w-md bg-stone-900 border border-amber-500/40 rounded-3xl p-6 text-stone-200 shadow-2xl text-center relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Icon */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-stone-800 text-stone-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Trophy Visual */}
        <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-stone-950 shadow-lg ring-4 ring-amber-400/30">
          <Trophy className="w-9 h-9 stroke-[2.2]" />
        </div>

        <h2 className="text-2xl font-black text-white tracking-tight mb-1">
          Board Cleared!
        </h2>
        <p className="text-sm text-amber-300 font-medium mb-4">
          All 72 tiles cleared on {dateKey}
        </p>

        {/* Summary Card */}
        <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-4 mb-5 grid grid-cols-2 gap-3 text-center">
          <div>
            <span className="block text-xs uppercase font-bold text-stone-400">Total Score</span>
            <span className="text-2xl font-black text-amber-400">{score} pts</span>
          </div>
          <div>
            <span className="block text-xs uppercase font-bold text-stone-400">Words Spelled</span>
            <span className="text-2xl font-black text-emerald-400">{submittedWords.length}</span>
          </div>
        </div>

        {/* Words Preview */}
        <div className="text-left mb-5">
          <span className="text-xs uppercase font-bold text-stone-400 block mb-2">
            Vocabulary Highlights:
          </span>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-stone-950 rounded-xl border border-stone-800/80">
            {submittedWords.map((item, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-lg bg-stone-900 border border-stone-700/60 text-xs font-semibold text-stone-200"
              >
                {item.word} (+{item.points})
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            type="button"
            id="btn-share-results"
            onClick={handleShare}
            className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-98"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                Copied to Clipboard!
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 stroke-[2.5]" />
                Share Results
              </>
            )}
          </button>

          <button
            type="button"
            id="btn-play-again"
            onClick={onPlayAgain}
            className="w-full py-3 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-sm flex items-center justify-center gap-2 transition active:scale-98"
          >
            <RefreshCw className="w-4 h-4" />
            Play Again / Restart
          </button>
        </div>
      </div>
    </div>
  );
};
