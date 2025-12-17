import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Archive, BookOpen, Users, MapPin } from 'lucide-react';
import { useSubjectStore } from '../../lib/store/subjectStore';
import { useTaskStore } from '../../lib/store/taskStore';
import type { Subject } from '../../lib/types';
import { SUBJECT_COLORS } from '../../lib/types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import { ToastProvider } from '../ui/Toast';

export interface SubjectManagerProps {
  showArchived?: boolean;
}

interface SubjectFormData {
  name: string;
  color: string;
  teacher: string;
  room: string;
}

const defaultFormData: SubjectFormData = {
  name: '',
  color: SUBJECT_COLORS[0],
  teacher: '',
  room: '',
};

export const SubjectManager: React.FC<SubjectManagerProps> = ({ showArchived = false }) => {
  const { addSubject, updateSubject, deleteSubject, archiveSubject, getActiveSubjects, getArchivedSubjects } = useSubjectStore();
  const { getTasksBySubject } = useTaskStore();
  
  const [showForm, setShowForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState<SubjectFormData>(defaultFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewArchived, setViewArchived] = useState(showArchived);
  
  const displayedSubjects = viewArchived ? getArchivedSubjects() : getActiveSubjects();

  const handleOpenForm = (subject?: Subject) => {
    if (subject) {
      setEditingSubject(subject);
      setFormData({
        name: subject.name,
        color: subject.color,
        teacher: subject.teacher || '',
        room: subject.room || '',
      });
    } else {
      setEditingSubject(null);
      setFormData(defaultFormData);
    }
    setErrors({});
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingSubject(null);
    setFormData(defaultFormData);
    setErrors({});
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Subject name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    try {
      const subjectData = {
        name: formData.name.trim(),
        color: formData.color,
        teacher: formData.teacher.trim() || undefined,
        room: formData.room.trim() || undefined,
        archived: false,
      };
      
      if (editingSubject) {
        updateSubject(editingSubject.id, subjectData);
      } else {
        addSubject(subjectData);
      }
      
      handleCloseForm();
    } catch (error) {
      console.error('Failed to save subject:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (subject: Subject) => {
    const subjectTasks = getTasksBySubject(subject.id);
    
    if (subjectTasks.length > 0) {
      if (!window.confirm(`This subject has ${subjectTasks.length} tasks. Are you sure you want to delete it?`)) {
        return;
      }
    } else if (!window.confirm('Are you sure you want to delete this subject?')) {
      return;
    }
    
    deleteSubject(subject.id);
  };

  const handleArchive = (subject: Subject) => {
    archiveSubject(subject.id);
  };

  const getTaskStats = (subjectId: string) => {
    const subjectTasks = getTasksBySubject(subjectId);
    const completed = subjectTasks.filter(t => t.status === 'completed').length;
    const total = subjectTasks.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { completed, total, percentage };
  };

  return (
    <ToastProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary-light dark:text-text-primary-dark">
              Subjects
            </h1>
            <p className="text-text-secondary mt-1">
              Manage your classes and subjects
            </p>
          </div>
          
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => handleOpenForm()}
          >
            Add Subject
          </Button>
        </div>
        
        {/* View Toggle */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg w-fit">
          <button
            onClick={() => setViewArchived(false)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              !viewArchived
                ? 'bg-white dark:bg-slate-900 text-text-primary-light dark:text-text-primary-dark shadow-sm'
                : 'text-text-secondary hover:text-text-primary-light dark:hover:text-text-primary-dark'
            }`}
          >
            Active ({getActiveSubjects().length})
          </button>
          <button
            onClick={() => setViewArchived(true)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              viewArchived
                ? 'bg-white dark:bg-slate-900 text-text-primary-light dark:text-text-primary-dark shadow-sm'
                : 'text-text-secondary hover:text-text-primary-light dark:hover:text-text-primary-dark'
            }`}
          >
            Archived ({getArchivedSubjects().length})
          </button>
        </div>
        
        {/* Subject Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {displayedSubjects.map((subject) => {
              const stats = getTaskStats(subject.id);
              
              return (
                <motion.div
                  key={subject.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group relative bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark overflow-hidden"
                >
                  {/* Color Strip */}
                  <div
                    className="h-2"
                    style={{ backgroundColor: subject.color }}
                  />
                  
                  <div className="p-4">
                    {/* Subject Name & Actions */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                          style={{ backgroundColor: subject.color }}
                        >
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-text-primary-light dark:text-text-primary-dark">
                            {subject.name}
                          </h3>
                          {subject.teacher && (
                            <p className="text-sm text-text-secondary flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {subject.teacher}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenForm(subject)}
                          className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary-light dark:hover:text-text-primary-dark hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          aria-label="Edit subject"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {!subject.archived && (
                          <button
                            onClick={() => handleArchive(subject)}
                            className="p-1.5 rounded-lg text-text-tertiary hover:text-warning hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                            aria-label="Archive subject"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(subject)}
                          className="p-1.5 rounded-lg text-text-tertiary hover:text-error hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          aria-label="Delete subject"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Room */}
                    {subject.room && (
                      <p className="text-sm text-text-tertiary flex items-center gap-1 mb-3">
                        <MapPin className="w-3 h-3" />
                        {subject.room}
                      </p>
                    )}
                    
                    {/* Stats */}
                    <div className="flex items-center justify-between pt-3 border-t border-border-light dark:border-border-dark">
                      <span className="text-sm text-text-secondary">
                        {stats.completed}/{stats.total} tasks completed
                      </span>
                      
                      {/* Progress Ring */}
                      <div className="relative w-10 h-10">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <circle
                            className="text-slate-200 dark:text-slate-700"
                            strokeWidth="3"
                            stroke="currentColor"
                            fill="transparent"
                            r="16"
                            cx="18"
                            cy="18"
                          />
                          <circle
                            className="text-success transition-all duration-500"
                            strokeWidth="3"
                            strokeDasharray={`${stats.percentage} 100`}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r="16"
                            cx="18"
                            cy="18"
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                          {stats.percentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
        
        {/* Empty State */}
        {displayedSubjects.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-text-tertiary" />
            </div>
            <h3 className="text-lg font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
              {viewArchived ? 'No archived subjects' : 'No subjects yet'}
            </h3>
            <p className="text-text-secondary mb-4">
              {viewArchived
                ? 'Archived subjects will appear here'
                : 'Create subjects to organize your tasks by class'}
            </p>
            {!viewArchived && (
              <Button
                variant="primary"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => handleOpenForm()}
              >
                Add Subject
              </Button>
            )}
          </motion.div>
        )}
        
        {/* Subject Form Modal */}
        <Modal
          open={showForm}
          onClose={handleCloseForm}
          title={editingSubject ? 'Edit Subject' : 'Create New Subject'}
          size="md"
          footer={
            <>
              <Button variant="secondary" onClick={handleCloseForm}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                loading={isSubmitting}
              >
                {editingSubject ? 'Save Changes' : 'Create Subject'}
              </Button>
            </>
          }
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Subject Name */}
            <Input
              label="Subject Name"
              placeholder="e.g., Mathematics, Biology, History"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              error={errors.name}
              autoFocus
            />
            
            {/* Color Picker */}
            <div>
              <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                Color
              </label>
              <div className="flex flex-wrap gap-2">
                {SUBJECT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                    className={`w-8 h-8 rounded-full transition-all ${
                      formData.color === color
                        ? 'ring-2 ring-offset-2 ring-brand-primary scale-110'
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                    aria-label={`Select color ${color}`}
                  />
                ))}
              </div>
            </div>
            
            {/* Teacher */}
            <Input
              label="Teacher (optional)"
              placeholder="e.g., Mr. Smith, Dr. Johnson"
              value={formData.teacher}
              onChange={(e) => setFormData(prev => ({ ...prev, teacher: e.target.value }))}
              icon={<Users className="w-4 h-4" />}
            />
            
            {/* Room */}
            <Input
              label="Room/Location (optional)"
              placeholder="e.g., Room 101, Building A"
              value={formData.room}
              onChange={(e) => setFormData(prev => ({ ...prev, room: e.target.value }))}
              icon={<MapPin className="w-4 h-4" />}
            />
          </form>
        </Modal>
      </div>
    </ToastProvider>
  );
};

export default SubjectManager;
