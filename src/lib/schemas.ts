/*
 * Zod schemas for persisted data and JSON imports.
 *
 * These schemas are the only trust boundary for data flowing into the app
 * from outside the running process — JSON imports from disk, and reads from
 * IndexedDB (which the user can edit via DevTools). Anything that touches
 * those surfaces must validate through here, not eyeball the shape.
 *
 * The schemas intentionally do NOT enforce semantic invariants (e.g. WPM
 * within human range, accuracy ≤ 1.0) at the schema level — the import flow
 * does an additional sanity sweep on top, see exportImport.ts.
 */
import { z } from 'zod';

// Generous but finite caps. Anything past these is either corruption or abuse.
const MAX_KEYSTROKES_PER_SESSION = 50_000;
const MAX_SESSIONS = 10_000;
const MAX_LESSON_ID = 200;
const UUID_OR_LIKE = /^[A-Za-z0-9_-]{1,128}$/;

const finite = () => z.number().finite();
const nonNeg = () => finite().nonnegative();
const ratio01 = () => finite().min(0).max(1);

const KeystrokeSchema = z.object({
  expected: z.string().max(8),
  actual: z.string().max(8),
  correct: z.boolean(),
  timestamp: nonNeg(),
  msSincePrevious: nonNeg(),
});

const SessionResultSchema = z.object({
  id: z.string().regex(UUID_OR_LIKE),
  mode: z.enum(['lesson', 'practice', 'code', 'drill']),
  sourceId: z.string().max(MAX_LESSON_ID),
  startedAt: nonNeg(),
  durationMs: nonNeg(),
  wpm: nonNeg(),
  rawWpm: nonNeg(),
  accuracy: ratio01(),
  consistency: ratio01(),
  keystrokes: z.array(KeystrokeSchema).max(MAX_KEYSTROKES_PER_SESSION),
  errorsByKey: z.record(z.string().max(8), nonNeg()),
  errorsByBigram: z.record(z.string().max(8), nonNeg()),
});

const KeyStatsSchema = z.object({
  key: z.string().max(8),
  attempts: nonNeg(),
  errors: nonNeg(),
  accuracy: ratio01(),
  avgMsBetween: nonNeg(),
});

const BigramStatsSchema = z.object({
  errors: nonNeg(),
  attempts: nonNeg(),
});

export const UserProgressSchema = z.object({
  schemaVersion: z.number().int().nonnegative(),
  lessonsCompleted: z.record(
    z.string().max(MAX_LESSON_ID),
    z.object({
      firstClearedAt: nonNeg(),
      bestWpm: nonNeg(),
      bestAccuracy: ratio01(),
    }),
  ),
  history: z.array(SessionResultSchema).max(MAX_SESSIONS),
  streak: z.object({
    current: z.number().int().nonnegative(),
    longest: z.number().int().nonnegative(),
    lastPracticedDate: z.string().max(32),
    todayMinutes: nonNeg(),
  }),
  badgesEarned: z.array(z.string().max(MAX_LESSON_ID)).max(1000),
  weakness: z.object({
    perKey: z.record(z.string().max(8), KeyStatsSchema),
    perBigram: z.record(z.string().max(8), BigramStatsSchema),
    lastComputedAt: nonNeg(),
  }),
});

export const UserSettingsSchema = z.object({
  schemaVersion: z.number().int().nonnegative(),
  dailyGoalMinutes: z.number().int().min(1).max(720),
  soundEnabled: z.boolean(),
  showKeyboard: z.boolean(),
  highlightNextKey: z.boolean(),
  showFingerColors: z.boolean(),
  theme: z.enum(['light', 'dark', 'auto']),
  accuracyGate: ratio01(),
  layout: z.literal('qwerty'),
  defaultPracticeSeconds: z.union([
    z.literal(15),
    z.literal(30),
    z.literal(60),
    z.literal(120),
  ]),
  onboardingCompleted: z.boolean(),
});

export const BundleSchema = z.object({
  app: z.literal('typer'),
  exportedAt: nonNeg(),
  // Bundle-level data-integrity tag. Future server-side leaderboards (if any)
  // can refuse to upload anything with a missing or stale value here.
  dataIntegrityVersion: z.number().int().nonnegative().optional(),
  progress: UserProgressSchema,
  settings: UserSettingsSchema,
});

export type Bundle = z.infer<typeof BundleSchema>;

export const IMPORT_MAX_BYTES = 5 * 1024 * 1024;
export const IMPORT_MAX_KEYSTROKES = MAX_KEYSTROKES_PER_SESSION;
export const IMPORT_MAX_SESSIONS = MAX_SESSIONS;

// Bumped when we introduce semantic checks (e.g. impossible WPM) that older
// exports wouldn't have known to encode. Kept low for now.
export const CURRENT_DATA_INTEGRITY_VERSION = 1;

/** Human-readable summary of a validated bundle for the import-confirm modal. */
export interface BundleSummary {
  exportedAt: number;
  sessionCount: number;
  earliestSessionAt: number | null;
  latestSessionAt: number | null;
  lessonsCleared: number;
  badges: number;
  totalKeystrokes: number;
}

export function summarizeBundle(b: Bundle): BundleSummary {
  const sessions = b.progress.history;
  let earliest: number | null = null;
  let latest: number | null = null;
  let keystrokes = 0;
  for (const s of sessions) {
    if (earliest === null || s.startedAt < earliest) earliest = s.startedAt;
    if (latest === null || s.startedAt > latest) latest = s.startedAt;
    keystrokes += s.keystrokes.length;
  }
  return {
    exportedAt: b.exportedAt,
    sessionCount: sessions.length,
    earliestSessionAt: earliest,
    latestSessionAt: latest,
    lessonsCleared: Object.keys(b.progress.lessonsCompleted).length,
    badges: b.progress.badgesEarned.length,
    totalKeystrokes: keystrokes,
  };
}
