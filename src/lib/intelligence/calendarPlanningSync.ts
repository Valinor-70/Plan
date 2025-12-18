/**
 * Calendar-Planning Sync Manager
 * 
 * Provides bidirectional sync between Planning tab and Calendar view.
 * Handles conflict detection, visual updates, and smart scheduling.
 */

import { usePlanningStore, type TaskSegment } from '../store/planningStore';
import { useTaskStore } from '../store/taskStore';
import type { Task } from '../types';

export interface ConflictInfo {
  segment1: TaskSegment;
  segment2: TaskSegment;
  overlapMinutes: number;
}

export interface SchedulingSuggestion {
  taskId: string;
  suggestedTime: Date;
  duration: number;
  reason: string;
  confidence: number;
}

export class CalendarPlanningSync {
  /**
   * Detect scheduling conflicts for a given date
   */
  detectConflicts(date: Date): ConflictInfo[] {
    const planningStore = usePlanningStore.getState();
    const segments = planningStore.getSegmentsForDate(date);
    const conflicts: ConflictInfo[] = [];

    // Check each pair of segments for overlaps
    for (let i = 0; i < segments.length; i++) {
      for (let j = i + 1; j < segments.length; j++) {
        const seg1 = segments[i];
        const seg2 = segments[j];
        
        const overlapMinutes = this.calculateOverlap(seg1, seg2);
        if (overlapMinutes > 0) {
          conflicts.push({
            segment1: seg1,
            segment2: seg2,
            overlapMinutes,
          });
        }
      }
    }

    return conflicts;
  }

  /**
   * Calculate overlap between two segments in minutes
   */
  private calculateOverlap(seg1: TaskSegment, seg2: TaskSegment): number {
    const start1 = new Date(seg1.startTime).getTime();
    const end1 = new Date(seg1.endTime).getTime();
    const start2 = new Date(seg2.startTime).getTime();
    const end2 = new Date(seg2.endTime).getTime();

    const overlapStart = Math.max(start1, start2);
    const overlapEnd = Math.min(end1, end2);
    
    if (overlapStart >= overlapEnd) return 0;
    
    return (overlapEnd - overlapStart) / (1000 * 60);
  }

  /**
   * Resolve conflicts by shifting later tasks
   */
  resolveConflicts(conflicts: ConflictInfo[]): void {
    const planningStore = usePlanningStore.getState();

    conflicts.forEach(conflict => {
      // Move the later segment to after the earlier one
      const earlier = conflict.segment1.startTime < conflict.segment2.startTime 
        ? conflict.segment1 
        : conflict.segment2;
      const later = earlier === conflict.segment1 ? conflict.segment2 : conflict.segment1;

      // Calculate new start time (end of earlier segment + 5 min buffer)
      const newStartTime = new Date(new Date(earlier.endTime).getTime() + 5 * 60000);
      
      planningStore.moveSegment(later.id, newStartTime);
    });
  }

