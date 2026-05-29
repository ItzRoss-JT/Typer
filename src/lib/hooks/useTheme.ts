/*
 * Applies the active theme to <html data-theme="..."> whenever the user's
 * theme setting changes. Theme value 'auto' follows prefers-color-scheme.
 */
import { useEffect } from 'react';
import { useSettingsStore } from '../../store/useSettingsStore';

export function useTheme(): void {
  const theme = useSettingsStore((s) => s.settings.theme);
  useEffect(() => {
    const apply = (mode: 'light' | 'dark') => {
      document.documentElement.dataset.theme = mode;
    };
    if (theme === 'auto') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      apply(mq.matches ? 'dark' : 'light');
      const handler = (e: MediaQueryListEvent) => apply(e.matches ? 'dark' : 'light');
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
    apply(theme);
  }, [theme]);
}
