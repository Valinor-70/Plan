/**
 * Intelligent Notification Manager
 * 
 * Handles smart notification delivery with context-aware timing,
 * adaptive frequency, and multi-tier priority system.
 */

import { useNotificationStore } from '../store/notificationStore';
import { useSettingsStore } from '../store/settingsStore';
import { useTaskStore } from '../store/taskStore';
import { useGamificationStore } from '../store/gamificationStore';
import { HeuristicEngine, BehavioralCollector } from '../intelligence/heuristicEngine';
import { getMessageGenerator } from '../intelligence/messageGenerator';
import type { Task } from '../types';
import type { Notification } from '../store/notificationStore';

export interface NotificationOpportunity {
  type: 'calendar_gap' | 'productive_hour' | 'energy_match' | 'deadline_approaching';
  confidence: number;
  task?: Task;
  reason: string;
}

export class IntelligentNotificationManager {
  private notificationHistory: Map<string, Date[]> = new Map();
  private userResponseRate: Map<string, number> = new Map(); // task -> response rate
  private lastNotificationTime: Date | null = null;
  private dismissalCount: number = 0;
  private engagementScore: number = 1.0; // 0-2.0, affects frequency

  constructor() {
    this.loadHistory();
  }

  /**
   * Determine if a notification should be sent right now
   */
  shouldSendNotification(
    task: Task,
    priority: 'critical' | 'high' | 'motivational' | 'informational'
  ): boolean {
    const settings = useSettingsStore.getState().settings;
    const notificationPrefs = settings.notificationPrefs;

    // Check if notifications are enabled
    if (!notificationPrefs?.enabled) return false;

    // Critical alerts always go through (unless in quiet hours)
    if (priority === 'critical') {
      return !this.isQuietHours();
    }

    // Check quiet hours
    if (this.isQuietHours()) return false;

    // Check if in productive hours (if configured)
    if (notificationPrefs.productiveHoursStart && notificationPrefs.productiveHoursEnd) {
      if (!this.isProductiveHours()) {
        // Only send high priority during non-productive hours
        return priority === 'high';
      }
    }

    // Check recent notification frequency
    if (this.lastNotificationTime) {
      const minutesSince = (Date.now() - this.lastNotificationTime.getTime()) / (1000 * 60);
      
      // Minimum time between notifications based on priority
      const minIntervals = {
        high: 30,
        motivational: 60,
        informational: 120,
      };
      
      const minInterval = minIntervals[priority as keyof typeof minIntervals] || 60;
      if (minutesSince < minInterval) return false;
    }

    // Check notification fatigue
    if (this.engagementScore < 0.5) {
      // User is showing fatigue, only send high priority
      return priority === 'high';
    }

    // Check task-specific response rate
    const responseRate = this.userResponseRate.get(task.id) || 0.5;
    if (responseRate < 0.2 && priority === 'motivational') {
      // User consistently ignores suggestions for this task
      return false;
    }

    // Frequency-based throttling
    const frequency = notificationPrefs.frequency || 'moderate';
    const frequencyLimits = {
      aggressive: 6, // Up to 6 per hour
      moderate: 2, // Up to 2 per hour
      minimal: 0.5, // Up to 1 per 2 hours
      custom: 1,
    };

    const hourlyLimit = frequencyLimits[frequency];
    const recentNotifications = this.getRecentNotificationCount(60); // Last hour

    return recentNotifications < hourlyLimit;
  }

