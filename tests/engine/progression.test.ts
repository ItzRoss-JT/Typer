import { describe, expect, it } from 'vitest';
import { clearsLesson, isUnlocked, nextSuggestedLesson } from '../../src/engine/progression';
import type { Lesson } from '../../src/types';

const l = (id: string, unit: number, order: number, prereq: string[] = []): Lesson => ({
  id,
  unit,
  order,
  title: id,
  description: '',
  introducesKeys: [],
  drills: ['fff'],
  prerequisites: prereq,
});

describe('clearsLesson', () => {
  it('passes at gate', () => {
    expect(clearsLesson(0.95, 0.95)).toBe(true);
  });
  it('passes above gate', () => {
    expect(clearsLesson(0.99, 0.95)).toBe(true);
  });
  it('fails below gate', () => {
    expect(clearsLesson(0.94, 0.95)).toBe(false);
  });
});

describe('isUnlocked', () => {
  it('is unlocked when no prerequisites', () => {
    expect(isUnlocked(l('a', 1, 1), {})).toBe(true);
  });
  it('is locked when a prerequisite is missing', () => {
    expect(isUnlocked(l('b', 1, 2, ['a']), {})).toBe(false);
  });
  it('is unlocked when all prerequisites are present', () => {
    expect(
      isUnlocked(l('b', 1, 2, ['a']), {
        a: { firstClearedAt: 0, bestWpm: 30, bestAccuracy: 0.99 },
      }),
    ).toBe(true);
  });
});

describe('nextSuggestedLesson', () => {
  it('returns the first unlocked-and-uncleared lesson in curriculum order', () => {
    const curriculum = [l('a', 1, 1), l('b', 1, 2, ['a']), l('c', 2, 1, ['b'])];
    const completed = {
      a: { firstClearedAt: 0, bestWpm: 30, bestAccuracy: 0.99 },
    };
    expect(nextSuggestedLesson(curriculum, completed)?.id).toBe('b');
  });

  it('returns null when everything is cleared', () => {
    const curriculum = [l('a', 1, 1)];
    const completed = { a: { firstClearedAt: 0, bestWpm: 30, bestAccuracy: 0.99 } };
    expect(nextSuggestedLesson(curriculum, completed)).toBe(null);
  });
});
