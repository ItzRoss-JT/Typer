/*
 * Glue component: wires the session store + keystroke capture + visual layers
 * together. Used by LessonPlayer, Practice, CodeMode, and the drill flow.
 *
 * Lifecycle: `idle` → user presses any key to `start()` → `active` until either
 * (a) target finished, (b) timer hits zero, or (c) user clicks exit / Esc.
 *
 * Auto-pause on window blur (spec §13).
 */
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useSessionStore } from '../../store/useSessionStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useKeystrokes } from '../../lib/hooks/useKeystrokes';
import { useBeforeUnload } from '../../lib/hooks/useBeforeUnload';
import { TypingSurface } from './TypingSurface';
import { Keyboard } from './Keyboard';
import { LiveStats } from './LiveStats';
import { SessionResults } from './SessionResults';
import { durationMs as engineDuration } from '../../engine/session';
import { useProgressStore } from '../../store/useProgressStore';
import type { SessionMode } from '../../types';
import { Pause, Play, X } from 'lucide-react';
import { Button } from '../ui/Button';

interface Props {
  mode: SessionMode;
  sourceId: string;
  target: string;
  /** Optional time limit in seconds for timed practice/code modes. */
  timeLimitSeconds?: number;
  /** Called when user clicks Continue on the results screen. */
  onNext: (clearedLesson: boolean | undefined) => void;
  /** Called when user clicks Retry. */
  onRetry: () => void;
  /** Called when user aborts (X / Esc). */
  onExit: () => void;
  /** Accuracy gate (used only for lesson mode) — defaults to settings.accuracyGate. */
  accuracyGate?: number;
  /** Heading shown at the top of the surface. */
  title?: string;
  /** Subheading (e.g. "Drill 2 of 4"). */
  subtitle?: string;
  /** If set, the surface auto-advances through positions for which this returns true.
   *  Used by code mode to skip leading-whitespace runs (§7.6). */
  autoSkippable?: (target: string, i: number) => boolean;
}

