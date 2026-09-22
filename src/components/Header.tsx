import React from 'react';
import { Lightbulb, RotateCcw, RefreshCw, HelpCircle, Trophy } from 'lucide-react';

interface HeaderProps {
  dateKey: string;
  score: number;
  remainingTilesCount: number;
  totalTilesCount: number;
  canUndo: boolean;
  onHint: () => void;
  onUndo: () => void;
  onReset: () => void;
  onOpenRules: () => void;
  onOpenStats: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  dateKey,
  score,
  remainingTilesCount,
  totalTilesCount,
  canUndo,
  onHint,
  onUndo,
  onReset,
  onOpenRules,
  onOpenStats,
}) => {
  // Format readable date
  const [year, month, day] = dateKey.split('-');
  const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
  const formattedDate = dateObj.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="w-full max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 px-3 py-2 bg-stone-900/80 backdrop-blur-md border border-stone-800 rounded-2xl shadow-md">
      {/* Brand & Date */}
      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-200 to-amber-500 border border-amber-300 shadow flex items-center justify-center font-black text-stone-900 text-lg">
            🀄
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-stone-100 flex items-center gap-1.5 leading-none">
              Word Mahjong
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                Daily
              </span>
            </h1>
            <p className="text-xs text-stone-400 font-medium">{formattedDate}</p>
          </div>
        </div>

        {/* Action Controls for Mobile Header Right */}
        <div className="flex items-center gap-1.5 sm:hidden">
          <button
            id="mobile-btn-rules"
            type="button"
            onClick={onOpenRules}
            className="p-2 rounded-xl bg-stone-800 text-stone-300 hover:text-white"
            title="How to Play"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
          <button
            id="mobile-btn-stats"
            type="button"
            onClick={onOpenStats}
            className="p-2 rounded-xl bg-stone-800 text-stone-300 hover:text-white"
            title="Player Stats"
          >
            <Trophy className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats Counter & Controls */}
      <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
        {/* Score & Remaining Badges */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-stone-950/80 border border-stone-800 rounded-xl flex flex-col items-center">
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">
              Score
            </span>
            <span className="text-sm font-black text-amber-400">{score}</span>
          </div>

          <div className="px-3 py-1 bg-stone-950/80 border border-stone-800 rounded-xl flex flex-col items-center">
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">
              Tiles Left
            </span>
            <span className="text-sm font-black text-stone-200">
              {remainingTilesCount} / {totalTilesCount}
            </span>
          </div>
        </div>

        {/* Gameplay Buttons: Hint, Undo, Reset */}
        <div className="flex items-center gap-1.5">
          {/* Level 1 Hint Button */}
          <button
            id="btn-hint"
            type="button"
            onClick={onHint}
            className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-bold active:scale-95 transition"
            title="Hint: Highlights free letters that can spell a word"
          >
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Hint</span>
          </button>

          {/* Undo Button */}
          <button
            id="btn-undo"
            type="button"
            disabled={!canUndo}
            onClick={onUndo}
            className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 disabled:opacity-30 disabled:pointer-events-none text-stone-300 text-xs font-bold active:scale-95 transition"
            title="Undo last word submission"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Undo</span>
          </button>

          {/* Reset Button */}
          <button
            id="btn-reset"
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold active:scale-95 transition"
            title="Restart today's puzzle"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          {/* Desktop Rules & Stats */}
          <div className="hidden sm:flex items-center gap-1 pl-1 border-l border-stone-800">
            <button
              id="desktop-btn-rules"
              type="button"
              onClick={onOpenRules}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition"
              title="How to Play"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            <button
              id="desktop-btn-stats"
              type="button"
              onClick={onOpenStats}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition"
              title="Player Stats"
            >
              <Trophy className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
