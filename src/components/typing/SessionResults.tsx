/*
 * End-of-session screen. Big WPM, accuracy + consistency bars, top weak keys
 * from this session, and a "next" CTA.
 */
import type { SessionResult } from '../../types';
import { Button } from '../ui/Button';
import { Sparkles, ArrowRight, RotateCcw } from 'lucide-react';

interface Props {
  result: SessionResult;
  /** Did this session clear an accuracy gate (only relevant for lessons)? */
  cleared?: boolean;
  onNext: () => void;
  onRetry: () => void;
}

export function SessionResults({ result, cleared, onNext, onRetry }: Props) {
  const weakKeys = topErrors(result.errorsByKey, 5);
  const weakBigrams = topErrors(result.errorsByBigram, 5);
  return (
    <div className="card-elevated relative overflow-hidden p-10 animate-pop-in">
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-200/40 blur-3xl" />
      <div className="relative">
        <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-brand-700">
          <Sparkles size={14} />
          {cleared === true ? 'Lesson cleared' : cleared === false ? 'Keep practicing' : 'Session done'}
        </div>
        <h2 className="mt-4 text-4xl font-bold text-ink">Nice work.</h2>
        <p className="mt-1 text-sm text-muted">
          Here's how that session went.
        </p>

        <div className="mt-8 grid grid-cols-3 gap-6">
          <BigNumber label="WPM" value={Math.round(result.wpm).toString()} accent />
          <BigNumber label="Accuracy" value={`${Math.round(result.accuracy * 100)}%`} />
          <BigNumber label="Consistency" value={`${Math.round(result.consistency * 100)}%`} />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          <WeakList title="Trouble keys" items={weakKeys} />
          <WeakList title="Trouble pairs" items={weakBigrams} />
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Button onClick={onNext} size="lg" rightIcon={<ArrowRight size={16} />}>
            {cleared === false ? 'Try again' : 'Continue'}
          </Button>
          <Button variant="secondary" onClick={onRetry} leftIcon={<RotateCcw size={16} />}>
            Retry this one
          </Button>
        </div>
      </div>
    </div>
  );
}

function BigNumber({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted">
        {label}
      </div>
      <div
        className={[
          'font-mono text-5xl font-bold tabular-nums',
          accent ? 'text-brand-500' : 'text-ink',
        ].join(' ')}
        style={{ letterSpacing: '-0.03em' }}
      >
        {value}
      </div>
    </div>
  );
}

function WeakList({ title, items }: { title: string; items: { key: string; n: number }[] }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted">
        {title}
      </div>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-dim">Clean run.</p>
      ) : (
        <ul className="mt-2 flex flex-wrap gap-2">
          {items.map((it) => (
            <li
              key={it.key}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-elevated px-2.5 py-1 font-mono text-sm text-ink"
            >
              <code>{it.key === ' ' ? '␣' : it.key}</code>
              <span className="text-xs text-muted">×{it.n}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function topErrors(byKey: Record<string, number>, limit: number): { key: string; n: number }[] {
  return Object.entries(byKey)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key, n]) => ({ key, n }));
}
