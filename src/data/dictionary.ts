// Curated offline English word dictionary for 4+ letter words
// Uses comprehensive official word list (~275,000 English words) from an-array-of-english-words
// ensuring common words like GREEN, COLORS, PLURALS, and variants are all recognized.

import allEnglishWords from 'an-array-of-english-words';
import { RAW_WORD_LIST } from './wordList.ts';

const DICTIONARY_SET = new Set<string>();

// Populate dictionary with RAW_WORD_LIST
for (const word of RAW_WORD_LIST) {
  if (word.length >= 4) {
    DICTIONARY_SET.add(word.toUpperCase().trim());
  }
}

// Populate with comprehensive English dictionary (words 4 to 15 letters)
for (const word of allEnglishWords) {
  if (typeof word === 'string' && word.length >= 4 && word.length <= 15) {
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

