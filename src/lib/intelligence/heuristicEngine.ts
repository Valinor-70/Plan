/**
 * Client-Side Heuristic Intelligence Engine
 * 
 * This system operates entirely in the browser without external APIs.
 * It uses sophisticated behavioral analysis and adaptive algorithms to
 * maximize user motivation and task completion.
 */

import type { Task } from '../types';

// ============================================================================
// BEHAVIORAL SIGNALS & TRACKING
// ============================================================================

export interface BehavioralSignals {
  // Task Completion Patterns
  completionRate: number; // 0-1
  averageTimeToComplete: number; // minutes
  tasksByTimeOfDay: Record<number, number>; // hour -> count
  tasksByDayOfWeek: Record<number, number>; // 0-6 -> count
  categoryCompletionRates: Record<string, number>;
  
  // Interaction Behaviors
  viewsBeforeStart: number; // Average views before starting
  snoozeFrequency: number; // Times per week
  postponeFrequency: number;
  editFrequency: number;
  
  // Temporal Context
  mostProductiveHours: number[]; // List of hours (0-23)
  mostProductiveDays: number[]; // List of days (0-6)
  averageDeadlineProximity: number; // Days before deadline when completed
  
  // Energy and Mood
  currentEnergyLevel: number; // 1-5
  energyByHour: Record<number, number>; // hour -> avg energy
  energyByDay: Record<number, number>; // day -> avg energy
  
  // Streak and Momentum
  currentStreak: number;
  streakVelocity: number; // Change in completion rate
  todayCompletedCount: number;
  todayTargetCount: number;
  
  // Historical Data
  totalTasksCompleted: number;
  totalTasksCreated: number;
  weeklyAverageCompletion: number;
  lastActivityDate: Date;
}

// ============================================================================
// HEURISTIC SCORING COMPONENTS
// ============================================================================

export interface TaskScore {
  overall: number; // 0-1
  urgency: number; // 0-1
  value: number; // 0-1
  friction: number; // 0-1 (inverted)
  successProbability: number; // 0-1
  recency: number; // 0-1
  energyMatch: number; // 0-1
  reasoning: string[];
}

export interface HeuristicWeights {
  urgency: number;
  value: number;
  friction: number;
  successProbability: number;
  recency: number;
  energyMatch: number;
  // Context-specific weight profiles
  contextual: {
    morning?: Partial<HeuristicWeights>;
    afternoon?: Partial<HeuristicWeights>;
    evening?: Partial<HeuristicWeights>;
    weekday?: Partial<HeuristicWeights>;
    weekend?: Partial<HeuristicWeights>;
  };
}

export const DEFAULT_WEIGHTS: HeuristicWeights = {
  urgency: 0.25,
  value: 0.20,
  friction: 0.15,
  successProbability: 0.20,
  recency: 0.10,
  energyMatch: 0.10,
  contextual: {},
};

// ============================================================================
// SCORING FUNCTIONS
// ============================================================================

export class HeuristicEngine {
  private weights: HeuristicWeights;
  private signals: BehavioralSignals;
  private lastSuggestionTimes: Map<string, Date> = new Map();

  constructor(weights: HeuristicWeights = DEFAULT_WEIGHTS, signals: BehavioralSignals) {
    this.weights = weights;
    this.signals = signals;
  }

