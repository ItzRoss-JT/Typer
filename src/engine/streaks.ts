/*
 * Daily streak math. Uses local YYYY-MM-DD strings (§13) so daylight-saving
 * transitions don't corrupt the counter.
 */
import { addDays, compareDates, localDateString } from '../lib/time';
import type { UserProgress } from '../types';

/**
 * Adds `addedMinutes` toward today's goal, then resolves whether the streak
 * advances, holds, or resets. Returns a new streak object — doesn't mutate.
 */
export function applyPracticeSession(
  streak: UserProgress['streak'],
  addedMinutes: number,
  dailyGoalMinutes: number,
  now: number = Date.now(),
): UserProgress['streak'] {
  const today = localDateString(now);
  // A day "counts" if total minutes today >= dailyGoalMinutes / 2 (§5.7).
  const threshold = dailyGoalMinutes / 2;

  // If lastPracticedDate is today, just add the minutes and we're done.
  if (streak.lastPracticedDate === today) {
    const newTodayMinutes = streak.todayMinutes + addedMinutes;
    return {
      ...streak,
      todayMinutes: newTodayMinutes,
    };
  }

  // It's a new day. Were the prior minutes enough to keep the streak going?
  // We need yesterday's count to be already-credited in `current` (we credit
  // immediately on hitting threshold), so today we just figure out continuity.
  let { current, longest, lastPracticedDate } = streak;
  const yesterday = addDays(today, -1);

  if (compareDates(lastPracticedDate, yesterday) === 0) {
    // Practiced yesterday — continuity preserved. Reset today's bucket.
  } else if (compareDates(lastPracticedDate, today) > 0) {
    // Future-dated last-practiced (clock skew). Treat as "today" and continue.
    return { ...streak, lastPracticedDate: today };
  } else if (lastPracticedDate === '' || lastPracticedDate === '1970-01-01') {
    // First-ever session.
    current = 0;
  } else {
    // Gap of ≥1 day — streak resets.
    current = 0;
  }

  // Today's bucket starts fresh.
  let todayMinutes = addedMinutes;
  let creditedNewDay = false;
  if (todayMinutes >= threshold) {
    current += 1;
    creditedNewDay = true;
    if (current > longest) longest = current;
  }

  return {
    current,
    longest,
    lastPracticedDate: creditedNewDay ? today : lastPracticedDate || today,
    todayMinutes,
  };
}

/**
 * If the user has already practiced today but hadn't crossed the threshold,
 * a subsequent session may push them over — re-evaluate.
 * Returns true if the streak should bump now.
 */
export function shouldCreditTodayUpgrade(
  streak: UserProgress['streak'],
  dailyGoalMinutes: number,
  now: number = Date.now(),
): boolean {
  const today = localDateString(now);
  if (streak.lastPracticedDate !== today) return false;
  return streak.todayMinutes >= dailyGoalMinutes / 2;
}

/** True if it's after 8pm local and today's threshold hasn't been met. */
export function isStreakAtRisk(
  streak: UserProgress['streak'],
  dailyGoalMinutes: number,
  now: number = Date.now(),
): boolean {
  const today = localDateString(now);
  const hour = new Date(now).getHours();
  if (hour < 20) return false;
  if (streak.lastPracticedDate === today && streak.todayMinutes >= dailyGoalMinutes / 2) {
    return false;
  }
  return streak.current > 0;
}
