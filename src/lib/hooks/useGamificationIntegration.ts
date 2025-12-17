import { useTaskStore } from '../store/taskStore';
import { usePomodoroStore } from '../store/pomodoroStore';
import { useGamificationStore } from '../store/gamificationStore';
import { calculateXP } from '../gamification/achievements';
import { useEffect, useState } from 'react';

export function useGamificationIntegration() {
  const { tasks } = useTaskStore();
  const { sessionHistory } = usePomodoroStore();
  const { updateStats, addXP, checkAchievements } = useGamificationStore();
  
  const [notifications, setNotifications] = useState<{
    type: 'levelUp' | 'achievement';
    data: any;
  }[]>([]);

  useEffect(() => {
    // Calculate current stats from tasks and sessions
    const completedTasks = tasks.filter(t => t.status === 'completed');
    const completedSessions = sessionHistory.filter(s => s.completed && s.type === 'work');
    
    // Calculate streak (simplified - checks consecutive days with completed tasks)
    const calculateStreak = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let streak = 0;
      let checkDate = new Date(today);
      
      while (true) {
        const dayTasks = completedTasks.filter(t => {
          if (!t.completedAt) return false;
          const completedDate = new Date(t.completedAt);
          completedDate.setHours(0, 0, 0, 0);
          return completedDate.getTime() === checkDate.getTime();
        });
        
        if (dayTasks.length === 0 && streak > 0) break;
        if (dayTasks.length > 0) streak++;
        if (streak === 0 && checkDate.getTime() < today.getTime()) break;
        
        checkDate.setDate(checkDate.getDate() - 1);
      }
      
      return streak;
    };

    const currentStreak = calculateStreak();
    
    // Find longest streak
    const longestStreak = Math.max(currentStreak, useGamificationStore.getState().stats.longestStreak);
    
    // Calculate total work minutes
    const totalWorkMinutes = completedSessions.reduce((total, session) => {
      const duration = Math.floor(
        (session.endTime.getTime() - session.startTime.getTime()) / 60000
      );
      return total + duration;
    }, 0);

    // Update stats
    const newStats = {
      tasksCompleted: completedTasks.length,
      pomodorosCompleted: completedSessions.length,
      currentStreak,
      longestStreak,
      totalWorkMinutes,
    };

    updateStats(newStats);
  }, [tasks.length, sessionHistory.length, updateStats]);

  const awardTaskXP = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status !== 'completed') return;

    const isOnTime = !task.dueDate || (task.completedAt && new Date(task.completedAt) <= new Date(task.dueDate));
    
    const xp = calculateXP({
      type: 'task_complete',
      priority: task.priority,
      estimatedMinutes: task.estimatedDuration,
      currentStreak: useGamificationStore.getState().stats.currentStreak,
      completedBeforeDue: isOnTime,
    });

    const result = addXP(xp);
    
    if (result.leveledUp) {
      setNotifications(prev => [...prev, {
        type: 'levelUp',
        data: { level: result.newLevel, xpGained: xp }
      }]);
    }

    // Check for new achievements
    const newAchievements = checkAchievements({});
    newAchievements.forEach(achievement => {
      setNotifications(prev => [...prev, {
        type: 'achievement',
        data: achievement
      }]);
    });
  };

  const awardPomodoroXP = () => {
    const xp = calculateXP({
      type: 'pomodoro_complete',
    });

    const result = addXP(xp);
    
    if (result.leveledUp) {
      setNotifications(prev => [...prev, {
        type: 'levelUp',
        data: { level: result.newLevel, xpGained: xp }
      }]);
    }
  };

  const dismissNotification = (index: number) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  };

  return {
    notifications,
    dismissNotification,
    awardTaskXP,
    awardPomodoroXP,
  };
}
