import { useEffect } from 'react';
import { useTaskStore } from '../../lib/store/taskStore';
import { useNotificationStore } from '../../lib/store/notificationStore';
import { differenceInHours, isPast, isToday, isTomorrow } from 'date-fns';

/**
 * Hook that monitors tasks and creates smart notifications
 * - Due date reminders
 * - Overdue task alerts
 * - Procrastination detection
 * - Pattern-based suggestions
 */
export function useSmartNotifications() {
  const { tasks } = useTaskStore();
  const { addNotification, settings } = useNotificationStore();

  useEffect(() => {
    if (!settings.enabled) return;

    const checkTasks = () => {
      const now = new Date();
      
      tasks.forEach((task) => {
        if (task.status === 'completed' || task.status === 'archived') return;

        const dueDate = new Date(task.dueDate);
        const hoursUntilDue = differenceInHours(dueDate, now);

        // Overdue tasks
        if (isPast(dueDate) && !isToday(dueDate)) {
          addNotification({
            type: 'overdue',
            title: '⚠️ Task Overdue',
            message: `"${task.title}" is overdue!`,
            taskId: task.id,
            actionUrl: `/tasks/index.html?task=${task.id}`,
          });
        }
        
        // Due soon (within configured hours)
        else if (hoursUntilDue > 0 && hoursUntilDue <= settings.dueSoonHours) {
          const timeText = hoursUntilDue < 24 
            ? `in ${hoursUntilDue} hours`
            : isTomorrow(dueDate) 
            ? 'tomorrow'
            : `soon`;

          addNotification({
            type: 'due_soon',
            title: '📅 Task Due Soon',
            message: `"${task.title}" is due ${timeText}`,
            taskId: task.id,
            actionUrl: `/tasks/index.html?task=${task.id}`,
          });
        }

        // Procrastination detection (high priority task not started)
        if (
          settings.procrastinationDetection &&
          task.status === 'todo' &&
          (task.priority === 'urgent' || task.priority === 'high') &&
          hoursUntilDue <= 48 &&
          hoursUntilDue > 0
        ) {
          addNotification({
            type: 'suggestion',
            title: '💡 Suggestion',
            message: `Start working on "${task.title}" to avoid last-minute rush`,
            taskId: task.id,
            actionUrl: `/pomodoro/index.html?task=${task.id}`,
          });
        }
      });

      // Pattern-based suggestions
      checkPatterns();
    };

    const checkPatterns = () => {
      const incompleteTasks = tasks.filter(
        (t) => t.status !== 'completed' && t.status !== 'archived'
      );

      // Too many pending tasks
      if (incompleteTasks.length > 20) {
        addNotification({
          type: 'suggestion',
          title: '🎯 Productivity Tip',
          message: `You have ${incompleteTasks.length} pending tasks. Consider breaking them into smaller, manageable chunks.`,
          actionUrl: '/tasks/index.html',
        });
      }

      // Unbalanced workload
      const urgentTasks = incompleteTasks.filter((t) => t.priority === 'urgent');
      if (urgentTasks.length > 5) {
        addNotification({
          type: 'suggestion',
          title: '⚡ Workload Alert',
          message: `You have ${urgentTasks.length} urgent tasks. Consider rescheduling some to balance your workload.`,
          actionUrl: '/tasks/index.html',
        });
      }
    };

    // Check immediately
    checkTasks();

    // Check every hour
    const interval = setInterval(checkTasks, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [tasks, settings, addNotification]);

  return null;
}
