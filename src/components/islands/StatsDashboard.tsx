import { useMemo } from 'react';
import { useTaskStore } from '../../lib/store/taskStore';
import { useSubjectStore } from '../../lib/store/subjectStore';
import { useSettingsStore } from '../../lib/store/settingsStore';
import { computeAnalyticsSummary } from '../../lib/analytics/compute';
import { generateInsights } from '../../lib/analytics/insights';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { format } from 'date-fns';

const COLORS = {
  primary: '#6366f1',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#06b6d4',
};

const PRIORITY_COLORS = {
  urgent: '#ef4444',
  high: '#f59e0b',
  medium: '#06b6d4',
  low: '#10b981',
};

export default function StatsDashboard() {
  const { tasks } = useTaskStore();
  const { subjects } = useSubjectStore();
  const { settings } = useSettingsStore();

  const summary = useMemo(
    () => computeAnalyticsSummary(tasks, subjects),
    [tasks, subjects]
  );

  const insights = useMemo(
    () => generateInsights(summary, tasks),
    [summary, tasks]
  );

  // Prepare chart data
  const velocityChartData = summary.velocity.last30Days.map((d) => ({
    date: format(new Date(d.date), 'MM/dd'),
    count: d.count,
  }));

  const subjectChartData = summary.subjectPerformance.map((s) => ({
    name: s.subjectName,
    completed: s.completedTasks,
    pending: s.totalTasks - s.completedTasks,
    completionRate: s.completionRate,
  }));

  const priorityChartData = [
    {
      name: 'Urgent',
      value: summary.priorityDistribution.urgent.total,
      completed: summary.priorityDistribution.urgent.completed,
    },
    {
      name: 'High',
      value: summary.priorityDistribution.high.total,
      completed: summary.priorityDistribution.high.completed,
    },
    {
      name: 'Medium',
      value: summary.priorityDistribution.medium.total,
      completed: summary.priorityDistribution.medium.completed,
    },
    {
      name: 'Low',
      value: summary.priorityDistribution.low.total,
      completed: summary.priorityDistribution.low.completed,
    },
  ].filter((d) => d.value > 0);

  const streakChartData = summary.streaks.last90Days
    .filter((_, i) => i % 7 === 0) // Show every 7th day
    .map((d) => ({
      date: format(new Date(d.date), 'MM/dd'),
      completed: d.completed,
    }));

  // Check if analytics is enabled
  if (!settings.analyticsEnabled) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center">
          <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-brand-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Analytics Disabled
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
            Enable analytics in settings to track your productivity, completion rates, and get personalized insights.
          </p>
          <a
            href="/settings"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white font-medium rounded-lg hover:bg-indigo-600 transition-colors"
          >
            Go to Settings
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Analytics</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Track your productivity and get insights into your study habits
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Completion Rate
            </span>
            {summary.completion.trend === 'up' && (
              <span className="text-emerald-600">↑</span>
            )}
            {summary.completion.trend === 'down' && <span className="text-red-600">↓</span>}
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
            {summary.completion.completionRate}%
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {summary.completion.completedTasks} of {summary.completion.totalTasks} tasks
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Daily Velocity
            </span>
            {summary.velocity.trend === 'up' && <span className="text-emerald-600">↑</span>}
            {summary.velocity.trend === 'down' && <span className="text-red-600">↓</span>}
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
            {summary.velocity.averageTasksPerDay}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">tasks per day</div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Current Streak
            </span>
            {summary.streaks.currentStreak > 0 && (
              <span className="text-amber-600">🔥</span>
            )}
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
            {summary.streaks.currentStreak}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            days (best: {summary.streaks.longestStreak})
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Time Accuracy
            </span>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
            {summary.timeAnalysis.accuracy}%
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">estimate vs actual</div>
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Insights & Recommendations
          </h2>
          <div className="space-y-3">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className={`p-4 rounded-lg border ${
                  insight.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                    : insight.type === 'warning'
                    ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                    : insight.type === 'info'
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                    : 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                      {insight.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {insight.message}
                    </p>
                  </div>
                  {insight.action && (
                    <a
                      href={insight.action.href}
                      className="ml-4 text-sm font-medium text-brand-primary hover:text-indigo-600 whitespace-nowrap"
                    >
                      {insight.action.label} →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Velocity Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Task Velocity (Last 30 Days)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={velocityChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                stroke="#64748b"
                style={{ fontSize: '12px' }}
              />
              <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke={COLORS.primary}
                strokeWidth={2}
                dot={{ fill: COLORS.primary }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Subject Performance */}
        {subjectChartData.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Subject Performance
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={subjectChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  style={{ fontSize: '12px' }}
                />
                <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Legend />
                <Bar dataKey="completed" fill={COLORS.success} name="Completed" />
                <Bar dataKey="pending" fill={COLORS.warning} name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Priority Distribution */}
        {priorityChartData.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Priority Distribution
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={priorityChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    percent ? `${name}: ${(percent * 100).toFixed(0)}%` : name
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {priorityChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        PRIORITY_COLORS[
                          entry.name.toLowerCase() as keyof typeof PRIORITY_COLORS
                        ]
                      }
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Streak Visualization */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Activity Over Time
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={streakChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                stroke="#64748b"
                style={{ fontSize: '12px' }}
              />
              <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Bar dataKey="completed" fill={COLORS.info} name="Tasks Completed" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
