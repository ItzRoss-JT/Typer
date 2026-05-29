/*
 * Badge definitions. Each badge has a pure `unlocksWhen(progress)` predicate;
 * after every session we check all badges and award newly-true ones.
 * Spec §14 calls for ≥5 unlockable through normal use; we ship 16.
 */
import type { Badge, UserProgress } from '../types';

function bestWpm(progress: UserProgress): number {
  return progress.history.reduce((max, s) => Math.max(max, s.wpm), 0);
}
function bestAccuracy(progress: UserProgress): number {
  return progress.history.reduce((max, s) => Math.max(max, s.accuracy), 0);
}
function lessonsClearedCount(progress: UserProgress): number {
  return Object.keys(progress.lessonsCompleted).length;
}
function totalSessions(progress: UserProgress): number {
  return progress.history.length;
}

export const BADGES: Badge[] = [
  {
    id: 'first-lesson',
    title: 'First steps',
    description: 'Cleared your first lesson.',
    unlocksWhen: (p) => lessonsClearedCount(p) >= 1,
  },
  {
    id: 'home-row-master',
    title: 'Home base',
    description: 'Cleared all four home-row lessons.',
    unlocksWhen: (p) =>
      ['01-home-fj', '02-home-dk', '03-home-sl', '04-home-asemi'].every(
        (id) => Boolean(p.lessonsCompleted[id]),
      ),
  },
  {
    id: 'top-row-done',
    title: 'Top of the world',
    description: 'Cleared all five top-row lessons.',
    unlocksWhen: (p) =>
      ['07-top-ei', '08-top-ru', '09-top-ty', '10-top-wo', '11-top-qp'].every(
        (id) => Boolean(p.lessonsCompleted[id]),
      ),
  },
  {
    id: 'bottom-row-done',
    title: 'Down low',
    description: 'Cleared all five bottom-row lessons.',
    unlocksWhen: (p) =>
      ['12-bot-vm', '13-bot-c-comma', '14-bot-x-period', '15-bot-z-slash', '16-bot-bn'].every(
        (id) => Boolean(p.lessonsCompleted[id]),
      ),
  },
  {
    id: 'fluency',
    title: 'Fluent',
    description: 'Cleared the final fluency unit.',
    unlocksWhen: (p) =>
      ['31-flu-sentences', '32-flu-paragraphs', '33-flu-mixed'].every(
        (id) => Boolean(p.lessonsCompleted[id]),
      ),
  },
  {
    id: 'streak-3',
    title: 'Three in a row',
    description: 'Practiced 3 days in a row.',
    unlocksWhen: (p) => p.streak.longest >= 3,
  },
  {
    id: 'streak-7',
    title: 'A week strong',
    description: 'Practiced 7 days in a row.',
    unlocksWhen: (p) => p.streak.longest >= 7,
  },
  {
    id: 'streak-30',
    title: 'Monthly habit',
    description: 'Practiced 30 days in a row.',
    unlocksWhen: (p) => p.streak.longest >= 30,
  },
  {
    id: 'wpm-30',
    title: '30 WPM',
    description: 'Reached 30 WPM in a single session.',
    unlocksWhen: (p) => bestWpm(p) >= 30,
  },
  {
    id: 'wpm-50',
    title: '50 WPM',
    description: 'Reached 50 WPM in a single session.',
    unlocksWhen: (p) => bestWpm(p) >= 50,
  },
  {
    id: 'wpm-80',
    title: '80 WPM',
    description: 'Reached 80 WPM in a single session.',
    unlocksWhen: (p) => bestWpm(p) >= 80,
  },
  {
    id: 'accuracy-95',
    title: 'Sharp shooter',
    description: 'Hit 95% accuracy in a session.',
    unlocksWhen: (p) => bestAccuracy(p) >= 0.95,
  },
  {
    id: 'accuracy-100',
    title: 'Flawless',
    description: 'Finished a session at 100% accuracy.',
    unlocksWhen: (p) => bestAccuracy(p) >= 1,
  },
  {
    id: 'ten-sessions',
    title: 'Ten down',
    description: 'Completed 10 sessions.',
    unlocksWhen: (p) => totalSessions(p) >= 10,
  },
  {
    id: 'fifty-sessions',
    title: 'Half a hundred',
    description: 'Completed 50 sessions.',
    unlocksWhen: (p) => totalSessions(p) >= 50,
  },
  {
    id: 'code-typist',
    title: 'Code typist',
    description: 'Completed a code-mode session.',
    unlocksWhen: (p) => p.history.some((s) => s.mode === 'code'),
  },
];

/** Returns the badge IDs that should now be unlocked but are not in earned. */
export function newlyUnlocked(progress: UserProgress): string[] {
  const earned = new Set(progress.badgesEarned);
  return BADGES.filter((b) => !earned.has(b.id) && b.unlocksWhen(progress)).map((b) => b.id);
}

export function findBadge(id: string): Badge | undefined {
  return BADGES.find((b) => b.id === id);
}
