/*
 * Settings store. Loads on app mount, persists on every change.
 */
import { create } from 'zustand';
import type { UserSettings } from '../types';
import { defaultSettings, loadSettings, saveSettings } from '../lib/db';

interface SettingsStore {
  settings: UserSettings;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  update: (patch: Partial<UserSettings>) => void;
  setOnboardingComplete: () => void;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: defaultSettings(),
  hydrated: false,
  hydrate: async () => {
    const s = await loadSettings();
    set({ settings: s, hydrated: true });
  },
  update: (patch) => {
    const next = { ...get().settings, ...patch };
    set({ settings: next });
    void saveSettings(next);
  },
  setOnboardingComplete: () => {
    const next = { ...get().settings, onboardingCompleted: true };
    set({ settings: next });
    void saveSettings(next);
  },
}));
