import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Filter, Search, ChevronDown, ListFilter } from 'lucide-react';
import { useTaskStore } from '../../lib/store/taskStore';
import { useSubjectStore } from '../../lib/store/subjectStore';
import { useSettingsStore } from '../../lib/store/settingsStore';
import type { Task } from '../../lib/types';
import { PRIORITY_CONFIG, STATUS_CONFIG } from '../../lib/types';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { ToastProvider } from '../ui/Toast';

export interface TaskListProps {
  initialView?: 'all' | 'today' | 'upcoming' | 'overdue';
}

type SortOption = 'dueDate' | 'priority' | 'createdAt' | 'title';
type GroupOption = 'none' | 'subject' | 'priority' | 'status';

// Map settings sortBy to our local SortOption
// The settings store has 'subject' as an option but we don't support sorting by subject in the list view,
// so we fall back to 'dueDate' for that case
const mapSortOption = (settingsSortBy: string): SortOption => {
  const validOptions: SortOption[] = ['dueDate', 'priority', 'createdAt'];
  if (validOptions.includes(settingsSortBy as SortOption)) {
    return settingsSortBy as SortOption;
  }
  // Default to dueDate for unsupported options (like 'subject' or 'title')
  return 'dueDate';
};

export const TaskList: React.FC<TaskListProps> = ({ initialView = 'all' }) => {
  const { tasks, getFilteredTasks, getTodaysTasks, getUpcomingTasks, getOverdueTasks, filters, setFilters, resetFilters } = useTaskStore();
  const { subjects, getActiveSubjects } = useSubjectStore();
  const { settings } = useSettingsStore();
  
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>(mapSortOption(settings.sortBy));
  const [groupBy, setGroupBy] = useState<GroupOption>(settings.groupBy);
  const [view, setView] = useState(initialView);
  
  const activeSubjects = getActiveSubjects();
  
  // Get tasks based on view
  const viewTasks = useMemo(() => {
    switch (view) {
      case 'today':
        return getTodaysTasks();
      case 'upcoming':
        return getUpcomingTasks(7);
      case 'overdue':
        return getOverdueTasks();
      default:
        return getFilteredTasks();
    }
  }, [view, tasks, filters, getTodaysTasks, getUpcomingTasks, getOverdueTasks, getFilteredTasks]);
  
  // Apply local search filter
  const searchedTasks = useMemo(() => {
    if (!searchQuery.trim()) return viewTasks;
    
    const query = searchQuery.toLowerCase();
    return viewTasks.filter(task => 
      task.title.toLowerCase().includes(query) ||
      task.description?.toLowerCase().includes(query) ||
      task.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }, [viewTasks, searchQuery]);
  
  // Sort tasks
  const sortedTasks = useMemo(() => {
    const sorted = [...searchedTasks];
    
    switch (sortBy) {
      case 'dueDate':
        sorted.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        break;
      case 'priority':
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        sorted.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
        break;
      case 'createdAt':
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'title':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }
    
    // Show incomplete tasks first
    if (!settings.showCompletedTasks) {
      return sorted.filter(t => t.status !== 'completed');
    }
    
    return sorted.sort((a, b) => {
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;
      return 0;
    });
  }, [searchedTasks, sortBy, settings.showCompletedTasks]);
  
  // Group tasks
  const groupedTasks = useMemo(() => {
    if (groupBy === 'none') {
      return { 'All Tasks': sortedTasks };
    }
    
    const groups: Record<string, Task[]> = {};
    
    sortedTasks.forEach(task => {
      let groupKey: string;
      
      switch (groupBy) {
        case 'subject':
          const subject = subjects.find(s => s.id === task.subjectId);
          groupKey = subject?.name || 'No Subject';
          break;
        case 'priority':
          groupKey = PRIORITY_CONFIG[task.priority].label;
          break;
        case 'status':
          groupKey = STATUS_CONFIG[task.status].label;
          break;
        default:
          groupKey = 'Other';
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(task);
    });
    
    return groups;
  }, [sortedTasks, groupBy, subjects]);
  
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };
  
  const handleCloseForm = () => {
    setShowTaskForm(false);
    setEditingTask(null);
  };
  
  const togglePriorityFilter = (priority: Task['priority']) => {
    const newPriorities = filters.priorities.includes(priority)
      ? filters.priorities.filter(p => p !== priority)
      : [...filters.priorities, priority];
    setFilters({ priorities: newPriorities });
  };
  
  const toggleSubjectFilter = (subjectId: string) => {
    const newSubjects = filters.subjects.includes(subjectId)
      ? filters.subjects.filter(s => s !== subjectId)
      : [...filters.subjects, subjectId];
    setFilters({ subjects: newSubjects });
  };
  
  const hasActiveFilters = filters.priorities.length > 0 || filters.subjects.length > 0 || filters.statuses.length > 0;

  return (
    <ToastProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary-light dark:text-text-primary-dark">
              Tasks
            </h1>
            <p className="text-text-secondary mt-1">
              {sortedTasks.length} {sortedTasks.length === 1 ? 'task' : 'tasks'}
              {view !== 'all' && ` • ${view.charAt(0).toUpperCase() + view.slice(1)}`}
            </p>
          </div>
          
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setShowTaskForm(true)}
          >
            Add Task
          </Button>
        </div>
        
        {/* View Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg w-fit">
          {(['all', 'today', 'upcoming', 'overdue'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                view === v
                  ? 'bg-white dark:bg-slate-900 text-text-primary-light dark:text-text-primary-dark shadow-sm'
                  : 'text-text-secondary hover:text-text-primary-light dark:hover:text-text-primary-dark'
              }`}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
        
        {/* Search and Filters Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1">
            <Input
              type="search"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          
          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="input pr-10 appearance-none cursor-pointer"
            >
              <option value="dueDate">Sort by Due Date</option>
              <option value="priority">Sort by Priority</option>
              <option value="createdAt">Sort by Created</option>
              <option value="title">Sort by Title</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none" />
          </div>
          
          {/* Group Dropdown */}
          <div className="relative">
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as GroupOption)}
              className="input pr-10 appearance-none cursor-pointer"
            >
              <option value="none">No Grouping</option>
              <option value="subject">Group by Subject</option>
              <option value="priority">Group by Priority</option>
              <option value="status">Group by Status</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none" />
          </div>
          
          {/* Filter Toggle */}
          <Button
            variant={showFilters ? 'primary' : 'secondary'}
            icon={<Filter className="w-4 h-4" />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
            {hasActiveFilters && (
              <span className="ml-1 w-5 h-5 bg-white/20 rounded-full text-xs flex items-center justify-center">
                {filters.priorities.length + filters.subjects.length}
              </span>
            )}
          </Button>
        </div>
        
        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-text-primary-light dark:text-text-primary-dark">Filters</h3>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={resetFilters}>
                      Clear All
                    </Button>
                  )}
                </div>
                
                {/* Priority Filters */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Priority</label>
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(PRIORITY_CONFIG) as Array<keyof typeof PRIORITY_CONFIG>).map((priority) => (
                      <button
                        key={priority}
                        onClick={() => togglePriorityFilter(priority)}
                        className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                          filters.priorities.includes(priority)
                            ? 'bg-brand-primary text-white border-brand-primary'
                            : 'border-border-light dark:border-border-dark hover:border-brand-primary'
                        }`}
                      >
                        {PRIORITY_CONFIG[priority].label}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Subject Filters */}
                {activeSubjects.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">Subject</label>
                    <div className="flex flex-wrap gap-2">
                      {activeSubjects.map((subject) => (
                        <button
                          key={subject.id}
                          onClick={() => toggleSubjectFilter(subject.id)}
                          className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                            filters.subjects.includes(subject.id)
                              ? 'text-white border-transparent'
                              : 'border-border-light dark:border-border-dark'
                          }`}
                          style={{
                            backgroundColor: filters.subjects.includes(subject.id) ? subject.color : undefined,
                          }}
                        >
                          {subject.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Task List */}
        <div className="space-y-6">
          {Object.entries(groupedTasks).map(([groupName, groupTasks]) => (
            <div key={groupName}>
              {groupBy !== 'none' && (
                <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
                  {groupName} ({groupTasks.length})
                </h2>
              )}
              
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {groupTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={handleEditTask}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
          
          {/* Empty State */}
          {sortedTasks.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <ListFilter className="w-8 h-8 text-text-tertiary" />
              </div>
              <h3 className="text-lg font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                No tasks found
              </h3>
              <p className="text-text-secondary mb-4">
                {hasActiveFilters
                  ? "Try adjusting your filters or search query"
                  : "Get started by creating your first task"}
              </p>
              {!hasActiveFilters && (
                <Button
                  variant="primary"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={() => setShowTaskForm(true)}
                >
                  Create Task
                </Button>
              )}
            </motion.div>
          )}
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

export default TaskList;
