export type GameMode = 'HEADS_SET_GO' | 'SWIPE_CHARADES';

export type MovieEra = '90s' | '2000s' | 'latest' | 'mixed';

export interface Movie {
  id: string;
  title: string;
  era: '90s' | '2000s' | 'latest';
  clues: string[];
  year?: number;
  cast?: string;
}

export interface SessionResultDetails {
  itemName: string;
  secondaryInfo?: string; // e.g. era for movies
  status: 'correct' | 'skip';
  durationMs?: number;
}

export interface GameSession {
  sessionId: string;
  gameMode: GameMode;
  era?: MovieEra;
  durationSeconds: number;
  score: number;
  results: SessionResultDetails[];
  timestamp: number;
}
