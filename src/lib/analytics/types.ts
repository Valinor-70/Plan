// Analytics Event Types
export interface AnalyticsEvent {
  id: string;
  timestamp: Date;
  type: 'task_created' | 'task_completed' | 'task_updated' | 'task_deleted' | 'time_logged' | 'subject_created';
  data: Record<string, any>;
}

// Analytics Metrics
export interface CompletionMetrics {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  thisWeek: number;
  lastWeek: number;
  trend: 'up' | 'down' | 'stable';
  sparklineData: number[];
}

export interface VelocityMetrics {
  averageTasksPerDay: number;
  last30Days: { date: string; count: number }[];
  productivityScore: number;
  trend: 'up' | 'down' | 'stable';
}

export interface SubjectPerformance {
  subjectId: string;
  subjectName: string;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  averageTimeAccuracy: number;
}

export interface PriorityDistribution {
  urgent: { total: number; completed: number };
  high: { total: number; completed: number };
  medium: { total: number; completed: number };
  low: { total: number; completed: number };
}

export interface TimeAnalysis {
  totalEstimated: number;
  totalActual: number;
  accuracy: number;
  bySubject: {
    subjectId: string;
    estimated: number;
    actual: number;
  }[];
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  last90Days: { date: string; completed: number }[];
}

export interface AnalyticsSummary {
  completion: CompletionMetrics;
  velocity: VelocityMetrics;
  subjectPerformance: SubjectPerformance[];
  priorityDistribution: PriorityDistribution;
  timeAnalysis: TimeAnalysis;
  streaks: StreakData;
}

// Insights
export interface Insight {
  id: string;
  type: 'success' | 'warning' | 'info' | 'tip';
  title: string;
  message: string;
  action?: {
    label: string;
    href: string;
  };
}