  /**
   * Calculate multi-dimensional score for a task
   */
  calculateTaskScore(task: Task): TaskScore {
    const now = new Date();
    const reasoning: string[] = [];

    // 1. Urgency Component
    const urgency = this.calculateUrgency(task, now);
    if (urgency > 0.7) reasoning.push('⚠️ High urgency - deadline approaching');
    if (urgency > 0.9) reasoning.push('🚨 Critical deadline');

    // 2. Value Component
    const value = this.calculateValue(task);
    if (value > 0.7) reasoning.push('⭐ High-value task');

    // 3. Friction Component (inverted)
    const friction = this.calculateFriction(task);
    if (friction < 0.3) reasoning.push('⚡ Quick win - low effort');
    if (friction > 0.7) reasoning.push('🎯 Challenging task');

    // 4. Success Probability
    const successProbability = this.calculateSuccessProbability(task, now);
    if (successProbability > 0.8) reasoning.push(`✅ ${Math.round(successProbability * 100)}% success rate`);

    // 5. Recency Component
    const recency = this.calculateRecency(task);
    
    // 6. Energy Match
    const energyMatch = this.calculateEnergyMatch(task, now);
    if (energyMatch > 0.8) reasoning.push('💪 Perfect energy match');
    if (energyMatch < 0.3) reasoning.push('⚠️ Energy mismatch');

    // Get contextual weights
    const activeWeights = this.getContextualWeights(now);

    // Calculate weighted overall score
    const overall = 
      urgency * activeWeights.urgency +
      value * activeWeights.value +
      (1 - friction) * activeWeights.friction +
      successProbability * activeWeights.successProbability +
      recency * activeWeights.recency +
      energyMatch * activeWeights.energyMatch;

    return {
      overall,
      urgency,
      value,
      friction,
      successProbability,
      recency,
      energyMatch,
      reasoning,
    };
  }

  /**
   * Calculate urgency based on deadline proximity
   */
  private calculateUrgency(task: Task, now: Date): number {
    if (!task.dueDate) return 0.3; // Base urgency for no deadline
    
    const dueDate = new Date(task.dueDate);
    const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntilDue < 0) return 1.0; // Overdue = maximum urgency
    if (hoursUntilDue < 2) return 0.95;
    if (hoursUntilDue < 24) return 0.85;
    if (hoursUntilDue < 48) return 0.70;
    if (hoursUntilDue < 168) return 0.50; // 1 week
    if (hoursUntilDue < 336) return 0.35; // 2 weeks
    
