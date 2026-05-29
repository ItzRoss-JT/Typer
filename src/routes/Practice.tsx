/*
 * Free practice — random quotes with a configurable timer.
 * Spec §7.5.
 */
import { useCallback, useEffect, useState } from 'react';
import { TypingSession } from '../components/typing/TypingSession';
import { QUOTES, randomQuote } from '../data/quotes';
import { Button } from '../components/ui/Button';
import { Shuffle } from 'lucide-react';
import { useSettingsStore } from '../store/useSettingsStore';
import type { Quote } from '../types';

const DURATIONS = [15, 30, 60, 120] as const;
type Duration = (typeof DURATIONS)[number];

export default function Practice() {
  const settingsDuration = useSettingsStore((s) => s.settings.defaultPracticeSeconds);
  const [duration, setDuration] = useState<Duration>(settingsDuration);
  const [quote, setQuote] = useState<Quote>(() => randomQuote());
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    setDuration(settingsDuration);
  }, [settingsDuration]);

  const handleNext = useCallback(() => {
    setQuote(randomQuote());
    setNonce((n) => n + 1);
  }, []);

  const handleExit = useCallback(() => {
    // No-op for /practice — staying on the route restarts via "new quote".
    handleNext();
  }, [handleNext]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.15em] text-brand-600">
            Free Practice
          </div>
          <h1 className="mt-1 text-3xl font-bold text-ink">Random quotes</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted">
            Timer
          </span>
          <div className="inline-flex rounded-md border border-border bg-surface p-1">
            {DURATIONS.map((d) => (
              <button
                key={d}
                onClick={() => {
                  setDuration(d);
                  setNonce((n) => n + 1);
                }}
                className={[
                  'rounded px-3 py-1 text-sm font-medium transition-colors duration-150 ease-standard',
                  duration === d ? 'bg-brand-500 text-white' : 'text-muted hover:text-ink',
                ].join(' ')}
              >
                {d}s
              </button>
            ))}
          </div>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Shuffle size={14} />}
            onClick={() => {
              setQuote(randomQuote());
              setNonce((n) => n + 1);
            }}
          >
            New quote
          </Button>
        </div>
      </header>

      <TypingSession
        key={`${quote.id}-${duration}-${nonce}`}
        mode="practice"
        sourceId={quote.id}
        target={quote.text}
        timeLimitSeconds={duration}
        title={quote.attribution ?? 'Anonymous'}
        subtitle={`${duration}s test · 1 of ${QUOTES.length} quotes`}
        onNext={handleNext}
        onRetry={() => setNonce((n) => n + 1)}
        onExit={handleExit}
      />
    </div>
  );
}
