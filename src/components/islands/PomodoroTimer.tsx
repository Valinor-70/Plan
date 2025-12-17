import { useEffect, useState, useRef } from 'react';
import { usePomodoroStore } from '../../lib/store/pomodoroStore';
import { useTaskStore } from '../../lib/store/taskStore';
import { 
  Play, 
  Pause, 
  Square, 
  SkipForward, 
  Settings as SettingsIcon,
  Clock,
  Target
} from 'lucide-react';

export function PomodoroTimer() {
  const {
    activeSession,
    settings,
    todayStats,
    startSession,
    pauseSession,
    resumeSession,
    stopSession,
    completeSession,
    skipBreak,
  } = usePomodoroStore();

  const { tasks } = useTaskStore();
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Calculate time remaining
  useEffect(() => {
    if (!activeSession) {
      setTimeRemaining(0);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const updateTimer = () => {
      if (activeSession.isPaused) {
        return;
      }

      const elapsed = Math.floor((Date.now() - activeSession.startTime.getTime()) / 1000);
      const totalSeconds = activeSession.duration * 60;
      const remaining = totalSeconds - elapsed + activeSession.totalPausedTime;

      if (remaining <= 0) {
        completeSession();
        playNotificationSound();
        showNotification();
        setTimeRemaining(0);
      } else {
        setTimeRemaining(remaining);
      }
    };

    updateTimer();
    timerRef.current = setInterval(updateTimer, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [activeSession, completeSession]);

  const playNotificationSound = () => {
    if (!settings.soundEnabled) return;
    
    if (audioRef.current) {
      audioRef.current.volume = settings.volume / 100;
      audioRef.current.play().catch(() => {
        // Ignore errors if sound can't play
      });
    }
  };

  const showNotification = () => {
    if (!settings.notificationsEnabled || typeof window === 'undefined') return;
    
    if ('Notification' in window && Notification.permission === 'granted') {
      const title = activeSession?.type === 'work' 
        ? 'Work Session Complete!' 
        : 'Break Time Over!';
      const body = activeSession?.type === 'work'
        ? 'Time for a break!'
        : 'Ready to get back to work?';
      
      new Notification(title, {
        body,
        icon: '/favicon.svg',
        badge: '/favicon.svg',
      });
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    startSession(selectedTaskId, 'work');
  };

  const handlePause = () => {
    if (activeSession?.isPaused) {
      resumeSession();
    } else {
      pauseSession();
    }
  };

  const handleStop = () => {
    stopSession(true);
    setSelectedTaskId(null);
  };

  const getProgressPercentage = (): number => {
    if (!activeSession) return 0;
    const totalSeconds = activeSession.duration * 60;
    return ((totalSeconds - timeRemaining) / totalSeconds) * 100;
  };

  const getSessionTypeColor = (): string => {
    if (!activeSession) return 'stroke-gray-300';
    switch (activeSession.type) {
      case 'work':
        return 'stroke-indigo-500';
      case 'shortBreak':
        return 'stroke-green-500';
      case 'longBreak':
        return 'stroke-blue-500';
      default:
        return 'stroke-gray-300';
    }
  };

  const getSessionTypeLabel = (): string => {
    if (!activeSession) return 'Not Started';
    switch (activeSession.type) {
      case 'work':
        return 'Focus Time';
      case 'shortBreak':
        return 'Short Break';
      case 'longBreak':
        return 'Long Break';
    }
  };

  const activeTasks = tasks.filter(t => t.status !== 'completed' && t.status !== 'archived');
  const selectedTask = selectedTaskId ? tasks.find(t => t.id === selectedTaskId) : null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md mx-auto">
      {/* Audio element for notification sound */}
      <audio
        ref={audioRef}
        src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZUA0PVqzn77BdGwlCm+LvvGwhBTKJ1fPSgzMGHW7A7+OaUQ0PVq3o8K9dGwlDm+LvvGwhBTKJ1fPSgzMGHW7A7+OaUQ0PVq3o8K9dGwlDm+LvvGwhBTKJ1fPSgzMGHW7A7+OaUQ0PVq3o8K9dGwlDm+LvvGwhBTKJ1fPSgzMGHW7A7+OaUQ0PVq3o8K9dGwlDm+LvvGwhBTKJ1fPSgzMGHW7A7+OaUQ0PVq3o8K9dGwlDm+LvvGwhBTKJ1fPSgzMGHW7A7+OaUQ0PVq3o8K9dGwlDm+LvvGwhBTKJ1fPSgzMGHW7A7+OaUQ0PVq3o8K9dGwlDm+LvvGwhBTKJ1fPSgzMGHW7A7+OaUQ0PVq3o8K9dGwlDm+LvvGwhBTKJ1fPSgzMGHW7A7+OaUQ0PVq3o8K9dGwlDm+LvvGwhBTKJ1fPSgzMGHW7A7+OaUQ0PVq3o8K9dGwlDm+LvvGwhBTKJ1fPSgzMGHW7A7+OaUQ0PVq3o8K9dGwlDm+LvvGwhBTKJ1fPSgzMGHW7A7+OaUQ0PVq3o8K9dGwlDm+LvvGwhBTKJ1fPSgzMGHW7A7+OaUQ0PVq3o8K9dGwlDm+LvvGwhBTKJ1fPSgzMGHW7A7+OaUQ0PVq3o8K9dGwlDm+Lv"
      />

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Clock className="w-6 h-6 text-indigo-500" />
          Pomodoro Timer
        </h2>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          aria-label="Settings"
        >
          <SettingsIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg space-y-3">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Timer Settings</h3>
          
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                Work (min)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={settings.workDuration}
                onChange={(e) =>
                  usePomodoroStore.getState().updateSettings({
                    workDuration: parseInt(e.target.value) || 25,
                  })
                }
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                Short (min)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={settings.shortBreakDuration}
                onChange={(e) =>
                  usePomodoroStore.getState().updateSettings({
                    shortBreakDuration: parseInt(e.target.value) || 5,
                  })
                }
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                Long (min)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={settings.longBreakDuration}
                onChange={(e) =>
                  usePomodoroStore.getState().updateSettings({
                    longBreakDuration: parseInt(e.target.value) || 15,
                  })
                }
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-700 dark:text-gray-300">Auto-start breaks</label>
            <input
              type="checkbox"
              checked={settings.autoStartBreaks}
              onChange={(e) =>
                usePomodoroStore.getState().updateSettings({
                  autoStartBreaks: e.target.checked,
                })
              }
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-700 dark:text-gray-300">Auto-start work</label>
            <input
              type="checkbox"
              checked={settings.autoStartWork}
              onChange={(e) =>
                usePomodoroStore.getState().updateSettings({
                  autoStartWork: e.target.checked,
                })
              }
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-700 dark:text-gray-300">Sound notifications</label>
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(e) =>
                usePomodoroStore.getState().updateSettings({
                  soundEnabled: e.target.checked,
                })
              }
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
            />
          </div>
        </div>
      )}

      {/* Timer Display */}
      <div className="flex flex-col items-center justify-center mb-8">
        <div className="relative w-64 h-64">
          {/* Progress Ring */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="128"
              cy="128"
              r="120"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-gray-200 dark:text-gray-700"
            />
            <circle
              cx="128"
              cy="128"
              r="120"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 120}`}
              strokeDashoffset={`${2 * Math.PI * 120 * (1 - getProgressPercentage() / 100)}`}
              className={`${getSessionTypeColor()} transition-all duration-1000 ease-linear`}
              strokeLinecap="round"
            />
          </svg>

          {/* Time Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
              {activeSession ? formatTime(timeRemaining) : '25:00'}
            </div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {getSessionTypeLabel()}
            </div>
            {activeSession?.isPaused && (
              <div className="text-xs font-medium text-orange-500 mt-1">PAUSED</div>
            )}
          </div>
        </div>
      </div>

      {/* Task Selection */}
      {!activeSession && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Task (Optional)
          </label>
          <select
            value={selectedTaskId || ''}
            onChange={(e) => setSelectedTaskId(e.target.value || null)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">No task selected</option>
            {activeTasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Active Task Display */}
      {activeSession?.taskId && selectedTask && (
        <div className="mb-6 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-medium text-indigo-900 dark:text-indigo-200">
              {selectedTask.title}
            </span>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 mb-6">
        {!activeSession ? (
          <button
            onClick={handleStart}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
          >
            <Play className="w-5 h-5" />
            Start
          </button>
        ) : (
          <>
            <button
              onClick={handlePause}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
            >
              {activeSession.isPaused ? (
                <>
                  <Play className="w-4 h-4" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4" />
                  Pause
                </>
              )}
            </button>
            <button
              onClick={handleStop}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              <Square className="w-4 h-4" />
              Stop
            </button>
            {activeSession.type !== 'work' && (
              <button
                onClick={skipBreak}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <SkipForward className="w-4 h-4" />
                Skip
              </button>
            )}
          </>
        )}
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-3 gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {todayStats.completedSessions}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Sessions</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {todayStats.workMinutes}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Work Min</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {todayStats.breakMinutes}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Break Min</div>
        </div>
      </div>
    </div>
  );
}