    return 0.25; // Low urgency for distant deadlines
  }

  /**
   * Calculate value based on priority and category importance
   */
  private calculateValue(task: Task): number {
    let value = 0.5; // Base value
    
    // Priority-based value
    switch (task.priority) {
      case 'urgent':
        value = 1.0;
        break;
      case 'high':
        value = 0.8;
        break;
      case 'medium':
        value = 0.5;
        break;
      case 'low':
        value = 0.3;
        break;
    }
    
    // Category importance (learned from user behavior)
    const categoryRate = this.signals.categoryCompletionRates[task.subjectId];
    if (categoryRate && categoryRate > 0.8) {
      value *= 1.2; // User completes these reliably
    }
    
    // Task has subtasks (likely important)
    if (task.subtasks && task.subtasks.length > 0) {
      value *= 1.1;
    }
    
    return Math.min(value, 1.0);
  }

  /**
   * Calculate friction (effort required)
   */
  private calculateFriction(task: Task): number {
    let friction = 0.5; // Base friction
    
    // Duration-based friction
    if (task.estimatedDuration) {
      if (task.estimatedDuration <= 15) friction = 0.2; // Very quick
      else if (task.estimatedDuration <= 30) friction = 0.3;
      else if (task.estimatedDuration <= 60) friction = 0.5;
      else if (task.estimatedDuration <= 120) friction = 0.7;
      else friction = 0.9; // Long tasks have high friction
    }
    
    // Complexity indicators
    if (task.subtasks && task.subtasks.length > 5) {
      friction += 0.1; // Complex tasks
    }
    
    if (task.description && task.description.length > 500) {
      friction += 0.05; // Detailed tasks may be complex
    }
    
    return Math.min(friction, 1.0);
  }

  /**
   * Calculate success probability based on historical patterns
   */
  private calculateSuccessProbability(task: Task, now: Date): number {
    let probability = 0.5; // Base probability
    
    // Time-of-day alignment
    const hour = now.getHours();
    if (this.signals.mostProductiveHours.includes(hour)) {
      probability += 0.2;
    }
    
    // Day-of-week alignment
    const day = now.getDay();
    if (this.signals.mostProductiveDays.includes(day)) {
      probability += 0.1;
    }
    
    // Category success rate
    const categoryRate = this.signals.categoryCompletionRates[task.subjectId];
    if (categoryRate !== undefined) {
      probability = (probability + categoryRate) / 2;
    }
    
    // Streak momentum bonus
    if (this.signals.currentStreak > 7) {
      probability += 0.15;
    } else if (this.signals.currentStreak > 3) {
      probability += 0.1;
    }
    
    // Today's progress affects probability
    if (this.signals.todayCompletedCount > 0) {
      probability += 0.1; // Momentum effect
    }
    
    return Math.min(probability, 1.0);
  }

  /**
   * Calculate recency (prevent suggestion spam)
   */
  private calculateRecency(task: Task): number {
    const lastSuggestion = this.lastSuggestionTimes.get(task.id);
    
    if (!lastSuggestion) return 1.0; // Never suggested = high recency
    
    const minutesSinceSuggestion = (Date.now() - lastSuggestion.getTime()) / (1000 * 60);
    
    if (minutesSinceSuggestion < 30) return 0.1; // Recently suggested
    if (minutesSinceSuggestion < 60) return 0.3;
    if (minutesSinceSuggestion < 180) return 0.6;
    
    return 1.0; // Old suggestion
  }

  /**
   * Calculate energy match between task difficulty and current energy
   */
  private calculateEnergyMatch(task: Task, now: Date): number {
    const currentEnergy = this.getCurrentEnergy(now);
    const taskDifficulty = this.getTaskDifficulty(task);
    
    // Perfect match: high energy + hard task OR low energy + easy task
    const diff = Math.abs(currentEnergy - taskDifficulty);
    return 1.0 - (diff / 5.0);
  }

  /**
   * Get current energy level (uses stored patterns)
   */
  private getCurrentEnergy(now: Date): number {
    const hour = now.getHours();
    const energyAtHour = this.signals.energyByHour[hour];
    
    if (energyAtHour !== undefined) {
      return energyAtHour;
    }
    
    // Use current energy level if no pattern
    return this.signals.currentEnergyLevel || 3;
  }

  /**
   * Estimate task difficulty
   */
  private getTaskDifficulty(task: Task): number {
    let difficulty = 3; // Medium default
    
    if (task.priority === 'urgent' || task.priority === 'high') {
      difficulty = 4;
    } else if (task.priority === 'low') {
      difficulty = 2;
    }
    
    // Adjust by duration
    if (task.estimatedDuration) {
      if (task.estimatedDuration > 120) difficulty += 1;
      else if (task.estimatedDuration < 15) difficulty -= 1;
    }
    
    // Adjust by complexity
    if (task.subtasks && task.subtasks.length > 3) {
      difficulty += 1;
    }
    
    return Math.max(1, Math.min(5, difficulty));
  }

  /**
   * Get contextual weights based on time of day and week
   */
  private getContextualWeights(now: Date): HeuristicWeights {
    const hour = now.getHours();
    const day = now.getDay();
    const isWeekend = day === 0 || day === 6;
    
    let contextWeights = { ...this.weights };
    
    // Morning context (6am - 12pm)
    if (hour >= 6 && hour < 12 && this.weights.contextual.morning) {
      contextWeights = { ...contextWeights, ...this.weights.contextual.morning };
    }
    // Afternoon context (12pm - 6pm)
    else if (hour >= 12 && hour < 18 && this.weights.contextual.afternoon) {
      contextWeights = { ...contextWeights, ...this.weights.contextual.afternoon };
    }
    // Evening context (6pm - 12am)
    else if (hour >= 18 || hour < 6) {
      if (this.weights.contextual.evening) {
        contextWeights = { ...contextWeights, ...this.weights.contextual.evening };
      }
    }
    
    // Weekend vs weekday
    if (isWeekend && this.weights.contextual.weekend) {
      contextWeights = { ...contextWeights, ...this.weights.contextual.weekend };
    } else if (!isWeekend && this.weights.contextual.weekday) {
      contextWeights = { ...contextWeights, ...this.weights.contextual.weekday };
    }
    
    return contextWeights;
  }

  /**
   * Rank tasks by motivational score
   */
  rankTasks(tasks: Task[]): Array<{ task: Task; score: TaskScore }> {
    const scored = tasks
      .filter(t => t.status === 'todo' || t.status === 'in-progress')
      .map(task => ({
        task,
        score: this.calculateTaskScore(task),
      }))
      .sort((a, b) => b.score.overall - a.score.overall);
    
    return scored;
  }

  /**
   * Get the single best task to work on right now
   */
  getBestTask(tasks: Task[]): { task: Task; score: TaskScore } | null {
    const ranked = this.rankTasks(tasks);
    return ranked.length > 0 ? ranked[0] : null;
  }

  /**
   * Record task suggestion for recency tracking
   */
  recordSuggestion(taskId: string): void {
    this.lastSuggestionTimes.set(taskId, new Date());
  }

  /**
   * Update weights based on user response
   */
  adaptWeights(
    task: Task,
    score: TaskScore,
    userResponse: 'completed' | 'started' | 'viewed' | 'ignored' | 'snoozed'
  ): void {
    const adjustmentRate = 0.02; // 2% adjustment per event
    
    // Determine if response was positive
    const isPositive = userResponse === 'completed' || userResponse === 'started';
    const multiplier = isPositive ? 1 + adjustmentRate : 1 - adjustmentRate;
    
    // Identify dominant scoring components
    const components = [
      { name: 'urgency', value: score.urgency },
      { name: 'value', value: score.value },
      { name: 'successProbability', value: score.successProbability },
      { name: 'energyMatch', value: score.energyMatch },
    ];
    
    // Sort by value to find most influential
    components.sort((a, b) => b.value - a.value);
    const dominantComponent = components[0].name;
    
    // Adjust the dominant component's weight
    if (dominantComponent in this.weights) {
      const key = dominantComponent as keyof typeof this.weights;
      if (typeof this.weights[key] === 'number') {
        (this.weights[key] as number) *= multiplier;
      }
    }
    
    // Normalize weights to sum to 1.0
    this.normalizeWeights();
  }

  /**
   * Normalize weights so they sum to 1.0
   */
  private normalizeWeights(): void {
    const sum = 
      this.weights.urgency +
      this.weights.value +
      this.weights.friction +
      this.weights.successProbability +
      this.weights.recency +
      this.weights.energyMatch;
    
    if (sum > 0) {
      this.weights.urgency /= sum;
      this.weights.value /= sum;
      this.weights.friction /= sum;
      this.weights.successProbability /= sum;
      this.weights.recency /= sum;
      this.weights.energyMatch /= sum;
    }
  }

  /**
   * Get current weights (for transparency)
   */
  getWeights(): HeuristicWeights {
    return { ...this.weights };
  }

  /**
   * Update behavioral signals
   */
  updateSignals(newSignals: Partial<BehavioralSignals>): void {
    this.signals = { ...this.signals, ...newSignals };
  }
}

