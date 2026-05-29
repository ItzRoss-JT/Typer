import { describe, expect, it } from 'vitest';
import { computeAccuracy, computeConsistency, computeWpm } from '../../src/engine/metrics';
import type { Keystroke } from '../../src/types';

function stroke(opts: Partial<Keystroke>): Keystroke {
  return {
    expected: 'a',
    actual: 'a',
    correct: true,
    timestamp: 0,
    msSincePrevious: 100,
    ...opts,
  };
}

describe('computeWpm', () => {
  it('returns 0/0 for empty input', () => {
    expect(computeWpm(0, 0, 0)).toEqual({ wpm: 0, rawWpm: 0 });
  });

  it('returns 0/0 for zero duration', () => {
    expect(computeWpm(50, 0, 0)).toEqual({ wpm: 0, rawWpm: 0 });
  });

  it('60 chars / 60s = 12 raw WPM (60/5)', () => {
    // 60 chars over 60s = 12 wpm
    const r = computeWpm(60, 0, 60_000);
    expect(r.rawWpm).toBeCloseTo(12, 1);
    expect(r.wpm).toBeCloseTo(12, 1);
  });

  it('penalizes errors in net WPM', () => {
    // 60 chars, 5 errors, 60s
    // raw = 12, net = (60-5)/5/1 = 11
    const r = computeWpm(60, 5, 60_000);
    expect(r.rawWpm).toBeCloseTo(12, 1);
    expect(r.wpm).toBeCloseTo(11, 1);
  });

  it('clamps net WPM to 0 when errors exceed chars', () => {
    expect(computeWpm(10, 100, 60_000).wpm).toBe(0);
  });
});

describe('computeAccuracy', () => {
  it('returns 1 for an empty session', () => {
    expect(computeAccuracy([])).toBe(1);
  });

  it('returns 1 for all correct', () => {
    expect(
      computeAccuracy([stroke({ correct: true }), stroke({ correct: true })]),
    ).toBe(1);
  });

  it('returns 0.5 for half correct', () => {
    expect(
      computeAccuracy([stroke({ correct: true }), stroke({ correct: false })]),
    ).toBe(0.5);
  });
});

describe('computeConsistency', () => {
  it('returns 0 for fewer than 2 intervals', () => {
    expect(computeConsistency([])).toBe(0);
    expect(computeConsistency([stroke({})])).toBe(0);
  });

  it('returns 1 for perfectly even rhythm', () => {
    const ks = [
      stroke({ msSincePrevious: 100 }),
      stroke({ msSincePrevious: 100 }),
      stroke({ msSincePrevious: 100 }),
    ];
    expect(computeConsistency(ks)).toBeCloseTo(1, 2);
  });

  it('penalizes variable rhythm', () => {
    const ks = [
      stroke({ msSincePrevious: 50 }),
      stroke({ msSincePrevious: 500 }),
      stroke({ msSincePrevious: 50 }),
      stroke({ msSincePrevious: 500 }),
    ];
    const c = computeConsistency(ks);
    expect(c).toBeLessThan(0.5);
    expect(c).toBeGreaterThanOrEqual(0);
  });

  it('ignores zero/negative intervals', () => {
    const ks = [
      stroke({ msSincePrevious: 0 }),
      stroke({ msSincePrevious: 100 }),
      stroke({ msSincePrevious: 100 }),
    ];
    expect(computeConsistency(ks)).toBeCloseTo(1, 2);
  });
});
