import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns';
import { useTaskStore } from '../../lib/store/taskStore';
import { useSubjectStore } from '../../lib/store/subjectStore';
import { useSettingsStore } from '../../lib/store/settingsStore';
import type { Task } from '../../lib/types';
import TaskForm from './TaskForm';
import Button from '../ui/Button';
import { ToastProvider } from '../ui/Toast';

export interface CalendarViewProps {
  initialDate?: Date;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ initialDate = new Date() }) => {
  const { tasks } = useTaskStore();
  const { getSubjectById } = useSubjectStore();
  const { settings } = useSettingsStore();
  
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  const firstDayOfWeek = settings.firstDayOfWeek;

  // Generate calendar days for the current month view
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: firstDayOfWeek });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: firstDayOfWeek });
    
    const days: Date[] = [];
    let day = calendarStart;
    
    while (day <= calendarEnd) {
      days.push(new Date(day));
      day = addDays(day, 1);
    }
    
    return days;
  }, [currentDate, firstDayOfWeek]);

  // Get tasks for each day
  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    
    tasks.forEach((task) => {
      const dateKey = format(new Date(task.dueDate), 'yyyy-MM-dd');
      const existing = map.get(dateKey) || [];
      map.set(dateKey, [...existing, task]);
    });
    
    return map;
  }, [tasks]);

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleAddTaskOnDate = (date: Date) => {
    setSelectedDate(date);
    setSelectedTask(null);
    setShowTaskForm(true);
  };

  const handleTaskClick = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTask(task);
    setShowTaskForm(true);
  };

  const handleCloseForm = () => {
    setShowTaskForm(false);
    setSelectedTask(null);
  };

  // Day names
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const orderedDayNames = firstDayOfWeek === 1
    ? [...dayNames.slice(1), dayNames[0]]
    : dayNames;

  // Get selected day's tasks
  const selectedDayTasks = selectedDate
    ? tasksByDate.get(format(selectedDate, 'yyyy-MM-dd')) || []
    : [];

  return (
    <ToastProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary-light dark:text-text-primary-dark">
              Calendar
            </h1>
            <p className="text-text-secondary mt-1">
              View and manage your tasks by date
            </p>
          </div>
          
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => {
              setSelectedTask(null);
              setShowTaskForm(true);
            }}
          >
            Add Task
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-3 bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark overflow-hidden">
            {/* Calendar Header */}
            <div className="flex items-center justify-between p-4 border-b border-border-light dark:border-border-dark">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark">
                  {format(currentDate, 'MMMM yyyy')}
                </h2>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handleToday}>
                  Today
                </Button>
                <div className="flex items-center border border-border-light dark:border-border-dark rounded-lg overflow-hidden">
                  <button
                    onClick={handlePrevMonth}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    aria-label="Previous month"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNextMonth}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    aria-label="Next month"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Day Names */}
            <div className="grid grid-cols-7 border-b border-border-light dark:border-border-dark">
              {orderedDayNames.map((day) => (
                <div
                  key={day}
                  className="py-3 text-center text-sm font-medium text-text-secondary"
                >
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar Grid */}
            <div className="grid grid-cols-7">
              {calendarDays.map((day) => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const dayTasks = tasksByDate.get(dateKey) || [];
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isTodayDate = isToday(day);
                
                return (
                  <div
                    key={dateKey}
                    onClick={() => handleDateClick(day)}
                    className={`min-h-[100px] p-2 border-b border-r border-border-light dark:border-border-dark cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-brand-primary/5'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    } ${!isCurrentMonth ? 'opacity-40' : ''}`}
                  >
                    {/* Date Number */}
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`w-7 h-7 flex items-center justify-center text-sm rounded-full ${
                          isTodayDate
                            ? 'bg-brand-primary text-white font-medium'
                            : isSelected
                            ? 'bg-brand-primary/20 text-brand-primary font-medium'
                            : 'text-text-primary-light dark:text-text-primary-dark'
                        }`}
                      >
                        {format(day, 'd')}
                      </span>
                      
                      {isCurrentMonth && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddTaskOnDate(day);
                          }}
                          className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                          aria-label="Add task"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    
                    {/* Tasks */}
                    <div className="space-y-1">
                      {dayTasks.slice(0, 3).map((task) => {
                        const subject = getSubjectById(task.subjectId);
                        return (
                          <button
                            key={task.id}
                            onClick={(e) => handleTaskClick(task, e)}
                            className={`w-full text-left text-xs px-2 py-1 rounded truncate transition-colors ${
                              task.status === 'completed'
                                ? 'line-through opacity-60'
                                : ''
                            }`}
                            style={{
                              backgroundColor: subject ? `${subject.color}20` : '#6366f120',
                              color: subject?.color || '#6366f1',
                            }}
                          >
                            {task.title}
                          </button>
                        );
                      })}
                      {dayTasks.length > 3 && (
                        <span className="text-xs text-text-tertiary px-2">
                          +{dayTasks.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Sidebar - Selected Day Details */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-4">
              <h3 className="font-semibold text-text-primary-light dark:text-text-primary-dark mb-4">
                {selectedDate
                  ? format(selectedDate, 'EEEE, MMMM d')
                  : format(new Date(), 'EEEE, MMMM d')}
              </h3>
              
              {selectedDayTasks.length > 0 ? (
                <div className="space-y-2">
                  {selectedDayTasks.map((task) => {
                    const subject = getSubjectById(task.subjectId);
                    return (
                      <button
                        key={task.id}
                        onClick={() => {
                          setSelectedTask(task);
                          setShowTaskForm(true);
                        }}
                        className="w-full text-left p-3 rounded-lg border border-border-light dark:border-border-dark hover:border-brand-primary/30 transition-colors"
                        style={{
                          borderLeftWidth: '3px',
                          borderLeftColor: subject?.color || '#6366f1',
                        }}
                      >
                        <p className={`text-sm font-medium ${
                          task.status === 'completed' ? 'line-through text-text-tertiary' : 'text-text-primary-light dark:text-text-primary-dark'
                        }`}>
                          {task.title}
                        </p>
                        {subject && (
                          <p className="text-xs text-text-tertiary mt-1">
                            {subject.name}
                          </p>
                        )}
                        {task.dueTime && (
                          <p className="text-xs text-text-tertiary mt-1">
                            {task.dueTime}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CalendarIcon className="w-8 h-8 mx-auto mb-2 text-text-tertiary" />
                  <p className="text-sm text-text-secondary">No tasks scheduled</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      setSelectedTask(null);
                      setShowTaskForm(true);
                    }}
                  >
                    Add Task
                  </Button>
                </div>
              )}
            </div>
            
            {/* Quick Stats */}
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-4">
              <h3 className="font-medium text-text-primary-light dark:text-text-primary-dark mb-3">
                This Month
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Total Tasks</span>
                  <span className="font-medium">{tasks.filter(t => 
                    isSameMonth(new Date(t.dueDate), currentDate)
                  ).length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Completed</span>
                  <span className="font-medium text-success">{tasks.filter(t => 
                    isSameMonth(new Date(t.dueDate), currentDate) && t.status === 'completed'
                  ).length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Pending</span>
                  <span className="font-medium text-warning">{tasks.filter(t => 
                    isSameMonth(new Date(t.dueDate), currentDate) && t.status !== 'completed'
                  ).length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Task Form Modal */}
        <TaskForm
          open={showTaskForm}
          onClose={handleCloseForm}
          editTask={selectedTask}
        />
      </div>
    </ToastProvider>
  );
};

export default CalendarView;