// ============================================================================
// BEHAVIORAL SIGNAL COLLECTOR
// ============================================================================

export class BehavioralCollector {
  private signals: BehavioralSignals;
  private storageKey = 'heuristic-behavioral-signals';

  constructor() {
    this.signals = this.loadSignals();
  }

  private loadSignals(): BehavioralSignals {
    if (typeof window === 'undefined') {
      return this.getDefaultSignals();
    }

    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        parsed.lastActivityDate = new Date(parsed.lastActivityDate);
        return parsed;
      } catch {
        return this.getDefaultSignals();
      }
    }
    
    return this.getDefaultSignals();
  }

  private getDefaultSignals(): BehavioralSignals {
    return {
      completionRate: 0.5,
      averageTimeToComplete: 60,
      tasksByTimeOfDay: {},
      tasksByDayOfWeek: {},
      categoryCompletionRates: {},
      viewsBeforeStart: 1,
      snoozeFrequency: 0,
      postponeFrequency: 0,
      editFrequency: 0,
      mostProductiveHours: [9, 10, 14, 15],
      mostProductiveDays: [1, 2, 3, 4], // Mon-Thu
      averageDeadlineProximity: 2,
      currentEnergyLevel: 3,
      energyByHour: {},
      energyByDay: {},
      currentStreak: 0,
      streakVelocity: 0,
      todayCompletedCount: 0,
      todayTargetCount: 5,
      totalTasksCompleted: 0,
      totalTasksCreated: 0,
      weeklyAverageCompletion: 0,
      lastActivityDate: new Date(),
    };
  }

  /**
   * Record task completion
   */
  recordCompletion(task: Task, completedAt: Date = new Date()): void {
    this.signals.totalTasksCompleted++;
    this.signals.todayCompletedCount++;
    
    // Track by time of day
    const hour = completedAt.getHours();
    this.signals.tasksByTimeOfDay[hour] = (this.signals.tasksByTimeOfDay[hour] || 0) + 1;
    
    // Track by day of week
    const day = completedAt.getDay();
    this.signals.tasksByDayOfWeek[day] = (this.signals.tasksByDayOfWeek[day] || 0) + 1;
    
    // Update category completion rate
    const categoryKey = task.subjectId;
    const currentRate = this.signals.categoryCompletionRates[categoryKey] || 0.5;
    this.signals.categoryCompletionRates[categoryKey] = (currentRate * 0.9) + (1.0 * 0.1); // Exponential moving average
    
    // Update overall completion rate
    this.signals.completionRate = this.signals.totalTasksCompleted / Math.max(1, this.signals.totalTasksCreated);
    
    // Recalculate productive hours
    this.updateProductiveHours();
    
    this.saveSignals();
  }

  /**
   * Record task creation
   */
  recordCreation(task: Task): void {
    this.signals.totalTasksCreated++;
    this.saveSignals();
  }

  /**
   * Update energy level
   */
  updateEnergy(level: number): void {
    this.signals.currentEnergyLevel = level;
    
    const hour = new Date().getHours();
    const day = new Date().getDay();
    
    // Update energy patterns
    const currentHourEnergy = this.signals.energyByHour[hour] || level;
    this.signals.energyByHour[hour] = (currentHourEnergy * 0.8) + (level * 0.2);
    
    const currentDayEnergy = this.signals.energyByDay[day] || level;
    this.signals.energyByDay[day] = (currentDayEnergy * 0.8) + (level * 0.2);
    
    this.saveSignals();
  }

  /**
   * Update productive hours based on completion patterns
   */
  private updateProductiveHours(): void {
    const completionsByHour = Object.entries(this.signals.tasksByTimeOfDay)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4)
      .map(item => item.hour);
    
    if (completionsByHour.length > 0) {
      this.signals.mostProductiveHours = completionsByHour;
    }
    
    const completionsByDay = Object.entries(this.signals.tasksByDayOfWeek)
      .map(([day, count]) => ({ day: parseInt(day), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4)
      .map(item => item.day);
    
    if (completionsByDay.length > 0) {
      this.signals.mostProductiveDays = completionsByDay;
    }
  }

  /**
   * Get current signals
   */
  getSignals(): BehavioralSignals {
    return { ...this.signals };
  }

  /**
   * Save signals to localStorage
   */
  private saveSignals(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.storageKey, JSON.stringify(this.signals));
    }
  }

  /**
   * Reset all behavioral data
   */
  reset(): void {
    this.signals = this.getDefaultSignals();
    this.saveSignals();
  }
}
