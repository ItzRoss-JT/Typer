/*
 * Captures keystrokes at the window level while a session is active. Filters
 * to printable characters + Backspace and rejects paste (spec §13 anti-cheat).
 *
 * We bind to window keydown rather than to a focused <input> because the
 * typing surface is just a styled <div> — the focus comes from the page
 * itself. Esc is treated as "exit/pause" by the caller (we pass it through
 * unchanged).
 */
import { useEffect } from 'react';

export interface KeystrokeHandlers {
  onKey: (input: string) => void;
  /** True while paused/finished — input is ignored at the source. */
  disabled: boolean;
}

export function useKeystrokes({ onKey, disabled }: KeystrokeHandlers): void {
  useEffect(() => {
    if (disabled) return;

    function handleKeydown(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return; // ignore browser shortcuts
      if (e.key === 'Backspace') {
        e.preventDefault();
        onKey('Backspace');
        return;
      }
      if (e.key === 'Tab') {
        // Prevent default to keep focus from leaving the surface (spec §13).
        e.preventDefault();
        onKey('\t');
        return;
      }
      // We only accept single-character printable keys.
      if (e.key.length === 1) {
        e.preventDefault();
        onKey(e.key);
      }
      // Other keys (Shift, Esc, F-keys, arrows) pass through to the document.
    }

    // Reject multi-character paste via the input event. We catch any paste
    // attempt at the document level — the surface is focusable but doesn't
    // hold text, so paste manifests as a beforeinput with inputType.
    function handlePaste(e: ClipboardEvent) {
      e.preventDefault();
    }

    window.addEventListener('keydown', handleKeydown);
    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('keydown', handleKeydown);
      window.removeEventListener('paste', handlePaste);
    };
  }, [onKey, disabled]);
}
