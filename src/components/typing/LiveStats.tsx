/*
 * Real-time WPM, accuracy, and timer. Re-renders ~5x/sec via an interval so
 * the user sees their numbers move while typing.
 */
import { useEffect, useState } from 'react';
import type { Keystroke } from '../../types';
import { computeAccuracy, computeWpm } from '../../engine/metrics';

interface Props {
  /** Keystrokes captured so far. */
  keystrokes: Keystroke[];
  /** ms the session has been active (excluding paused). */
  durationMs: number;
  /** If set, display countdown to this many ms instead of elapsed. */
  timeLimitMs?: number;
  /** When true, treat the session as live (refresh timer). */
  running: boolean;
}

export function LiveStats({ keystrokes, durationMs, timeLimitMs, running }: Props) {
  // Force re-render at ~5Hz while live so the timer ticks.
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 200);
    return () => window.clearInterval(id);
  }, [running]);

  const errors = keystrokes.reduce((n, k) => n + (k.correct ? 0 : 1), 0);
  const { wpm } = computeWpm(keystrokes.length, errors, Math.max(durationMs, 1));
  const accuracy = computeAccuracy(keystrokes);

  const secondsShown = timeLimitMs
    ? Math.max(0, Math.ceil((timeLimitMs - durationMs) / 1000))
    : Math.floor(durationMs / 1000);

  return (
    <div className="flex items-center gap-6">
      <Stat label="WPM" value={Math.round(wpm).toString()} accent />
      <Stat label="Accuracy" value={`${Math.round(accuracy * 100)}%`} />
      <Stat label={timeLimitMs ? 'Left' : 'Time'} value={formatSeconds(secondsShown)} />
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex flex-col items-start">
      <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted">
        {label}
      </span>
      <span
        className={[
          'font-mono text-3xl font-semibold tabular-nums',
          accent ? 'text-brand-500' : 'text-ink',
        ].join(' ')}
        style={{ letterSpacing: '-0.02em' }}
      >
        {value}
      </span>
    </div>
  );
}

function formatSeconds(s: number): string {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
}
