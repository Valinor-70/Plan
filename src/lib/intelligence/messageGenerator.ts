/**
 * Dynamic Message Generation System
 * 
 * Creates personalized, contextual messages based on user's motivation style,
 * current context, and behavioral patterns.
 */

import type { Task } from '../types';

export type MotivationStyle = 'encouraging' | 'neutral' | 'challenging';
export type MessageContext = 'greeting' | 'completion' | 'suggestion' | 'progress' | 'streak' | 'achievement' | 'struggle';

export interface MessageVariables {
  userName?: string;
  streakCount?: number;
  tasksCompleted?: number;
  tasksRemaining?: number;
  completionPercentage?: number;
  timeOfDay?: 'morning' | 'afternoon' | 'evening';
  achievement?: string;
  taskName?: string;
  successRate?: number;
  energyLevel?: string;
  comparisonStat?: string;
}

// ============================================================================
// MESSAGE TEMPLATES
// ============================================================================

const GREETING_MESSAGES = {
  encouraging: {
    morning: [
      'Good morning, {userName}! Ready to make today amazing? You have {tasksRemaining} tasks planned.',
      'Rise and shine, {userName}! Let\'s tackle the day together. {tasksRemaining} tasks waiting for your magic touch!',
      'Morning, {userName}! Your {streakCount}-day streak is looking great. Let\'s keep it going!',
      'Hello {userName}! Fresh day, fresh opportunities. You\'ve got {tasksRemaining} chances to shine today.',
    ],
    afternoon: [
      'Welcome back, {userName}! You\'ve completed {tasksCompleted} of {tasksRemaining} tasks so far. Great progress!',
      'Hey {userName}! Hope your day is going well. {tasksRemaining} tasks left to conquer.',
      'Afternoon, {userName}! You\'re doing great. Let\'s finish strong with {tasksRemaining} more tasks.',
      'Hi {userName}! {tasksCompleted} tasks down, {tasksRemaining} to go. You\'re on a roll!',
    ],
    evening: [
      'Evening, {userName}! Time to wrap up or plan tomorrow? {tasksRemaining} tasks on your list.',
      'Good evening! You completed {tasksCompleted} tasks today. {tasksRemaining} left if you want to push through.',
      'Hey {userName}! Winding down or going for one more win? {tasksRemaining} tasks available.',
      'Evening check-in, {userName}! {completionPercentage}% complete today. Proud of you!',
    ],
  },
  neutral: {
    morning: [
      'Good morning, {userName}. {tasksRemaining} tasks scheduled for today.',
      'Morning. {streakCount}-day streak active. {tasksRemaining} tasks pending.',
      'Hello. Daily tasks loaded: {tasksRemaining} items.',
    ],
    afternoon: [
      'Progress update: {tasksCompleted} completed, {tasksRemaining} remaining.',
      '{completionPercentage}% completion rate today. {tasksRemaining} tasks left.',
      'Current status: {tasksCompleted}/{tasksRemaining} tasks. On track.',
    ],
    evening: [
      'Evening summary: {tasksCompleted} tasks completed today.',
      'End of day: {completionPercentage}% completion rate.',
      '{tasksCompleted} tasks finished. {tasksRemaining} pending.',
    ],
  },
  challenging: {
    morning: [
      'Morning, {userName}. {tasksRemaining} tasks. Your record is {comparisonStat}. Can you beat it?',
      'Ready to prove yourself? {tasksRemaining} tasks won\'t complete themselves.',
      '{streakCount}-day streak. Don\'t break it now. {tasksRemaining} tasks waiting.',
      'Your best performance was {comparisonStat} tasks. Today you have {tasksRemaining}. Show me what you\'ve got.',
    ],
    afternoon: [
      'Only {tasksCompleted} tasks done? You\'re capable of more. {tasksRemaining} remaining.',
      '{completionPercentage}% completion. Your average is higher. Step it up.',
      'You\'ve completed {tasksCompleted}. Last week at this time you had {comparisonStat} done.',
    ],
    evening: [
      '{tasksCompleted} tasks today. Is that your best effort?',
      'You had {tasksRemaining} tasks. Completed {completionPercentage}%. Can do better tomorrow.',
      'Day over. {tasksCompleted} tasks finished. Last week you averaged {comparisonStat}.',
    ],
  },
};

