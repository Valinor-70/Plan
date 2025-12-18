import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserSettings } from '../types';

// Extended Settings Types
export interface NotificationPreferences {
  enabled: boolean;
  before: number[];
  sound: boolean;
  // New notification settings
  frequency: 'aggressive' | 'moderate' | 'minimal' | 'custom';
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  productiveHoursStart?: string;
  productiveHoursEnd?: string;
  weekendStrategy: 'same' | 'reduced' | 'off';
}

export interface TaskManagementPreferences {
  defaultTaskDuration: number;
  autoSchedulingEnabled: boolean;
  autoSchedulingAggressiveness: 'low' | 'medium' | 'high';
  taskViewPreference: 'list' | 'kanban' | 'calendar' | 'timeline';
  colorScheme: Record<string, string>;
  completionConfirmation: boolean;
  defaultPriority: 'low' | 'medium' | 'high' | 'urgent';
  categoryStructure: string[];
  priorityTiers: 3 | 5;
  deadlineStrictness: 'soft' | 'hard';
  subtaskBehavior: 'expanded' | 'collapsed' | 'hide-until-active';
}

export interface HeuristicPreferences {
  enabled: boolean;
  motivationStyle: 'encouraging' | 'neutral' | 'challenging';
  suggestionFrequency: number; // 1-10 (1=once per day, 10=multiple per hour)
  confidenceThreshold: number; // 0.1-0.9 (only suggest above this probability)
  surpriseFactorEnabled: boolean;
  proactiveMode: boolean; // system initiates vs waits for user
  energyTrackingEnabled: boolean;
  energyCheckInFrequency: 'hourly' | 'every-3-hours' | 'daily' | 'manual';
  energyScale: 'numeric' | 'emoji' | 'descriptive';
  adaptiveWeightsEnabled: boolean;
  showLearningTransparency: boolean;
}

export interface DisplayPreferences {
  theme: 'light' | 'dark' | 'auto';
  accentColor: string;
  typographyScale: 'small' | 'medium' | 'large';
  animationIntensity: 'full' | 'reduced' | 'minimal';
  density: 'compact' | 'comfortable' | 'spacious';
  dashboardWidgets: string[];
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  timeFormat: '12h' | '24h';
  firstDayOfWeek: 0 | 1;
}

interface ExtendedUserSettings extends UserSettings {
  notificationPrefs?: NotificationPreferences;
  taskManagementPrefs?: TaskManagementPreferences;
  heuristicPrefs?: HeuristicPreferences;
  displayPrefs?: DisplayPreferences;
  userName?: string;
  profilePicture?: string;
  onboardingCompleted?: boolean;
}

interface SettingsState {
  settings: ExtendedUserSettings;
}

interface SettingsActions {
  updateSettings: (updates: Partial<ExtendedUserSettings>) => void;
  updateNotificationPrefs: (updates: Partial<NotificationPreferences>) => void;
  updateTaskManagementPrefs: (updates: Partial<TaskManagementPreferences>) => void;
  updateHeuristicPrefs: (updates: Partial<HeuristicPreferences>) => void;
  updateDisplayPrefs: (updates: Partial<DisplayPreferences>) => void;
  resetSettings: () => void;
  toggleTheme: () => void;
  exportSettings: () => string;
  importSettings: (jsonString: string) => boolean;
}

type SettingsStore = SettingsState & SettingsActions;

const defaultNotificationPrefs: NotificationPreferences = {
  enabled: true,
  before: [15, 60],
  sound: true,
  frequency: 'moderate',
  quietHoursEnabled: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
  weekendStrategy: 'reduced',
};

const defaultTaskManagementPrefs: TaskManagementPreferences = {
  defaultTaskDuration: 60,
  autoSchedulingEnabled: false,
  autoSchedulingAggressiveness: 'medium',
  taskViewPreference: 'list',
  colorScheme: {},
  completionConfirmation: false,
  defaultPriority: 'medium',
  categoryStructure: [],
  priorityTiers: 5,
  deadlineStrictness: 'soft',
  subtaskBehavior: 'collapsed',
};

const defaultHeuristicPrefs: HeuristicPreferences = {
  enabled: true,
  motivationStyle: 'encouraging',
  suggestionFrequency: 5,
  confidenceThreshold: 0.6,
  surpriseFactorEnabled: true,
  proactiveMode: true,
  energyTrackingEnabled: true,
  energyCheckInFrequency: 'every-3-hours',
  energyScale: 'numeric',
  adaptiveWeightsEnabled: true,
  showLearningTransparency: true,
};

const defaultDisplayPrefs: DisplayPreferences = {
  theme: 'auto',
  accentColor: '#6366f1',
  typographyScale: 'medium',
  animationIntensity: 'full',
  density: 'comfortable',
  dashboardWidgets: ['next-task', 'streak', 'achievements', 'calendar'],
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h',
  firstDayOfWeek: 0,
};

const defaultSettings: ExtendedUserSettings = {
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
  notificationPrefs: defaultNotificationPrefs,
  taskManagementPrefs: defaultTaskManagementPrefs,
  heuristicPrefs: defaultHeuristicPrefs,
  displayPrefs: defaultDisplayPrefs,
  onboardingCompleted: false,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,

      updateSettings: (updates) => {
        set((state) => ({
          settings: { ...state.settings, ...updates },
        }));
      },

      updateNotificationPrefs: (updates) => {
        set((state) => ({
          settings: {
            ...state.settings,
            notificationPrefs: {
              ...state.settings.notificationPrefs,
              ...updates,
            } as NotificationPreferences,
          },
        }));
      },

      updateTaskManagementPrefs: (updates) => {
        set((state) => ({
          settings: {
            ...state.settings,
            taskManagementPrefs: {
              ...state.settings.taskManagementPrefs,
              ...updates,
            } as TaskManagementPreferences,
          },
        }));
      },

      updateHeuristicPrefs: (updates) => {
        set((state) => ({
          settings: {
            ...state.settings,
            heuristicPrefs: {
              ...state.settings.heuristicPrefs,
              ...updates,
            } as HeuristicPreferences,
          },
        }));
      },

      updateDisplayPrefs: (updates) => {
        set((state) => ({
          settings: {
            ...state.settings,
            displayPrefs: {
              ...state.settings.displayPrefs,
              ...updates,
            } as DisplayPreferences,
          },
        }));
      },

      resetSettings: () => {
        set({ settings: defaultSettings });
      },

      toggleTheme: () => {
        set((state) => {
          const currentTheme = state.settings.theme;
          const nextTheme: ExtendedUserSettings['theme'] = 
            currentTheme === 'light' ? 'dark' : 
            currentTheme === 'dark' ? 'auto' : 'light';
          return {
            settings: { ...state.settings, theme: nextTheme },
          };
        });
      },

      exportSettings: () => {
        return JSON.stringify(get().settings, null, 2);
      },

      importSettings: (jsonString) => {
        try {
          const imported = JSON.parse(jsonString);
          set({ settings: { ...defaultSettings, ...imported } });
          return true;
        } catch (error) {
          console.error('Failed to import settings:', error);
          return false;
        }
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

export const getEffectiveTheme = (theme: ExtendedUserSettings['theme']): 'light' | 'dark' => {
  if (theme === 'auto') {
    return getSystemTheme();
  }
  return theme;
};

