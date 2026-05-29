/*
 * Lightweight session state machine. Pure logic — UI layer wraps this in a
 * Zustand store. No React imports here.
 *
 * States: idle → active ⇄ paused → finished (or aborted).
 *
 * Model: every keystroke advances the index. A wrong keystroke is logged
 * with `correct: false` but still advances. Backspace steps the index back
 * by 1; the prior wrong keystroke STAYS in the log so it still counts as an
 * error (spec §13 — don't reward wipe-and-retry).
 */
import type { Keystroke, SessionMode } from '../types';

export type SessionStatus = 'idle' | 'active' | 'paused' | 'finished' | 'aborted';

export interface SessionState {
  status: SessionStatus;
  mode: SessionMode;
  sourceId: string;
  target: string;
  /** Position in `target` of the next character to type. */
  index: number;
  /** All committed keystrokes (correct or wrong). Backspace does NOT pop these. */
  keystrokes: Keystroke[];
  /** performance.now() when the session started. */
  startedAt: number;
  /** Unix ms when started (for persistence). */
  startedAtWallClock: number;
  /** ms total spent paused — subtracted from duration. */
  pausedAccumMs: number;
  /** performance.now() when most recent pause began. */
  pauseStartedAt: number | null;
  /** Last keystroke's performance.now() — used for msSincePrevious. */
  lastKeyAt: number;
}

export function createSession(mode: SessionMode, sourceId: string, target: string): SessionState {
  return {
    status: 'idle',
    mode,
    sourceId,
    target,
    index: 0,
    keystrokes: [],
    startedAt: 0,
    startedAtWallClock: 0,
    pausedAccumMs: 0,
    pauseStartedAt: null,
    lastKeyAt: 0,
  };
}

export function start(s: SessionState, now: number = performance.now()): SessionState {
  return {
    ...s,
    status: 'active',
    startedAt: now,
    startedAtWallClock: Date.now(),
    lastKeyAt: now,
  };
}

/**
 * Records a single character keystroke (one of: a printable char, or 'Backspace').
 * Returns a new state. Multi-char paste must be filtered upstream (anti-cheat).
 */
export function recordKeystroke(
  s: SessionState,
  input: string,
  now: number = performance.now(),
): SessionState {
  if (s.status !== 'active') return s;

  if (input === 'Backspace') {
    if (s.index === 0) return s;
    // Move the cursor back one. The keystroke log is unchanged — that error stays
    // recorded in accuracy math.
    return { ...s, index: s.index - 1, lastKeyAt: now };
  }

  if (input.length !== 1) return s;
  if (s.index >= s.target.length) return s;

  const expected = s.target[s.index];
  const correct = input === expected;
  const msSincePrevious = Math.max(1, now - s.lastKeyAt);

  const stroke: Keystroke = {
    expected,
    actual: input,
    correct,
    timestamp: now - s.startedAt,
    msSincePrevious,
  };

  const nextIndex = s.index + 1;
  const finished = nextIndex >= s.target.length;

  return {
    ...s,
    keystrokes: [...s.keystrokes, stroke],
    index: nextIndex,
    lastKeyAt: now,
    status: finished ? 'finished' : 'active',
  };
}

export function pause(s: SessionState, now: number = performance.now()): SessionState {
  if (s.status !== 'active') return s;
  return { ...s, status: 'paused', pauseStartedAt: now };
}

export function resume(s: SessionState, now: number = performance.now()): SessionState {
  if (s.status !== 'paused' || s.pauseStartedAt === null) return s;
  return {
    ...s,
    status: 'active',
    pausedAccumMs: s.pausedAccumMs + (now - s.pauseStartedAt),
    pauseStartedAt: null,
    // Don't credit pause-time to msSincePrevious on the next keystroke.
    lastKeyAt: now,
  };
}

export function abort(s: SessionState): SessionState {
  return { ...s, status: 'aborted' };
}

export function finish(s: SessionState): SessionState {
  return { ...s, status: 'finished' };
}

/** Active-time duration in ms (excludes paused time). */
export function durationMs(s: SessionState, now: number = performance.now()): number {
  const ref =
    s.status === 'paused' && s.pauseStartedAt !== null ? s.pauseStartedAt : now;
  return Math.max(0, ref - s.startedAt - s.pausedAccumMs);
}

/**
 * Used by code mode (§7.6): auto-advance through leading-whitespace runs so
 * the user only needs to type each line's first non-whitespace char. The
 * synthesized keystrokes are marked correct and don't affect rhythm because
 * we give them msSincePrevious = 1.
 *
 * `isSkippable` decides whether a given target position should be skipped.
 * Typical use: every position that is a space following a newline (or start
 * of string) up to the first non-space.
 */
export function autoSkip(
  s: SessionState,
  isSkippable: (target: string, i: number) => boolean,
): SessionState {
  if (s.status !== 'active') return s;
  let next = s;
  while (next.index < next.target.length && isSkippable(next.target, next.index)) {
    const ch = next.target[next.index];
    next = {
      ...next,
      keystrokes: [
        ...next.keystrokes,
        {
          expected: ch,
          actual: ch,
          correct: true,
          timestamp: next.lastKeyAt - next.startedAt,
          msSincePrevious: 1,
        },
      ],
      index: next.index + 1,
    };
  }
  if (next.index >= next.target.length) {
    next = { ...next, status: 'finished' };
  }
  return next;
}

/**
 * Precomputes a mask of positions that should be auto-skipped: a leading
 * whitespace run at the very start of the string, and any whitespace
 * immediately following a newline.
 */
export function makeLeadingSpaceSkipper(): (target: string, i: number) => boolean {
  return (target: string, i: number) => {
    const ch = target[i];
    if (ch !== ' ' && ch !== '\t') return false;
    // Walk back; only "skippable" if we are in a run that starts at the very
    // beginning OR after a newline.
    for (let j = i - 1; j >= 0; j--) {
      const c = target[j];
      if (c === ' ' || c === '\t') continue;
      return c === '\n';
    }
    return true; // start of string
  };
}
