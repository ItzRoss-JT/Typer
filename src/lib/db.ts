/*
 * Typed wrapper around idb-keyval with schema migrations and Zod validation.
 *
 * IndexedDB is editable by anyone with the user's browser (DevTools → Storage).
 * That's acceptable for personal stats, but reads still need to be validated:
 * a malformed object should not crash the app, leak prototype keys, or be
 * trusted as-is. The flow is:
 *
 *   raw idb-keyval read
 *     → migrateX (defensive merging that adds new fields)
 *     → Zod parse (rejects anything still off-shape)
 *     → on failure: fall back to defaults and log a warning
 *
 * Long history archives spill into 'progress-archive-{n}' per spec §13.
 */
import { get, set } from 'idb-keyval';
import type { UserProgress, UserSettings } from '../types';
import { UserProgressSchema, UserSettingsSchema } from './schemas';

export const CURRENT_PROGRESS_SCHEMA = 1;
export const CURRENT_SETTINGS_SCHEMA = 1;

const KEY_PROGRESS = 'progress';
const KEY_SETTINGS = 'settings';
const HISTORY_HARD_CAP = 1000;
const HISTORY_ARCHIVE_BATCH = 200;

export function defaultProgress(): UserProgress {
  return {
    schemaVersion: CURRENT_PROGRESS_SCHEMA,
    lessonsCompleted: {},
    history: [],
    streak: {
      current: 0,
      longest: 0,
      lastPracticedDate: '',
      todayMinutes: 0,
    },
    badgesEarned: [],
    weakness: {
      perKey: {},
      perBigram: {},
      lastComputedAt: 0,
    },
  };
}

export function defaultSettings(): UserSettings {
  return {
    schemaVersion: CURRENT_SETTINGS_SCHEMA,
    dailyGoalMinutes: 10,
    soundEnabled: false,
    showKeyboard: true,
    highlightNextKey: true,
    showFingerColors: true,
    theme: 'auto',
    accuracyGate: 0.95,
    layout: 'qwerty',
    defaultPracticeSeconds: 60,
    onboardingCompleted: false,
  };
}

// Migrations are pure functions that take an "any-shape" old object and return
// the new shape. v1 is the starting schema — no migrations to run yet.
function migrateProgress(raw: unknown): UserProgress {
  if (!raw || typeof raw !== 'object') return defaultProgress();
  // We cast through `unknown` because the stored shape is loose by design.
  const o = raw as Partial<UserProgress>;
  return {
    ...defaultProgress(),
    ...o,
    schemaVersion: CURRENT_PROGRESS_SCHEMA,
    // Defensive merging — old stores may be missing the streak.todayMinutes field
    streak: { ...defaultProgress().streak, ...(o.streak ?? {}) },
    weakness: { ...defaultProgress().weakness, ...(o.weakness ?? {}) },
  };
}

function migrateSettings(raw: unknown): UserSettings {
  if (!raw || typeof raw !== 'object') return defaultSettings();
  const o = raw as Partial<UserSettings>;
  return { ...defaultSettings(), ...o, schemaVersion: CURRENT_SETTINGS_SCHEMA };
}

export async function loadProgress(): Promise<UserProgress> {
  try {
    const raw = await get(KEY_PROGRESS);
    const migrated = migrateProgress(raw);
    const parsed = UserProgressSchema.safeParse(migrated);
    if (!parsed.success) {
      // Stored data is corrupt or tampered. Don't crash and don't trust it —
      // fall back to defaults. The user keeps the app usable; the bad data
      // stays on disk until they choose to reset (so we don't silently
      // destroy anything that might be recoverable manually).
      console.warn('[db] progress failed validation, using defaults:', parsed.error.issues[0]);
      return defaultProgress();
    }
    return parsed.data;
  } catch (err) {
    // IndexedDB unavailable (private mode etc.) — start fresh in-memory.
    console.warn('[db] loadProgress fell back to defaults:', err);
    return defaultProgress();
  }
}

export async function saveProgress(p: UserProgress): Promise<void> {
  let payload = p;
  // Archive oldest sessions when history grows too large (spec §13).
  if (payload.history.length > HISTORY_HARD_CAP) {
    const archive = payload.history.slice(0, HISTORY_ARCHIVE_BATCH);
    const idx = await nextArchiveIndex();
    await set(`${KEY_PROGRESS}-archive-${idx}`, archive);
    payload = { ...payload, history: payload.history.slice(HISTORY_ARCHIVE_BATCH) };
  }
  await set(KEY_PROGRESS, payload);
}

async function nextArchiveIndex(): Promise<number> {
  // We don't list keys (idb-keyval doesn't expose it cheaply); store a counter.
  const cur = ((await get('progress-archive-counter')) as number | undefined) ?? 0;
  const next = cur + 1;
  await set('progress-archive-counter', next);
  return next;
}

export async function loadSettings(): Promise<UserSettings> {
  try {
    const raw = await get(KEY_SETTINGS);
    const migrated = migrateSettings(raw);
    const parsed = UserSettingsSchema.safeParse(migrated);
    if (!parsed.success) {
      console.warn('[db] settings failed validation, using defaults:', parsed.error.issues[0]);
      return defaultSettings();
    }
    return parsed.data;
  } catch (err) {
    console.warn('[db] loadSettings fell back to defaults:', err);
    return defaultSettings();
  }
}

export async function saveSettings(s: UserSettings): Promise<void> {
  await set(KEY_SETTINGS, s);
}

export async function resetAll(): Promise<void> {
  // Wipe both keys — used by Settings → "Reset all data".
  await set(KEY_PROGRESS, defaultProgress());
  await set(KEY_SETTINGS, defaultSettings());
}
