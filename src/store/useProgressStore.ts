/*
 * Progress store. The heavy one — owns history, weakness, streaks, lessons,
 * and badges. Persists asynchronously on every mutation.
 */
import { create } from 'zustand';
import { defaultProgress, loadProgress, saveProgress } from '../lib/db';
import type { SessionResult, UserProgress } from '../types';
import {
  computeRhythm,
  computeSessionDeltas,
  errorTotalsFor,
  mergeWeakness,
} from '../engine/weakness';
import { applyPracticeSession } from '../engine/streaks';
import { newlyUnlocked } from '../data/badges';

interface ProgressStore {
  progress: UserProgress;
  hydrated: boolean;
  /** Badge IDs unlocked by the most recent session — feeds the BadgeToast. */
  pendingBadges: string[];
  hydrate: () => Promise<void>;
  /**
   * Adds a completed session to history and recomputes weakness + streak.
   * Returns the new progress for callers that want to read it synchronously.
   */
  addSession: (result: SessionResult, dailyGoalMinutes: number) => UserProgress;
  /** Marks a lesson cleared if accuracy >= gate. */
  markLessonCleared: (lessonId: string, accuracy: number, wpm: number) => void;
  /** Award one or more badges; no-op if already earned. */
  awardBadges: (badgeIds: string[]) => string[];
  /** Clear the pending-badges queue (called by BadgeToast on dismiss). */
  clearPendingBadges: () => void;
  /** Replace the whole progress object (used by import). */
  replace: (p: UserProgress) => void;
}

export const useProgressStore = create<ProgressStore>((set, get) => ({
  progress: defaultProgress(),
  hydrated: false,
  pendingBadges: [],

  hydrate: async () => {
    const p = await loadProgress();
    set({ progress: p, hydrated: true });
  },

  addSession: (result, dailyGoalMinutes) => {
    const current = get().progress;

    // Update weakness with decay
    const deltas = computeSessionDeltas(result.keystrokes);
    const rhythm = computeRhythm(result.keystrokes);
    const weakness = mergeWeakness(
      { perKey: current.weakness.perKey, perBigram: current.weakness.perBigram },
      deltas,
      rhythm,
    );

    // Also annotate the result with errors-by-key/bigram from the keystrokes
    const errorTotals = errorTotalsFor(result.keystrokes);
    const enrichedResult: SessionResult = { ...result, ...errorTotals };

    // Update streak
    const minutes = result.durationMs / 60_000;
    const streak = applyPracticeSession(
      current.streak,
      minutes,
      dailyGoalMinutes,
      result.startedAt,
    );

    const next: UserProgress = {
      ...current,
      history: [...current.history, enrichedResult],
      streak,
      weakness: { ...weakness, lastComputedAt: Date.now() },
    };

    // Check for newly-unlocked badges (we pass `next` because the predicate
    // needs to see the post-session state — e.g. "first session" needs history.length >= 1).
    const newBadges = newlyUnlocked(next);
    if (newBadges.length > 0) {
      next.badgesEarned = [...next.badgesEarned, ...newBadges];
    }

    set({ progress: next, pendingBadges: newBadges });
    void saveProgress(next);
    return next;
  },

  markLessonCleared: (lessonId, accuracy, wpm) => {
    const current = get().progress;
    const prior = current.lessonsCompleted[lessonId];
    const next: UserProgress = {
      ...current,
      lessonsCompleted: {
        ...current.lessonsCompleted,
        [lessonId]: {
          firstClearedAt: prior?.firstClearedAt ?? Date.now(),
          bestWpm: Math.max(prior?.bestWpm ?? 0, wpm),
          bestAccuracy: Math.max(prior?.bestAccuracy ?? 0, accuracy),
        },
      },
    };
    set({ progress: next });
    void saveProgress(next);
  },

  awardBadges: (badgeIds) => {
    const current = get().progress;
    const newly = badgeIds.filter((id) => !current.badgesEarned.includes(id));
    if (newly.length === 0) return [];
    const next: UserProgress = {
      ...current,
      badgesEarned: [...current.badgesEarned, ...newly],
    };
    set({ progress: next });
    void saveProgress(next);
    return newly;
  },

  clearPendingBadges: () => set({ pendingBadges: [] }),

  replace: (p) => {
    set({ progress: p });
    void saveProgress(p);
  },
}));
