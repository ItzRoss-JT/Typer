/*
 * JSON export/import for backup and migration.
 *
 * SECURITY: imports are an attack vector — the user can hand us a file the
 * app then persists. The flow is two-step:
 *
 *   1. parseAndValidateImport(file) — reads, size-caps, JSON-parses, runs the
 *      Zod schema, returns a typed Bundle + a summary. Throws on any failure.
 *   2. applyImport(bundle)         — the UI calls this AFTER the user confirms
 *      in the modal, only then do we touch IndexedDB.
 *
 * Never call applyImport without the user explicitly confirming the summary.
 */
import { loadProgress, loadSettings, saveProgress, saveSettings } from './db';
import {
  BundleSchema,
  CURRENT_DATA_INTEGRITY_VERSION,
  IMPORT_MAX_BYTES,
  summarizeBundle,
  type Bundle,
  type BundleSummary,
} from './schemas';

export async function exportToFile(): Promise<void> {
  const [progress, settings] = await Promise.all([loadProgress(), loadSettings()]);
  const bundle: Bundle = {
    app: 'typer',
    exportedAt: Date.now(),
    dataIntegrityVersion: CURRENT_DATA_INTEGRITY_VERSION,
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

export interface ParsedImport {
  bundle: Bundle;
  summary: BundleSummary;
}

/**
 * Step 1 of import: size-cap, parse, validate. Never writes to storage.
 * Throws a user-friendly Error on any failure (caller surfaces the message).
 */
export async function parseAndValidateImport(file: File): Promise<ParsedImport> {
  // Size check BEFORE reading into memory beyond a header. `file.size` is
  // populated by the browser without a full read.
  if (file.size > IMPORT_MAX_BYTES) {
    const mb = (IMPORT_MAX_BYTES / 1024 / 1024).toFixed(1);
    throw new Error(`File is too large (max ${mb} MB).`);
  }

  let text: string;
  try {
    text = await file.text();
  } catch {
    throw new Error('Could not read file.');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('File is not valid JSON.');
  }

  const result = BundleSchema.safeParse(parsed);
  if (!result.success) {
    // Surface the first issue path/message — enough to debug, not so much it
    // becomes a leakage vector.
    const first = result.error.issues[0];
    const where = first?.path?.join('.') || '<root>';
    throw new Error(`Backup file is invalid: ${first?.message ?? 'unknown'} at ${where}`);
  }

  return { bundle: result.data, summary: summarizeBundle(result.data) };
}

/**
 * Step 2 of import: persist the already-validated bundle. The UI MUST gate
 * this behind explicit user confirmation (the import-confirm modal).
 */
export async function applyImport(bundle: Bundle): Promise<void> {
  // Defensive re-parse in case the caller mutated the object between steps.
  const result = BundleSchema.safeParse(bundle);
  if (!result.success) {
    throw new Error('Refused to apply: bundle failed re-validation.');
  }
  await saveProgress(result.data.progress);
  await saveSettings(result.data.settings);
}