  /**
   * Suggest alternative time slots for a task
   */
  suggestAlternativeSlots(
    task: Task,
    preferredDate: Date,
    count: number = 3
  ): SchedulingSuggestion[] {
    const planningStore = usePlanningStore.getState();
    const workingHours = planningStore.workingHours;
    const segments = planningStore.getSegmentsForDate(preferredDate);
    
    const suggestions: SchedulingSuggestion[] = [];
    const duration = task.estimatedDuration || 60;

    // Parse working hours
    const [startHour, startMin] = workingHours.start.split(':').map(Number);
    const [endHour, endMin] = workingHours.end.split(':').map(Number);

    // Generate time slots (every 30 minutes during working hours)
    const slots: Date[] = [];
    const date = new Date(preferredDate);
    
    for (let hour = startHour; hour <= endHour; hour++) {
      for (let min = 0; min < 60; min += 30) {
        if (hour === endHour && min >= endMin) break;
        if (hour === startHour && min < startMin) continue;
        
        const slot = new Date(date);
        slot.setHours(hour, min, 0, 0);
        slots.push(slot);
      }
    }

    // Score each slot
    const scoredSlots = slots.map(slot => {
      const slotEnd = new Date(slot.getTime() + duration * 60000);
      
      // Check if slot fits within working hours
      if (slotEnd.getHours() > endHour || 
          (slotEnd.getHours() === endHour && slotEnd.getMinutes() > endMin)) {
        return { slot, score: 0, reason: 'Outside working hours' };
      }

      // Check for conflicts
      let hasConflict = false;
      let nearbyTasks = 0;
      
      segments.forEach(seg => {
        const segStart = new Date(seg.startTime).getTime();
        const segEnd = new Date(seg.endTime).getTime();
        const slotStart = slot.getTime();
        const slotEndTime = slotEnd.getTime();
        
        // Check overlap
        if (slotStart < segEnd && slotEndTime > segStart) {
          hasConflict = true;
        }
        
        // Check proximity (within 30 minutes)
        const timeDiff = Math.min(
          Math.abs(slotStart - segEnd),
          Math.abs(slotEndTime - segStart)
        );
        if (timeDiff < 30 * 60000) {
          nearbyTasks++;
        }
      });

      if (hasConflict) {
        return { slot, score: 0, reason: 'Conflicts with existing task' };
      }

      // Calculate score
      let score = 1.0;
      let reason = 'Available slot';

      // Prefer morning for high priority tasks
      if (task.priority === 'high' || task.priority === 'urgent') {
        const hour = slot.getHours();
        if (hour >= 8 && hour < 12) {
          score += 0.3;
          reason = 'Morning slot - ideal for high priority';
        }
      }

      // Prefer afternoon for low friction tasks
      if (duration <= 30) {
        const hour = slot.getHours();
        if (hour >= 14 && hour < 16) {
          score += 0.2;
          reason = 'Afternoon slot - good for quick tasks';
        }
      }

      // Penalty for too many nearby tasks
      if (nearbyTasks > 2) {
        score -= 0.2;
        reason = 'May be too busy';
      }

      // Prefer gaps between tasks
      if (nearbyTasks === 0) {
        score += 0.1;
        reason = 'Clear time block';
      }

      return { slot, score, reason };
    });

    // Sort by score and return top suggestions
    return scoredSlots
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, count)
      .map(s => ({
        taskId: task.id,
        suggestedTime: s.slot,
        duration,
        reason: s.reason,
        confidence: Math.min(s.score, 1.0),
      }));
  }

  /**
   * Auto-distribute tasks using intelligent scheduling
   */
  autoScheduleTasks(
    tasks: Task[],
    startDate: Date,
    endDate: Date,
    options: {
      respectPriority?: boolean;
      respectDeadlines?: boolean;
      respectEnergyLevels?: boolean;
      avoidOverload?: boolean;
    } = {}
  ): void {
    const planningStore = usePlanningStore.getState();
    const defaults = {
      respectPriority: true,
      respectDeadlines: true,
      respectEnergyLevels: true,
      avoidOverload: true,
    };
    const config = { ...defaults, ...options };

    // Sort tasks by priority and deadline
    let sortedTasks = [...tasks];
    
    if (config.respectPriority) {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      sortedTasks.sort((a, b) => 
        priorityOrder[a.priority] - priorityOrder[b.priority]
      );
    }

    if (config.respectDeadlines) {
      sortedTasks.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
    }

    // Distribute each task
    sortedTasks.forEach(task => {
      const duration = task.estimatedDuration || 60;
      let targetDate = new Date(startDate);

      // If task has deadline, work backwards
      if (config.respectDeadlines && task.dueDate) {
        const deadline = new Date(task.dueDate);
        if (deadline < endDate) {
          targetDate = deadline;
        }
      }

      // Find best slot for this task
      const suggestions = this.suggestAlternativeSlots(task, targetDate, 1);
      
      if (suggestions.length > 0) {
        const suggestion = suggestions[0];
        planningStore.addSegment({
          taskId: task.id,
          title: task.title,
          startTime: suggestion.suggestedTime,
          endTime: new Date(suggestion.suggestedTime.getTime() + duration * 60000),
          duration,
          color: this.getTaskColor(task),
          completed: false,
        });
      } else {
        // No good slot found, distribute across multiple days
        planningStore.distributeTask(task.id, duration, startDate, endDate);
      }
    });

    // Check and resolve any conflicts
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const conflicts = this.detectConflicts(currentDate);
      if (conflicts.length > 0) {
        this.resolveConflicts(conflicts);
      }
      currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
    }
  }

  /**
   * Sync planning segments to calendar view
   */
  syncToCalendar(date: Date): void {
    // This would integrate with CalendarView component
    // For now, we ensure planning store is the source of truth
    const planningStore = usePlanningStore.getState();
    const segments = planningStore.getSegmentsForDate(date);
    
    // Segments are automatically available via the store
    // CalendarView can read them directly
    console.log(`Synced ${segments.length} segments for ${date.toDateString()}`);
  }

  /**
   * Get task color based on priority
   */
  private getTaskColor(task: Task): string {
    const colors = {
      urgent: '#ef4444',
      high: '#f97316',
      medium: '#3b82f6',
      low: '#10b981',
    };
    return colors[task.priority];
  }

  /**
   * Get visual indicators for deadline proximity
   */
  getDeadlineIndicator(task: Task): {
    color: string;
    label: string;
    urgency: 'low' | 'medium' | 'high';
  } {
    if (!task.dueDate) {
      return { color: '#6b7280', label: 'No deadline', urgency: 'low' };
    }

    const now = new Date();
    const deadline = new Date(task.dueDate);
    const hoursUntilDue = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilDue < 0) {
      return { color: '#dc2626', label: 'Overdue', urgency: 'high' };
    } else if (hoursUntilDue < 24) {
      return { color: '#ea580c', label: 'Due today', urgency: 'high' };
    } else if (hoursUntilDue < 48) {
      return { color: '#f59e0b', label: 'Due tomorrow', urgency: 'medium' };
    } else if (hoursUntilDue < 168) {
      return { color: '#84cc16', label: 'Due this week', urgency: 'medium' };
    } else {
      return { color: '#22c55e', label: 'Due later', urgency: 'low' };
    }
  }

  /**
   * Calculate completion status for a time period
   */
  getCompletionStats(startDate: Date, endDate: Date): {
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
    totalMinutes: number;
    completedMinutes: number;
  } {
    const planningStore = usePlanningStore.getState();
    const segments = planningStore.getSegmentsForDateRange(startDate, endDate);

    const totalTasks = segments.length;
    const completedTasks = segments.filter(s => s.completed).length;
    const totalMinutes = segments.reduce((sum, s) => sum + s.duration, 0);
    const completedMinutes = segments
      .filter(s => s.completed)
      .reduce((sum, s) => sum + s.duration, 0);

    return {
      totalTasks,
      completedTasks,
      completionRate: totalTasks > 0 ? completedTasks / totalTasks : 0,
      totalMinutes,
      completedMinutes,
    };
  }
}

// Singleton instance
let syncManagerInstance: CalendarPlanningSync | null = null;

export function getCalendarPlanningSync(): CalendarPlanningSync {
  if (!syncManagerInstance) {
    syncManagerInstance = new CalendarPlanningSync();
  }
  return syncManagerInstance;
}

/**
 * Hook to use calendar-planning sync
 */
export function useCalendarPlanningSync() {
  const sync = getCalendarPlanningSync();

  return {
    detectConflicts: sync.detectConflicts.bind(sync),
    resolveConflicts: sync.resolveConflicts.bind(sync),
    suggestAlternativeSlots: sync.suggestAlternativeSlots.bind(sync),
    autoScheduleTasks: sync.autoScheduleTasks.bind(sync),
    syncToCalendar: sync.syncToCalendar.bind(sync),
    getDeadlineIndicator: sync.getDeadlineIndicator.bind(sync),
    getCompletionStats: sync.getCompletionStats.bind(sync),
  };
}
