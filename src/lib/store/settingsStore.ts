import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserSettings } from '../types';

interface SettingsState {
  settings: UserSettings;
}

interface SettingsActions {
  updateSettings: (updates: Partial<UserSettings>) => void;
  resetSettings: () => void;
  toggleTheme: () => void;
}

type SettingsStore = SettingsState & SettingsActions;

const defaultSettings: UserSettings = {
  theme: 'auto',
  accentColor: '#6366f1',
  defaultView: 'list',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h',
  firstDayOfWeek: 0,
  defaultTaskDuration: 60,
  defaultPriority: 'medium',
  notifications: {
    enabled: true,
    before: [15, 60],
    sound: true,
  },
  sortBy: 'dueDate',
  groupBy: 'none',
  showCompletedTasks: true,
  compactMode: false,
  language: 'en',
  firstRunComplete: false,
  analyticsEnabled: false,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: defaultSettings,

      updateSettings: (updates) => {
        set((state) => ({
          settings: { ...state.settings, ...updates },
        }));
      },

      resetSettings: () => {
        set({ settings: defaultSettings });
      },

      toggleTheme: () => {
        set((state) => {
          const currentTheme = state.settings.theme;
          const nextTheme: UserSettings['theme'] = 
            currentTheme === 'light' ? 'dark' : 
            currentTheme === 'dark' ? 'auto' : 'light';
          return {
            settings: { ...state.settings, theme: nextTheme },
          };
        });
      },
    }),
    {
      name: 'homework-planner-settings',
    }
  )
);

// Theme utilities
export const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const getEffectiveTheme = (theme: UserSettings['theme']): 'light' | 'dark' => {
  if (theme === 'auto') {
    return getSystemTheme();
  }
  return theme;
};
