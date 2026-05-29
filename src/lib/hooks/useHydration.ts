/*
 * Hydrates both stores from IndexedDB on first mount. Returns true once both
 * stores have finished loading.
 */
import { useEffect } from 'react';
import { useProgressStore } from '../../store/useProgressStore';
import { useSettingsStore } from '../../store/useSettingsStore';

export function useHydration(): boolean {
  const progressHydrated = useProgressStore((s) => s.hydrated);
  const settingsHydrated = useSettingsStore((s) => s.hydrated);
  const hydrateProgress = useProgressStore((s) => s.hydrate);
  const hydrateSettings = useSettingsStore((s) => s.hydrate);

  useEffect(() => {
    if (!progressHydrated) void hydrateProgress();
    if (!settingsHydrated) void hydrateSettings();
  }, [progressHydrated, settingsHydrated, hydrateProgress, hydrateSettings]);

  return progressHydrated && settingsHydrated;
}
