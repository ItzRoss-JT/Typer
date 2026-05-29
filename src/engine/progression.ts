/*
 * Lesson unlock logic and accuracy gating.
 * Spec §5.6.
 */
import type { Lesson, UserProgress } from '../types';

/** True if every prerequisite lesson is in `lessonsCompleted`. */
export function isUnlocked(
  lesson: Lesson,
  completed: UserProgress['lessonsCompleted'],
): boolean {
  return lesson.prerequisites.every((pid) => Boolean(completed[pid]));
}

/** True if the session's accuracy meets/exceeds the configured gate. */
export function clearsLesson(accuracy: number, accuracyGate: number): boolean {
  return accuracy >= accuracyGate;
}

/**
 * Returns the next lesson the user should be steered toward, or null.
 * - Prefers the next unlocked-but-uncleared lesson in curriculum order.
 * - If the user has cleared everything, returns null.
 */
export function nextSuggestedLesson(
  curriculum: Lesson[],
  completed: UserProgress['lessonsCompleted'],
): Lesson | null {
  const sorted = [...curriculum].sort((a, b) =>
    a.unit === b.unit ? a.order - b.order : a.unit - b.unit,
  );
  for (const lesson of sorted) {
    if (completed[lesson.id]) continue;
    if (isUnlocked(lesson, completed)) return lesson;
  }
  // All unlocked-and-uncleared exhausted — look for any uncleared with prerequisites.
  for (const lesson of sorted) {
    if (!completed[lesson.id]) return lesson;
  }
  return null;
}
