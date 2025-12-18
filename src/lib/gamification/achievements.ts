import type { Achievement } from '../types/gamification';

export const ACHIEVEMENTS: Omit<Achievement, 'progress' | 'unlockedAt'>[] = [
  // TIER 1: Foundation Achievements (Build Habit Formation)
  {
    id: 'first-steps',
    name: 'First Steps',
    description: 'Create your first task',
    icon: '🎯',
    rarity: 'common',
    category: 'tasks',
  },
  {
    id: 'first-completion',
    name: 'First Completion',
    description: 'Complete your first task',
    icon: '✅',
    rarity: 'common',
    category: 'tasks',
  },
  {
    id: 'first-schedule',
    name: 'First Schedule',
    description: 'Schedule your first task on the calendar',
    icon: '📅',
    rarity: 'common',
    category: 'productivity',
  },
  {
    id: 'three-day-streak',
    name: 'Consistency Begins',
    description: 'Complete tasks for 3 consecutive days',
    icon: '🔥',
    rarity: 'common',
    category: 'streaks',
  },
  {
    id: 'weekly-login',
    name: 'Weekly Visitor',
    description: 'Log in for 7 days (not necessarily consecutive)',
    icon: '👋',
    rarity: 'common',
    category: 'streaks',
  },
  {
    id: 'first-planned-week',
    name: 'Planning Ahead',
    description: 'Plan tasks for an entire week',
    icon: '🗓️',
    rarity: 'common',
    category: 'productivity',
  },

  // TIER 2: Consistency Achievements (Reinforce Daily Engagement)
  {
    id: 'week-warrior',
    name: 'Week Warrior',
    description: '7-day completion streak',
    icon: '🔥',
    rarity: 'rare',
    category: 'streaks',
  },
  {
    id: 'two-week-streak',
    name: 'Fortnight Force',
    description: '14-day completion streak',
    icon: '💪',
    rarity: 'rare',
    category: 'streaks',
  },
  {
    id: 'month-master',
    name: 'Month Master',
    description: '30-day completion streak',
    icon: '⭐',
    rarity: 'epic',
    category: 'streaks',
  },
  {
    id: 'sixty-day-streak',
    name: 'Marathon Momentum',
    description: '60-day completion streak',
    icon: '🏃',
    rarity: 'epic',
    category: 'streaks',
  },
  {
    id: 'hundred-day-streak',
    name: 'Unstoppable Force',
    description: '100-day completion streak',
    icon: '🚀',
    rarity: 'legendary',
    category: 'streaks',
  },
  {
    id: 'year-warrior',
    name: 'Year Warrior',
    description: '365-day active streak',
    icon: '👑',
    rarity: 'legendary',
    category: 'streaks',
  },
  {
    id: 'perfect-week',
    name: 'Perfect Week',
    description: 'Complete all tasks for 7 consecutive days (100%)',
    icon: '💯',
    rarity: 'epic',
    category: 'streaks',
  },
  {
    id: 'perfect-month',
    name: 'Flawless Month',
    description: 'Complete all tasks for 30 consecutive days',
    icon: '🏆',
    rarity: 'legendary',
    category: 'streaks',
  },
  {
    id: 'early-finisher',
    name: 'Early Bird Expert',
    description: 'Complete 50 tasks before their deadline',
    icon: '🐦',
    rarity: 'rare',
    category: 'productivity',
  },
  {
    id: 'morning-person',
    name: 'Morning Glory',
    description: 'Complete 25 tasks before 9 AM',
    icon: '🌅',
    rarity: 'rare',
    category: 'productivity',
  },

  // TIER 3: Volume Achievements (Reward Sustained Productivity)
  {
    id: 'getting-started',
    name: 'Getting Started',
    description: 'Complete 10 tasks',
    icon: '🎯',
    rarity: 'common',
    category: 'tasks',
  },
  {
    id: 'task-achiever',
    name: 'Task Achiever',
    description: 'Complete 50 tasks',
    icon: '✨',
    rarity: 'rare',
    category: 'tasks',
  },
  {
    id: 'productivity-pro',
    name: 'Productivity Pro',
    description: 'Complete 100 tasks',
    icon: '⚡',
    rarity: 'rare',
    category: 'tasks',
  },
  {
    id: 'task-master',
    name: 'Task Master',
    description: 'Complete 500 tasks',
    icon: '🏅',
    rarity: 'epic',
    category: 'tasks',
  },
  {
    id: 'task-champion',
    name: 'Task Champion',
    description: 'Complete 1,000 tasks',
    icon: '🎖️',
    rarity: 'epic',
    category: 'tasks',
  },
  {
    id: 'task-legend',
    name: 'Task Legend',
    description: 'Complete 5,000 tasks',
    icon: '👑',
    rarity: 'legendary',
    category: 'tasks',
  },
  {
    id: 'task-titan',
    name: 'Task Titan',
    description: 'Complete 10,000 tasks - Productivity Legend',
    icon: '💎',
    rarity: 'legendary',
    category: 'tasks',
  },
  {
    id: 'category-balance',
    name: 'Well-Rounded',
    description: 'Complete tasks across 5+ different categories',
    icon: '🎨',
    rarity: 'rare',
    category: 'tasks',
  },
  {
    id: 'hundred-hours',
    name: 'Time Investor',
    description: 'Log 100 cumulative hours of focused work',
    icon: '⏰',
    rarity: 'rare',
    category: 'time',
  },
  {
    id: 'five-hundred-hours',
    name: 'Dedication Master',
    description: 'Log 500 cumulative hours of focused work',
    icon: '⏱️',
    rarity: 'epic',
    category: 'time',
  },
  {
    id: 'thousand-hours',
    name: 'Time Lord',
    description: 'Log 1,000 cumulative hours of focused work',
    icon: '🕐',
    rarity: 'legendary',
    category: 'time',
  },

  // TIER 4: Excellence Achievements (Celebrate Exceptional Performance)
  {
    id: 'speed-demon',
    name: 'Speed Demon',
    description: 'Complete 100 tasks faster than estimated',
    icon: '⚡',
    rarity: 'epic',
    category: 'productivity',
  },
  {
    id: 'efficiency-expert',
    name: 'Efficiency Expert',
    description: 'Maintain 90%+ on-time completion rate for 20 tasks',
    icon: '🎯',
    rarity: 'epic',
    category: 'productivity',
  },
  {
    id: 'focus-beginner',
    name: 'Focus Beginner',
    description: 'Complete 10 Pomodoro sessions',
    icon: '🍅',
    rarity: 'common',
    category: 'time',
  },
  {
    id: 'focus-master',
    name: 'Focus Master',
    description: 'Complete 100 uninterrupted Pomodoro sessions',
    icon: '🧠',
    rarity: 'epic',
    category: 'time',
  },
  {
    id: 'deep-work-champion',
    name: 'Deep Work Champion',
    description: 'Complete 50 consecutive Pomodoro sessions without interruption',
    icon: '🧘',
    rarity: 'legendary',
    category: 'time',
  },
  {
    id: 'productivity-perfectionist',
    name: 'Productivity Perfectionist',
    description: 'Maintain 90%+ completion rate for 30 consecutive days',
    icon: '💎',
    rarity: 'legendary',
    category: 'productivity',
  },
  {
    id: 'optimization-guru',
    name: 'Optimization Guru',
    description: 'Complete 50 tasks with perfect time estimates (within 10%)',
    icon: '🎓',
    rarity: 'epic',
    category: 'productivity',
  },

  // TIER 5: Legendary Achievements (Long-term Aspirational Goals)
  {
    id: 'unstoppable',
    name: 'Unstoppable',
    description: '365-day completion streak - The ultimate consistency',
    icon: '🌟',
    rarity: 'legendary',
    category: 'streaks',
  },
  {
    id: 'perfect-year',
    name: 'Perfect Year',
    description: 'Maintain 90%+ completion rate for entire year',
    icon: '🏆',
    rarity: 'legendary',
    category: 'productivity',
  },
  {
    id: 'zen-master',
    name: 'Zen Master',
    description: 'Complete 500 Pomodoro sessions',
    icon: '🧘',
    rarity: 'legendary',
    category: 'time',
  },

  // Additional Special Achievements
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
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Complete 10 tasks in one day',
    icon: '✨',
    rarity: 'rare',
    category: 'productivity',
  },
  {
    id: 'category-king',
    name: 'Category King',
    description: 'Complete 100 tasks in one subject',
    icon: '📚',
    rarity: 'epic',
    category: 'tasks',
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
