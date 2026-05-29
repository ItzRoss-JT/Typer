/*
 * SVG ring that fills as the user practices toward today's daily goal.
 * The ring stroke uses the brand color; under-filled portions use the border token.
 */
interface Props {
  /** Minutes practiced today */
  todayMinutes: number;
  /** Daily goal in minutes */
  goalMinutes: number;
  size?: number;
}

export function DailyGoalRing({ todayMinutes, goalMinutes, size = 96 }: Props) {
  const ratio = Math.max(0, Math.min(1, todayMinutes / Math.max(1, goalMinutes)));
  const r = (size - 16) / 2;
  const c = 2 * Math.PI * r;
  const dash = c * ratio;

  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={10}
        />
        {/* Fill */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-brand-500)"
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dasharray 400ms cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
        {/* Center number */}
        <text
          x="50%"
          y="50%"
          dominantBaseline="central"
          textAnchor="middle"
          fontFamily="'JetBrains Mono', monospace"
          fontSize="22"
          fontWeight="700"
          fill="var(--color-text)"
          style={{ letterSpacing: '-0.03em' }}
        >
          {Math.min(Math.round(todayMinutes), goalMinutes)}
        </text>
      </svg>
      <div className="flex flex-col">
        <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted">
          Today
        </span>
        <span className="text-sm font-medium text-ink">
          {Math.round(todayMinutes)} / {goalMinutes} min
        </span>
        <span className="text-[11px] font-medium text-muted">
          {ratio >= 1 ? 'Goal met!' : `${Math.max(0, goalMinutes - Math.round(todayMinutes))} to go`}
        </span>
      </div>
    </div>
  );
}
