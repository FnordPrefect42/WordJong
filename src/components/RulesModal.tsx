import React from 'react';
import { X, CheckCircle, ArrowUp, ArrowDown, Lightbulb, RotateCcw } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      id="rules-modal"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-stone-900 border border-stone-800 rounded-3xl p-6 text-stone-200 shadow-2xl overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🀄</span>
            <h2 className="text-xl font-black text-stone-100">How to Play</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-4 text-sm leading-relaxed text-stone-300">
          {/* Mahjong Tile Clearance Rule */}
          <div className="bg-stone-950/60 p-3.5 rounded-2xl border border-stone-800/80">
            <h3 className="font-bold text-amber-300 text-base flex items-center gap-2 mb-1.5">
              <CheckCircle className="w-4 h-4 text-amber-400" />
              1. Mahjong Tile Freedom Rule
            </h3>
            <p>
              A tile is <strong>free to play</strong> if:
            </p>
            <ul className="list-disc list-inside mt-1 space-y-1 text-stone-300 pl-1">
              <li>No other tile is resting on top of it.</li>
              <li>At least one side (its <strong>left OR right edge</strong>) is open and unblocked.</li>
            </ul>
            <div className="mt-2 text-xs bg-amber-950/40 text-amber-200/90 p-2 rounded-lg border border-amber-800/40">
              <strong>Turn Rule:</strong> All tiles must be free at the start of your turn to be used in that word.
            </div>
          </div>

          {/* Word Rules & Length */}
          <div className="bg-stone-950/60 p-3.5 rounded-2xl border border-stone-800/80">
            <h3 className="font-bold text-emerald-400 text-base flex items-center gap-2 mb-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              2. Spelling & Length Requirement
            </h3>
            <p>
              Tap free tiles to build words in your active word tray. All words must be at least <strong>4 letters long</strong>.
            </p>
          </div>

          {/* Scoring Rules */}
          <div className="bg-stone-950/60 p-3.5 rounded-2xl border border-stone-800/80">
            <h3 className="font-bold text-sky-400 text-base flex items-center gap-2 mb-1.5">
              <CheckCircle className="w-4 h-4 text-sky-400" />
              3. Scoring
            </h3>
            <p className="mb-2">Longer words earn higher bonus points:</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-mono">
              <div className="bg-stone-900 p-2 rounded-xl border border-stone-800">
                <span className="block text-stone-400">4 Letters</span>
                <span className="font-bold text-emerald-400 text-sm">1 pt</span>
              </div>
              <div className="bg-stone-900 p-2 rounded-xl border border-stone-800">
                <span className="block text-stone-400">5 Letters</span>
                <span className="font-bold text-emerald-400 text-sm">2 pts</span>
              </div>
              <div className="bg-stone-900 p-2 rounded-xl border border-stone-800">
                <span className="block text-stone-400">6 Letters</span>
                <span className="font-bold text-emerald-400 text-sm">3 pts</span>
              </div>
              <div className="bg-stone-900 p-2 rounded-xl border border-stone-800">
                <span className="block text-stone-400">7+ Letters</span>
                <span className="font-bold text-emerald-400 text-sm">4+ pts</span>
              </div>
            </div>
          </div>

          {/* Gestures & Controls */}
          <div className="bg-stone-950/60 p-3.5 rounded-2xl border border-stone-800/80">
            <h3 className="font-bold text-purple-400 text-base flex items-center gap-2 mb-1.5">
              <CheckCircle className="w-4 h-4 text-purple-400" />
              4. Tap, Click & Swipe Controls
            </h3>
            <ul className="space-y-1.5 text-stone-300">
              <li className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-stone-800 text-xs font-mono">Tap/Click</span>
                <span>Tap any free tile to add it to your tray. Tap a letter in the tray to return it.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-stone-800 text-xs font-mono flex items-center gap-1">
                  <ArrowUp className="w-3 h-3 text-emerald-400" /> Swipe Up
                </span>
                <span>Swipe up on the word tray to submit your word quickly.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-stone-800 text-xs font-mono flex items-center gap-1">
                  <ArrowDown className="w-3 h-3 text-stone-400" /> Swipe Down
                </span>
                <span>Swipe down on the word tray to recall all letters.</span>
              </li>
            </ul>
          </div>

          {/* Hints & Undo */}
          <div className="bg-stone-950/60 p-3.5 rounded-2xl border border-stone-800/80">
            <h3 className="font-bold text-stone-200 text-base flex items-center gap-2 mb-1.5">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              5. Hint System & Undo
            </h3>
            <p>
              Need inspiration? Tap <strong>Hint</strong> to highlight free tiles that can form a valid word. Made a mistake? Tap <strong>Undo</strong> to restore your last cleared word!
            </p>
          </div>
        </div>

        {/* Footer Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white text-center shadow-lg transition active:scale-98"
          >
            Got It, Let's Play!
          </button>
        </div>
      </div>
    </div>
  );
};