const COMPLETION_MESSAGES = {
  encouraging: [
    'Awesome work on "{taskName}"! {tasksCompleted} down, {tasksRemaining} to go!',
    'Yes! You crushed "{taskName}"! Keep that momentum going!',
    'Fantastic! "{taskName}" is complete. You\'re {completionPercentage}% through today\'s goals!',
    'Beautiful work! "{taskName}" done. Your {streakCount}-day streak is safe!',
    'Outstanding! That\'s {tasksCompleted} tasks today. You\'re on fire! 🔥',
  ],
  neutral: [
    '"{taskName}" completed. {tasksRemaining} tasks remaining.',
    'Task finished: "{taskName}". Progress: {completionPercentage}%.',
    'Completed "{taskName}". Current count: {tasksCompleted} tasks today.',
    '"{taskName}" marked complete. {tasksRemaining} pending.',
  ],
  challenging: [
    '"{taskName}" done. Only took you {comparisonStat}. You can do faster.',
    'Task completed. {tasksCompleted} so far. Your record is {comparisonStat} in one day.',
    '"{taskName}" finished. {tasksRemaining} left. Don\'t slow down now.',
    'One task done. You\'ve completed harder tasks faster. Keep pushing.',
  ],
};

const SUGGESTION_MESSAGES = {
  encouraging: [
    'Perfect timing for "{taskName}"! You have a {successRate}% success rate with these. You\'ve got this!',
    'How about tackling "{taskName}" now? It matches your current energy perfectly! 💪',
    'Quick win available: "{taskName}" - just {comparisonStat} minutes. Easy momentum builder!',
    'I believe in you! "{taskName}" is a great next step. You usually excel at these during {timeOfDay}.',
  ],
  neutral: [
    'Suggested task: "{taskName}". Success probability: {successRate}%. Estimated: {comparisonStat} minutes.',
    '"{taskName}" recommended. Historical success rate in this category: {successRate}%.',
    'Next task suggestion: "{taskName}". Current energy level ({energyLevel}) matches task difficulty.',
    'Optimal task identified: "{taskName}". Reasoning: {comparisonStat}.',
  ],
  challenging: [
    '"{taskName}" is waiting. You\'ve been avoiding it. Time to step up.',
    'I\'m suggesting "{taskName}". Your success rate here is {successRate}%. Prove you can do better.',
    'You said this was important: "{taskName}". Show me you meant it.',
    '"{taskName}" - You completed similar tasks in {comparisonStat} minutes. Beat that time.',
  ],
};

const PROGRESS_MESSAGES = {
  encouraging: [
    'You\'re {completionPercentage}% through your weekly goal! That\'s {comparisonStat} ahead of schedule. Amazing!',
    'Incredible progress! {tasksCompleted} tasks completed this week. You\'re crushing your goals!',
    'Just checked your stats - you\'re {completionPercentage}% above your average! Keep it up!',
    'You\'ve completed {tasksCompleted} tasks today - that\'s {comparisonStat}% above your typical Monday!',
  ],
  neutral: [
    'Weekly progress: {completionPercentage}%. {tasksCompleted} of {tasksRemaining} tasks complete.',
    'Current completion rate: {completionPercentage}%. Average: {comparisonStat}%.',
    'Tasks completed this week: {tasksCompleted}. Previous week: {comparisonStat}.',
    'Progress report: {completionPercentage}% completion. On track for weekly target.',
  ],
  challenging: [
    'Only {completionPercentage}% complete this week. You averaged {comparisonStat}% by this point.',
    'You\'ve completed {tasksCompleted} tasks. Last week you had {comparisonStat} done. What changed?',
    'Completion rate: {completionPercentage}%. That\'s below your standard. Pick it up.',
    '{tasksCompleted} tasks done. You\'re capable of {comparisonStat} based on past performance.',
  ],
};

