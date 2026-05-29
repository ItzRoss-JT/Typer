/*
 * Shared type contract for the whole app. The spec §4 is the source of
 * truth — if anything here drifts from §4, fix this file, not the spec.
 */

export type FingerId =
  | 'L_PINKY'
  | 'L_RING'
  | 'L_MIDDLE'
  | 'L_INDEX'
  | 'R_INDEX'
  | 'R_MIDDLE'
  | 'R_RING'
  | 'R_PINKY'
  | 'THUMB';

export type KeyboardLayout = 'qwerty'; // v1 only — extensible for Colemak/Dvorak later

export interface Keystroke {
  expected: string;
  actual: string;
  correct: boolean;
  /** ms since session start (from performance.now()) */
  timestamp: number;
  /** ms since the previous keystroke (clamped ≥ 1) */
  msSincePrevious: number;
}

export type SessionMode = 'lesson' | 'practice' | 'code' | 'drill';

export interface SessionResult {
  id: string;
  mode: SessionMode;
  /** Lesson id, quote id, snippet id, or 'adaptive' */
  sourceId: string;
  /** Unix ms when the session started */
  startedAt: number;
  durationMs: number;
  /** Net WPM (errors penalized) — the primary number we display */
  wpm: number;
  /** Gross WPM */
  rawWpm: number;
  /** 0..1 */
  accuracy: number;
  /** 0..1, derived from stddev of inter-key intervals */
  consistency: number;
  keystrokes: Keystroke[];
  errorsByKey: Record<string, number>;
  /** Bigram key e.g. "th", "ng" — lowercase letters only */
  errorsByBigram: Record<string, number>;
}

export interface KeyStats {
  key: string;
  attempts: number;
  errors: number;
  /** 0..1 */
  accuracy: number;
  /** Average ms between this key and the previous one (rhythm) */
  avgMsBetween: number;
}

export interface BigramStats {
  errors: number;
  attempts: number;
}

export interface UserProgress {
  schemaVersion: number;
  lessonsCompleted: Record<
    string,
    { firstClearedAt: number; bestWpm: number; bestAccuracy: number }
  >;
  history: SessionResult[];
  streak: {
    current: number;
    longest: number;
    /** ISO date YYYY-MM-DD in user's local tz */
    lastPracticedDate: string;
    /** Minutes accumulated for today, used to evaluate "day counted" */
    todayMinutes: number;
  };
  badgesEarned: string[];
  weakness: {
    perKey: Record<string, KeyStats>;
    perBigram: Record<string, BigramStats>;
    lastComputedAt: number;
  };
}

export interface UserSettings {
  schemaVersion: number;
  /** Default 10 */
  dailyGoalMinutes: number;
  /** Default false */
  soundEnabled: boolean;
  /** Default true */
  showKeyboard: boolean;
  /** Default true */
  highlightNextKey: boolean;
  /** Default true */
  showFingerColors: boolean;
  /** Default 'auto' */
  theme: 'light' | 'dark' | 'auto';
  /** 0..1, default 0.95 — gate for unlocking the next lesson */
  accuracyGate: number;
  layout: KeyboardLayout;
  /** Default 60 — seconds for free practice */
  defaultPracticeSeconds: 15 | 30 | 60 | 120;
  /** True after the user finishes /onboarding */
  onboardingCompleted: boolean;
}

export interface Lesson {
  id: string;
  unit: number;
  order: number;
  title: string;
  description: string;
  introducesKeys: string[];
  drills: string[];
  prerequisites: string[];
}

export interface Quote {
  id: string;
  text: string;
  attribution?: string;
}

export type CodeLanguage = 'javascript' | 'typescript' | 'python';

export interface CodeSnippet {
  id: string;
  language: CodeLanguage;
  title: string;
  code: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  /** Pure function over UserProgress. Returns true → badge unlocks. */
  unlocksWhen: (progress: UserProgress) => boolean;
}
