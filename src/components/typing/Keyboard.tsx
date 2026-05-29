/*
 * On-screen QWERTY keyboard with finger color zones and a next-key highlight.
 * Optional via Settings.showKeyboard.
 *
 * We use inline-style backgrounds because Tailwind's opacity modifier syntax
 * (e.g. `bg-finger-l-pinky/25`) requires colors in space-separated RGB form,
 * but our tokens.css defines them as hex.
 */
import type { FingerId } from '../../types';
import { fingerFor } from '../../engine/fingerMap';

interface Props {
  /** The next key the user should press, or undefined when no session. */
  nextKey?: string;
  /** When false, colors are suppressed (settings.showFingerColors). */
  showFingerColors: boolean;
}

const ROWS: string[][] = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
];

const FINGER_HEX: Record<FingerId, string> = {
  L_PINKY: '#ec4899',
  L_RING: '#a855f7',
  L_MIDDLE: '#3b82f6',
  L_INDEX: '#06b6d4',
  R_INDEX: '#14b8a6',
  R_MIDDLE: '#22c55e',
  R_RING: '#eab308',
  R_PINKY: '#f97316',
  THUMB: '#94a3b8',
};

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function Keyboard({ nextKey, showFingerColors }: Props) {
  const target = nextKey ? nextKey.toLowerCase() : undefined;
  return (
    <div className="mx-auto w-full max-w-3xl select-none" aria-hidden="true">
      <div className="flex flex-col gap-1.5">
        {ROWS.map((row, ri) => (
          <div
            key={ri}
            className="flex justify-center gap-1.5"
            style={{ paddingLeft: `${ri * 14}px` }}
          >
            {row.map((k) => (
              <Key
                key={k}
                label={k}
                isNext={target === k}
                finger={fingerFor(k)}
                showFingerColors={showFingerColors}
                width="w-11"
              />
            ))}
          </div>
        ))}
        <div className="mt-1 flex justify-center gap-1.5">
          <Key
            label="space"
            isNext={target === ' '}
            finger="THUMB"
            showFingerColors={showFingerColors}
            width="w-72"
          />
        </div>
      </div>
    </div>
  );
}

function Key({
  label,
  isNext,
  finger,
  showFingerColors,
  width,
}: {
  label: string;
  isNext: boolean;
  finger?: FingerId;
  showFingerColors: boolean;
  width: string;
}) {
  const hex = finger ? FINGER_HEX[finger] : undefined;
  const useColor = showFingerColors && hex;

  const inlineStyle: React.CSSProperties = useColor
    ? {
        backgroundColor: hexToRgba(hex, 0.18),
        borderColor: hexToRgba(hex, 0.55),
        color: hex,
      }
    : {};

  return (
    <div
      style={inlineStyle}
      className={[
        'relative flex h-11 items-center justify-center rounded-md border text-xs font-bold',
        'font-mono uppercase',
        !useColor ? 'bg-elevated border-border text-muted' : '',
        width,
        isNext
          ? 'ring-2 ring-brand-500 ring-offset-2 ring-offset-bg !text-ink shadow-glow animate-pop-in'
          : '',
      ].join(' ')}
    >
      {label}
    </div>
  );
}
