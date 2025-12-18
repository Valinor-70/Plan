import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProgress, Achievement } from '../types/gamification';
import { ACHIEVEMENTS, calculateLevel, xpForNextLevel } from '../gamification/achievements';

interface GamificationState extends UserProgress {
  addXP: (xp: number) => { leveledUp: boolean; newLevel?: number };
  unlockAchievement: (achievementId: string) => boolean;
  checkAchievements: (stats: Partial<UserProgress['stats']>) => Achievement[];
  updateStats: (stats: Partial<UserProgress['stats']>) => void;
}

const initialStats = {
  tasksCompleted: 0,
  pomodorosCompleted: 0,
  currentStreak: 0,
  longestStreak: 0,
  totalWorkMinutes: 0,
  perfectDays: 0,
};

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set, get) => ({
      level: 1,
      currentXP: 0,
      nextLevelXP: 100,
      totalXP: 0,
      achievements: ACHIEVEMENTS.map(a => ({
        ...a,
        progress: getAchievementProgress(a.id, initialStats),
        unlockedAt: undefined,
      })),
      stats: initialStats,

      addXP: (xp) => {
        const state = get();
        const newTotalXP = state.totalXP + xp;
        const newCurrentXP = state.currentXP + xp;
        const newLevel = calculateLevel(newTotalXP);
        const leveledUp = newLevel > state.level;
        const nextLevelXP = xpForNextLevel(newLevel);

        set({
          totalXP: newTotalXP,
          currentXP: leveledUp ? newCurrentXP - state.nextLevelXP : newCurrentXP,
          level: newLevel,
          nextLevelXP,
        });

        return { leveledUp, newLevel: leveledUp ? newLevel : undefined };
      },

      unlockAchievement: (achievementId) => {
        const state = get();
        const achievement = state.achievements.find(a => a.id === achievementId);
        
        if (!achievement || achievement.unlockedAt) {
          return false; // Already unlocked or doesn't exist
        }

        set({
          achievements: state.achievements.map(a =>
            a.id === achievementId
              ? { ...a, unlockedAt: new Date() }
              : a
          ),
        });

        // Award XP for achievement
        const xpBonus = achievement.rarity === 'legendary' ? 500 
          : achievement.rarity === 'epic' ? 200
          : achievement.rarity === 'rare' ? 50
          : 20;
        
        get().addXP(xpBonus);
        
        return true;
      },

      checkAchievements: (updatedStats) => {
        const state = get();
        const newStats = { ...state.stats, ...updatedStats };
        const newlyUnlocked: Achievement[] = [];

        state.achievements.forEach(achievement => {
          if (achievement.unlockedAt) return; // Already unlocked

          const progress = getAchievementProgress(achievement.id, newStats);
          
          if (progress.current >= progress.target) {
            if (get().unlockAchievement(achievement.id)) {
              newlyUnlocked.push({
                ...achievement,
                progress,
                unlockedAt: new Date(),
              });
            }
          }
        });

        // Update progress for all achievements
        set({
          achievements: state.achievements.map(a => ({
            ...a,
            progress: getAchievementProgress(a.id, newStats),
          })),
        });

        return newlyUnlocked;
      },

      updateStats: (newStats) => {
        set((state) => ({
          stats: { ...state.stats, ...newStats },
        }));
        
        // Check for newly unlocked achievements
        get().checkAchievements(newStats);
      },
    }),
    {
      name: 'homework-planner-gamification',
    }
  )
);

