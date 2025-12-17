import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task, TaskFilters } from '../types';

interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  filters: TaskFilters;
}

interface TaskActions {
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;
  bulkUpdateTasks: (ids: string[], updates: Partial<Task>) => void;
  bulkDeleteTasks: (ids: string[]) => void;
  setFilters: (filters: Partial<TaskFilters>) => void;
  resetFilters: () => void;
  getTaskById: (id: string) => Task | undefined;
  getTasksBySubject: (subjectId: string) => Task[];
  getTasksByDateRange: (start: Date, end: Date) => Task[];
  getOverdueTasks: () => Task[];
  getUpcomingTasks: (days: number) => Task[];
  getTodaysTasks: () => Task[];
  getFilteredTasks: () => Task[];
}

type TaskStore = TaskState & TaskActions;

const generateId = (): string => {
  return crypto.randomUUID ? crypto.randomUUID() : 
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
};

const defaultFilters: TaskFilters = {
  subjects: [],
  priorities: [],
  statuses: [],
  tags: [],
  searchQuery: '',
  overdueOnly: false,
  hasSubtasks: undefined,
  hasAttachments: undefined,
  recurring: undefined,
};

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      loading: false,
      error: null,
      filters: defaultFilters,

      addTask: (taskData) => {
        const now = new Date();
        const newTask: Task = {
          ...taskData,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
          dueDate: new Date(taskData.dueDate),
        };
        set((state) => ({ tasks: [...state.tasks, newTask] }));
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, ...updates, updatedAt: new Date() }
              : task
          ),
        }));
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }));
      },

      completeTask: (id) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? {
                  ...task,
                  status: 'completed' as const,
                  completedAt: new Date(),
                  updatedAt: new Date(),
                }
              : task
          ),
        }));
      },

      toggleTaskStatus: (id) => {
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id !== id) return task;
            const isCompleted = task.status === 'completed';
            return {
              ...task,
              status: isCompleted ? ('todo' as const) : ('completed' as const),
              completedAt: isCompleted ? undefined : new Date(),
              updatedAt: new Date(),
            };
          }),
        }));
      },

      bulkUpdateTasks: (ids, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            ids.includes(task.id)
              ? { ...task, ...updates, updatedAt: new Date() }
              : task
          ),
        }));
      },

      bulkDeleteTasks: (ids) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => !ids.includes(task.id)),
        }));
      },

      setFilters: (newFilters) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        }));
      },

      resetFilters: () => {
        set({ filters: defaultFilters });
      },

      getTaskById: (id) => {
        return get().tasks.find((task) => task.id === id);
      },

      getTasksBySubject: (subjectId) => {
        return get().tasks.filter((task) => task.subjectId === subjectId);
      },

      getTasksByDateRange: (start, end) => {
        return get().tasks.filter((task) => {
          const dueDate = new Date(task.dueDate);
          return dueDate >= start && dueDate <= end;
        });
      },

      getOverdueTasks: () => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        return get().tasks.filter((task) => {
          if (task.status === 'completed' || task.status === 'archived') return false;
          const dueDate = new Date(task.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          return dueDate < now;
        });
      },

      getUpcomingTasks: (days) => {
        const now = new Date();
        const end = new Date();
        end.setDate(end.getDate() + days);
        return get().tasks.filter((task) => {
          if (task.status === 'completed' || task.status === 'archived') return false;
          const dueDate = new Date(task.dueDate);
          return dueDate >= now && dueDate <= end;
        });
      },

      getTodaysTasks: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return get().tasks.filter((task) => {
          const dueDate = new Date(task.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          return dueDate.getTime() === today.getTime();
        });
      },

      getFilteredTasks: () => {
        const { tasks, filters } = get();
        
        return tasks.filter((task) => {
          // Filter by search query
          if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            const matchesTitle = task.title.toLowerCase().includes(query);
            const matchesDescription = task.description?.toLowerCase().includes(query);
            const matchesTags = task.tags.some((tag) => tag.toLowerCase().includes(query));
            if (!matchesTitle && !matchesDescription && !matchesTags) return false;
          }

          // Filter by subjects
          if (filters.subjects.length > 0 && !filters.subjects.includes(task.subjectId)) {
            return false;
          }

          // Filter by priorities
          if (filters.priorities.length > 0 && !filters.priorities.includes(task.priority)) {
            return false;
          }

          // Filter by statuses
          if (filters.statuses.length > 0 && !filters.statuses.includes(task.status)) {
            return false;
          }

          // Filter by tags
          if (filters.tags.length > 0 && !filters.tags.some((tag) => task.tags.includes(tag))) {
            return false;
          }

          // Filter by date range
          if (filters.dateRange) {
            const dueDate = new Date(task.dueDate);
            if (dueDate < filters.dateRange.start || dueDate > filters.dateRange.end) {
              return false;
            }
          }

          // Filter overdue only
          if (filters.overdueOnly) {
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            const dueDate = new Date(task.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            if (dueDate >= now || task.status === 'completed' || task.status === 'archived') {
              return false;
            }
          }

          // Filter by subtasks
          if (filters.hasSubtasks === true && (!task.subtasks || task.subtasks.length === 0)) {
            return false;
          }
          if (filters.hasSubtasks === false && task.subtasks && task.subtasks.length > 0) {
            return false;
          }

          // Filter by attachments
          if (filters.hasAttachments === true && (!task.attachments || task.attachments.length === 0)) {
            return false;
          }

          // Filter by recurring
          if (filters.recurring === true && !task.recurring) {
            return false;
          }
          if (filters.recurring === false && task.recurring) {
            return false;
          }

          return true;
        });
      },
    }),
    {
      name: 'homework-planner-tasks',
      partialize: (state) => ({ tasks: state.tasks }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Convert date strings back to Date objects
          state.tasks = state.tasks.map((task) => ({
            ...task,
            dueDate: new Date(task.dueDate),
            createdAt: new Date(task.createdAt),
            updatedAt: new Date(task.updatedAt),
            completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
          }));
        }
      },
    }
  )
);