  /**
   * Detect notification opportunities
   */
  detectOpportunities(): NotificationOpportunity[] {
    const opportunities: NotificationOpportunity[] = [];
    const tasks = useTaskStore.getState().tasks;
    const collector = new BehavioralCollector();
    const signals = collector.getSignals();
    const engine = new HeuristicEngine(undefined, signals);

    const now = new Date();
    const currentHour = now.getHours();

    // Check for productive hour
    if (signals.mostProductiveHours.includes(currentHour)) {
      const bestTask = engine.getBestTask(tasks);
      if (bestTask && bestTask.score.overall > 0.7) {
        opportunities.push({
          type: 'productive_hour',
          confidence: bestTask.score.overall,
          task: bestTask.task,
          reason: 'You\'re in one of your most productive hours',
        });
      }
    }

    // Check for energy-matched tasks
    const highEnergyTasks = tasks
      .filter(t => t.status === 'todo' || t.status === 'in-progress')
      .map(t => ({ task: t, score: engine.calculateTaskScore(t) }))
      .filter(({ score }) => score.energyMatch > 0.8);

    if (highEnergyTasks.length > 0) {
      const best = highEnergyTasks.sort((a, b) => b.score.overall - a.score.overall)[0];
      opportunities.push({
        type: 'energy_match',
        confidence: best.score.energyMatch,
        task: best.task,
        reason: 'Perfect energy match for this task',
      });
    }

    // Check for approaching deadlines
    const urgentTasks = tasks
      .filter(t => {
        if (!t.dueDate || t.status === 'completed') return false;
        const hoursUntilDue = (new Date(t.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60);
        return hoursUntilDue > 0 && hoursUntilDue < 24;
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    if (urgentTasks.length > 0) {
      const mostUrgent = urgentTasks[0];
      const hoursUntilDue = (new Date(mostUrgent.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60);
      opportunities.push({
        type: 'deadline_approaching',
        confidence: 1.0 - (hoursUntilDue / 24),
        task: mostUrgent,
        reason: `Deadline in ${Math.round(hoursUntilDue)} hours`,
      });
    }

    return opportunities.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Send a smart notification
   */
  sendSmartNotification(opportunity: NotificationOpportunity): void {
    if (!opportunity.task) return;

    const settings = useSettingsStore.getState().settings;
    const messageGen = getMessageGenerator(settings.heuristicPrefs?.motivationStyle);
    
    // Determine priority
    let priority: 'critical' | 'high' | 'motivational' | 'informational' = 'motivational';
    if (opportunity.type === 'deadline_approaching' && opportunity.confidence > 0.8) {
      priority = 'critical';
    } else if (opportunity.confidence > 0.8) {
      priority = 'high';
    }

    // Check if should send
    if (!this.shouldSendNotification(opportunity.task, priority)) {
      return;
    }

    // Generate message
    const message = messageGen.generate('suggestion', {
      taskName: opportunity.task.title,
      successRate: Math.round(opportunity.confidence * 100),
      comparisonStat: opportunity.reason,
    });

    // Create notification
    const notificationType = priority === 'critical' ? 'overdue' : 'suggestion';
    useNotificationStore.getState().addNotification({
      type: notificationType,
      title: this.getPriorityTitle(priority),
      message,
      taskId: opportunity.task.id,
      actionUrl: `/tasks/${opportunity.task.id}`,
    });

    // Update tracking
    this.recordNotification(opportunity.task.id);
    this.lastNotificationTime = new Date();
  }

  /**
   * Handle user response to notification
   */
  handleUserResponse(taskId: string, action: 'completed' | 'started' | 'viewed' | 'dismissed'): void {
    // Update response rate for this task
    const currentRate = this.userResponseRate.get(taskId) || 0.5;
    const isPositive = action === 'completed' || action === 'started' || action === 'viewed';
    const newRate = currentRate * 0.9 + (isPositive ? 1.0 : 0.0) * 0.1;
    this.userResponseRate.set(taskId, newRate);

    // Update engagement score
    if (action === 'dismissed') {
      this.dismissalCount++;
      if (this.dismissalCount > 3) {
        this.engagementScore *= 0.9; // Reduce frequency
        this.dismissalCount = 0;
      }
    } else if (isPositive) {
      this.engagementScore = Math.min(2.0, this.engagementScore * 1.1); // Increase frequency
      this.dismissalCount = 0;
    }

    this.saveHistory();
  }

  /**
   * Send streak protection notification
   */
  sendStreakProtectionNotification(): void {
    const stats = useGamificationStore.getState().stats;
    const settings = useSettingsStore.getState().settings;
    
    if (stats.currentStreak === 0) return;

    const messageGen = getMessageGenerator(settings.heuristicPrefs?.motivationStyle);
    const message = messageGen.generate('streak', {
      streakCount: stats.currentStreak,
    });

    // Find quickest task
    const tasks = useTaskStore.getState().tasks;
    const quickTask = tasks
      .filter(t => t.status === 'todo')
      .sort((a, b) => (a.estimatedDuration || 60) - (b.estimatedDuration || 60))[0];

    useNotificationStore.getState().addNotification({
      type: 'reminder',
      title: '🔥 Streak at Risk!',
      message: quickTask 
        ? `${message} Quick win available: "${quickTask.title}"`
        : message,
      taskId: quickTask?.id,
    });

    this.lastNotificationTime = new Date();
  }

  /**
   * Send achievement notification
   */
  sendAchievementNotification(achievementName: string, description: string, rarity: string): void {
    const settings = useSettingsStore.getState().settings;
    const messageGen = getMessageGenerator(settings.heuristicPrefs?.motivationStyle);
    const message = messageGen.generateAchievementMessage(achievementName, description);

    // Legendary achievements always notify
    const shouldNotify = rarity === 'legendary' || this.shouldSendNotification({} as Task, 'high');

    if (shouldNotify) {
      useNotificationStore.getState().addNotification({
        type: 'achievement',
        title: '🏆 Achievement Unlocked!',
        message,
      });
    }
  }

  // Helper methods

  private isQuietHours(): boolean {
    const settings = useSettingsStore.getState().settings;
    const notificationPrefs = settings.notificationPrefs;
    
    if (!notificationPrefs?.quietHoursEnabled) return false;

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const start = notificationPrefs.quietHoursStart || '22:00';
    const end = notificationPrefs.quietHoursEnd || '08:00';
    
    if (start > end) {
      return currentTime >= start || currentTime < end;
    }
    
    return currentTime >= start && currentTime < end;
  }

  private isProductiveHours(): boolean {
    const settings = useSettingsStore.getState().settings;
    const notificationPrefs = settings.notificationPrefs;
    
    if (!notificationPrefs?.productiveHoursStart || !notificationPrefs?.productiveHoursEnd) {
      return true; // No restriction
    }

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const start = notificationPrefs.productiveHoursStart;
    const end = notificationPrefs.productiveHoursEnd;
    
    return currentTime >= start && currentTime < end;
  }

  private getRecentNotificationCount(minutes: number): number {
    const cutoff = Date.now() - minutes * 60 * 1000;
    let count = 0;
    
    for (const times of this.notificationHistory.values()) {
      count += times.filter(t => t.getTime() > cutoff).length;
    }
    
    return count;
  }

  private recordNotification(taskId: string): void {
    const history = this.notificationHistory.get(taskId) || [];
    history.push(new Date());
    this.notificationHistory.set(taskId, history);
    this.saveHistory();
  }

  private getPriorityTitle(priority: string): string {
    switch (priority) {
      case 'critical':
        return '🚨 Urgent Action Required';
      case 'high':
        return '⚡ Great Opportunity';
      case 'motivational':
        return '💡 Smart Suggestion';
      case 'informational':
        return 'ℹ️ Update';
      default:
        return 'Notification';
    }
  }

  private loadHistory(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem('notification-manager-history');
      if (stored) {
        const data = JSON.parse(stored);
        this.engagementScore = data.engagementScore || 1.0;
        this.dismissalCount = data.dismissalCount || 0;
        
        if (data.userResponseRate) {
          this.userResponseRate = new Map(Object.entries(data.userResponseRate));
        }
        
        if (data.notificationHistory) {
          for (const [taskId, times] of Object.entries(data.notificationHistory)) {
            this.notificationHistory.set(
              taskId,
              (times as string[]).map(t => new Date(t))
            );
          }
        }
      }
    } catch (error) {
      console.error('Failed to load notification history:', error);
    }
  }

  private saveHistory(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const data = {
        engagementScore: this.engagementScore,
        dismissalCount: this.dismissalCount,
        userResponseRate: Object.fromEntries(this.userResponseRate),
        notificationHistory: Object.fromEntries(
          Array.from(this.notificationHistory.entries()).map(([key, value]) => [
            key,
            value.map(d => d.toISOString()),
          ])
        ),
      };
      
      localStorage.setItem('notification-manager-history', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save notification history:', error);
    }
  }
}

// Singleton instance
let notificationManagerInstance: IntelligentNotificationManager | null = null;

export function getNotificationManager(): IntelligentNotificationManager {
  if (!notificationManagerInstance) {
    notificationManagerInstance = new IntelligentNotificationManager();
  }
  return notificationManagerInstance;
}

/**
 * Hook to use intelligent notifications
 */
export function useIntelligentNotifications() {
  const manager = getNotificationManager();

  const detectAndNotify = () => {
    const opportunities = manager.detectOpportunities();
    if (opportunities.length > 0) {
      manager.sendSmartNotification(opportunities[0]);
    }
  };

  const handleResponse = (taskId: string, action: 'completed' | 'started' | 'viewed' | 'dismissed') => {
    manager.handleUserResponse(taskId, action);
  };

  const sendStreakProtection = () => {
    manager.sendStreakProtectionNotification();
  };

  const sendAchievement = (name: string, description: string, rarity: string) => {
    manager.sendAchievementNotification(name, description, rarity);
  };

  return {
    detectAndNotify,
    handleResponse,
    sendStreakProtection,
    sendAchievement,
    manager,
  };
}
