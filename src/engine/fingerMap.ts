/*
 * Maps every QWERTY key to the finger that should press it.
 * Lowercase letters, digits, common punctuation, and space are covered.
 * Spec §3 (file), §7.4 (on-screen keyboard finger colors).
 */
import type { FingerId } from '../types';

// Lowercase letter, digit, and punctuation map. Uppercase is derived from
// the lowercase form (`shift` is the off-hand pinky, but for finger-color
// display we just colorize by the base key).
const MAP: Record<string, FingerId> = {
  // Number row
  '`': 'L_PINKY',
  '1': 'L_PINKY',
  '2': 'L_RING',
  '3': 'L_MIDDLE',
  '4': 'L_INDEX',
  '5': 'L_INDEX',
  '6': 'R_INDEX',
  '7': 'R_INDEX',
  '8': 'R_MIDDLE',
  '9': 'R_RING',
  '0': 'R_PINKY',
  '-': 'R_PINKY',
  '=': 'R_PINKY',

  // Top row
  q: 'L_PINKY',
  w: 'L_RING',
  e: 'L_MIDDLE',
  r: 'L_INDEX',
  t: 'L_INDEX',
  y: 'R_INDEX',
  u: 'R_INDEX',
  i: 'R_MIDDLE',
  o: 'R_RING',
  p: 'R_PINKY',
  '[': 'R_PINKY',
  ']': 'R_PINKY',
  '\\': 'R_PINKY',

  // Home row
  a: 'L_PINKY',
  s: 'L_RING',
  d: 'L_MIDDLE',
  f: 'L_INDEX',
  g: 'L_INDEX',
  h: 'R_INDEX',
  j: 'R_INDEX',
  k: 'R_MIDDLE',
  l: 'R_RING',
  ';': 'R_PINKY',
  "'": 'R_PINKY',

  // Bottom row
  z: 'L_PINKY',
  x: 'L_RING',
  c: 'L_MIDDLE',
  v: 'L_INDEX',
  b: 'L_INDEX',
  n: 'R_INDEX',
  m: 'R_INDEX',
  ',': 'R_MIDDLE',
  '.': 'R_RING',
  '/': 'R_PINKY',

  // Space
  ' ': 'THUMB',
};

/** Returns the finger that should press `key`, or undefined for unmapped keys. */
export function fingerFor(key: string): FingerId | undefined {
  const lower = key.toLowerCase();
  return MAP[lower];
}

/** Returns the home-row key for the given finger (used by "rest position" indicators). */
export function homeKeyFor(finger: FingerId): string {
  switch (finger) {
    case 'L_PINKY':
      return 'a';
    case 'L_RING':
      return 's';
    case 'L_MIDDLE':
      return 'd';
    case 'L_INDEX':
      return 'f';
    case 'R_INDEX':
      return 'j';
    case 'R_MIDDLE':
      return 'k';
    case 'R_RING':
      return 'l';
    case 'R_PINKY':
      return ';';
    case 'THUMB':
      return ' ';
  }
}