const STREAK_MESSAGES = {
  encouraging: [
    'Amazing! {streakCount}-day streak! You\'re unstoppable! 🔥',
    'Wow! {streakCount} consecutive days! That takes real dedication. So proud!',
    'Your {streakCount}-day streak is incredible! Each day you\'re building better habits!',
    '{streakCount} days in a row! You\'re a productivity champion! 👑',
  ],
  neutral: [
    '{streakCount}-day completion streak maintained.',
    'Current streak: {streakCount} consecutive days.',
    'Streak status: {streakCount} days. Longest streak: {comparisonStat} days.',
    'Daily completion streak: {streakCount} days active.',
  ],
  challenging: [
    '{streakCount}-day streak. Good. But your longest was {comparisonStat} days. Can you beat it?',
    'You\'ve hit {streakCount} days. Don\'t get comfortable. Push for {comparisonStat}.',
    '{streakCount} days. Decent. Your potential is {comparisonStat} based on past performance.',
    'Streak: {streakCount} days. You broke a {comparisonStat}-day streak before. Don\'t let it happen again.',
  ],
};

const STRUGGLE_MESSAGES = {
  encouraging: [
    'Having a tough day? That\'s okay! Try this quick 5-minute task to build momentum: "{taskName}"',
    'Don\'t worry about yesterday. Today is a fresh start! Let\'s begin with something easy.',
    'Feeling stuck? Remember: you\'ve overcome this before. One small task at a time. You\'ve got this! 💪',
    'Low energy? No problem! Here\'s a simple task perfectly matched to how you\'re feeling right now.',
  ],
  neutral: [
    'Completion rate below average. Suggested adjustment: focus on shorter tasks.',
    'Current productivity lower than baseline. Recommendation: {taskName} (low difficulty).',
    'Pattern detected: reduced output. Try breaking large tasks into smaller steps.',
    'Performance variance noted. Consider starting with quick-win tasks.',
  ],
  challenging: [
    'You\'ve snoozed this task 3 times: "{taskName}". Time to tackle it or delete it.',
    'Your completion rate dropped 20% this week. What are you going to do about it?',
    'You completed {comparisonStat} tasks last week. This week: {tasksCompleted}. Explain the difference.',
    'Having a bad week? Your past self did better. Find that person again.',
  ],
};

// ============================================================================
// MESSAGE GENERATOR
// ============================================================================

export class MessageGenerator {
  private style: MotivationStyle;

  constructor(style: MotivationStyle = 'encouraging') {
    this.style = style;
  }

  /**
   * Set motivation style
   */
  setStyle(style: MotivationStyle): void {
    this.style = style;
  }

  /**
   * Generate a contextual message
   */
  generate(context: MessageContext, variables: MessageVariables = {}): string {
    // Add time of day if not provided
    if (!variables.timeOfDay) {
      variables.timeOfDay = this.getTimeOfDay();
    }

    let templates: string[] = [];

    switch (context) {
      case 'greeting':
        templates = GREETING_MESSAGES[this.style][variables.timeOfDay] || [];
        break;
      case 'completion':
        templates = COMPLETION_MESSAGES[this.style];
        break;
      case 'suggestion':
        templates = SUGGESTION_MESSAGES[this.style];
        break;
      case 'progress':
        templates = PROGRESS_MESSAGES[this.style];
        break;
      case 'streak':
        templates = STREAK_MESSAGES[this.style];
        break;
      case 'struggle':
        templates = STRUGGLE_MESSAGES[this.style];
        break;
      default:
        templates = ['Hello! Keep up the great work!'];
    }

    // Pick a random template
    const template = templates[Math.floor(Math.random() * templates.length)];

    // Replace variables
    return this.interpolate(template, variables);
  }

  /**
   * Generate multiple message variations
   */
  generateVariations(context: MessageContext, variables: MessageVariables, count: number = 3): string[] {
    const messages: string[] = [];
    const used = new Set<string>();

    // Get all templates for this context
    let allTemplates: string[] = [];
    
    switch (context) {
      case 'greeting':
        const timeOfDay = variables.timeOfDay || this.getTimeOfDay();
        allTemplates = GREETING_MESSAGES[this.style][timeOfDay] || [];
        break;
      case 'completion':
        allTemplates = COMPLETION_MESSAGES[this.style];
        break;
      case 'suggestion':
        allTemplates = SUGGESTION_MESSAGES[this.style];
        break;
      case 'progress':
        allTemplates = PROGRESS_MESSAGES[this.style];
        break;
      case 'streak':
        allTemplates = STREAK_MESSAGES[this.style];
        break;
      case 'struggle':
        allTemplates = STRUGGLE_MESSAGES[this.style];
        break;
    }

    // Generate unique messages
    while (messages.length < count && messages.length < allTemplates.length) {
      const template = allTemplates[Math.floor(Math.random() * allTemplates.length)];
      const message = this.interpolate(template, variables);
      
      if (!used.has(message)) {
        messages.push(message);
        used.add(message);
      }
    }

    return messages;
  }

