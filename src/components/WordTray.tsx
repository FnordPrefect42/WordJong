import React, { useRef, useState } from 'react';
import { MahjongTile } from '../types.ts';
import { isValidWord } from '../data/dictionary.ts';
import { calculateWordPoints } from '../utils/mahjongRules.ts';
import { Check, X, Delete, ArrowUp, ArrowDown } from 'lucide-react';

interface WordTrayProps {
  selectedTiles: MahjongTile[];
  onRemoveTile: (tileId: string) => void;
  onSubmitWord: () => void;
  onClearTray: () => void;
  errorMessage: string | null;
}

export const WordTray: React.FC<WordTrayProps> = ({
  selectedTiles,
  onRemoveTile,
  onSubmitWord,
  onClearTray,
  errorMessage,
}) => {
  const currentWord = selectedTiles.map((t) => t.letter).join('');
  const length = currentWord.length;
  const isLengthValid = length >= 4;
  const isWordValid = isLengthValid && isValidWord(currentWord);
  const potentialPoints = calculateWordPoints(currentWord);

  // Swipe tracking for Option B: Swipe UP to Submit, Swipe DOWN to Clear
  const [dragStartY, setDragStartY] = useState<number | null>(null);
  const [dragOffsetY, setDragOffsetY] = useState<number>(0);
  const trayRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only track if not clicking an inner button
    if ((e.target as HTMLElement).closest('button')) return;
    setDragStartY(e.clientY);
    setDragOffsetY(0);
    if (trayRef.current) {
      trayRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (dragStartY === null) return;
    const currentY = e.clientY;
    const deltaY = currentY - dragStartY;
    // Dampen drag visual
    setDragOffsetY(deltaY * 0.4);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragStartY === null) return;
    const deltaY = e.clientY - dragStartY;
    const threshold = 40; // 40px swipe threshold

    if (deltaY < -threshold) {
      // Swiped UP -> Submit
      if (isWordValid) {
        onSubmitWord();
      }
    } else if (deltaY > threshold) {
      // Swiped DOWN -> Clear / Recall
      if (selectedTiles.length > 0) {
        onClearTray();
      }
    }

    setDragStartY(null);
    setDragOffsetY(0);
    try {
      if (trayRef.current && trayRef.current.hasPointerCapture(e.pointerId)) {
        trayRef.current.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Pointer capture release safety
    }
  };

  return (
    <div
      ref={trayRef}
      id="word-tray-container"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => {
        setDragStartY(null);
        setDragOffsetY(0);
      }}
      className="w-full max-w-2xl mx-auto px-2.5 sm:px-3 py-1.5 sm:py-2 bg-stone-900/95 backdrop-blur-md border border-stone-700/80 rounded-xl sm:rounded-2xl shadow-xl touch-none transition-transform duration-75 select-none"
      style={{
        transform: `translateY(${dragOffsetY}px)`,
      }}
    >
      {/* Swipe Feedback Hints & Status */}
      <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-medium text-stone-400 px-1.5 pb-1 border-b border-stone-800">
        <span className="flex items-center gap-1">
          <ArrowUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400 animate-pulse" />
          <span className="hidden xs:inline">Swipe UP to Submit</span>
          <span className="xs:hidden">Up: Submit</span>
        </span>
        <div className="flex items-center gap-1.5">
          {length > 0 ? (
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] sm:text-xs font-semibold ${
                !isLengthValid
                  ? 'bg-stone-800 text-stone-400'
                  : isWordValid
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                  : 'bg-amber-950 text-amber-300 border border-amber-700'
              }`}
            >
              {!isLengthValid
                ? `${length}/4 letters`
                : isWordValid
                ? `Valid: +${potentialPoints} pt${potentialPoints > 1 ? 's' : ''}`
                : 'Not in word list'}
            </span>
          ) : (
            <span className="text-stone-500">Tap free tiles to spell words</span>
          )}
        </div>
        <span className="flex items-center gap-1">
          <ArrowDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-stone-400" />
          <span className="hidden xs:inline">Swipe DOWN to Clear</span>
          <span className="xs:hidden">Down: Clear</span>
        </span>
      </div>

      {/* Main Tray Area */}
      <div className="flex items-center justify-between gap-1.5 sm:gap-2 py-1.5 sm:py-2">
        {/* Active Letter Tiles Container */}
        <div
          id="active-letter-rack"
          className="flex-1 min-h-[50px] sm:min-h-[56px] bg-stone-950/80 border border-stone-800 rounded-lg sm:rounded-xl px-2 py-1 flex items-center justify-center gap-1 sm:gap-1.5 overflow-x-auto"
        >
          {selectedTiles.length === 0 ? (
            <span className="text-stone-500 text-xs sm:text-sm font-medium italic">
              Select letters from the board below
            </span>
          ) : (
            selectedTiles.map((tile, idx) => (
              <button
                key={`${tile.id}-${idx}`}
                id={`tray-tile-${tile.id}`}
                onClick={() => onRemoveTile(tile.id)}
                type="button"
                className="group relative flex flex-col items-center justify-center w-9 h-11 sm:w-11 sm:h-12 bg-gradient-to-b from-[#fffff7] via-[#faf6ee] to-[#f0e8d5] text-stone-900 border border-[#d8caa8] rounded-md sm:rounded-lg shadow-md hover:scale-105 active:scale-95 transition-transform shrink-0"
                title="Tap to return this letter"
              >
                <span className="text-lg sm:text-xl font-black leading-none">{tile.letter}</span>
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-stone-700 text-stone-200 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                </span>
              </button>
            ))
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Backspace Button */}
          <button
            id="btn-backspace"
            type="button"
            disabled={selectedTiles.length === 0}
            onClick={() => {
              if (selectedTiles.length > 0) {
                onRemoveTile(selectedTiles[selectedTiles.length - 1].id);
              }
            }}
            className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-stone-800 text-stone-300 hover:bg-stone-700 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition"
            title="Backspace"
          >
            <Delete className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Clear Button */}
          <button
            id="btn-clear-tray"
            type="button"
            disabled={selectedTiles.length === 0}
            onClick={onClearTray}
            className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-stone-800 text-stone-300 hover:bg-stone-700 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition"
            title="Clear all letters"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Submit Button */}
          <button
            id="btn-submit-word"
            type="button"
            disabled={!isWordValid}
            onClick={onSubmitWord}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-bold flex items-center gap-1 sm:gap-1.5 transition active:scale-95 shadow-md ${
              isWordValid
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer ring-2 ring-emerald-400/50'
                : 'bg-stone-800 text-stone-500 cursor-not-allowed opacity-50'
            }`}
            title="Submit Word (or swipe up)"
          >
            <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
            <span className="hidden sm:inline text-sm">Submit</span>
          </button>
        </div>
      </div>

      {/* Dynamic Error or Instruction Notice */}
      {errorMessage && (
        <div className="text-center text-xs font-semibold text-rose-400 py-0.5 animate-bounce">
          {errorMessage}
        </div>
      )}
    </div>
  );
};
