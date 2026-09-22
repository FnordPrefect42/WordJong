export interface MahjongTile {
  id: string;
  letter: string;
  points: number; // Scrabble letter value for reference
  layer: number;  // 0 is bottom
  row: number;    // Grid row (half-steps or whole numbers)
  col: number;    // Grid column
  width: number;  // Standard 2
  height: number; // Standard 2
  isRemoved: boolean;
}

export interface SubmittedWord {
  id: string;
  word: string;
  points: number;
  tileIds: string[];
  timestamp: number;
}

export interface GameState {
  dateKey: string;
  tiles: MahjongTile[];
  freeTileIdsAtTurnStart: string[];
  selectedTileIds: string[]; // Order of tiles in word tray
  submittedWords: SubmittedWord[];
  score: number;
  hintTileIds: string[];
  hintMessage: string | null;
  history: GameHistoryStep[];
  isCompleted: boolean;
  startTime: number;
}

export interface GameHistoryStep {
  word: SubmittedWord;
  previousScore: number;
  tileIds: string[];
}
