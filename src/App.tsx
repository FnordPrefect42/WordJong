import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MahjongTile, GameState, GameHistoryStep, SubmittedWord } from './types.ts';
import { generateDailyBoard, getTodayDateKey } from './utils/dailyGenerator.ts';
import {
  getFreeTileIds,
  calculateWordPoints,
  findHintTileIds,
} from './utils/mahjongRules.ts';
import { isValidWord } from './data/dictionary.ts';
import {
  saveGameState,
  loadGameState,
  clearGameState,
  loadPlayerStats,
  recordGameFinished,
  PlayerStats,
} from './utils/storage.ts';
import { Header } from './components/Header.tsx';
import { Board } from './components/Board.tsx';
import { WordTray } from './components/WordTray.tsx';
import { RulesModal } from './components/RulesModal.tsx';
import { StatsModal } from './components/StatsModal.tsx';
import { WinModal } from './components/WinModal.tsx';

export default function App() {
  const dateKey = useMemo(() => getTodayDateKey(), []);

  // Main game state
  const [tiles, setTiles] = useState<MahjongTile[]>([]);
  const [freeTileIdsAtTurnStart, setFreeTileIdsAtTurnStart] = useState<string[]>([]);
  const [selectedTileIds, setSelectedTileIds] = useState<string[]>([]);
  const [submittedWords, setSubmittedWords] = useState<SubmittedWord[]>([]);
  const [score, setScore] = useState<number>(0);
  const [history, setHistory] = useState<GameHistoryStep[]>([]);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Hints & feedback
  const [hintTileIds, setHintTileIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);
  const [isStatsOpen, setIsStatsOpen] = useState<boolean>(false);
  const [isWinOpen, setIsWinOpen] = useState<boolean>(false);
  const [stats, setStats] = useState<PlayerStats>(loadPlayerStats());

  // Show toast notification
  const showToast = useCallback((msg: string, durationMs: number = 3000) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, durationMs);
  }, []);

  // Initialize or load game
  useEffect(() => {
    const saved = loadGameState(dateKey);
    if (saved && saved.tiles && saved.tiles.length === 72) {
      setTiles(saved.tiles);
      setSelectedTileIds([]);
      setSubmittedWords(saved.submittedWords || []);
      setScore(saved.score || 0);
      setHistory(saved.history || []);
      setIsCompleted(saved.isCompleted || false);

      const active = saved.tiles.filter((t) => !t.isRemoved);
      const free = getFreeTileIds(active);
      setFreeTileIdsAtTurnStart(free);
      if (saved.isCompleted) {
        setIsWinOpen(true);
      }
    } else {
      // Generate fresh daily board
      const newTiles = generateDailyBoard(dateKey);
      setTiles(newTiles);
      setSelectedTileIds([]);
      setSubmittedWords([]);
      setScore(0);
      setHistory([]);
      setIsCompleted(false);

      const free = getFreeTileIds(newTiles);
      setFreeTileIdsAtTurnStart(free);
    }
  }, [dateKey]);

  // Persist state whenever meaningful values change
  useEffect(() => {
    if (tiles.length === 0) return;
    const currentState: GameState = {
      dateKey,
      tiles,
      freeTileIdsAtTurnStart,
      selectedTileIds,
      submittedWords,
      score,
      hintTileIds: [],
      hintMessage: null,
      history,
      isCompleted,
      startTime: Date.now(),
    };
    saveGameState(currentState);
  }, [tiles, freeTileIdsAtTurnStart, selectedTileIds, submittedWords, score, history, isCompleted, dateKey]);

  // Active free tiles at start of turn
  const remainingTiles = useMemo(() => tiles.filter((t) => !t.isRemoved), [tiles]);
  const remainingCount = remainingTiles.length;

  // Selected tiles objects in tray order
  const selectedTiles = useMemo(() => {
    const tileMap = new Map(tiles.map((t) => [t.id, t]));
    return selectedTileIds
      .map((id) => tileMap.get(id))
      .filter((t): t is MahjongTile => Boolean(t));
  }, [selectedTileIds, tiles]);

  // Handle tile tap on board
  const handleTileClick = useCallback(
    (tile: MahjongTile) => {
      if (tile.isRemoved) return;

      // Check if already in tray: if so, do nothing (or player can tap in tray to return)
      if (selectedTileIds.includes(tile.id)) {
        return;
      }

      // Turn Rule: Must be free at the beginning of the turn
      if (!freeTileIdsAtTurnStart.includes(tile.id)) {
        showToast('Tile is blocked! Only letters free at the start of your turn can be played.');
        return;
      }

      // Add to tray
      setSelectedTileIds((prev) => [...prev, tile.id]);

      // Clear hint if player selected a hinted tile
      if (hintTileIds.includes(tile.id)) {
        setHintTileIds((prev) => prev.filter((id) => id !== tile.id));
      }
    },
    [freeTileIdsAtTurnStart, selectedTileIds, hintTileIds, showToast]
  );

  // Handle removing a tile from the tray
  const handleRemoveTileFromTray = useCallback((tileId: string) => {
    setSelectedTileIds((prev) => prev.filter((id) => id !== tileId));
  }, []);

  // Clear active word tray
  const handleClearTray = useCallback(() => {
    setSelectedTileIds([]);
    setToastMessage(null);
  }, []);

  // Submit word (via Submit button or Swipe UP)
  const handleSubmitWord = useCallback(() => {
    const word = selectedTiles.map((t) => t.letter).join('');

    if (word.length < 4) {
      showToast('Words must be at least 4 letters long.');
      return;
    }

    if (!isValidWord(word)) {
      showToast(`"${word}" is not recognized in the dictionary.`);
      return;
    }

    const wordPoints = calculateWordPoints(word);
    const submittedItem: SubmittedWord = {
      id: `word-${Date.now()}`,
      word,
      points: wordPoints,
      tileIds: [...selectedTileIds],
      timestamp: Date.now(),
    };

    // Record for Undo
    const historyStep: GameHistoryStep = {
      word: submittedItem,
      previousScore: score,
      tileIds: [...selectedTileIds],
    };

    // Mark tiles as removed
    const removedSet = new Set(selectedTileIds);
    const updatedTiles = tiles.map((t) =>
      removedSet.has(t.id) ? { ...t, isRemoved: true } : t
    );

    const newScore = score + wordPoints;
    const newWords = [...submittedWords, submittedItem];
    const newHistory = [...history, historyStep];

    setTiles(updatedTiles);
    setScore(newScore);
    setSubmittedWords(newWords);
    setHistory(newHistory);
    setSelectedTileIds([]);
    setHintTileIds([]);

    showToast(`+${wordPoints} pt${wordPoints > 1 ? 's' : ''}! "${word}" submitted.`, 2000);

    // Compute new free tiles for the next turn
    const active = updatedTiles.filter((t) => !t.isRemoved);
    const newFree = getFreeTileIds(active);
    setFreeTileIdsAtTurnStart(newFree);

    // Check for board clearance / win!
    if (active.length === 0) {
      setIsCompleted(true);
      setIsWinOpen(true);
      const updatedStats = recordGameFinished(newScore, newWords.length, dateKey);
      setStats(updatedStats);
    }
  }, [selectedTiles, selectedTileIds, score, history, tiles, submittedWords, dateKey, showToast]);

  // Undo last submitted word
  const handleUndo = useCallback(() => {
    if (history.length === 0) return;

    const lastStep = history[history.length - 1];
    const restoredTileIds = new Set(lastStep.tileIds);

    const updatedTiles = tiles.map((t) =>
      restoredTileIds.has(t.id) ? { ...t, isRemoved: false } : t
    );

    const updatedHistory = history.slice(0, -1);
    const updatedWords = submittedWords.slice(0, -1);
    const updatedScore = lastStep.previousScore;

    setTiles(updatedTiles);
    setScore(updatedScore);
    setSubmittedWords(updatedWords);
    setHistory(updatedHistory);
    setSelectedTileIds([]);
    setHintTileIds([]);
    setIsCompleted(false);

    // Recompute free tiles for start of turn
    const active = updatedTiles.filter((t) => !t.isRemoved);
    const newFree = getFreeTileIds(active);
    setFreeTileIdsAtTurnStart(newFree);

    showToast(`Undid word "${lastStep.word.word}". Tiles returned.`, 2500);
  }, [history, tiles, submittedWords, showToast]);

  // Reset today's puzzle
  const handleReset = useCallback(() => {
    if (
      submittedWords.length > 0 &&
      !window.confirm("Restart today's puzzle? Your current board progress will be reset.")
    ) {
      return;
    }

    clearGameState(dateKey);
    const newTiles = generateDailyBoard(dateKey);
    setTiles(newTiles);
    setSelectedTileIds([]);
    setSubmittedWords([]);
    setScore(0);
    setHistory([]);
    setIsCompleted(false);
    setHintTileIds([]);

    const free = getFreeTileIds(newTiles);
    setFreeTileIdsAtTurnStart(free);
    showToast("Today's puzzle has been reset.", 2000);
  }, [dateKey, submittedWords.length, showToast]);

  // Level 1 Hint System:
  // "6. Level 1" -> Highlights free tiles that can form a valid word, leaving player to discover it
  const handleHint = useCallback(() => {
    const activeTiles = tiles.filter((t) => !t.isRemoved);
    const freeTiles = activeTiles.filter((t) => freeTileIdsAtTurnStart.includes(t.id));

    const result = findHintTileIds(freeTiles);
    if (result) {
      setHintTileIds(result.tileIds);
      showToast(
        `Hint: Highlighted ${result.tileIds.length} free tiles can form a valid word!`,
        5000
      );
    } else {
      showToast(
        'No 4+ letter words found with currently free tiles. Try using Undo or Resetting!',
        4000
      );
    }
  }, [tiles, freeTileIdsAtTurnStart, showToast]);

  return (
    <div className="min-h-screen bg-[#0d1612] text-stone-100 flex flex-col justify-between p-2 sm:p-4 select-none">
      {/* Top Header & Stats */}
      <Header
        dateKey={dateKey}
        score={score}
        remainingTilesCount={remainingCount}
        totalTilesCount={72}
        canUndo={history.length > 0}
        onHint={handleHint}
        onUndo={handleUndo}
        onReset={handleReset}
        onOpenRules={() => setIsRulesOpen(true)}
        onOpenStats={() => setIsStatsOpen(true)}
      />

      {/* Main Mahjong Solitaire Board */}
      <main className="w-full max-w-5xl mx-auto flex-1 flex flex-col my-2 sm:my-3">
        <Board
          tiles={tiles}
          freeTileIds={freeTileIdsAtTurnStart}
          selectedTileIds={selectedTileIds}
          hintTileIds={hintTileIds}
          onTileClick={handleTileClick}
        />
      </main>

      {/* Bottom Word Tray with Option B Swipe Controls */}
      <footer className="w-full">
        <WordTray
          selectedTiles={selectedTiles}
          onRemoveTile={handleRemoveTileFromTray}
          onSubmitWord={handleSubmitWord}
          onClearTray={handleClearTray}
          errorMessage={toastMessage}
        />
      </footer>

      {/* Modals */}
      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />
      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        stats={stats}
        submittedWords={submittedWords}
        currentScore={score}
      />
      <WinModal
        isOpen={isWinOpen}
        score={score}
        submittedWords={submittedWords}
        dateKey={dateKey}
        onPlayAgain={handleReset}
        onClose={() => setIsWinOpen(false)}
      />
    </div>
  );
}
