import { format, subDays, startOfDay, endOfDay, differenceInDays, isAfter, isBefore } from 'date-fns';
import type { Task, Subject } from '../types';
import type {
  CompletionMetrics,
  VelocityMetrics,
  SubjectPerformance,
  PriorityDistribution,
  TimeAnalysis,
  StreakData,
  AnalyticsSummary,
} from './types';

/**
 * Compute completion rate metrics from tasks
 */
export function computeCompletionMetrics(tasks: Task[]): CompletionMetrics {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // This week vs last week
  const now = new Date();
  const weekAgo = subDays(now, 7);
  const twoWeeksAgo = subDays(now, 14);

  const thisWeek = tasks.filter(
    (t) =>
      t.status === 'completed' &&
      t.completedAt &&
      isAfter(new Date(t.completedAt), weekAgo)
  ).length;

  const lastWeek = tasks.filter(
    (t) =>
      t.status === 'completed' &&
      t.completedAt &&
      isAfter(new Date(t.completedAt), twoWeeksAgo) &&
      isBefore(new Date(t.completedAt), weekAgo)
  ).length;

  const trend: 'up' | 'down' | 'stable' =
    thisWeek > lastWeek ? 'up' : thisWeek < lastWeek ? 'down' : 'stable';

  // Sparkline data (last 30 days)
  const sparklineData: number[] = [];
  for (let i = 29; i >= 0; i--) {
    const day = subDays(now, i);
    const dayStart = startOfDay(day);
    const dayEnd = endOfDay(day);
    const completed = tasks.filter(
      (t) =>
        t.status === 'completed' &&
        t.completedAt &&
        isAfter(new Date(t.completedAt), dayStart) &&
        isBefore(new Date(t.completedAt), dayEnd)
    ).length;
    sparklineData.push(completed);
  }

  return {
    totalTasks,
    completedTasks,
    completionRate: Math.round(completionRate),
    thisWeek,
    lastWeek,
    trend,
    sparklineData,
  };
}

/**
 * Compute task velocity metrics
 */
export function computeVelocityMetrics(tasks: Task[]): VelocityMetrics {
  const now = new Date();
  const thirtyDaysAgo = subDays(now, 30);

  // Get completed tasks in last 30 days
  const recentCompletedTasks = tasks.filter(
    (t) =>
      t.status === 'completed' &&
      t.completedAt &&
      isAfter(new Date(t.completedAt), thirtyDaysAgo)
  );

  // Group by day
  const last30Days: { date: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const day = subDays(now, i);
    const dayStr = format(day, 'yyyy-MM-dd');
    const dayStart = startOfDay(day);
    const dayEnd = startOfDay(subDays(day, -1));

    const count = recentCompletedTasks.filter(
      (t) =>
        t.completedAt &&
        isAfter(new Date(t.completedAt), dayStart) &&
        isBefore(new Date(t.completedAt), dayEnd)
    ).length;

    last30Days.push({ date: dayStr, count });
  }

  const averageTasksPerDay = recentCompletedTasks.length / 30;

  // Calculate productivity score (0-100)
  const maxTasksPerDay = Math.max(...last30Days.map((d) => d.count), 1);
  const productivityScore = Math.min(
    100,
    Math.round((averageTasksPerDay / maxTasksPerDay) * 100)
  );

  // Trend: compare first 15 days vs last 15 days
  const firstHalf = last30Days.slice(0, 15).reduce((sum, d) => sum + d.count, 0);
  const secondHalf = last30Days.slice(15).reduce((sum, d) => sum + d.count, 0);
  const trend: 'up' | 'down' | 'stable' =
    secondHalf > firstHalf ? 'up' : secondHalf < firstHalf ? 'down' : 'stable';

  return {
    averageTasksPerDay: Math.round(averageTasksPerDay * 10) / 10,
    last30Days,
    productivityScore,
    trend,
  };
}

/**
 * Compute subject performance metrics
 */
export function computeSubjectPerformance(
  tasks: Task[],
  subjects: Subject[]
): SubjectPerformance[] {
  return subjects.map((subject) => {
    const subjectTasks = tasks.filter((t) => t.subjectId === subject.id);
    const completedTasks = subjectTasks.filter((t) => t.status === 'completed').length;
    const totalTasks = subjectTasks.length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Time accuracy: compare estimated vs actual duration
    const tasksWithTime = subjectTasks.filter(
      (t) => t.estimatedDuration && t.actualDuration
    );
    const averageTimeAccuracy =
      tasksWithTime.length > 0
        ? tasksWithTime.reduce((sum, t) => {
            const accuracy =
              (Math.min(t.actualDuration!, t.estimatedDuration!) /
                Math.max(t.actualDuration!, t.estimatedDuration!)) *
              100;
            return sum + accuracy;
          }, 0) / tasksWithTime.length
        : 0;

    return {
      subjectId: subject.id,
      subjectName: subject.name,
      totalTasks,
      completedTasks,
      completionRate: Math.round(completionRate),
      averageTimeAccuracy: Math.round(averageTimeAccuracy),
    };
  });
}

