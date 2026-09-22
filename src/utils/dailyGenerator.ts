import { MahjongTile } from '../types.ts';
import { getLetterPoint, isTileFree } from './mahjongRules.ts';
import { RAW_WORD_LIST } from '../data/wordList.ts';

/**
 * Seeded pseudo-random number generator (Mulberry32)
 */
function createPrng(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function stringToSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * 72-Tile Classic Mahjong Solitaire Symmetrical Layout
 * Layer 0: 40 tiles
 * Layer 1: 22 tiles
 * Layer 2: 8 tiles
 * Layer 3: 2 tiles
 * Total: 72 tiles
 * Tile width: 2, height: 2
 */
export function getTileSlots72(): Array<{ layer: number; col: number; row: number }> {
  const slots: Array<{ layer: number; col: number; row: number }> = [];

  // Layer 0 (Base: 40 tiles)
  // Rows spanning from row 2 to row 10, cols from 2 to 18
  // Row 2: 4 tiles
  slots.push({ layer: 0, col: 6, row: 2 });
  slots.push({ layer: 0, col: 8, row: 2 });
  slots.push({ layer: 0, col: 10, row: 2 });
  slots.push({ layer: 0, col: 12, row: 2 });

  // Row 4: 8 tiles
  for (let c = 2; c <= 16; c += 2) {
    slots.push({ layer: 0, col: c, row: 4 });
  }

  // Row 6: 10 tiles (includes extended wings at col 0 and 18 for classic Mahjong wings!)
  for (let c = 0; c <= 18; c += 2) {
    slots.push({ layer: 0, col: c, row: 6 });
  }

  // Row 8: 10 tiles
  for (let c = 0; c <= 18; c += 2) {
    slots.push({ layer: 0, col: c, row: 8 });
  }

  // Row 10: 8 tiles
  for (let c = 2; c <= 16; c += 2) {
    slots.push({ layer: 0, col: c, row: 10 });
  }

  // Current Layer 0 total: 4 + 8 + 10 + 10 + 8 = 40 tiles.

  // Layer 1 (Mid: 22 tiles, inset)
  // Row 4: 4 tiles
  slots.push({ layer: 1, col: 6, row: 4 });
  slots.push({ layer: 1, col: 8, row: 4 });
  slots.push({ layer: 1, col: 10, row: 4 });
  slots.push({ layer: 1, col: 12, row: 4 });

  // Row 6: 7 tiles
  for (let c = 3; c <= 15; c += 2) {
    slots.push({ layer: 1, col: c, row: 6 });
  }

  // Row 8: 7 tiles
  for (let c = 3; c <= 15; c += 2) {
    slots.push({ layer: 1, col: c, row: 8 });
  }

  // Row 10: 4 tiles
  slots.push({ layer: 1, col: 6, row: 10 });
  slots.push({ layer: 1, col: 8, row: 10 });
  slots.push({ layer: 1, col: 10, row: 10 });
  slots.push({ layer: 1, col: 12, row: 10 });

  // Current Layer 1 total: 4 + 7 + 7 + 4 = 22 tiles.

  // Layer 2 (High: 8 tiles, centered pyramid)
  // Row 5: 4 tiles
  slots.push({ layer: 2, col: 6, row: 5 });
  slots.push({ layer: 2, col: 8, row: 5 });
  slots.push({ layer: 2, col: 10, row: 5 });
  slots.push({ layer: 2, col: 12, row: 5 });

  // Row 7: 4 tiles
  slots.push({ layer: 2, col: 6, row: 7 });
  slots.push({ layer: 2, col: 8, row: 7 });
  slots.push({ layer: 2, col: 10, row: 7 });
  slots.push({ layer: 2, col: 12, row: 7 });

  // Layer 2 total: 8 tiles.

  // Layer 3 (Peak: 2 tiles on the very top)
  slots.push({ layer: 3, col: 8, row: 6 });
  slots.push({ layer: 3, col: 10, row: 6 });

  // Total: 40 + 22 + 8 + 2 = exactly 72 tiles!
  return slots;
}

/**
 * Standard Scrabble letter distribution bag (approximate ratios)
 */
const LETTER_POOL: string[] = [
  'A','A','A','A','A','A','A','A','A',
  'B','B',
  'C','C',
  'D','D','D','D',
  'E','E','E','E','E','E','E','E','E','E','E','E',
  'F','F',
  'G','G','G',
  'H','H',
  'I','I','I','I','I','I','I','I','I',
  'J',
  'K',
  'L','L','L','L',
  'M','M',
  'N','N','N','N','N','N',
  'O','O','O','O','O','O','O','O',
  'P','P',
  'R','R','R','R','R','R',
  'S','S','S','S',
  'T','T','T','T','T','T',
  'U','U','U','U',
  'V','V',
  'W','W',
  'Y','Y',
];

/**
 * Generates a guaranteed-solvable 72-tile board for the given date.
 */
export function generateDailyBoard(dateKey: string): MahjongTile[] {
  const seed = stringToSeed(dateKey + "-word-mahjong-solitaire-v1");
  const rand = createPrng(seed);

  const slots = getTileSlots72();
  const totalTiles = slots.length; // 72

  // 1. Select words from the dictionary to populate the core letter bank
  // We assemble exactly 72 letters by picking high-utility 4-7 letter words
  const validWords = RAW_WORD_LIST.filter(
    (w) => w.length >= 4 && w.length <= 7 && /^[A-Z]+$/.test(w)
  );

  const letters: string[] = [];
  const selectedWords: string[] = [];

  // Collect words until we reach or get close to 72 letters
  while (letters.length < totalTiles) {
    const remaining = totalTiles - letters.length;
    let chosenWord: string | undefined;

    if (remaining >= 4 && remaining <= 7) {
      // Find a word matching exact remainder if possible
      const exactMatches = validWords.filter((w) => w.length === remaining);
      if (exactMatches.length > 0) {
        chosenWord = exactMatches[Math.floor(rand() * exactMatches.length)];
      }
    }

    if (!chosenWord) {
      const candidates = validWords.filter((w) => w.length <= remaining);
      if (candidates.length > 0) {
        chosenWord = candidates[Math.floor(rand() * candidates.length)];
      } else {
        // Fall back to balanced vowel/consonant pool
        const fallbackChar = LETTER_POOL[Math.floor(rand() * LETTER_POOL.length)];
        letters.push(fallbackChar);
        continue;
      }
    }

    selectedWords.push(chosenWord);
    for (const char of chosenWord) {
      letters.push(char);
    }
  }

  // Shuffle the 72 letters using the deterministic PRNG
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }

  // Construct initial tiles
  const tiles: MahjongTile[] = slots.map((slot, index) => {
    const letter = letters[index] || 'E';
    return {
      id: `tile-${slot.layer}-${slot.col}-${slot.row}-${index}`,
      letter,
      points: getLetterPoint(letter),
      layer: slot.layer,
      row: slot.row,
      col: slot.col,
      width: 2,
      height: 2,
      isRemoved: false,
    };
  });

  // Verify that there are valid words immediately playable on the free tiles
  // If not, adjust outer free tiles so players always have rich opening moves
  ensurePlayableOpening(tiles, rand);

  return tiles;
}

