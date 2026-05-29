import { describe, expect, it } from 'vitest';
import {
  bigramAt,
  computeSessionDeltas,
  DECAY,
  mergeWeakness,
  errorTotalsFor,
} from '../../src/engine/weakness';
import type { Keystroke } from '../../src/types';

function k(expected: string, correct: boolean, ms = 100): Keystroke {
  return { expected, actual: correct ? expected : 'x', correct, timestamp: 0, msSincePrevious: ms };
}

describe('bigramAt', () => {
  it('returns lowercase pair for two letters', () => {
    expect(bigramAt('The', 0)).toBe('th');
    expect(bigramAt('The', 1)).toBe('he');
  });

  it('returns null at last position', () => {
    expect(bigramAt('abc', 2)).toBe(null);
  });

  it('returns null when either char is non-letter', () => {
    expect(bigramAt('a1', 0)).toBe(null);
    expect(bigramAt('1a', 0)).toBe(null);
    expect(bigramAt('a ', 0)).toBe(null);
  });
});

describe('computeSessionDeltas', () => {
  it('counts per-key attempts and errors', () => {
    const ks = [k('t', true), k('h', false), k('e', true)];
    const d = computeSessionDeltas(ks);
    expect(d.perKey['t']).toEqual({ attempts: 1, errors: 0 });
    expect(d.perKey['h']).toEqual({ attempts: 1, errors: 1 });
    expect(d.perKey['e']).toEqual({ attempts: 1, errors: 0 });
  });

  it('counts per-bigram across consecutive letter pairs', () => {
    const ks = [k('t', true), k('h', false), k('e', true)];
    const d = computeSessionDeltas(ks);
    expect(d.perBigram['th']).toEqual({ attempts: 1, errors: 1 });
    expect(d.perBigram['he']).toEqual({ attempts: 1, errors: 0 });
  });

  it('skips bigrams where either side is non-letter', () => {
    const ks = [k('a', true), k(' ', true), k('b', true)];
    const d = computeSessionDeltas(ks);
    expect(d.perBigram['a ']).toBeUndefined();
    expect(d.perBigram[' b']).toBeUndefined();
  });
});

describe('mergeWeakness with decay', () => {
  it('decays existing stats and adds new', () => {
    const existing = {
      perKey: {
        a: { key: 'a', attempts: 100, errors: 10, accuracy: 0.9, avgMsBetween: 100 },
      },
      perBigram: {
        th: { attempts: 40, errors: 4 },
      },
    };
    const deltas = computeSessionDeltas([k('a', false), k('a', true)]);
    const m = mergeWeakness(existing, deltas);
    // attempts = 100 * 0.85 + 2 = 87
    expect(m.perKey['a'].attempts).toBeCloseTo(100 * DECAY + 2, 6);
    // errors = 10 * 0.85 + 1 = 9.5
    expect(m.perKey['a'].errors).toBeCloseTo(10 * DECAY + 1, 6);
    // accuracy = 1 - errors/attempts
    expect(m.perKey['a'].accuracy).toBeCloseTo(1 - 9.5 / 87, 4);
  });
});

describe('errorTotalsFor', () => {
  it('aggregates errors by key and bigram from keystrokes', () => {
    const ks = [k('t', true), k('h', false), k('e', false)];
    const totals = errorTotalsFor(ks);
    expect(totals.errorsByKey).toEqual({ h: 1, e: 1 });
    // both 'th' and 'he' had the second key wrong → bigram error
    expect(totals.errorsByBigram).toEqual({ th: 1, he: 1 });
  });
});
