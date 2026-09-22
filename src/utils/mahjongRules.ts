import { MahjongTile } from '../types.ts';
import { isValidWord, getDictionaryWords } from '../data/dictionary.ts';

/**
 * Checks if tile A is covered by any other tile on a higher layer.
 */
export function isTileCovered(target: MahjongTile, activeTiles: MahjongTile[]): boolean {
  for (const other of activeTiles) {
    if (other.id === target.id) continue;
    if (other.layer > target.layer) {
      // Check 2D bounding box intersection
      const hOverlap =
        target.col < other.col + other.width &&
        target.col + target.width > other.col;
      const vOverlap =
        target.row < other.row + other.height &&
        target.row + target.height > other.row;
      if (hOverlap && vOverlap) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Checks if tile A is blocked on its left side by an adjacent tile on the same layer.
 */
export function isTileBlockedLeft(target: MahjongTile, activeTiles: MahjongTile[]): boolean {
  for (const other of activeTiles) {
    if (other.id === target.id) continue;
    if (other.layer === target.layer) {
      // Must overlap vertically
      const vOverlap =
        target.row < other.row + other.height &&
        target.row + target.height > other.row;
      if (!vOverlap) continue;

      // Contact or overlap to the left: other tile's right edge meets or penetrates target's left edge
      const meetsLeft =
        Math.abs((other.col + other.width) - target.col) < 0.1 ||
        (other.col < target.col && other.col + other.width > target.col);

      if (meetsLeft) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Checks if tile A is blocked on its right side by an adjacent tile on the same layer.
 */
export function isTileBlockedRight(target: MahjongTile, activeTiles: MahjongTile[]): boolean {
  for (const other of activeTiles) {
    if (other.id === target.id) continue;
    if (other.layer === target.layer) {
      // Must overlap vertically
      const vOverlap =
        target.row < other.row + other.height &&
        target.row + target.height > other.row;
      if (!vOverlap) continue;

      // Contact or overlap to the right: other tile's left edge meets or penetrates target's right edge
      const meetsRight =
        Math.abs(other.col - (target.col + target.width)) < 0.1 ||
        (other.col > target.col && other.col < target.col + target.width);

      if (meetsRight) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Standard Mahjong Solitaire Rule:
 * A tile is FREE if:
 * 1. Nothing is resting on top of it.
 * 2. It is NOT blocked on BOTH left and right (i.e., at least one horizontal edge is open).
 */
export function isTileFree(target: MahjongTile, activeTiles: MahjongTile[]): boolean {
  if (target.isRemoved) return false;
  if (isTileCovered(target, activeTiles)) return false;

  const blockedLeft = isTileBlockedLeft(target, activeTiles);
  const blockedRight = isTileBlockedRight(target, activeTiles);

  // If blocked on both sides, it's not free
  if (blockedLeft && blockedRight) {
    return false;
  }

  return true;
}

/**
 * Computes all free tile IDs from a list of active tiles.
 */
export function getFreeTileIds(tiles: MahjongTile[]): string[] {
  const activeTiles = tiles.filter((t) => !t.isRemoved);
  return activeTiles.filter((t) => isTileFree(t, activeTiles)).map((t) => t.id);
}

/**
 * Letter points based on classic Scrabble values for display.
 */
export const SCRABBLE_POINTS: Record<string, number> = {
  A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2, H: 4, I: 1, J: 8, K: 5, L: 1, M: 3,
  N: 1, O: 1, P: 3, Q: 10, R: 1, S: 1, T: 1, U: 1, V: 4, W: 4, X: 8, Y: 4, Z: 10,
};

export function getLetterPoint(letter: string): number {
  return SCRABBLE_POINTS[letter.toUpperCase()] || 1;
}

/**
 * User Scoring Rule:
 * "1 point for 4 letter words, 2 for 5 letter words, 3 for 6, etc."
 * Points = length - 3 (minimum 4 letters)
 */
export function calculateWordPoints(word: string): number {
  if (word.length < 4) return 0;
  return word.length - 3;
}

/**
 * Finds a valid word that can be formed from the free tiles to power the Hint system.
 * Returns the matching tile IDs (without revealing the word itself).
 * Prefers familiar, common words first so hints are pleasant and natural.
 */
export function findHintTileIds(freeTiles: MahjongTile[]): { tileIds: string[]; word: string } | null {
  if (freeTiles.length < 4) return null;

  // Map available letters to their tile IDs and track counts
  const letterMap = new Map<string, MahjongTile[]>();
  for (const tile of freeTiles) {
    const l = tile.letter.toUpperCase();
    if (!letterMap.has(l)) letterMap.set(l, []);
    letterMap.get(l)!.push(tile);
  }

  const dictionary = getDictionaryWords();

  // Filter dictionary: length between 4 and min(7, freeTiles.length)
  // and all characters must exist in the letterMap
  const maxLen = Math.min(7, freeTiles.length);
  const eligibleWords: string[] = [];

  for (const word of dictionary) {
    if (word.length < 4 || word.length > maxLen) continue;
    let allCharsPresent = true;
    for (let i = 0; i < word.length; i++) {
      if (!letterMap.has(word[i])) {
        allCharsPresent = false;
        break;
      }
    }
    if (allCharsPresent) {
      eligibleWords.push(word);
    }
  }

  // Shuffle slightly or sort by length (prefer 4-5 letter accessible words)
  eligibleWords.sort((a, b) => a.length - b.length);

  for (const word of eligibleWords) {
    const usedCounts = new Map<string, number>();
    let canForm = true;

    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      const current = usedCounts.get(char) || 0;
      const available = letterMap.get(char)?.length || 0;
      if (current + 1 > available) {
        canForm = false;
        break;
      }
      usedCounts.set(char, current + 1);
    }

    if (canForm) {
      // Collect the specific tile IDs used
      const chosenTileIds: string[] = [];
      const tracker = new Map<string, number>();
      for (let i = 0; i < word.length; i++) {
        const char = word[i];
        const idx = tracker.get(char) || 0;
        const tile = letterMap.get(char)![idx];
        chosenTileIds.push(tile.id);
        tracker.set(char, idx + 1);
      }
      return { tileIds: chosenTileIds, word };
    }
  }

  return null;
}
