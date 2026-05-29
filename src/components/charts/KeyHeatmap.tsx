/*
 * SVG-rendered per-key heatmap. Color encodes accuracy (red→green); the size
 * badge in the corner encodes attempt volume. Hovering shows the exact value.
 */
import type { KeyStats } from '../../types';

interface Props {
  perKey: Record<string, KeyStats>;
}

const ROWS: string[][] = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
];

// Lerp a hex along the red → yellow → green continuum based on accuracy 0..1.
function colorFor(accuracy: number | null, hasData: boolean): string {
  if (!hasData || accuracy === null) return '#F0E5D8';
  // 0 = red, 0.5 = yellow, 1 = green
  if (accuracy < 0.5) {
    const t = accuracy / 0.5;
    return mix('#ef4444', '#eab308', t);
  }
  const t = (accuracy - 0.5) / 0.5;
  return mix('#eab308', '#22c55e', t);
}

function mix(a: string, b: string, t: number): string {
  const ar = parseInt(a.slice(1, 3), 16);
  const ag = parseInt(a.slice(3, 5), 16);
  const ab = parseInt(a.slice(5, 7), 16);
  const br = parseInt(b.slice(1, 3), 16);
  const bg = parseInt(b.slice(3, 5), 16);
  const bb = parseInt(b.slice(5, 7), 16);
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return `rgb(${r}, ${g}, ${bl})`;
}

export function KeyHeatmap({ perKey }: Props) {
  return (
    <div className="space-y-2">
      <div className="flex flex-col items-center gap-1.5">
        {ROWS.map((row, ri) => (
          <div key={ri} className="flex gap-1.5" style={{ paddingLeft: `${ri * 14}px` }}>
            {row.map((k) => {
              const stat = perKey[k];
              const hasData = Boolean(stat && stat.attempts >= 5);
              const accuracy = stat ? stat.accuracy : null;
              return (
                <div
                  key={k}
                  title={hasData ? `${k}: ${Math.round((accuracy ?? 0) * 100)}% over ${Math.round(stat.attempts)} tries` : `${k}: not enough data`}
                  className="relative grid h-11 w-11 place-items-center rounded-md border text-xs font-bold text-ink font-mono uppercase"
                  style={{
                    backgroundColor: colorFor(accuracy, hasData),
                    borderColor: 'rgba(0,0,0,0.05)',
                  }}
                >
                  {k}
                  {hasData ? (
                    <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-ink text-[8px] font-bold text-bg">
                      {volumeBadge(stat.attempts)}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-center gap-3 text-[10px] font-medium uppercase tracking-[0.15em] text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: '#ef4444' }} />
          weak
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: '#eab308' }} />
          ok
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: '#22c55e' }} />
          strong
        </span>
      </div>
    </div>
  );
}

function volumeBadge(attempts: number): string {
  if (attempts < 25) return '·';
  if (attempts < 100) return '•';
  return '●';
}
