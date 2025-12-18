/**
 * Intelligence Transparency Dashboard
 * 
 * Shows users what the system has learned about their patterns
 * and how it's making decisions.
 */

import React, { useState, useEffect } from 'react';
import { Brain, Clock, Calendar, TrendingUp, BarChart3, Eye, RefreshCw } from 'lucide-react';
import { BehavioralCollector } from '../../lib/intelligence/heuristicEngine';
import { HeuristicEngine } from '../../lib/intelligence/heuristicEngine';
import { useSettingsStore } from '../../lib/store/settingsStore';
import { useTaskStore } from '../../lib/store/taskStore';

export const InsightsDashboard: React.FC = () => {
  const { settings } = useSettingsStore();
  const { tasks } = useTaskStore();
  const [collector] = useState(() => new BehavioralCollector());
  const [insights, setInsights] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'patterns' | 'weights' | 'recommendations'>('patterns');

  useEffect(() => {
    loadInsights();
  }, [tasks]);

  const loadInsights = () => {
    const signals = collector.getSignals();
    const engine = new HeuristicEngine(undefined, signals);
    const weights = engine.getWeights();

    // Generate insights
    const productiveHoursDisplay = signals.mostProductiveHours
      .sort((a, b) => a - b)
      .map(h => formatHour(h))
      .join(', ');

    const productiveDaysDisplay = signals.mostProductiveDays
      .sort((a, b) => a - b)
      .map(d => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d])
      .join(', ');

    const topCategories = Object.entries(signals.categoryCompletionRates)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    setInsights({
      signals,
      weights,
      productiveHoursDisplay,
      productiveDaysDisplay,
      topCategories,
    });
  };

  const formatHour = (hour: number): string => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}${period}`;
  };

  const getWeightColor = (weight: number): string => {
    if (weight > 0.25) return 'bg-blue-500';
    if (weight > 0.15) return 'bg-green-500';
    return 'bg-gray-400';
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all learned patterns? This cannot be undone.')) {
      collector.reset();
      loadInsights();
    }
  };

  if (!settings.heuristicPrefs?.showLearningTransparency) {
    return null;
  }

  if (!insights) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Intelligence Insights</h2>
              <p className="text-purple-100 text-sm">
                What the system has learned about you
              </p>
            </div>
          </div>
          
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset Data</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('patterns')}
          className={`flex-1 py-3 px-4 font-medium transition-colors ${
            activeTab === 'patterns'
              ? 'border-b-2 border-purple-500 text-purple-600 dark:text-purple-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span>Patterns</span>
          </div>
        </button>
        
        <button
          onClick={() => setActiveTab('weights')}
          className={`flex-1 py-3 px-4 font-medium transition-colors ${
            activeTab === 'weights'
              ? 'border-b-2 border-purple-500 text-purple-600 dark:text-purple-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <BarChart3 className="w-4 h-4" />
            <span>Weights</span>
          </div>
        </button>
        
        <button
          onClick={() => setActiveTab('recommendations')}
          className={`flex-1 py-3 px-4 font-medium transition-colors ${
            activeTab === 'recommendations'
              ? 'border-b-2 border-purple-500 text-purple-600 dark:text-purple-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Eye className="w-4 h-4" />
            <span>Recommendations</span>
          </div>
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'patterns' && (
          <div className="space-y-6">
            {/* Productivity Patterns */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-500" />
                Productivity Patterns
              </h3>
              
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Most Productive Hours
                  </div>
                  <div className="text-lg font-medium text-gray-900 dark:text-white">
                    {insights.productiveHoursDisplay || 'Building pattern...'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    You complete {Math.round((insights.signals.completionRate || 0) * 100)}% more tasks during these hours
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Most Productive Days
                  </div>
                  <div className="text-lg font-medium text-gray-900 dark:text-white">
                    {insights.productiveDaysDisplay || 'Building pattern...'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Your highest completion rates occur on these days
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Overall Completion Rate
                  </div>
                  <div className="text-lg font-medium text-gray-900 dark:text-white">
                    {Math.round((insights.signals.completionRate || 0) * 100)}%
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Based on {insights.signals.totalTasksCompleted} completed tasks
                  </div>
                </div>
              </div>
            </div>

            {/* Category Performance */}
            {insights.topCategories.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-500" />
                  Top Categories
                </h3>
                
                <div className="space-y-3">
                  {insights.topCategories.map(([categoryId, rate]: [string, number], index: number) => (
                    <div key={categoryId} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-gray-900 dark:text-white">
                          #{index + 1} Category
                        </div>
                        <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                          {Math.round(rate * 100)}% completion
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{ width: `${rate * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'weights' && (
          <div className="space-y-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              These weights determine how the system prioritizes different factors when suggesting tasks.
              They adapt based on which suggestions you respond to.
            </p>

            <div className="space-y-4">
              {[
                { key: 'urgency', label: 'Urgency (Deadline Pressure)', value: insights.weights.urgency },
                { key: 'value', label: 'Value (Priority & Importance)', value: insights.weights.value },
                { key: 'successProbability', label: 'Success Probability', value: insights.weights.successProbability },
                { key: 'energyMatch', label: 'Energy Match', value: insights.weights.energyMatch },
                { key: 'friction', label: 'Friction (Ease of Completion)', value: insights.weights.friction },
                { key: 'recency', label: 'Recency (Suggestion Freshness)', value: insights.weights.recency },
              ].map(({ key, label, value }) => (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {label}
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {Math.round(value * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${getWeightColor(value)}`}
                      style={{ width: `${value * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <strong>💡 How it works:</strong> Higher weights mean that factor has more influence on task suggestions.
                The system adjusts these automatically based on which tasks you complete vs. ignore.
              </div>
            </div>
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Based on your patterns, here are personalized recommendations:
            </p>

            <div className="space-y-3">
              {insights.signals.mostProductiveHours.length > 0 && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">⏰</div>
                    <div>
                      <div className="font-medium text-green-800 dark:text-green-200 mb-1">
                        Schedule Important Tasks During Peak Hours
                      </div>
                      <div className="text-sm text-green-700 dark:text-green-300">
                        You're {Math.round((insights.signals.completionRate || 0.5) * 200)}% more productive during {insights.productiveHoursDisplay}.
                        Schedule your high-priority tasks during these windows.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {insights.signals.completionRate < 0.6 && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">🎯</div>
                    <div>
                      <div className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                        Focus on Shorter Tasks
                      </div>
                      <div className="text-sm text-yellow-700 dark:text-yellow-300">
                        Your completion rate suggests breaking large tasks into smaller, manageable chunks.
                        Aim for tasks under 30 minutes to build momentum.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {insights.signals.currentStreak > 7 && (
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">🔥</div>
                    <div>
                      <div className="font-medium text-purple-800 dark:text-purple-200 mb-1">
                        Maintain Your Momentum
                      </div>
                      <div className="text-sm text-purple-700 dark:text-purple-300">
                        You're on a {insights.signals.currentStreak}-day streak! Set a daily reminder
                        for your most productive time to ensure you don't break it.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {insights.topCategories.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">📊</div>
                    <div>
                      <div className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                        Leverage Your Strengths
                      </div>
                      <div className="text-sm text-blue-700 dark:text-blue-300">
                        You excel at certain categories. When motivation is low, start with tasks
                        from your high-completion categories to build confidence.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InsightsDashboard;