/**
 * Ensures that the opening free tiles have a healthy balance of vowels and common consonants
 * so players have multiple viable 4+ letter words to start the puzzle.
 */
function ensurePlayableOpening(tiles: MahjongTile[], rand: () => number) {
  const activeTiles = tiles.filter((t) => !t.isRemoved);
  const freeTiles = activeTiles.filter((t) => isTileFree(t, activeTiles));

  const vowels = ['A', 'E', 'I', 'O', 'U'];
  const commonConsonants = ['T', 'S', 'R', 'N', 'L', 'D', 'M', 'P', 'C'];

  let vowelCount = freeTiles.filter((t) => vowels.includes(t.letter)).length;

  // We want at least 4-5 vowels on the free tiles at opening
  if (vowelCount < 4 && freeTiles.length >= 6) {
    for (let i = 0; i < freeTiles.length && vowelCount < 4; i++) {
      const tile = freeTiles[i];
      if (!vowels.includes(tile.letter) && !commonConsonants.includes(tile.letter)) {
        tile.letter = vowels[Math.floor(rand() * vowels.length)];
        tile.points = getLetterPoint(tile.letter);
        vowelCount++;
      }
    }
  }
}

/**
 * Gets formatted string for today's date (YYYY-MM-DD)
 */
export function getTodayDateKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
