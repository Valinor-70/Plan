import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProgress, Achievement } from '../types/gamification';
import { ACHIEVEMENTS, calculateXP, calculateLevel, xpForNextLevel } from '../gamification/achievements';

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
    case 'first-steps':
      return { current: Math.min(stats.tasksCompleted, 1), target: 1 };
    case 'getting-started':
      return { current: stats.tasksCompleted, target: 5 };
    case 'task-master':
      return { current: stats.tasksCompleted, target: 25 };
    case 'productivity-pro':
      return { current: stats.tasksCompleted, target: 100 };
    case 'task-legend':
      return { current: stats.tasksCompleted, target: 500 };
    
    case 'week-warrior':
      return { current: stats.longestStreak, target: 7 };
    case 'month-master':
      return { current: stats.longestStreak, target: 30 };
    case 'unstoppable':
      return { current: stats.longestStreak, target: 100 };
    
    case 'focus-beginner':
      return { current: stats.pomodorosCompleted, target: 10 };
    case 'marathon-runner':
      return { current: stats.pomodorosCompleted, target: 50 };
    case 'time-master':
      return { current: Math.floor(stats.totalWorkMinutes / 60), target: 100 };
    case 'zen-master':
      return { current: stats.pomodorosCompleted, target: 500 };
    
    case 'perfectionist':
      return { current: stats.perfectDays, target: 1 };
    case 'perfect-week':
      return { current: stats.perfectDays, target: 7 };
    case 'dedication':
      return { current: stats.longestStreak, target: 30 };
    
    default:
      return { current: 0, target: 1 };
  }
}
