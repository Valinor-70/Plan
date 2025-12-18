// Gamification Types
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
  progress: {
    current: number;
    target: number;
  };
  category: 'tasks' | 'streaks' | 'time' | 'productivity' | 'social';
}

export interface UserProgress {
  level: number;
  currentXP: number;
  nextLevelXP: number;
  totalXP: number;
  achievements: Achievement[];
  stats: {
    tasksCompleted: number;
    pomodorosCompleted: number;
    currentStreak: number;
    longestStreak: number;
    totalWorkMinutes: number;
    perfectDays: number;
    // New tracking fields
    tasksScheduled?: number;
    totalLoginDays?: number;
    weeksPlanned?: number;
    tasksCompletedBeforeDeadline?: number;
    morningTasksCompleted?: number;
    categoriesCompleted?: number;
    tasksFasterThanEstimate?: number;
    onTimeCompletionStreak?: number;
    uninterruptedPomodoros?: number;
    consecutivePomodoros?: number;
    highCompletionRateDays?: number;
    perfectEstimates?: number;
    yearCompletionRate?: number;
    nightTasksCompleted?: number;
    earlyTasksCompleted?: number;
    maxTasksInCategory?: number;
  };
}
