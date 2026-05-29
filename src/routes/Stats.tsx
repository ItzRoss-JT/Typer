/*
 * Stats page. WPM history chart, key heatmap, weak bigrams, recent sessions.
 * Triggers an adaptive drill via the ?drill=1 query param (used by the
 * "Drill weak spots" CTAs).
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useProgressStore } from '../store/useProgressStore';
import { WpmHistoryChart } from '../components/charts/WpmHistoryChart';
import { KeyHeatmap } from '../components/charts/KeyHeatmap';
import { BigramList } from '../components/charts/BigramList';
import { TypingSession } from '../components/typing/TypingSession';
import { generateAdaptiveDrill } from '../engine/drillGenerator';

export default function Stats() {
  const progress = useProgressStore((s) => s.progress);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const drillActive = searchParams.get('drill') === '1';
  const [drillNonce, setDrillNonce] = useState(0);

  const drillTarget = useMemo(() => {
    return generateAdaptiveDrill(
      progress.weakness.perKey,
      progress.weakness.perBigram,
      progress.history.length,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drillNonce]);

  // Friendly empty state (spec §13)
  if (!drillActive && progress.history.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-ink">Stats</h1>
        <Card elevated>
          <div className="flex flex-col items-start gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-600">
              Empty for now
            </span>
            <h2 className="text-xl font-semibold text-ink">
              Complete your first lesson to see stats.
            </h2>
            <p className="text-muted">
              We'll start tracking your WPM history, per-key accuracy, and your weakest letter
              pairs the moment you finish a session.
            </p>
            <Button onClick={() => navigate('/lessons')} rightIcon={<ArrowRight size={16} />}>
              Start a lesson
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (drillActive) {
    return (
      <div className="space-y-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-600">
                Adaptive drill
              </div>
              <h1 className="text-2xl font-bold text-ink">Drill your weak spots</h1>
            </div>
            <Sparkles className="text-brand-500" />
          </div>
        </Card>
        <TypingSession
          key={drillNonce}
          mode="drill"
          sourceId="adaptive"
          target={drillTarget}
          title="Adaptive drill"
          subtitle="Targets your weakest keys and pairs"
          onNext={() => {
            setSearchParams({});
          }}
          onRetry={() => setDrillNonce((n) => n + 1)}
          onExit={() => setSearchParams({})}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <div className="text-[11px] font-semibold uppercase tracking-[0.15em] text-brand-600">
          Your stats
        </div>
        <h1 className="mt-1 text-3xl font-bold text-ink">Progress</h1>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card elevated>
          <h2 className="mb-4 text-base font-semibold text-ink">Recent WPM & accuracy</h2>
          <WpmHistoryChart history={progress.history} />
        </Card>
        <Card elevated>
          <h2 className="mb-4 text-base font-semibold text-ink">Per-key strength</h2>
          <KeyHeatmap perKey={progress.weakness.perKey} />
        </Card>
      </div>

      <Card elevated>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">Weakest letter pairs</h2>
          <Button
            size="sm"
            onClick={() => {
              setDrillNonce((n) => n + 1);
              setSearchParams({ drill: '1' });
            }}
            rightIcon={<ArrowRight size={14} />}
          >
            Drill weak spots
          </Button>
        </div>
        <BigramList perBigram={progress.weakness.perBigram} />
      </Card>

      <RecentSessions />
    </div>
  );
}

function RecentSessions() {
  const history = useProgressStore((s) => s.progress.history);
  const recent = [...history].reverse().slice(0, 10);
  if (recent.length === 0) return null;
  return (
    <Card elevated>
      <h2 className="mb-4 text-base font-semibold text-ink">Recent sessions</h2>
      <ul className="divide-y divide-border">
        {recent.map((s) => (
          <li key={s.id} className="flex items-center justify-between gap-4 py-2.5 text-sm">
            <div className="text-muted">
              {new Date(s.startedAt).toLocaleString()} · <span className="text-ink">{s.mode}</span>
            </div>
            <div className="flex gap-3 font-mono text-ink tabular-nums">
              <span>{Math.round(s.wpm)} wpm</span>
              <span className="text-muted">{Math.round(s.accuracy * 100)}%</span>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

// `useEffect` is imported but only referenced if React complains; preserve import.
void useEffect;
