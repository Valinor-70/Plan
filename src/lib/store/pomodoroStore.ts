import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PomodoroSession, PomodoroSettings, ActiveSession, TodayStats } from '../types';
import { generateId } from '../utils/generateId';

interface PomodoroState {
  activeSession: ActiveSession | null;
  sessionHistory: PomodoroSession[];
  settings: PomodoroSettings;
  todayStats: TodayStats;
  sessionCount: number; // For tracking long break intervals
}

interface PomodoroActions {
  startSession: (taskId: string | null, type: 'work' | 'shortBreak' | 'longBreak') => void;
  pauseSession: () => void;
  resumeSession: () => void;
  stopSession: (interrupted: boolean) => void;
  completeSession: () => void;
  skipBreak: () => void;
  updateSettings: (settings: Partial<PomodoroSettings>) => void;
  getTodaysSessions: () => PomodoroSession[];
  getSessionsByTask: (taskId: string) => PomodoroSession[];
  getSessionsByDateRange: (start: Date, end: Date) => PomodoroSession[];
  resetTodayStats: () => void;
}

type PomodoroStore = PomodoroState & PomodoroActions;

const defaultSettings: PomodoroSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartWork: false,
  soundEnabled: true,
  notificationsEnabled: true,
  volume: 50,
};

const defaultTodayStats: TodayStats = {
  workMinutes: 0,
  breakMinutes: 0,
  completedSessions: 0,
  interruptions: 0,
};

export const usePomodoroStore = create<PomodoroStore>()(
  persist(
    (set, get) => ({
      activeSession: null,
      sessionHistory: [],
      settings: defaultSettings,
      todayStats: defaultTodayStats,
      sessionCount: 0,

      startSession: (taskId, type) => {
        const { settings } = get();
        let duration: number;
        
        switch (type) {
          case 'work':
            duration = settings.workDuration;
            break;
          case 'shortBreak':
            duration = settings.shortBreakDuration;
            break;
          case 'longBreak':
            duration = settings.longBreakDuration;
            break;
        }

        set({
          activeSession: {
            taskId,
            type,
            startTime: new Date(),
            duration,
            isPaused: false,
            totalPausedTime: 0,
          },
        });

        // Request notification permission if needed
        if (settings.notificationsEnabled && typeof window !== 'undefined') {
          if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
          }
        }
      },

      pauseSession: () => {
        set((state) => {
          if (!state.activeSession) return state;
          return {
            activeSession: {
              ...state.activeSession,
              isPaused: true,
              pausedAt: new Date(),
            },
          };
        });
      },

      resumeSession: () => {
        set((state) => {
          if (!state.activeSession || !state.activeSession.pausedAt) return state;
          
          const pausedDuration = Math.floor(
            (new Date().getTime() - state.activeSession.pausedAt.getTime()) / 1000
          );
          
          return {
            activeSession: {
              ...state.activeSession,
              isPaused: false,
              pausedAt: undefined,
              totalPausedTime: state.activeSession.totalPausedTime + pausedDuration,
            },
          };
        });
      },

      stopSession: (interrupted) => {
        const { activeSession, sessionHistory, todayStats } = get();
        if (!activeSession) return;

        const endTime = new Date();
        const session: PomodoroSession = {
          id: generateId(),
          taskId: activeSession.taskId,
          type: activeSession.type,
          startTime: activeSession.startTime,
          endTime,
          completed: !interrupted,
          interrupted,
        };

        // Update stats
        const duration = Math.floor(
          (endTime.getTime() - activeSession.startTime.getTime()) / 60000 - 
          activeSession.totalPausedTime / 60
        );

        const updatedStats = { ...todayStats };
        if (interrupted) {
          updatedStats.interruptions += 1;
        } else {
          updatedStats.completedSessions += 1;
          if (activeSession.type === 'work') {
            updatedStats.workMinutes += duration;
          } else {
            updatedStats.breakMinutes += duration;
          }
        }

        set({
          activeSession: null,
          sessionHistory: [...sessionHistory, session],
          todayStats: updatedStats,
        });
      },

      completeSession: () => {
        const { activeSession, sessionCount, settings } = get();
        if (!activeSession) return;

        get().stopSession(false);

        // Auto-start next session if enabled
        if (activeSession.type === 'work') {
          const newCount = sessionCount + 1;
          set({ sessionCount: newCount });

          if (settings.autoStartBreaks) {
            // Start long break after N work sessions
            if (newCount % settings.longBreakInterval === 0) {
              get().startSession(null, 'longBreak');
            } else {
              get().startSession(null, 'shortBreak');
            }
          }
        } else if (settings.autoStartWork) {
          // Start work session after break
          get().startSession(activeSession.taskId, 'work');
        }
      },

      skipBreak: () => {
        const { activeSession } = get();
        if (!activeSession || activeSession.type === 'work') return;
        
        get().stopSession(true);
        get().startSession(activeSession.taskId, 'work');
      },

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },

      getTodaysSessions: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        return get().sessionHistory.filter((session) => {
          const sessionDate = new Date(session.startTime);
          return sessionDate >= today && sessionDate < tomorrow;
        });
      },

      getSessionsByTask: (taskId) => {
        return get().sessionHistory.filter((session) => session.taskId === taskId);
      },

      getSessionsByDateRange: (start, end) => {
        return get().sessionHistory.filter((session) => {
          const sessionDate = new Date(session.startTime);
          return sessionDate >= start && sessionDate <= end;
        });
      },

      resetTodayStats: () => {
        set({ todayStats: defaultTodayStats });
      },
    }),
    {
      name: 'homework-planner-pomodoro',
      partialize: (state) => ({
        sessionHistory: state.sessionHistory,
        settings: state.settings,
        sessionCount: state.sessionCount,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Convert date strings back to Date objects
          state.sessionHistory = state.sessionHistory
            .filter(session => session.startTime && session.endTime) // Only include complete sessions
            .map((session) => ({
              ...session,
              startTime: new Date(session.startTime),
              endTime: new Date(session.endTime),
            }));

          // Reset today stats on load
          state.todayStats = defaultTodayStats;
          
          // Calculate today's stats from session history
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const todaysSessions = state.sessionHistory.filter((session) => {
            const sessionDate = new Date(session.startTime);
            sessionDate.setHours(0, 0, 0, 0);
            return sessionDate.getTime() === today.getTime() && session.completed;
          });

          todaysSessions.forEach((session) => {
            const duration = Math.floor(
              (session.endTime.getTime() - session.startTime.getTime()) / 60000
            );
            
            if (session.type === 'work') {
              state.todayStats.workMinutes += duration;
            } else {
              state.todayStats.breakMinutes += duration;
            }
            
            if (session.completed) {
              state.todayStats.completedSessions += 1;
            }
            if (session.interrupted) {
              state.todayStats.interruptions += 1;
            }
          });
        }
      },
    }
  )
);
