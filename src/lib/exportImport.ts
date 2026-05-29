/*
 * JSON export/import for backup and migration. Writes a single bundle file
 * with both progress and settings.
 */
import { loadProgress, loadSettings, saveProgress, saveSettings } from './db';
import type { UserProgress, UserSettings } from '../types';

interface Bundle {
  app: 'typer';
  exportedAt: number;
  progress: UserProgress;
  settings: UserSettings;
}

export async function exportToFile(): Promise<void> {
  const [progress, settings] = await Promise.all([loadProgress(), loadSettings()]);
  const bundle: Bundle = {
    app: 'typer',
    exportedAt: Date.now(),
    progress,
    settings,
  };
  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `typer-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Validates a parsed JSON bundle. Throws with a user-friendly message on failure. */
function assertBundle(raw: unknown): asserts raw is Bundle {
  if (!raw || typeof raw !== 'object') throw new Error('File is not valid JSON.');
  // `r` is `any`-typed at the boundary — we're doing the validation here. // any-justified: untyped JSON
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = raw as any;
  if (r.app !== 'typer') throw new Error('Not a Typer backup file.');
  if (!r.progress || !r.settings) throw new Error('Missing progress or settings.');
}

export async function importFromFile(file: File): Promise<void> {
  const text = await file.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('File is not valid JSON.');
  }
  assertBundle(parsed);
  await saveProgress(parsed.progress);
  await saveSettings(parsed.settings);
}
