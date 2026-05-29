/*
 * Pure metric calculations. No React, no DOM.
 * Spec §5.1–5.3.
 */
import type { Keystroke } from '../types';

const CHARS_PER_WORD = 5; // Industry-standard "word" definition

export interface ComputedMetrics {
  wpm: number; // Net WPM
  rawWpm: number;
  accuracy: number; // 0..1
  consistency: number; // 0..1
}

/**
 * Net WPM penalizes uncorrected errors. Raw WPM does not.
 * `uncorrectedErrors` = positions where the final committed character was wrong.
 * The session model treats backspace-then-retype as: original counts as an error
 * (spec §5.2), but the retyped char is the one that's committed.
 *
 * For a session that completes its target string, `uncorrectedErrors` is typically
 * 0 (the user retyped everything correctly). The error penalty surfaces via the
 * accuracy number and the keystroke count.
 */
export function computeWpm(
  totalCharsTyped: number,
  uncorrectedErrors: number,
  durationMs: number,
): { wpm: number; rawWpm: number } {
  if (durationMs <= 0 || totalCharsTyped <= 0) {
    return { wpm: 0, rawWpm: 0 };
  }
  const minutes = durationMs / 60_000;
  const rawWpm = totalCharsTyped / CHARS_PER_WORD / minutes;
  const netWpm = Math.max(0, totalCharsTyped - uncorrectedErrors) / CHARS_PER_WORD / minutes;
  return {
    wpm: round1(netWpm),
    rawWpm: round1(rawWpm),
  };
}

/** Accuracy = correct first-attempt keystrokes / total keystrokes (§5.2). */
export function computeAccuracy(keystrokes: Keystroke[]): number {
  if (keystrokes.length === 0) return 1;
  const correct = keystrokes.reduce((n, k) => n + (k.correct ? 1 : 0), 0);
  return correct / keystrokes.length;
}

/**
 * Consistency derived from coefficient of variation of inter-key intervals.
 * Lower variation → higher consistency.
 * Returns 0..1, clamped (§5.3).
 */
export function computeConsistency(keystrokes: Keystroke[]): number {
  const intervals = keystrokes.map((k) => k.msSincePrevious).filter((ms) => ms > 0);
  if (intervals.length < 2) return 0;
  const mean = intervals.reduce((s, x) => s + x, 0) / intervals.length;
  if (mean === 0) return 0;
  const variance =
    intervals.reduce((s, x) => s + (x - mean) ** 2, 0) / intervals.length;
  const stdDev = Math.sqrt(variance);
  const cv = stdDev / mean;
  return clamp01(1 - cv);
}

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
