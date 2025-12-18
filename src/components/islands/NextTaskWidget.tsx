/**
 * Next Task Suggestion Widget
 * 
 * Displays the single best task to work on right now based on heuristic scoring.
 */

import React, { useEffect, useState } from 'react';
import { Play, Clock, Target, TrendingUp, Sparkles } from 'lucide-react';
import { useTaskStore } from '../../lib/store/taskStore';
import { HeuristicEngine, BehavioralCollector } from '../../lib/intelligence/heuristicEngine';
import { getMessageGenerator } from '../../lib/intelligence/messageGenerator';
import { useSettingsStore } from '../../lib/store/settingsStore';
import { useGamificationStore } from '../../lib/store/gamificationStore';
import type { Task } from '../../lib/types';
import type { TaskScore } from '../../lib/intelligence/heuristicEngine';

export interface NextTaskWidgetProps {
  onTaskStart?: (taskId: string) => void;
  className?: string;
}

export const NextTaskWidget: React.FC<NextTaskWidgetProps> = ({
  onTaskStart,
  className = '',
}) => {
  const { tasks, updateTask } = useTaskStore();
  const { settings } = useSettingsStore();
  const { stats } = useGamificationStore();
  const [bestTask, setBestTask] = useState<{ task: Task; score: TaskScore } | null>(null);
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if heuristics are enabled
    if (!settings.heuristicPrefs?.enabled) {
      setIsLoading(false);
      return;
    }

    // Initialize behavioral collector and heuristic engine
    const collector = new BehavioralCollector();
    const signals = collector.getSignals();
    
    // Update signals with current stats
    signals.currentStreak = stats.currentStreak;
    signals.todayCompletedCount = 0; // Could be tracked separately
    signals.totalTasksCompleted = stats.tasksCompleted;
    
    const engine = new HeuristicEngine(undefined, signals);
    
    // Find best task
    const activeTasks = tasks.filter(
      t => t.status === 'todo' || t.status === 'in-progress'
    );
    
    if (activeTasks.length === 0) {
      setBestTask(null);
      setMessage('🎉 All tasks completed! Time to plan or relax.');
      setIsLoading(false);
      return;
    }

    const result = engine.getBestTask(activeTasks);
    setBestTask(result);
    
    // Generate personalized message
    if (result) {
      const messageGen = getMessageGenerator(settings.heuristicPrefs?.motivationStyle);
      const suggestionMessage = messageGen.generate('suggestion', {
        taskName: result.task.title,
        successRate: Math.round(result.score.successProbability * 100),
        energyLevel: signals.currentEnergyLevel.toString(),
        comparisonStat: result.task.estimatedDuration?.toString() || '30',
        timeOfDay: getTimeOfDay(),
      });
      setMessage(suggestionMessage);
      
      // Record suggestion
      engine.recordSuggestion(result.task.id);
    }
    
    setIsLoading(false);
  }, [tasks, settings, stats]);

  const handleStartTask = () => {
    if (bestTask) {
      updateTask(bestTask.task.id, { status: 'in-progress' });
      onTaskStart?.(bestTask.task.id);
    }
  };

  if (isLoading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (!settings.heuristicPrefs?.enabled) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${className}`}>
        <div className="text-center text-gray-500 dark:text-gray-400">
          <Sparkles className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Smart suggestions are disabled</p>
          <p className="text-xs mt-1">Enable in Settings to get personalized task recommendations</p>
        </div>
      </div>
    );
  }

  if (!bestTask) {
    return (
      <div className={`bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg shadow-lg p-6 ${className}`}>
        <div className="text-center">
          <div className="text-4xl mb-2">🎉</div>
          <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
            All Caught Up!
          </h3>
          <p className="text-sm text-green-700 dark:text-green-300">
            {message}
          </p>
        </div>
      </div>
    );
  }

  const { task, score } = bestTask;
  const priorityColors = {
    urgent: 'from-red-500 to-red-600',
    high: 'from-orange-500 to-orange-600',
    medium: 'from-blue-500 to-blue-600',
    low: 'from-green-500 to-green-600',
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden ${className}`}>
      {/* Header with gradient */}
      <div className={`bg-gradient-to-r ${priorityColors[task.priority]} p-4 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5" />
            <h3 className="font-semibold">Next Best Task</h3>
          </div>
          <div className="flex items-center space-x-1 text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>{Math.round(score.overall * 100)}% match</span>
          </div>
        </div>
      </div>

      {/* Task Details */}
      <div className="p-6">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {task.title}
        </h4>
        
        {task.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Reasoning */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-4">
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
            {message}
          </p>
          
          {score.reasoning.length > 0 && (
            <div className="space-y-1">
              {score.reasoning.map((reason, index) => (
                <div key={index} className="text-xs text-gray-600 dark:text-gray-400 flex items-start">
                  <span className="mr-1">•</span>
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Success Rate</div>
            <div className="text-lg font-semibold text-green-600 dark:text-green-400">
              {Math.round(score.successProbability * 100)}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Urgency</div>
            <div className="text-lg font-semibold text-orange-600 dark:text-orange-400">
              {Math.round(score.urgency * 100)}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Energy Match</div>
            <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
              {Math.round(score.energyMatch * 100)}%
            </div>
          </div>
        </div>

        {/* Time estimate */}
        {task.estimatedDuration && (
          <div className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-400 mb-4">
            <Clock className="w-4 h-4 mr-1" />
            <span>Estimated: {task.estimatedDuration} minutes</span>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleStartTask}
          className={`w-full bg-gradient-to-r ${priorityColors[task.priority]} text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center space-x-2 hover:opacity-90 transition-opacity`}
        >
          <Play className="w-5 h-5" />
          <span>Start This Task</span>
        </button>
      </div>
    </div>
  );
};

function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

export default NextTaskWidget;
