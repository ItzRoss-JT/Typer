/*
 * The core typing surface. Renders the target text with per-character status
 * (untyped / correct / incorrect) and an animated caret.
 *
 * - Layout: a relative-positioned container so we can place the caret absolutely.
 * - Per-char styling: untyped = muted; correct = ink; incorrect = ink on a soft
 *   red wash (color + icon to avoid color-only signaling).
 * - Caret: a 2px-wide vertical bar that blinks (animation keyframes in tailwind config).
 *
 * The surface itself doesn't capture keystrokes — its parent wires `useKeystrokes`.
 */
import { useEffect, useMemo, useRef } from 'react';
import type { Keystroke } from '../../types';

interface Props {
  target: string;
  /** Position of the next char to type. */
  index: number;
  /** Most-recent keystrokes for visual status. */
  keystrokes: Keystroke[];
  /** When true, dims the surface (paused state). */
  paused?: boolean;
}

interface CharState {
  char: string;
  status: 'pending' | 'correct' | 'incorrect' | 'current';
}

export function TypingSurface({ target, index, keystrokes, paused }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const currentRef = useRef<HTMLSpanElement | null>(null);

  const states: CharState[] = useMemo(() => {
    // Walk keystrokes in order: each one advanced one position (engine semantics).
    // First N positions are determined by the first N keystrokes. Position == index
    // is "current". Everything past index is "pending".
    const out: CharState[] = [];
    for (let i = 0; i < target.length; i++) {
      const k = keystrokes[i];
      if (k) {
        // Even if subsequently overtyped via backspace, the recorded keystroke
        // controls the visual status: spec §13 — we don't reward wipe-and-retry.
        out.push({ char: target[i], status: k.correct ? 'correct' : 'incorrect' });
      } else if (i === index) {
        out.push({ char: target[i], status: 'current' });
      } else {
        out.push({ char: target[i], status: 'pending' });
      }
    }
    return out;
  }, [target, index, keystrokes]);

  // Auto-scroll the current word into view so it stays centered (spec §13).
  useEffect(() => {
    const node = currentRef.current;
    const root = containerRef.current;
    if (!node || !root) return;
    const rNode = node.getBoundingClientRect();
    const rRoot = root.getBoundingClientRect();
    if (rNode.bottom > rRoot.bottom - 32 || rNode.top < rRoot.top + 32) {
      node.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [index]);

  return (
    <div
      ref={containerRef}
      className={[
        'relative max-h-[50vh] overflow-y-auto rounded-xl border border-border bg-surface p-8',
        'font-mono text-[24px] leading-[1.75] tracking-[-0.005em] selection:bg-brand-200',
        'whitespace-pre-wrap break-words',
        paused ? 'opacity-60' : '',
      ].join(' ')}
      aria-label="Typing surface"
      aria-live="polite"
    >
      {states.map((cs, i) => {
        const isCurrent = i === index;
        const base =
          'relative transition-colors duration-150 ease-standard';
        let tone = '';
        if (cs.status === 'pending') tone = 'text-dim';
        else if (cs.status === 'correct') tone = 'text-ink';
        else if (cs.status === 'incorrect') tone = 'text-error bg-red-100/60 rounded-sm';
        else if (cs.status === 'current') tone = 'text-ink';

        return (
          <span
            key={i}
            ref={isCurrent ? currentRef : undefined}
            className={`${base} ${tone}`}
            data-pos={i}
          >
            {isCurrent ? (
              <span
                aria-hidden="true"
                className="absolute -left-[2px] top-1 inline-block h-[1.4em] w-[2.5px] rounded-full bg-brand-500 animate-caret-blink"
              />
            ) : null}
            {cs.char}
          </span>
        );
      })}
    </div>
  );
}
