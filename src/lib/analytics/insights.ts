import type { Task, Subject } from '../types';
import type { Insight, AnalyticsSummary } from './types';
import { ROUTES } from '../config/routes';

/**
 * Generate insights based on analytics data
 */
export function generateInsights(
  summary: AnalyticsSummary,
  tasks: Task[]
): Insight[] {
  const insights: Insight[] = [];

  // Completion rate insights
  if (summary.completion.completionRate > 80) {
    insights.push({
      id: 'high-completion',
      type: 'success',
      title: 'Excellent Progress!',
      message: `You're crushing it with an ${summary.completion.completionRate}% completion rate. Keep up the great work!`,
    });
  } else if (summary.completion.completionRate < 40) {
    insights.push({
      id: 'low-completion',
      type: 'warning',
      title: 'Room for Improvement',
      message: `Your completion rate is ${summary.completion.completionRate}%. Try breaking down large tasks into smaller, manageable pieces.`,
      action: {
        label: 'View Tasks',
        href: ROUTES.tasks,
      },
    });
  }

  // Velocity trend insights
  if (summary.velocity.trend === 'up') {
    insights.push({
      id: 'velocity-up',
      type: 'success',
      title: 'Productivity Increasing',
      message: `You're completing ${summary.velocity.averageTasksPerDay} tasks per day on average, and your pace is improving!`,
    });
  } else if (summary.velocity.trend === 'down') {
    insights.push({
      id: 'velocity-down',
      type: 'info',
      title: 'Productivity Dip',
      message: 'Your task completion rate has decreased recently. Consider reviewing your priorities.',
      action: {
        label: 'Review Tasks',
        href: ROUTES.tasks,
      },
    });
  }

  // Overdue tasks
  const overdueTasks = tasks.filter(
    (t) => t.status !== 'completed' && new Date(t.dueDate) < new Date()
  );
  if (overdueTasks.length > 0) {
    insights.push({
      id: 'overdue-tasks',
      type: 'warning',
      title: `${overdueTasks.length} Overdue Task${overdueTasks.length > 1 ? 's' : ''}`,
      message: 'You have tasks past their due date. Consider rescheduling or completing them soon.',
      action: {
        label: 'View Overdue',
        href: ROUTES.tasks,
      },
    });
  }

  // Subject performance insights
  const lowPerformingSubjects = summary.subjectPerformance.filter(
    (s) => s.totalTasks > 3 && s.completionRate < 50
  );
  if (lowPerformingSubjects.length > 0) {
    const subject = lowPerformingSubjects[0];
    insights.push({
      id: 'subject-performance',
      type: 'info',
      title: `${subject.subjectName} Needs Attention`,
      message: `Only ${subject.completionRate}% of ${subject.subjectName} tasks are completed. Focus on this subject to improve.`,
      action: {
        label: 'View Subject',
        href: ROUTES.subjects,
      },
    });
  }

  // Time estimation insights
  if (summary.timeAnalysis.accuracy < 60 && summary.timeAnalysis.totalEstimated > 0) {
    insights.push({
      id: 'time-accuracy',
      type: 'tip',
      title: 'Improve Time Estimates',
      message: `Your time estimates are ${summary.timeAnalysis.accuracy}% accurate. Track actual time spent to improve planning.`,
    });
  } else if (summary.timeAnalysis.accuracy > 85) {
    insights.push({
      id: 'time-accuracy-good',
      type: 'success',
      title: 'Great Time Management',
      message: 'Your time estimates are highly accurate! You know your pace well.',
    });
  }

  // Streak insights
  if (summary.streaks.currentStreak >= 7) {
    insights.push({
      id: 'streak-milestone',
      type: 'success',
      title: `${summary.streaks.currentStreak}-Day Streak!`,
      message: "You've been consistently productive. Amazing dedication!",
    });
  } else if (summary.streaks.currentStreak === 0 && summary.streaks.longestStreak > 0) {
    insights.push({
      id: 'streak-broken',
      type: 'info',
      title: 'Rebuild Your Streak',
      message: `Your longest streak was ${summary.streaks.longestStreak} days. Complete a task today to start a new streak!`,
    });
  }

  // Priority distribution insights
  const { urgent, high } = summary.priorityDistribution;
  const urgentPending = urgent.total - urgent.completed;
  const highPending = high.total - high.completed;

  if (urgentPending > 0) {
    insights.push({
      id: 'urgent-tasks',
      type: 'warning',
      title: `${urgentPending} Urgent Task${urgentPending > 1 ? 's' : ''} Pending`,
      message: 'Focus on urgent tasks first to avoid last-minute stress.',
      action: {
        label: 'View Tasks',
        href: ROUTES.tasks,
      },
    });
  } else if (highPending > 5) {
    insights.push({
      id: 'high-priority-tasks',
      type: 'info',
      title: 'Many High-Priority Tasks',
      message: `You have ${highPending} high-priority tasks. Consider tackling a few each day.`,
    });
  }

  // Upcoming deadlines
  const upcomingTasks = tasks.filter((t) => {
    if (t.status === 'completed') return false;
    const daysUntilDue = Math.ceil(
      (new Date(t.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilDue >= 0 && daysUntilDue <= 3;
  });

  if (upcomingTasks.length > 0) {
    insights.push({
      id: 'upcoming-deadlines',
      type: 'info',
      title: 'Deadlines This Week',
      message: `You have ${upcomingTasks.length} task${upcomingTasks.length > 1 ? 's' : ''} due in the next 3 days. Plan accordingly!`,
      action: {
        label: 'View Calendar',
        href: ROUTES.calendar,
      },
    });
  }

  // Motivational insights when doing well
  if (
    summary.completion.completionRate > 70 &&
    summary.streaks.currentStreak > 3 &&
    overdueTasks.length === 0
  ) {
    insights.push({
      id: 'motivation',
      type: 'success',
      title: "You're On Fire! 🔥",
      message: 'Great completion rate, active streak, and no overdue tasks. Keep this momentum going!',
    });
  }

  // General productivity tip
  if (insights.length < 2) {
    insights.push({
      id: 'productivity-tip',
      type: 'tip',
      title: 'Productivity Tip',
      message: 'Break large tasks into smaller subtasks to make progress more manageable and track completion better.',
    });
  }

  return insights.slice(0, 6); // Return max 6 insights
}
