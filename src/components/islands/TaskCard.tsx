import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Circle, Calendar, Clock, Trash2, Edit } from 'lucide-react';
import { useTaskStore } from '../../lib/store/taskStore';
import { useSubjectStore } from '../../lib/store/subjectStore';
import type { Task } from '../../lib/types';
import { formatRelativeDate, isOverdue } from '../../lib/utils/dateHelpers';
import { PriorityBadge } from '../ui/Badge';

export interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  compact?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, compact = false }) => {
  const { toggleTaskStatus, deleteTask } = useTaskStore();
  const { getSubjectById } = useSubjectStore();
  const [showActions, setShowActions] = useState(false);
  
  const subject = getSubjectById(task.subjectId);
  const isCompleted = task.status === 'completed';
  const taskIsOverdue = !isCompleted && isOverdue(task.dueDate);
  
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleTaskStatus(task.id);
  };
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTask(task.id);
    }
  };
  
  const handleEdit = () => {
    if (onEdit) {
      onEdit(task);
    }
  };
  
  // Calculate subtask progress
  const subtaskProgress = task.subtasks && task.subtasks.length > 0
    ? Math.round((task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100)
    : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`group relative bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark hover:border-brand-primary/30 transition-all duration-200 ${
        compact ? 'p-3' : 'p-4'
      } ${isCompleted ? 'opacity-60' : ''}`}
      style={{
        borderLeftWidth: '3px',
        borderLeftColor: subject?.color || '#6366f1',
      }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          type="button"
          onClick={handleToggle}
          className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
            isCompleted
              ? 'bg-success border-success text-white'
              : 'border-border-light dark:border-border-dark hover:border-brand-primary'
          }`}
          aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
        >
          <AnimatePresence>
            {isCompleted && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Check className="w-3 h-3" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3
            className={`text-sm font-medium text-text-primary-light dark:text-text-primary-dark ${
              isCompleted ? 'line-through' : ''
            }`}
          >
            {task.title}
          </h3>
          
          {/* Description (if not compact) */}
          {!compact && task.description && (
            <p className="mt-1 text-sm text-text-secondary line-clamp-2">
              {task.description}
            </p>
          )}
          
          {/* Meta info */}
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-text-tertiary">
            {/* Subject */}
            {subject && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${subject.color}20`, color: subject.color }}
              >
                <Circle className="w-2 h-2 fill-current" />
                {subject.name}
              </span>
            )}
            
            {/* Due date */}
            <span className={`inline-flex items-center gap-1 ${taskIsOverdue ? 'text-error' : ''}`}>
              <Calendar className="w-3 h-3" />
              {formatRelativeDate(task.dueDate)}
            </span>
            
            {/* Time (if set) */}
            {task.dueTime && (
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {task.dueTime}
              </span>
            )}
            
            {/* Priority */}
            <PriorityBadge priority={task.priority} />
            
            {/* Subtask progress */}
            {subtaskProgress !== null && (
              <div className="flex items-center gap-1.5">
                <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-success rounded-full transition-all duration-300"
                    style={{ width: `${subtaskProgress}%` }}
                  />
                </div>
                <span>{subtaskProgress}%</span>
              </div>
            )}
          </div>
          
          {/* Tags */}
          {task.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {task.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-slate-100 dark:bg-slate-800 text-text-secondary"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
        
        {/* Actions */}
        <AnimatePresence>
          {showActions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-1"
            >
              <button
                type="button"
                onClick={handleEdit}
                className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary-light dark:hover:text-text-primary-dark hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Edit task"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="p-1.5 rounded-lg text-text-tertiary hover:text-error hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                aria-label="Delete task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default TaskCard;
