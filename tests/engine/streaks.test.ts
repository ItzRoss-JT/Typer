import { describe, expect, it } from 'vitest';
import { applyPracticeSession, isStreakAtRisk } from '../../src/engine/streaks';

// All `now` values are constructed from local time so the tests don't depend
// on the runner's timezone offset.

function localTs(y: number, m: number, d: number, hh = 12, mm = 0): number {
  return new Date(y, m - 1, d, hh, mm, 0, 0).getTime();
}

describe('applyPracticeSession', () => {
  it('starts a streak at 1 when the user crosses the threshold on day one', () => {
    const now = localTs(2026, 5, 27, 14);
    const r = applyPracticeSession(
      { current: 0, longest: 0, lastPracticedDate: '', todayMinutes: 0 },
      6, // dailyGoal=10, threshold=5 — 6 minutes crosses it
      10,
      now,
    );
    expect(r.current).toBe(1);
    expect(r.longest).toBe(1);
    expect(r.lastPracticedDate).toBe('2026-05-27');
    expect(r.todayMinutes).toBe(6);
  });

  it('does not credit the day if minutes < threshold', () => {
    const now = localTs(2026, 5, 27, 14);
    const r = applyPracticeSession(
      { current: 0, longest: 0, lastPracticedDate: '', todayMinutes: 0 },
      2,
      10,
      now,
    );
    expect(r.current).toBe(0);
    expect(r.todayMinutes).toBe(2);
  });

  it('increments minutes when same day, no double-credit', () => {
    const now = localTs(2026, 5, 27, 16);
    const r = applyPracticeSession(
      { current: 1, longest: 1, lastPracticedDate: '2026-05-27', todayMinutes: 6 },
      4,
      10,
      now,
    );
    expect(r.current).toBe(1);
    expect(r.todayMinutes).toBe(10);
  });

  it('continues streak when yesterday → today', () => {
    const now = localTs(2026, 5, 28, 14);
    const r = applyPracticeSession(
      { current: 3, longest: 3, lastPracticedDate: '2026-05-27', todayMinutes: 12 },
      6,
      10,
      now,
    );
    expect(r.current).toBe(4);
    expect(r.longest).toBe(4);
    expect(r.lastPracticedDate).toBe('2026-05-28');
  });

  it('resets streak after a gap of ≥ 2 days', () => {
    const now = localTs(2026, 5, 30, 14);
    const r = applyPracticeSession(
      { current: 5, longest: 5, lastPracticedDate: '2026-05-27', todayMinutes: 12 },
      6,
      10,
      now,
    );
    expect(r.current).toBe(1);
    expect(r.longest).toBe(5); // longest preserved
  });

  it('keeps longest when current resets', () => {
    const now = localTs(2026, 5, 30, 14);
    const r = applyPracticeSession(
      { current: 10, longest: 10, lastPracticedDate: '2026-05-27', todayMinutes: 12 },
      2, // not enough to credit a new day
      10,
      now,
    );
    expect(r.current).toBe(0);
    expect(r.longest).toBe(10);
  });
});

describe('isStreakAtRisk', () => {
  it('flags risk after 8pm if today not yet credited', () => {
    const now = localTs(2026, 5, 27, 21);
    const at = isStreakAtRisk(
      { current: 3, longest: 5, lastPracticedDate: '2026-05-26', todayMinutes: 0 },
      10,
      now,
    );
    expect(at).toBe(true);
  });

  it('does not flag if today is already credited', () => {
    const now = localTs(2026, 5, 27, 21);
    const at = isStreakAtRisk(
      { current: 3, longest: 5, lastPracticedDate: '2026-05-27', todayMinutes: 8 },
      10,
      now,
    );
    expect(at).toBe(false);
  });

  it('does not flag before 8pm', () => {
    const now = localTs(2026, 5, 27, 17);
    const at = isStreakAtRisk(
      { current: 3, longest: 5, lastPracticedDate: '2026-05-26', todayMinutes: 0 },
      10,
      now,
    );
    expect(at).toBe(false);
  });

  it('does not flag if no streak exists', () => {
    const now = localTs(2026, 5, 27, 21);
    const at = isStreakAtRisk(
      { current: 0, longest: 0, lastPracticedDate: '', todayMinutes: 0 },
      10,
      now,
    );
    expect(at).toBe(false);
  });
});