export function TypingSession({
  mode,
  sourceId,
  target,
  timeLimitSeconds,
  onNext,
  onRetry,
  onExit,
  accuracyGate,
  title,
  subtitle,
  autoSkippable,
}: Props) {
  const session = useSessionStore((s) => s.session);
  const begin = useSessionStore((s) => s.begin);
  const startSession = useSessionStore((s) => s.start);
  const recordKey = useSessionStore((s) => s.recordKey);
  const autoSkip = useSessionStore((s) => s.autoSkip);
  const pause = useSessionStore((s) => s.pause);
  const resume = useSessionStore((s) => s.resume);
  const finishSession = useSessionStore((s) => s.finish);
  const snapshot = useSessionStore((s) => s.snapshotResult);
  const clearSession = useSessionStore((s) => s.clear);

  const settings = useSettingsStore((s) => s.settings);
  const addSession = useProgressStore((s) => s.addSession);
  const markLessonCleared = useProgressStore((s) => s.markLessonCleared);

  // Initialize the session whenever target or sourceId changes.
  useEffect(() => {
    begin(mode, sourceId, target);
    return () => clearSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, sourceId, target]);

  // Track active duration with a ticking ref so timer-based finish works.
  const tickRef = useRef(0);
  useEffect(() => {
    if (session?.status !== 'active' || !timeLimitSeconds) return;
    const id = window.setInterval(() => {
      const s = useSessionStore.getState().session;
      if (!s) return;
      const elapsed = engineDuration(s);
      if (elapsed >= timeLimitSeconds * 1000) {
        finishSession();
      }
      tickRef.current += 1;
    }, 200);
    return () => window.clearInterval(id);
  }, [session?.status, timeLimitSeconds, finishSession]);

  // Auto-pause on window blur, resume on focus (spec §13).
  useEffect(() => {
    function onBlur() {
      const s = useSessionStore.getState().session;
      if (s?.status === 'active') pause();
    }
    function onFocus() {
      const s = useSessionStore.getState().session;
      if (s?.status === 'paused') resume();
    }
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);
    return () => {
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
    };
  }, [pause, resume]);

  // Esc exits the surface.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onExit();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onExit]);

  // Warn before unloading mid-session.
  useBeforeUnload(session?.status === 'active' || session?.status === 'paused');

  // Keystroke handler — also auto-starts the session on the first keypress.
  const onKey = useCallback(
    (input: string) => {
      const s = useSessionStore.getState().session;
      if (!s) return;
      if (s.status === 'idle') {
        startSession();
        // The 'start' call doesn't consume the input. Re-call after start
        // (next event loop tick) so the very first keypress is captured.
        queueMicrotask(() => recordKey(input));
        return;
      }
      if (s.status !== 'active') return;
      recordKey(input);
    },
    [recordKey, startSession],
  );

  useKeystrokes({
    onKey,
    disabled: session?.status === 'finished' || session?.status === 'aborted',
  });

  // After each index change, auto-skip skippable positions (e.g. leading
  // spaces in code mode). This runs as a side effect so the engine stays pure.
  useEffect(() => {
    if (!autoSkippable) return;
    const s = useSessionStore.getState().session;
    if (!s || s.status !== 'active') return;
    if (autoSkippable(s.target, s.index)) {
      autoSkip(autoSkippable);
    }
  }, [session?.index, session?.status, autoSkippable, autoSkip]);

  // When session finishes, persist + show results.
  const finished = session?.status === 'finished';
  const resultMemo = useMemo(() => {
    if (!finished) return null;
    return snapshot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  useEffect(() => {
    if (!finished || !resultMemo) return;
    addSession(resultMemo, settings.dailyGoalMinutes);
    if (mode === 'lesson') {
      const gate = accuracyGate ?? settings.accuracyGate;
      if (resultMemo.accuracy >= gate) {
        markLessonCleared(sourceId, resultMemo.accuracy, resultMemo.wpm);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished, resultMemo]);

  if (resultMemo) {
    const gate = accuracyGate ?? settings.accuracyGate;
    const cleared = mode === 'lesson' ? resultMemo.accuracy >= gate : undefined;
    return (
      <SessionResults
        result={resultMemo}
        cleared={cleared}
        onNext={() => onNext(cleared)}
        onRetry={onRetry}
      />
    );
  }

  const status = session?.status ?? 'idle';
  const elapsed = session ? engineDuration(session) : 0;
  const nextKey = session ? target[session.index] : undefined;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          {subtitle ? (
            <div className="text-[11px] font-semibold uppercase tracking-[0.15em] text-brand-600">
              {subtitle}
            </div>
          ) : null}
          {title ? <h1 className="mt-1 text-2xl font-semibold text-ink">{title}</h1> : null}
        </div>
        <div className="flex items-center gap-6">
          <LiveStats
            keystrokes={session?.keystrokes ?? []}
            durationMs={elapsed}
            timeLimitMs={timeLimitSeconds ? timeLimitSeconds * 1000 : undefined}
            running={status === 'active'}
          />
          <div className="flex gap-2">
            {status === 'paused' ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => resume()}
                leftIcon={<Play size={14} />}
              >
                Resume
              </Button>
            ) : status === 'active' ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => pause()}
                leftIcon={<Pause size={14} />}
              >
                Pause
              </Button>
            ) : null}
            <Button
              variant="ghost"
              size="sm"
              onClick={onExit}
              leftIcon={<X size={14} />}
              aria-label="Exit session"
            >
              Exit
            </Button>
          </div>
        </div>
      </header>

      {status === 'idle' ? (
        <div className="card flex items-center justify-center p-10 text-sm text-muted">
          Press any key to start typing…
        </div>
      ) : null}

      <TypingSurface
        target={target}
        index={session?.index ?? 0}
        keystrokes={session?.keystrokes ?? []}
        paused={status === 'paused'}
      />

      {settings.showKeyboard ? (
        <Keyboard
          nextKey={settings.highlightNextKey ? nextKey : undefined}
          showFingerColors={settings.showFingerColors}
        />
      ) : null}
    </div>
  );
}