function getAchievementProgress(
  achievementId: string,
  stats: UserProgress['stats']
): { current: number; target: number } {
  switch (achievementId) {
    // TIER 1: Foundation
    case 'first-steps':
      // Tracks task creation - would need separate stat in real implementation
      return { current: Math.min(stats.tasksCompleted, 1), target: 1 };
    case 'first-completion':
      // Tracks task completion
      return { current: Math.min(stats.tasksCompleted, 1), target: 1 };
    case 'first-schedule':
      return { current: Math.min(stats.tasksScheduled || 0, 1), target: 1 };
    case 'three-day-streak':
      return { current: stats.longestStreak, target: 3 };
    case 'weekly-login':
      return { current: stats.totalLoginDays || 0, target: 7 };
    case 'first-planned-week':
      return { current: stats.weeksPlanned || 0, target: 1 };
    
    // TIER 2: Consistency
    case 'week-warrior':
      return { current: stats.longestStreak, target: 7 };
    case 'two-week-streak':
      return { current: stats.longestStreak, target: 14 };
    case 'month-master':
      return { current: stats.longestStreak, target: 30 };
    case 'sixty-day-streak':
      return { current: stats.longestStreak, target: 60 };
    case 'hundred-day-streak':
      return { current: stats.longestStreak, target: 100 };
    case 'year-warrior':
      return { current: stats.longestStreak, target: 365 };
    case 'perfect-week':
      return { current: stats.perfectDays, target: 7 };
    case 'perfect-month':
      return { current: stats.perfectDays, target: 30 };
    case 'early-finisher':
      return { current: stats.tasksCompletedBeforeDeadline || 0, target: 50 };
    case 'morning-person':
      return { current: stats.morningTasksCompleted || 0, target: 25 };
    
    // TIER 3: Volume
    case 'getting-started':
      return { current: stats.tasksCompleted, target: 10 };
    case 'task-achiever':
      return { current: stats.tasksCompleted, target: 50 };
    case 'productivity-pro':
      return { current: stats.tasksCompleted, target: 100 };
    case 'task-master':
      return { current: stats.tasksCompleted, target: 500 };
    case 'task-champion':
      return { current: stats.tasksCompleted, target: 1000 };
    case 'task-legend':
      return { current: stats.tasksCompleted, target: 5000 };
    case 'task-titan':
      return { current: stats.tasksCompleted, target: 10000 };
    case 'category-balance':
      return { current: stats.categoriesCompleted || 0, target: 5 };
    case 'hundred-hours':
      return { current: Math.floor(stats.totalWorkMinutes / 60), target: 100 };
    case 'five-hundred-hours':
      return { current: Math.floor(stats.totalWorkMinutes / 60), target: 500 };
    case 'thousand-hours':
      return { current: Math.floor(stats.totalWorkMinutes / 60), target: 1000 };
    
    // TIER 4: Excellence
    case 'speed-demon':
      return { current: stats.tasksFasterThanEstimate || 0, target: 100 };
    case 'efficiency-expert':
      return { current: stats.onTimeCompletionStreak || 0, target: 20 };
    case 'focus-beginner':
      return { current: stats.pomodorosCompleted, target: 10 };
    case 'focus-master':
      return { current: stats.uninterruptedPomodoros || 0, target: 100 };
    case 'deep-work-champion':
      return { current: stats.consecutivePomodoros || 0, target: 50 };
    case 'productivity-perfectionist':
      return { current: stats.highCompletionRateDays || 0, target: 30 };
    case 'optimization-guru':
      return { current: stats.perfectEstimates || 0, target: 50 };
    
    // TIER 5: Legendary
    case 'unstoppable':
      return { current: stats.longestStreak, target: 365 };
    case 'perfect-year':
      return { current: stats.yearCompletionRate || 0, target: 90 };
    case 'zen-master':
      return { current: stats.pomodorosCompleted, target: 500 };
    
    // Special
    case 'night-owl':
      return { current: stats.nightTasksCompleted || 0, target: 10 };
    case 'early-bird':
      return { current: stats.earlyTasksCompleted || 0, target: 10 };
    case 'perfectionist':
      return { current: stats.perfectDays, target: 1 };
    case 'category-king':
      return { current: stats.maxTasksInCategory || 0, target: 100 };
    case 'dedication':
      return { current: stats.longestStreak, target: 30 };
    
    default:
      return { current: 0, target: 1 };
  }
}
