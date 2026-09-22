import { GameState } from '../types.ts';

const STORAGE_KEY_PREFIX = 'word_mahjong_solitaire_';
const STATS_KEY = `${STORAGE_KEY_PREFIX}stats`;

export interface PlayerStats {
  gamesPlayed: number;
  gamesCompleted: number;
  totalWordsSpelled: number;
  highestScore: number;
  lastPlayedDate: string;
}

export function saveGameState(state: GameState): void {
  try {
    const key = `${STORAGE_KEY_PREFIX}game_${state.dateKey}`;
    localStorage.setItem(key, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save game state to localStorage:', err);
  }
}

export function loadGameState(dateKey: string): GameState | null {
  try {
    const key = `${STORAGE_KEY_PREFIX}game_${dateKey}`;
    const data = localStorage.getItem(key);
    if (!data) return null;
    return JSON.parse(data) as GameState;
  } catch (err) {
    console.error('Failed to load game state from localStorage:', err);
    return null;
  }
}

export function clearGameState(dateKey: string): void {
  try {
    const key = `${STORAGE_KEY_PREFIX}game_${dateKey}`;
    localStorage.removeItem(key);
  } catch (err) {
    console.error('Failed to clear game state:', err);
  }
}

export function loadPlayerStats(): PlayerStats {
  try {
    const data = localStorage.getItem(STATS_KEY);
    if (data) {
      return JSON.parse(data) as PlayerStats;
    }
  } catch (err) {
    console.error('Failed to load player stats:', err);
  }
  return {
    gamesPlayed: 0,
    gamesCompleted: 0,
    totalWordsSpelled: 0,
    highestScore: 0,
    lastPlayedDate: '',
  };
}

export function recordGameFinished(score: number, wordsCount: number, dateKey: string): PlayerStats {
  const stats = loadPlayerStats();
  stats.gamesPlayed += 1;
  stats.gamesCompleted += 1;
  stats.totalWordsSpelled += wordsCount;
  if (score > stats.highestScore) {
    stats.highestScore = score;
  }
  stats.lastPlayedDate = dateKey;
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (err) {
    console.error('Failed to save player stats:', err);
  }
  return stats;
}
