/*
 * Per-key and per-bigram weakness tracking with exponential decay so
 * recent performance matters more than ancient sessions (§5.4).
 */
import type { KeyStats, BigramStats, Keystroke, SessionResult } from '../types';

/** Old data fades to 85% before merging new — tunable. */
export const DECAY = 0.85;

/** Minimum attempts before a key counts as a "real" weakness signal (avoids noise). */
export const MIN_ATTEMPTS = 20;

/**
 * Returns the bigram key for a position in the expected string, or null if
 * the position doesn't form a valid bigram (both chars must be ASCII letters).
 */
export function bigramAt(expected: string, i: number): string | null {
  if (i < 0 || i + 1 >= expected.length) return null;
  const a = expected[i].toLowerCase();
  const b = expected[i + 1].toLowerCase();
  if (!isLetter(a) || !isLetter(b)) return null;
  return a + b;
}

function isLetter(c: string): boolean {
  return c.length === 1 && c >= 'a' && c <= 'z';
}

/**
 * Computes per-key and per-bigram increments for a single session.
 * - Per key: attempts = every keystroke targeting that expected char;
 *           errors = wrong first attempts on that expected char.
 * - Per bigram: attempts = bigram positions visited (expected[i],expected[i+1]
 *               both letters); errors = the second keystroke wrong on first try
 *               with both expected chars letters. (We only credit the bigram
 *               attempt when the bigram position was actually typed past.)
 */
export function computeSessionDeltas(keystrokes: Keystroke[]): {
  perKey: Record<string, { attempts: number; errors: number }>;
  perBigram: Record<string, { attempts: number; errors: number }>;
} {
  const perKey: Record<string, { attempts: number; errors: number }> = {};
  const perBigram: Record<string, { attempts: number; errors: number }> = {};

  for (let i = 0; i < keystrokes.length; i++) {
    const k = keystrokes[i];
    const key = k.expected;
    if (!perKey[key]) perKey[key] = { attempts: 0, errors: 0 };
    perKey[key].attempts += 1;
    if (!k.correct) perKey[key].errors += 1;

    // Bigram only counts when both chars are letters and we have a prior keystroke
    // that targeted the previous expected char (i.e. we typed past index i-1).
    if (i > 0) {
      const prev = keystrokes[i - 1];
      const a = prev.expected.toLowerCase();
      const b = k.expected.toLowerCase();
      if (isLetter(a) && isLetter(b)) {
        const bg = a + b;
        if (!perBigram[bg]) perBigram[bg] = { attempts: 0, errors: 0 };
        perBigram[bg].attempts += 1;
        // We credit a bigram error if the second key was wrong on first try
        // (the most common touch-typing slip is mis-fingering the second of a pair).
        if (!k.correct) perBigram[bg].errors += 1;
      }
    }
  }
  return { perKey, perBigram };
}

/**
 * Applies decayed merge: existing * DECAY + new.
 * Pure — returns new state, doesn't mutate.
 */
export function mergeWeakness(
  existing: {
    perKey: Record<string, KeyStats>;
    perBigram: Record<string, BigramStats>;
  },
  deltas: ReturnType<typeof computeSessionDeltas>,
  rhythm?: Record<string, { sumMs: number; count: number }>,
): { perKey: Record<string, KeyStats>; perBigram: Record<string, BigramStats> } {
  const perKey: Record<string, KeyStats> = {};
  // Decay all existing keys first
  for (const [k, s] of Object.entries(existing.perKey)) {
    perKey[k] = {
      key: k,
      attempts: s.attempts * DECAY,
      errors: s.errors * DECAY,
      accuracy: 0, // recomputed below
      avgMsBetween: s.avgMsBetween,
    };
  }
  // Merge new
  for (const [k, d] of Object.entries(deltas.perKey)) {
    if (!perKey[k]) {
      perKey[k] = { key: k, attempts: 0, errors: 0, accuracy: 1, avgMsBetween: 0 };
    }
    perKey[k].attempts += d.attempts;
    perKey[k].errors += d.errors;
    if (rhythm && rhythm[k]) {
      const r = rhythm[k];
      perKey[k].avgMsBetween = r.sumMs / Math.max(1, r.count);
    }
  }
  // Finalize accuracy
  for (const k of Object.keys(perKey)) {
    perKey[k].accuracy = 1 - perKey[k].errors / Math.max(1, perKey[k].attempts);
  }

  const perBigram: Record<string, BigramStats> = {};
  for (const [bg, s] of Object.entries(existing.perBigram)) {
    perBigram[bg] = { attempts: s.attempts * DECAY, errors: s.errors * DECAY };
  }
  for (const [bg, d] of Object.entries(deltas.perBigram)) {
    if (!perBigram[bg]) perBigram[bg] = { attempts: 0, errors: 0 };
    perBigram[bg].attempts += d.attempts;
    perBigram[bg].errors += d.errors;
  }
  return { perKey, perBigram };
}

/** Per-key rhythm (avg ms between) for a session — fed to mergeWeakness. */
export function computeRhythm(
  keystrokes: Keystroke[],
): Record<string, { sumMs: number; count: number }> {
  const out: Record<string, { sumMs: number; count: number }> = {};
  for (const k of keystrokes) {
    if (k.msSincePrevious <= 0) continue;
    if (!out[k.expected]) out[k.expected] = { sumMs: 0, count: 0 };
    out[k.expected].sumMs += k.msSincePrevious;
    out[k.expected].count += 1;
  }
  return out;
}

/** Aggregates errorsByKey + errorsByBigram for storage on a SessionResult. */
export function errorTotalsFor(keystrokes: Keystroke[]): Pick<
  SessionResult,
  'errorsByKey' | 'errorsByBigram'
> {
  const errorsByKey: Record<string, number> = {};
  const errorsByBigram: Record<string, number> = {};
  for (let i = 0; i < keystrokes.length; i++) {
    const k = keystrokes[i];
    if (!k.correct) errorsByKey[k.expected] = (errorsByKey[k.expected] ?? 0) + 1;
    if (i > 0) {
      const a = keystrokes[i - 1].expected.toLowerCase();
      const b = k.expected.toLowerCase();
      if (isLetter(a) && isLetter(b) && !k.correct) {
        const bg = a + b;
        errorsByBigram[bg] = (errorsByBigram[bg] ?? 0) + 1;
      }
    }
  }
  return { errorsByKey, errorsByBigram };
}
