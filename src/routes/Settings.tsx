/*
 * Full Settings panel per spec §7.8.
 * Sections: Practice, Display, Audio, Data.
 * "Reset all" requires typing the word RESET to confirm.
 */
import { useRef, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Toggle } from '../components/ui/Toggle';
import { Modal } from '../components/ui/Modal';
import { useSettingsStore } from '../store/useSettingsStore';
import { useProgressStore } from '../store/useProgressStore';
import { exportToFile, importFromFile } from '../lib/exportImport';
import { defaultProgress, defaultSettings, resetAll } from '../lib/db';
import type { UserSettings } from '../types';
import { Download, Trash2, Upload } from 'lucide-react';

const GOAL_OPTIONS = [5, 10, 15, 30] as const;
const PRACTICE_DURATIONS: UserSettings['defaultPracticeSeconds'][] = [15, 30, 60, 120];
const GATE_OPTIONS = [0.9, 0.93, 0.95, 0.97, 0.99] as const;

export default function Settings() {
  const settings = useSettingsStore((s) => s.settings);
  const update = useSettingsStore((s) => s.update);
  const replaceProgress = useProgressStore((s) => s.replace);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetWord, setResetWord] = useState('');
  const [importErr, setImportErr] = useState<string | null>(null);
  const [importOk, setImportOk] = useState(false);

  return (
    <div className="space-y-8">
      <header>
        <div className="text-[11px] font-semibold uppercase tracking-[0.15em] text-brand-600">
          Preferences
        </div>
        <h1 className="mt-1 text-3xl font-bold text-ink">Settings</h1>
      </header>

      {/* Practice */}
      <Section title="Practice">
        <Row label="Daily goal" hint="How many minutes per day to aim for.">
          <SegmentedGroup
            options={GOAL_OPTIONS.map((m) => ({ value: m, label: `${m} min` }))}
            value={settings.dailyGoalMinutes}
            onChange={(v) => update({ dailyGoalMinutes: v })}
          />
        </Row>
        <Row
          label="Accuracy gate"
          hint="Minimum accuracy to mark a lesson cleared."
        >
          <SegmentedGroup
            options={GATE_OPTIONS.map((g) => ({ value: g, label: `${Math.round(g * 100)}%` }))}
            value={settings.accuracyGate}
            onChange={(v) => update({ accuracyGate: v })}
          />
        </Row>
        <Row
          label="Default test length"
          hint="Used by Free Practice and Code Mode."
        >
          <SegmentedGroup
            options={PRACTICE_DURATIONS.map((s) => ({ value: s, label: `${s}s` }))}
            value={settings.defaultPracticeSeconds}
            onChange={(v) => update({ defaultPracticeSeconds: v })}
          />
        </Row>
      </Section>

      {/* Display */}
      <Section title="Display">
        <Row label="On-screen keyboard">
          <Toggle
            id="show-kb"
            label={settings.showKeyboard ? 'Visible' : 'Hidden'}
            checked={settings.showKeyboard}
            onChange={(v) => update({ showKeyboard: v })}
          />
        </Row>
        <Row label="Highlight next key">
          <Toggle
            id="highlight"
            label={settings.highlightNextKey ? 'On' : 'Off'}
            checked={settings.highlightNextKey}
            onChange={(v) => update({ highlightNextKey: v })}
          />
        </Row>
        <Row label="Finger colors">
          <Toggle
            id="finger-colors"
            label={settings.showFingerColors ? 'On' : 'Off'}
            checked={settings.showFingerColors}
            onChange={(v) => update({ showFingerColors: v })}
          />
        </Row>
        <Row label="Theme" hint="Light / Dark / follow your system.">
          <SegmentedGroup
            options={[
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
              { value: 'auto', label: 'Auto' },
            ]}
            value={settings.theme}
            onChange={(v) => update({ theme: v })}
          />
        </Row>
      </Section>

      {/* Audio */}
      <Section title="Audio">
        <Row label="Sound effects" hint="Tiny clicks and a celebration on lesson complete.">
          <Toggle
            id="sound"
            label={settings.soundEnabled ? 'On' : 'Off'}
            checked={settings.soundEnabled}
            onChange={(v) => update({ soundEnabled: v })}
          />
        </Row>
      </Section>

      {/* Data */}
      <Section title="Data">
        <Row label="Backup / restore" hint="Export your full progress as JSON, or load a previous export.">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Download size={14} />}
              onClick={() => exportToFile()}
            >
              Export JSON
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Upload size={14} />}
              onClick={() => fileRef.current?.click()}
            >
              Import JSON
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                setImportErr(null);
                setImportOk(false);
                try {
                  await importFromFile(f);
                  // Reload progress into the store immediately.
                  const { loadProgress } = await import('../lib/db');
                  replaceProgress(await loadProgress());
                  setImportOk(true);
                } catch (err) {
                  setImportErr(err instanceof Error ? err.message : 'Import failed.');
                }
                e.target.value = '';
              }}
            />
            {importErr ? <span className="text-xs text-error">{importErr}</span> : null}
            {importOk ? <span className="text-xs text-success">Imported.</span> : null}
          </div>
        </Row>
        <Row label="Reset" hint="Delete all progress and start fresh.">
          <Button
            variant="danger"
            size="sm"
            leftIcon={<Trash2 size={14} />}
            onClick={() => {
              setResetOpen(true);
              setResetWord('');
            }}
          >
            Reset all data
          </Button>
        </Row>
      </Section>

      <Modal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Reset all data?"
      >
        <p className="text-sm text-muted">
          This deletes your history, weakness map, streak, and badges. To confirm, type{' '}
          <code className="rounded bg-elevated px-1.5 py-0.5 font-mono text-ink">RESET</code>{' '}
          below.
        </p>
        <input
          type="text"
          autoFocus
          value={resetWord}
          onChange={(e) => setResetWord(e.target.value)}
          className="mt-4 w-full rounded-md border border-border bg-bg px-3 py-2 font-mono text-ink focus:border-brand-500 focus:outline-none"
          placeholder="RESET"
        />
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={() => setResetOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            disabled={resetWord.trim() !== 'RESET'}
            onClick={async () => {
              await resetAll();
              replaceProgress(defaultProgress());
              update(defaultSettings());
              setResetOpen(false);
            }}
          >
            Reset
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card elevated>
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      <div className="mt-5 space-y-5">{children}</div>
    </Card>
  );
}

function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="max-w-md">
        <div className="text-sm font-medium text-ink">{label}</div>
        {hint ? <div className="mt-0.5 text-xs text-muted">{hint}</div> : null}
      </div>
      <div>{children}</div>
    </div>
  );
}

interface SegmentedOption<T> {
  value: T;
  label: string;
}

function SegmentedGroup<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex rounded-md border border-border bg-surface p-1">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={String(o.value)}
            onClick={() => onChange(o.value)}
            className={[
              'rounded px-3 py-1 text-sm font-medium',
              'transition-[background-color,color] duration-150 ease-standard',
              active ? 'bg-brand-500 text-white' : 'text-muted hover:text-ink',
            ].join(' ')}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
