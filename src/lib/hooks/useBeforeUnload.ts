import { useEffect } from 'react';

/**
 * Shows the browser's "Leave site?" prompt when `armed` is true.
 * Used during an in-flight session so the user doesn't lose their session
 * by accidentally closing the tab.
 */
export function useBeforeUnload(armed: boolean): void {
  useEffect(() => {
    if (!armed) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Modern browsers ignore the message; setting returnValue triggers the dialog.
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [armed]);
}