  /**
   * Interpolate variables into template
   */
  private interpolate(template: string, variables: MessageVariables): string {
    let result = template;

    // Replace all variable placeholders
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{${key}}`;
      if (value !== undefined && value !== null) {
        result = result.replace(new RegExp(placeholder, 'g'), String(value));
      }
    }

    // Remove any remaining placeholders
    result = result.replace(/\{[^}]+\}/g, '');

    return result;
  }

  /**
   * Get current time of day
   */
  private getTimeOfDay(): 'morning' | 'afternoon' | 'evening' {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  }

  /**
   * Generate achievement unlock message
   */
  generateAchievementMessage(achievementName: string, description: string): string {
    const templates = {
      encouraging: [
        `🎉 Amazing! You unlocked "${achievementName}"! ${description} This is a huge accomplishment!`,
        `Incredible work! Achievement unlocked: "${achievementName}" - ${description}. You earned this!`,
        `Yes! You did it! "${achievementName}" is yours! ${description} So proud of you!`,
        `Outstanding! "${achievementName}" achieved! ${description} Keep being awesome!`,
      ],
      neutral: [
        `Achievement unlocked: "${achievementName}". ${description}`,
        `New achievement: "${achievementName}" - ${description}`,
        `"${achievementName}" completed. ${description}`,
      ],
      challenging: [
        `Finally! "${achievementName}" unlocked. ${description} Took you long enough.`,
        `Achievement: "${achievementName}". ${description} What's next?`,
        `You got "${achievementName}". ${description} Don't stop now.`,
      ],
    };

    const messages = templates[this.style];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  /**
   * Generate daily summary message
   */
  generateDailySummary(
    tasksCompleted: number,
    completionRate: number,
    streakDays: number,
    trendAnalysis: string
  ): string {
    const variables: MessageVariables = {
      tasksCompleted,
      completionPercentage: Math.round(completionRate * 100),
      streakCount: streakDays,
      comparisonStat: trendAnalysis,
    };

    const templates = {
      encouraging: [
        'What a day! You completed {tasksCompleted} tasks ({completionPercentage}% completion rate). {comparisonStat}. Your {streakCount}-day streak is looking great! 🌟',
        'Fantastic work today! {tasksCompleted} tasks finished with {completionPercentage}% completion. {comparisonStat}. Tomorrow is going to be even better!',
        'You crushed it! {tasksCompleted} tasks done, {completionPercentage}% completion rate. {comparisonStat}. {streakCount}-day streak maintained! 🔥',
      ],
      neutral: [
        'Daily summary: {tasksCompleted} tasks completed. Completion rate: {completionPercentage}%. Streak: {streakCount} days. Analysis: {comparisonStat}.',
        'Today: {tasksCompleted} tasks ({completionPercentage}%). {comparisonStat}. Current streak: {streakCount} days.',
        'Results: {tasksCompleted} completions, {completionPercentage}% rate. {comparisonStat}. {streakCount}-day streak active.',
      ],
      challenging: [
        '{tasksCompleted} tasks today at {completionPercentage}% completion. {comparisonStat}. Your {streakCount}-day streak continues, but can you do better tomorrow?',
        'Daily report: {tasksCompleted} tasks. {completionPercentage}% completion. {comparisonStat}. {streakCount} days straight. Don\'t break it.',
        'You finished {tasksCompleted} tasks ({completionPercentage}%). {comparisonStat}. Streak at {streakCount} days. Push harder tomorrow.',
      ],
    };

    const messages = templates[this.style];
    const template = messages[Math.floor(Math.random() * messages.length)];
    return this.interpolate(template, variables);
  }
}

// Singleton instance
let messageGeneratorInstance: MessageGenerator | null = null;

export function getMessageGenerator(style?: MotivationStyle): MessageGenerator {
  if (!messageGeneratorInstance) {
    messageGeneratorInstance = new MessageGenerator(style);
  } else if (style) {
    messageGeneratorInstance.setStyle(style);
  }
  return messageGeneratorInstance;
}