/**
 * Compute priority distribution
 */
export function computePriorityDistribution(tasks: Task[]): PriorityDistribution {
  const distribution: PriorityDistribution = {
    urgent: { total: 0, completed: 0 },
    high: { total: 0, completed: 0 },
    medium: { total: 0, completed: 0 },
    low: { total: 0, completed: 0 },
  };

  tasks.forEach((task) => {
    const priority = task.priority;
    distribution[priority].total++;
    if (task.status === 'completed') {
      distribution[priority].completed++;
    }
  });

  return distribution;
}

/**
 * Compute time analysis
 */
export function computeTimeAnalysis(tasks: Task[], subjects: Subject[]): TimeAnalysis {
  const totalEstimated = tasks.reduce(
    (sum, t) => sum + (t.estimatedDuration || 0),
    0
  );
  const totalActual = tasks
    .filter((t) => t.status === 'completed')
    .reduce((sum, t) => sum + (t.actualDuration || 0), 0);

  const accuracy =
    totalEstimated > 0 && totalActual > 0
      ? (Math.min(totalActual, totalEstimated) / Math.max(totalActual, totalEstimated)) *
        100
      : 0;

  const bySubject = subjects.map((subject) => {
    const subjectTasks = tasks.filter((t) => t.subjectId === subject.id);
    return {
      subjectId: subject.id,
      estimated: subjectTasks.reduce((sum, t) => sum + (t.estimatedDuration || 0), 0),
      actual: subjectTasks
        .filter((t) => t.status === 'completed')
        .reduce((sum, t) => sum + (t.actualDuration || 0), 0),
    };
  });

  return {
    totalEstimated,
    totalActual,
    accuracy: Math.round(accuracy),
    bySubject,
  };
}

/**
 * Compute streak data
 */
export function computeStreakData(tasks: Task[]): StreakData {
  const now = new Date();
  const completedTasks = tasks.filter((t) => t.status === 'completed' && t.completedAt);

  // Sort by completion date
  const sorted = completedTasks
    .map((t) => ({ date: startOfDay(new Date(t.completedAt!)), task: t }))
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  // Calculate current streak
  let currentStreak = 0;
  let checkDate = startOfDay(now);
  const datesWithTasks = new Set(sorted.map((s) => s.date.toISOString()));

  while (datesWithTasks.has(checkDate.toISOString())) {
    currentStreak++;
    checkDate = subDays(checkDate, 1);
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 0;
  let prevDate: Date | null = null;

  sorted.forEach(({ date }) => {
    if (!prevDate || differenceInDays(prevDate, date) === 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else if (differenceInDays(prevDate, date) > 1) {
      tempStreak = 1;
    }
    prevDate = date;
  });

  // Last 90 days contribution graph
  const last90Days: { date: string; completed: number }[] = [];
  for (let i = 89; i >= 0; i--) {
    const day = subDays(now, i);
    const dayStr = format(day, 'yyyy-MM-dd');
    const dayStart = startOfDay(day);
    const dayEnd = startOfDay(subDays(day, -1));

    const count = completedTasks.filter(
      (t) =>
        t.completedAt &&
        isAfter(new Date(t.completedAt), dayStart) &&
        isBefore(new Date(t.completedAt), dayEnd)
    ).length;

    last90Days.push({ date: dayStr, completed: count });
  }

  return {
    currentStreak,
    longestStreak,
    last90Days,
  };
}

/**
 * Compute all analytics metrics
 */
export function computeAnalyticsSummary(
  tasks: Task[],
  subjects: Subject[]
): AnalyticsSummary {
  return {
    completion: computeCompletionMetrics(tasks),
    velocity: computeVelocityMetrics(tasks),
    subjectPerformance: computeSubjectPerformance(tasks, subjects),
    priorityDistribution: computePriorityDistribution(tasks),
    timeAnalysis: computeTimeAnalysis(tasks, subjects),
    streaks: computeStreakData(tasks),
  };
}
