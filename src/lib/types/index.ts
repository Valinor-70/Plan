// Task Types
export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  order: number;
}

export interface RecurringPattern {
  frequency: 'daily' | 'weekly' | 'monthly';
  interval: number;
  endDate?: Date;
  daysOfWeek?: number[];
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  dueDate: Date;
  dueTime?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in-progress' | 'completed' | 'archived';
  tags: string[];
  estimatedDuration?: number;
  actualDuration?: number;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  attachments?: Attachment[];
  subtasks?: SubTask[];
  recurring?: RecurringPattern;
  reminderBefore?: number;
  customFields?: Record<string, unknown>;
}

// Subject Types
export interface ClassSchedule {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface Subject {
  id: string;
  name: string;
  color: string;
  icon?: string;
  teacher?: string;
  room?: string;
  schedule?: ClassSchedule[];
  creditHours?: number;
  semester?: string;
  archived: boolean;
  createdAt: Date;
}

// User Settings Types
export interface NotificationSettings {
  enabled: boolean;
  before: number[];
  sound: boolean;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'auto';
  accentColor: string;
  defaultView: 'list' | 'calendar' | 'kanban' | 'timeline';
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  timeFormat: '12h' | '24h';
  firstDayOfWeek: 0 | 1;
  defaultTaskDuration: number;
  defaultPriority: Task['priority'];
  notifications: NotificationSettings;
  sortBy: 'dueDate' | 'priority' | 'subject' | 'createdAt';
  groupBy: 'none' | 'subject' | 'priority' | 'status';
  showCompletedTasks: boolean;
  compactMode: boolean;
  language: string;
  firstRunComplete?: boolean;
  analyticsEnabled?: boolean;
}

// Filter Types
export interface TaskFilters {
  subjects: string[];
  priorities: Task['priority'][];
  statuses: Task['status'][];
  dateRange?: { start: Date; end: Date };
  tags: string[];
  hasSubtasks?: boolean;
  overdueOnly?: boolean;
  hasAttachments?: boolean;
  recurring?: boolean;
  searchQuery: string;
}

// UI Types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Priority config
export const PRIORITY_CONFIG = {
  urgent: { label: 'Urgent', color: 'error', order: 0 },
  high: { label: 'High', color: 'warning', order: 1 },
  medium: { label: 'Medium', color: 'info', order: 2 },
  low: { label: 'Low', color: 'success', order: 3 },
} as const;

// Status config
export const STATUS_CONFIG = {
  todo: { label: 'To Do', color: 'slate' },
  'in-progress': { label: 'In Progress', color: 'info' },
  completed: { label: 'Completed', color: 'success' },
  archived: { label: 'Archived', color: 'slate' },
} as const;

// Subject color presets
export const SUBJECT_COLORS = [
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#ec4899', // Pink
  '#3b82f6', // Blue
  '#14b8a6', // Teal
  '#f97316', // Orange
  '#84cc16', // Lime
  '#a855f7', // Purple
] as const;
