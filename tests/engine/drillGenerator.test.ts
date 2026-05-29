import { describe, expect, it } from 'vitest';
import { FALLBACK_DRILL, generateAdaptiveDrill, rankWeakKeys } from '../../src/engine/drillGenerator';
import type { KeyStats } from '../../src/types';

const ks = (
  key: string,
  attempts: number,
  errors: number,
): KeyStats => ({ key, attempts, errors, accuracy: 1 - errors / attempts, avgMsBetween: 100 });

describe('rankWeakKeys', () => {
  it('returns keys ordered by error rate', () => {
    const perKey = {
      a: ks('a', 100, 5),
      b: ks('b', 100, 20),
      c: ks('c', 100, 10),
    };
    expect(rankWeakKeys(perKey, 3)).toEqual(['b', 'c', 'a']);
  });

  it('filters out low-attempt noise', () => {
    const perKey = {
      a: ks('a', 5, 5), // would be 100% error but only 5 attempts
      b: ks('b', 100, 5),
    };
    expect(rankWeakKeys(perKey, 3)).toEqual(['b']);
  });
});

describe('generateAdaptiveDrill', () => {
  it('falls back to default with fewer than 3 sessions', () => {
    expect(generateAdaptiveDrill({}, {}, 0)).toBe(FALLBACK_DRILL);
    expect(generateAdaptiveDrill({}, {}, 2)).toBe(FALLBACK_DRILL);
  });

  it('output contains at least one of the weak target keys', () => {
    const perKey = { z: ks('z', 100, 30) };
    const drill = generateAdaptiveDrill(perKey, {}, 10);
    // Drill may be the fallback if no candidate word contains 'z', but our
    // word list does include 'zip' so we expect z somewhere.
    expect(drill.includes('z')).toBe(true);
  });
});
