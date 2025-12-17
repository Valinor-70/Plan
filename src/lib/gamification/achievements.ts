import type { Achievement } from '../types/gamification';

export const ACHIEVEMENTS: Omit<Achievement, 'progress' | 'unlockedAt'>[] = [
  // Getting Started (Common)
  {
    id: 'first-steps',
    name: 'First Steps',
    description: 'Create your first task',
    icon: '🎯',
    rarity: 'common',
    category: 'tasks',
  },
  {
    id: 'getting-started',
    name: 'Getting Started',
    description: 'Complete 5 tasks',
    icon: '✅',
    rarity: 'common',
    category: 'tasks',
  },
  {
    id: 'task-master',
    name: 'Task Master',
    description: 'Complete 25 tasks',
    icon: '🏆',
    rarity: 'rare',
    category: 'tasks',
  },
  {
    id: 'productivity-pro',
    name: 'Productivity Pro',
    description: 'Complete 100 tasks',
    icon: '⭐',
    rarity: 'epic',
    category: 'tasks',
  },
  {
    id: 'task-legend',
    name: 'Task Legend',
    description: 'Complete 500 tasks',
    icon: '👑',
    rarity: 'legendary',
    category: 'tasks',
  },

  // Streaks (Rare)
  {
    id: 'week-warrior',
    name: 'Week Warrior',
    description: '7-day completion streak',
    icon: '🔥',
    rarity: 'rare',
    category: 'streaks',
  },
  {
    id: 'month-master',
    name: 'Month Master',
    description: '30-day completion streak',
    icon: '💪',
    rarity: 'epic',
    category: 'streaks',
  },
  {
    id: 'unstoppable',
    name: 'Unstoppable',
    description: '100-day completion streak',
    icon: '🚀',
    rarity: 'legendary',
    category: 'streaks',
  },

  // Pomodoro (Common to Epic)
  {
    id: 'focus-beginner',
    name: 'Focus Beginner',
    description: 'Complete 10 Pomodoro sessions',
    icon: '🍅',
    rarity: 'common',
    category: 'time',
  },
  {
    id: 'marathon-runner',
    name: 'Marathon Runner',
    description: 'Complete 50 Pomodoro sessions',
    icon: '🏃',
    rarity: 'rare',
    category: 'time',
  },
  {
    id: 'time-master',
    name: 'Time Master',
    description: 'Log 100 hours of focused work',
    icon: '⏰',
    rarity: 'epic',
    category: 'time',
  },
  {
    id: 'zen-master',
    name: 'Zen Master',
    description: 'Complete 500 Pomodoro sessions',
    icon: '🧘',
    rarity: 'legendary',
    category: 'time',
  },

  // Daily Achievements (Common)
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Complete 10 tasks in one day',
    icon: '✨',
    rarity: 'rare',
    category: 'productivity',
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    description: 'Complete 10 tasks after 10 PM',
    icon: '🦉',
    rarity: 'common',
    category: 'productivity',
  },
  {
    id: 'early-bird',
    name: 'Early Bird',
    description: 'Complete 10 tasks before 8 AM',
    icon: '🐦',
    rarity: 'common',
    category: 'productivity',
  },

  // Estimation (Rare)
  {
    id: 'estimate-expert',
    name: 'Estimate Expert',
    description: '90% time estimation accuracy (20 tasks)',
    icon: '🎯',
    rarity: 'rare',
    category: 'productivity',
  },

  // Special (Epic/Legendary)
  {
    id: 'category-king',
    name: 'Category King',
    description: 'Complete 100 tasks in one subject',
    icon: '📚',
    rarity: 'epic',
    category: 'tasks',
  },
  {
    id: 'speed-demon',
    name: 'Speed Demon',
    description: 'Complete 20 tasks in one hour',
    icon: '⚡',
    rarity: 'legendary',
    category: 'productivity',
  },
  {
    id: 'perfect-week',
    name: 'Perfect Week',
    description: 'Complete all tasks for 7 consecutive days',
    icon: '💯',
    rarity: 'epic',
    category: 'streaks',
  },
  {
    id: 'dedication',
    name: 'Dedication',
    description: 'Use the app for 30 consecutive days',
    icon: '💎',
    rarity: 'rare',
    category: 'streaks',
  },
];

export function calculateXP(action: {
  type: 'task_complete' | 'pomodoro_complete' | 'streak_day';
  priority?: 'urgent' | 'high' | 'medium' | 'low';
  estimatedMinutes?: number;
  currentStreak?: number;
  completedBeforeDue?: boolean;
}): number {
  let xp = 10; // Base XP

  if (action.type === 'task_complete') {
    // Priority multipliers
    if (action.priority === 'urgent') xp *= 2;
    else if (action.priority === 'high') xp *= 1.5;
    else if (action.priority === 'medium') xp *= 1.2;

    // Time-based bonus
    if (action.estimatedMinutes && action.estimatedMinutes > 120) {
      xp += 20; // Long task bonus
    }

    // On-time bonus
    if (action.completedBeforeDue) {
      xp += 5;
    }

    // Streak bonus
    if (action.currentStreak && action.currentStreak > 7) {
      xp *= 1.2;
    }
  } else if (action.type === 'pomodoro_complete') {
    xp = 5; // Pomodoro sessions give less XP
  } else if (action.type === 'streak_day') {
    xp = 15; // Streak bonus
  }

  return Math.floor(xp);
}

export function calculateLevel(totalXP: number): number {
  // Exponential level curve: level = floor(sqrt(XP / 100))
  return Math.floor(Math.sqrt(totalXP / 100)) + 1;
}

export function xpForNextLevel(currentLevel: number): number {
  // XP required for next level
  return Math.pow(currentLevel, 2) * 100;
}
