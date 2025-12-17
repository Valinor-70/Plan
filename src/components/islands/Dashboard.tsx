import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  BookOpen,
  Target,
  Flame,
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import { useTaskStore } from '../../lib/store/taskStore';
import { useSubjectStore } from '../../lib/store/subjectStore';
import type { Task } from '../../lib/types';
import { Card, CardTitle, CardContent } from '../ui/Card';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import { ToastProvider } from '../ui/Toast';

export const Dashboard: React.FC = () => {
  const { tasks, getTodaysTasks, getUpcomingTasks, getOverdueTasks } = useTaskStore();
  const { getActiveSubjects } = useSubjectStore();
  const [showTaskForm, setShowTaskForm] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);

  const activeSubjects = getActiveSubjects();
  const todaysTasks = getTodaysTasks();
  const upcomingTasks = getUpcomingTasks(7);
  const overdueTasks = getOverdueTasks();

  // Calculate stats
  const stats = useMemo(() => {
    const completedTasks = tasks.filter(t => t.status === 'completed');
    const totalTasks = tasks.length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;
    
    // Calculate streak (consecutive days with completed tasks)
    let streak = 0;
    let currentDate = new Date();
    for (let i = 0; i < 365; i++) {
      const dayTasks = tasks.filter(t => {
        const taskDate = new Date(t.completedAt || t.updatedAt);
        return format(taskDate, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd') && t.status === 'completed';
      });
      if (dayTasks.length > 0) {
        streak++;
        currentDate = subDays(currentDate, 1);
      } else {
        break;
      }
    }
    
    return {
      totalTasks,
      completedTasks: completedTasks.length,
      completionRate,
      overdue: overdueTasks.length,
      streak,
    };
  }, [tasks, overdueTasks]);

  // Tasks by subject
  const tasksBySubject = useMemo(() => {
    return activeSubjects.map(subject => {
      const subjectTasks = tasks.filter(t => t.subjectId === subject.id);
      const completed = subjectTasks.filter(t => t.status === 'completed').length;
      return {
        subject,
        total: subjectTasks.length,
        completed,
        percentage: subjectTasks.length > 0 ? Math.round((completed / subjectTasks.length) * 100) : 0,
      };
    }).sort((a, b) => b.total - a.total);
  }, [tasks, activeSubjects]);

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleCloseForm = () => {
    setShowTaskForm(false);
    setEditingTask(null);
  };

  // Listen for global open-task-form events (dispatched from non-React header)
  React.useEffect(() => {
    const openHandler = () => setShowTaskForm(true);
    window.addEventListener('open-task-form', openHandler as EventListener);
    return () => window.removeEventListener('open-task-form', openHandler as EventListener);
  }, []);

  return (
    <ToastProvider>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-text-primary-light dark:text-text-primary-dark">
            Dashboard
          </h1>
          <p className="text-text-secondary mt-1">
            Welcome back! Here's your overview for today.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Completed Tasks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-text-primary-light dark:text-text-primary-dark">
                  {stats.completedTasks}
                </p>
                <p className="text-sm text-text-secondary">Completed</p>
              </div>
            </div>
          </motion.div>

          {/* Due Today */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="card p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-text-primary-light dark:text-text-primary-dark">
                  {todaysTasks.length}
                </p>
                <p className="text-sm text-text-secondary">Due Today</p>
              </div>
            </div>
          </motion.div>

          {/* Overdue */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-4"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                stats.overdue > 0 ? 'bg-error/10' : 'bg-slate-100 dark:bg-slate-800'
              }`}>
                <AlertTriangle className={`w-5 h-5 ${
                  stats.overdue > 0 ? 'text-error' : 'text-text-tertiary'
                }`} />
              </div>
              <div>
                <p className="text-2xl font-semibold text-text-primary-light dark:text-text-primary-dark">
                  {stats.overdue}
                </p>
                <p className="text-sm text-text-secondary">Overdue</p>
              </div>
            </div>
          </motion.div>

          {/* Streak */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="card p-4"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                stats.streak > 0 ? 'bg-warning/10' : 'bg-slate-100 dark:bg-slate-800'
              }`}>
                <Flame className={`w-5 h-5 ${
                  stats.streak > 0 ? 'text-warning' : 'text-text-tertiary'
                }`} />
              </div>
              <div>
                <p className="text-2xl font-semibold text-text-primary-light dark:text-text-primary-dark">
                  {stats.streak}
                </p>
                <p className="text-sm text-text-secondary">Day Streak</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Tasks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <Card padding="none">
              <div className="p-4 border-b border-border-light dark:border-border-dark">
                <CardTitle>Today's Tasks</CardTitle>
              </div>
              <CardContent className="p-4">
                {todaysTasks.length > 0 ? (
                  <div className="space-y-3">
                    {todaysTasks.map((task) => (
                      <TaskCard key={task.id} task={task} onEdit={handleEditTask} compact />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-10 h-10 mx-auto mb-3 text-text-tertiary" />
                    <p className="text-text-secondary">No tasks due today</p>
                    <button
                      onClick={() => setShowTaskForm(true)}
                      className="mt-2 text-sm text-brand-primary hover:underline"
                    >
                      Add a task
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Subject Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Card padding="none">
              <div className="p-4 border-b border-border-light dark:border-border-dark">
                <CardTitle>Subjects</CardTitle>
              </div>
              <CardContent className="p-4">
                {tasksBySubject.length > 0 ? (
                  <div className="space-y-4">
                    {tasksBySubject.slice(0, 5).map(({ subject, total, completed, percentage }) => (
                      <div key={subject.id} className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: subject.color }}
                        >
                          <BookOpen className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium truncate text-text-primary-light dark:text-text-primary-dark">
                              {subject.name}
                            </span>
                            <span className="text-xs text-text-tertiary">
                              {completed}/{total}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${percentage}%`,
                                backgroundColor: subject.color,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="w-10 h-10 mx-auto mb-3 text-text-tertiary" />
                    <p className="text-text-secondary">No subjects yet</p>
                    <a
                      href="/subjects"
                      className="mt-2 text-sm text-brand-primary hover:underline inline-block"
                    >
                      Add subjects
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Upcoming & Overdue */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Upcoming Tasks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card padding="none">
              <div className="p-4 border-b border-border-light dark:border-border-dark flex items-center justify-between">
                <CardTitle>Upcoming (7 days)</CardTitle>
                <span className="text-sm text-text-tertiary">{upcomingTasks.length} tasks</span>
              </div>
              <CardContent className="p-4 max-h-[300px] overflow-y-auto">
                {upcomingTasks.length > 0 ? (
                  <div className="space-y-2">
                    {upcomingTasks.slice(0, 5).map((task) => (
                      <TaskCard key={task.id} task={task} onEdit={handleEditTask} compact />
                    ))}
                    {upcomingTasks.length > 5 && (
                      <a
                        href="/?view=upcoming"
                        className="block text-center py-2 text-sm text-brand-primary hover:underline"
                      >
                        View all {upcomingTasks.length} tasks
                      </a>
                    )}
                  </div>
                ) : (
                  <p className="text-center py-4 text-text-secondary">No upcoming tasks</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Overdue Tasks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <Card padding="none">
              <div className="p-4 border-b border-border-light dark:border-border-dark flex items-center justify-between">
                <CardTitle className={overdueTasks.length > 0 ? 'text-error' : ''}>
                  Overdue
                </CardTitle>
                <span className={`text-sm ${overdueTasks.length > 0 ? 'text-error' : 'text-text-tertiary'}`}>
                  {overdueTasks.length} tasks
                </span>
              </div>
              <CardContent className="p-4 max-h-[300px] overflow-y-auto">
                {overdueTasks.length > 0 ? (
                  <div className="space-y-2">
                    {overdueTasks.slice(0, 5).map((task) => (
                      <TaskCard key={task.id} task={task} onEdit={handleEditTask} compact />
                    ))}
                    {overdueTasks.length > 5 && (
                      <a
                        href="/?view=overdue"
                        className="block text-center py-2 text-sm text-brand-primary hover:underline"
                      >
                        View all {overdueTasks.length} tasks
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Target className="w-10 h-10 mx-auto mb-3 text-success" />
                    <p className="text-success font-medium">All caught up!</p>
                    <p className="text-sm text-text-secondary mt-1">No overdue tasks</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Task Form Modal */}
        <TaskForm
          open={showTaskForm}
          onClose={handleCloseForm}
          editTask={editingTask}
        />
      </div>
    </ToastProvider>
  );
};

export default Dashboard;
