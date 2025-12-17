import React, { useState, useEffect } from 'react';
import { Calendar, Clock, X, Plus } from 'lucide-react';
import { useTaskStore } from '../../lib/store/taskStore';
import { useSubjectStore } from '../../lib/store/subjectStore';
import type { Task, SubTask } from '../../lib/types';
import { PRIORITY_CONFIG } from '../../lib/types';
import { generateId } from '../../lib/utils/generateId';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Modal from '../ui/Modal';

export interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  editTask?: Task | null;
}

interface FormData {
  title: string;
  description: string;
  subjectId: string;
  dueDate: string;
  dueTime: string;
  priority: Task['priority'];
  tags: string[];
  estimatedDuration: number;
  subtasks: SubTask[];
}

const defaultFormData: FormData = {
  title: '',
  description: '',
  subjectId: '',
  dueDate: new Date().toISOString().split('T')[0],
  dueTime: '',
  priority: 'medium',
  tags: [],
  estimatedDuration: 60,
  subtasks: [],
};

export const TaskForm: React.FC<TaskFormProps> = ({ open, onClose, editTask }) => {
  const { addTask, updateTask } = useTaskStore();
  const { getActiveSubjects } = useSubjectStore();
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [tagInput, setTagInput] = useState('');
  const [subtaskInput, setSubtaskInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const activeSubjects = getActiveSubjects();
  const isEditing = !!editTask;

  useEffect(() => {
    if (editTask) {
      setFormData({
        title: editTask.title,
        description: editTask.description || '',
        subjectId: editTask.subjectId,
        dueDate: new Date(editTask.dueDate).toISOString().split('T')[0],
        dueTime: editTask.dueTime || '',
        priority: editTask.priority,
        tags: editTask.tags || [],
        estimatedDuration: editTask.estimatedDuration || 60,
        subtasks: editTask.subtasks || [],
      });
    } else {
      setFormData(defaultFormData);
    }
    setErrors({});
  }, [editTask, open]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }
    
    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    try {
      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        subjectId: formData.subjectId,
        dueDate: new Date(formData.dueDate),
        dueTime: formData.dueTime || undefined,
        priority: formData.priority,
        status: (editTask?.status || 'todo') as Task['status'],
        tags: formData.tags,
        estimatedDuration: formData.estimatedDuration,
        subtasks: formData.subtasks,
      };
      
      if (isEditing && editTask) {
        updateTask(editTask.id, taskData);
      } else {
        addTask(taskData);
      }
      
      onClose();
    } catch (error) {
      console.error('Failed to save task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tagToRemove),
    }));
  };

  const handleAddSubtask = () => {
    const title = subtaskInput.trim();
    if (title) {
      const newSubtask: SubTask = {
        id: generateId(),
        title,
        completed: false,
        order: formData.subtasks.length,
      };
      setFormData(prev => ({ ...prev, subtasks: [...prev.subtasks, newSubtask] }));
      setSubtaskInput('');
    }
  };

  const handleRemoveSubtask = (id: string) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.filter(s => s.id !== id),
    }));
  };

  const handleToggleSubtask = (id: string) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.map(s =>
        s.id === id ? { ...s, completed: !s.completed } : s
      ),
    }));
  };

  const priorityOptions = Object.entries(PRIORITY_CONFIG).map(([value, config]) => ({
    value,
    label: config.label,
  }));

  const subjectOptions = activeSubjects.map(s => ({
    value: s.id,
    label: s.name,
  }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Edit Task' : 'Create New Task'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={isSubmitting}
          >
            {isEditing ? 'Save Changes' : 'Create Task'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <Input
          label="Task Title"
          placeholder="What needs to be done?"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          error={errors.title}
          autoFocus
        />
        
        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1.5">
            Description (optional)
          </label>
          <textarea
            className="input min-h-[100px] resize-y"
            placeholder="Add more details about this task..."
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          />
        </div>
        
        {/* Subject and Priority */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Subject"
            options={subjectOptions}
            placeholder="Select a subject"
            value={formData.subjectId}
            onChange={(e) => setFormData(prev => ({ ...prev, subjectId: e.target.value }))}
          />
          
          <Select
            label="Priority"
            options={priorityOptions}
            value={formData.priority}
            onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as Task['priority'] }))}
          />
        </div>
        
        {/* Due Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Due Date"
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
            error={errors.dueDate}
            icon={<Calendar className="w-4 h-4" />}
          />
          
          <Input
            label="Due Time (optional)"
            type="time"
            value={formData.dueTime}
            onChange={(e) => setFormData(prev => ({ ...prev, dueTime: e.target.value }))}
            icon={<Clock className="w-4 h-4" />}
          />
        </div>
        
        {/* Estimated Duration */}
        <div>
          <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1.5">
            Estimated Duration: {Math.floor(formData.estimatedDuration / 60)}h {formData.estimatedDuration % 60}m
          </label>
          <input
            type="range"
            min="15"
            max="480"
            step="15"
            value={formData.estimatedDuration}
            onChange={(e) => setFormData(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) }))}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-primary"
          />
          <div className="flex justify-between text-xs text-text-tertiary mt-1">
            <span>15m</span>
            <span>8h</span>
          </div>
        </div>
        
        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1.5">
            Tags
          </label>
          <div className="flex gap-2">
            <Input
              placeholder="Add a tag..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
            />
            <Button type="button" variant="secondary" onClick={handleAddTag}>
              Add
            </Button>
          </div>
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-sm"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
        
        {/* Subtasks */}
        <div>
          <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1.5">
            Subtasks
          </label>
          <div className="flex gap-2">
            <Input
              placeholder="Add a subtask..."
              value={subtaskInput}
              onChange={(e) => setSubtaskInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSubtask();
                }
              }}
            />
            <Button type="button" variant="secondary" onClick={handleAddSubtask} icon={<Plus className="w-4 h-4" />}>
              Add
            </Button>
          </div>
          {formData.subtasks.length > 0 && (
            <ul className="mt-2 space-y-2">
              {formData.subtasks.map((subtask) => (
                <li
                  key={subtask.id}
                  className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg"
                >
                  <button
                    type="button"
                    onClick={() => handleToggleSubtask(subtask.id)}
                    className={`w-4 h-4 rounded border flex items-center justify-center ${
                      subtask.completed
                        ? 'bg-success border-success text-white'
                        : 'border-border-light dark:border-border-dark'
                    }`}
                  >
                    {subtask.completed && <span className="text-xs">✓</span>}
                  </button>
                  <span className={`flex-1 text-sm ${subtask.completed ? 'line-through text-text-tertiary' : ''}`}>
                    {subtask.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(subtask.id)}
                    className="p-1 text-text-tertiary hover:text-error"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default TaskForm;
