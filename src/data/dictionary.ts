// Curated offline English word dictionary for 4+ letter words
// Covers high-frequency and common English words suitable for daily word puzzles.

import { RAW_WORD_LIST } from './wordList.ts';

const DICTIONARY_SET = new Set<string>();

// Populate dictionary in uppercase
for (const word of RAW_WORD_LIST) {
  if (word.length >= 4) {
    DICTIONARY_SET.add(word.toUpperCase().trim());
  }
}

export function isValidWord(word: string): boolean {
  if (!word || word.length < 4) return false;
  return DICTIONARY_SET.has(word.toUpperCase());
}

export function getDictionaryWords(): string[] {
  return Array.from(DICTIONARY_SET);
}

export function hasPrefix(prefix: string): boolean {
  const upper = prefix.toUpperCase();
  for (const w of DICTIONARY_SET) {
    if (w.startsWith(upper)) return true;
  }
  return false;
}
