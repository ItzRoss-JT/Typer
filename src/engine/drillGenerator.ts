/*
 * Generates targeted drill strings from the user's weakness profile (§5.5).
 * No React, pure logic.
 */
import type { KeyStats, BigramStats } from '../types';
import { MIN_ATTEMPTS } from './weakness';

const FALLBACK_DRILL =
  'the quick brown fox jumps over the lazy dog. she sells sea shells by the sea shore. ' +
  'practice slowly to learn the feel of every key. small daily sessions beat long weekly ones. ' +
  'accuracy first; speed will follow when your hands learn the rhythm.';

const SHORT_WORDS = [
  'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'any', 'can', 'her', 'was', 'one',
  'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old', 'see',
  'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use', 'cat',
  'dog', 'run', 'sun', 'top', 'bit', 'big', 'red', 'box', 'cup', 'eye', 'fly', 'gap', 'hat',
  'ink', 'jam', 'key', 'lip', 'map', 'net', 'pan', 'rat', 'sit', 'tip', 'van', 'wet', 'yes',
  'zip', 'arm', 'art', 'ask', 'ate', 'bag', 'bad', 'bed', 'bee', 'bog', 'bug', 'bus', 'buy',
];

const MEDIUM_WORDS = [
  'about', 'above', 'after', 'again', 'before', 'below', 'between', 'every', 'first', 'great',
  'group', 'house', 'large', 'learn', 'light', 'might', 'never', 'often', 'order', 'other',
  'place', 'plant', 'point', 'right', 'round', 'small', 'sound', 'start', 'still', 'study',
  'their', 'there', 'these', 'thing', 'think', 'three', 'under', 'water', 'where', 'which',
  'while', 'world', 'would', 'write', 'young', 'paper', 'happy', 'quick', 'short', 'green',
];

/** Picks top weak keys by error rate, with a minimum-attempts gate. */
export function rankWeakKeys(
  perKey: Record<string, KeyStats>,
  limit: number = 3,
): string[] {
  return Object.values(perKey)
    .filter((s) => s.attempts >= MIN_ATTEMPTS)
    .map((s) => ({ key: s.key, rate: s.errors / Math.max(1, s.attempts) }))
    .filter((s) => s.rate > 0)
    .sort((a, b) => b.rate - a.rate)
    .slice(0, limit)
    .map((s) => s.key);
}

/** Picks top weak bigrams by error rate. */
export function rankWeakBigrams(
  perBigram: Record<string, BigramStats>,
  limit: number = 5,
): string[] {
  return Object.entries(perBigram)
    .filter(([, s]) => s.attempts >= MIN_ATTEMPTS)
    .map(([bg, s]) => ({ bg, rate: s.errors / Math.max(1, s.attempts) }))
    .filter((s) => s.rate > 0)
    .sort((a, b) => b.rate - a.rate)
    .slice(0, limit)
    .map((s) => s.bg);
}

/** Joins words to ~targetLen chars, with single spaces between. */
function buildString(words: string[], targetLen = 200): string {
  let out = '';
  let i = 0;
  while (out.length < targetLen && words.length > 0) {
    const word = words[i % words.length];
    out += (out ? ' ' : '') + word;
    i++;
    if (i > 5000) break; // safety
  }
  return out;
}

/**
 * Generates a drill string targeting the user's worst keys and bigrams.
 * - Picks short/medium words that contain those keys/bigrams.
 * - Interleaves so one key doesn't dominate the line.
 * - Falls back to a balanced default if too little data.
 */
export function generateAdaptiveDrill(
  perKey: Record<string, KeyStats>,
  perBigram: Record<string, BigramStats>,
  sessionsCompleted: number,
): string {
  if (sessionsCompleted < 3) return FALLBACK_DRILL;

  const weakKeys = rankWeakKeys(perKey, 3);
  const weakBigrams = rankWeakBigrams(perBigram, 5);

  if (weakKeys.length === 0 && weakBigrams.length === 0) return FALLBACK_DRILL;

  const targets = new Set<string>([...weakKeys, ...weakBigrams]);

  // Score every candidate word by how many targets it covers.
  const candidates = [...SHORT_WORDS, ...MEDIUM_WORDS]
    .map((w) => ({ w, score: scoreWordForTargets(w, targets) }))
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score);

  if (candidates.length === 0) return FALLBACK_DRILL;

  // Interleave: take a buffer of top-N candidates, then walk them round-robin.
  const top = candidates.slice(0, 24).map((c) => c.w);
  shuffleInPlace(top);

  return buildString(top, 220);
}

function scoreWordForTargets(word: string, targets: Set<string>): number {
  let score = 0;
  for (const t of targets) {
    if (t.length === 1) {
      if (word.includes(t)) score += 1;
    } else if (word.includes(t)) {
      score += 2; // bigrams worth more — they're harder to find
    }
  }
  return score;
}

function shuffleInPlace<T>(arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

export { FALLBACK_DRILL };
