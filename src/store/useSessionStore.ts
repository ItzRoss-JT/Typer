/*
 * In-flight session state — lives in memory only, not persisted.
 * Wraps engine/session.ts with React-friendly access.
 */
import { create } from 'zustand';
import {
  abort as engineAbort,
  autoSkip as engineAutoSkip,
  createSession,
  durationMs as engineDuration,
  finish as engineFinish,
  pause as enginePause,
  recordKeystroke as engineRecord,
  resume as engineResume,
  start as engineStart,
  type SessionState,
} from '../engine/session';
import type { SessionMode, SessionResult } from '../types';
import { computeAccuracy, computeConsistency, computeWpm } from '../engine/metrics';
import { errorTotalsFor } from '../engine/weakness';

interface SessionStore {
  session: SessionState | null;
  begin: (mode: SessionMode, sourceId: string, target: string) => void;
  start: () => void;
  recordKey: (input: string) => void;
  /** Used by code mode to auto-advance through leading whitespace. */
  autoSkip: (isSkippable: (target: string, i: number) => boolean) => void;
  pause: () => void;
  resume: () => void;
  abort: () => void;
  /** Stops the session manually (e.g. timer hits zero). */
  finish: () => void;
  /** Returns a SessionResult snapshot for persisting. */
  snapshotResult: () => SessionResult | null;
  /** Clears the in-memory session (after persisting or aborting). */
  clear: () => void;
}

export const useSessionStore = create<SessionStore>((set, get) => ({
  session: null,

  begin: (mode, sourceId, target) => {
    set({ session: createSession(mode, sourceId, target) });
  },

  start: () => {
    const s = get().session;
    if (!s) return;
    set({ session: engineStart(s) });
  },

  recordKey: (input) => {
    const s = get().session;
    if (!s) return;
    set({ session: engineRecord(s, input) });
  },

  autoSkip: (isSkippable) => {
    const s = get().session;
    if (!s) return;
    set({ session: engineAutoSkip(s, isSkippable) });
  },

  pause: () => {
    const s = get().session;
    if (!s) return;
    set({ session: enginePause(s) });
  },

  resume: () => {
    const s = get().session;
    if (!s) return;
    set({ session: engineResume(s) });
  },

  abort: () => {
    const s = get().session;
    if (!s) return;
    set({ session: engineAbort(s) });
  },

  finish: () => {
    const s = get().session;
    if (!s) return;
    set({ session: engineFinish(s) });
  },

  snapshotResult: () => {
    const s = get().session;
    if (!s || s.status === 'idle') return null;
    const duration = engineDuration(s);
    const totalCharsTyped = s.keystrokes.length;
    const uncorrectedErrors = s.keystrokes.reduce((n, k) => n + (k.correct ? 0 : 1), 0);
    const { wpm, rawWpm } = computeWpm(totalCharsTyped, uncorrectedErrors, duration);
    const accuracy = computeAccuracy(s.keystrokes);
    const consistency = computeConsistency(s.keystrokes);
    const errorTotals = errorTotalsFor(s.keystrokes);
    return {
      id: cryptoRandomId(),
      mode: s.mode,
      sourceId: s.sourceId,
      startedAt: s.startedAtWallClock,
      durationMs: duration,
      wpm,
      rawWpm,
      accuracy,
      consistency,
      keystrokes: s.keystrokes,
      ...errorTotals,
    };
  },

  clear: () => set({ session: null }),
}));

function cryptoRandomId(): string {
  // crypto.randomUUID is widely available in modern browsers and Node 19+.
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  // Fallback: 10 hex chars from Math.random (not unique under attack — fine here).
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}
