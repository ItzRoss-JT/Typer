/*
 * Animated streak counter. The flame swells subtly on mount; on a stale
 * streak (zero days), it's rendered greyed out.
 */
import { Flame } from 'lucide-react';

interface Props {
  current: number;
  longest: number;
  atRisk?: boolean;
}

export function StreakFlame({ current, longest, atRisk }: Props) {
  const cold = current === 0;
  return (
    <div className="flex items-center gap-4">
      <div
        className={[
          'relative grid h-16 w-16 place-items-center rounded-full',
          cold ? 'bg-elevated text-dim' : 'bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-elevated',
          atRisk ? 'animate-pop-in' : '',
        ].join(' ')}
      >
        <Flame size={28} strokeWidth={2.2} />
        {atRisk && !cold ? (
          <span className="absolute -bottom-1 -right-1 inline-block h-3 w-3 rounded-full bg-warning ring-2 ring-bg" />
        ) : null}
      </div>
      <div className="flex flex-col">
        <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted">
          Streak
        </span>
        <span
          className="font-mono text-4xl font-bold tabular-nums text-ink"
          style={{ letterSpacing: '-0.03em' }}
        >
          {current}
        </span>
        <span className="text-[11px] font-medium text-muted">
          Longest: {longest} {longest === 1 ? 'day' : 'days'}
        </span>
      </div>
    </div>
  );
}
