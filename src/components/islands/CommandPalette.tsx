import { useEffect, useState, useCallback } from 'react';
import { Command } from 'cmdk';
import { useTaskStore } from '../../lib/store/taskStore';
import { useSubjectStore } from '../../lib/store/subjectStore';
import { ROUTES } from '../../lib/config/routes';
import {
  Search,
  Plus,
  Calendar,
  BookOpen,
  Settings,
  Clock,
  BarChart2,
  Moon,
  Sun,
  CheckSquare,
  Home,
  X
} from 'lucide-react';

interface CommandAction {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  keywords?: string[];
  action: () => void;
  section: 'navigation' | 'actions' | 'tasks' | 'settings';
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { tasks, addTask } = useTaskStore();
  const { subjects } = useSubjectStore();

  // Toggle command palette with Cmd/Ctrl + K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
      // ESC to close
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const navigate = useCallback((path: string) => {
    window.location.href = path;
    setOpen(false);
  }, []);

  const toggleTheme = useCallback(() => {
    const html = document.documentElement;
    const currentTheme = html.classList.contains('dark') ? 'dark' : 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    html.classList.remove('light', 'dark');
    html.classList.add(newTheme);
    localStorage.setItem('theme', newTheme);
    setOpen(false);
  }, []);

  const createQuickTask = useCallback(() => {
    const title = prompt('Enter task title:');
    if (title && title.trim()) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      addTask({
        title: title.trim(),
        description: '',
        subjectId: subjects[0]?.id || '',
        dueDate: tomorrow,
        priority: 'medium',
        status: 'todo',
        tags: [],
      });
      
      alert('Task created successfully!');
    }
    setOpen(false);
  }, [addTask, subjects]);

  const actions: CommandAction[] = [
    // Navigation
    {
      id: 'nav-home',
      label: 'Go to Dashboard',
      description: 'View your main dashboard',
      icon: <Home className="w-4 h-4" />,
      keywords: ['dashboard', 'home', 'main'],
      action: () => navigate(ROUTES.dashboard),
      section: 'navigation'
    },
    {
      id: 'nav-calendar',
      label: 'Go to Calendar',
      description: 'View calendar and schedule',
      icon: <Calendar className="w-4 h-4" />,
      keywords: ['calendar', 'schedule', 'dates'],
      action: () => navigate(ROUTES.calendar),
      section: 'navigation'
    },
    {
      id: 'nav-subjects',
      label: 'Go to Subjects',
      description: 'Manage your subjects',
      icon: <BookOpen className="w-4 h-4" />,
      keywords: ['subjects', 'courses', 'classes'],
      action: () => navigate(ROUTES.subjects),
      section: 'navigation'
    },
    {
      id: 'nav-pomodoro',
      label: 'Go to Pomodoro Timer',
      description: 'Start a focus session',
      icon: <Clock className="w-4 h-4" />,
      keywords: ['pomodoro', 'timer', 'focus'],
      action: () => navigate(ROUTES.pomodoro),
      section: 'navigation'
    },
    {
      id: 'nav-analytics',
      label: 'Go to Analytics',
      description: 'View your productivity stats',
      icon: <BarChart2 className="w-4 h-4" />,
      keywords: ['analytics', 'stats', 'insights'],
      action: () => navigate(ROUTES.analytics),
      section: 'navigation'
    },
    {
      id: 'nav-settings',
      label: 'Go to Settings',
      description: 'Configure your preferences',
      icon: <Settings className="w-4 h-4" />,
      keywords: ['settings', 'preferences', 'config'],
      action: () => navigate(ROUTES.settings),
      section: 'navigation'
    },
    
    // Actions
    {
      id: 'action-create-task',
      label: 'Create New Task',
      description: 'Quickly add a new task',
      icon: <Plus className="w-4 h-4" />,
      keywords: ['create', 'new', 'add', 'task'],
      action: createQuickTask,
      section: 'actions'
    },
    {
      id: 'action-toggle-theme',
      label: 'Toggle Theme',
      description: 'Switch between light and dark mode',
      icon: document.documentElement.classList.contains('dark') ? 
        <Sun className="w-4 h-4" /> : 
        <Moon className="w-4 h-4" />,
      keywords: ['theme', 'dark', 'light', 'mode'],
      action: toggleTheme,
      section: 'settings'
    },
  ];

  // Add recent incomplete tasks to the command palette
  const recentTasks = tasks
    .filter(t => t.status !== 'completed' && t.status !== 'archived')
    .slice(0, 5)
    .map(task => ({
      id: `task-${task.id}`,
      label: task.title,
      description: `Due: ${new Date(task.dueDate).toLocaleDateString()}`,
      icon: <CheckSquare className="w-4 h-4" />,
      keywords: [task.title, 'task'],
      action: () => {
        navigate(`${ROUTES.tasks}?task=${task.id}`);
      },
      section: 'tasks' as const
    }));

  const allActions = [...actions, ...recentTasks];

  const filteredActions = search
    ? allActions.filter(action => {
        const searchLower = search.toLowerCase();
        return (
          action.label.toLowerCase().includes(searchLower) ||
          action.description?.toLowerCase().includes(searchLower) ||
          action.keywords?.some(k => k.toLowerCase().includes(searchLower))
        );
      })
    : allActions;

  const groupedActions = filteredActions.reduce((acc, action) => {
    if (!acc[action.section]) {
      acc[action.section] = [];
    }
    acc[action.section].push(action);
    return acc;
  }, {} as Record<string, CommandAction[]>);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-20 px-4">
      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        label="Command Palette"
        className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-2xl overflow-hidden"
      >
        <div className="flex items-center border-b border-gray-200 dark:border-gray-700 px-4">
          <Search className="w-5 h-5 text-gray-400" />
          <Command.Input
            value={search}
            onValueChange={setSearch}
            placeholder="Type a command or search..."
            className="flex-1 px-3 py-4 bg-transparent border-0 outline-none text-gray-900 dark:text-white placeholder-gray-400"
          />
          <button
            onClick={() => setOpen(false)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <Command.List className="max-h-[400px] overflow-y-auto p-2">
          <Command.Empty className="py-6 text-center text-sm text-gray-500">
            No results found.
          </Command.Empty>

          {groupedActions.navigation && groupedActions.navigation.length > 0 && (
            <Command.Group heading="Navigation" className="mb-2">
              <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                Navigation
              </div>
              {groupedActions.navigation.map((action) => (
                <Command.Item
                  key={action.id}
                  value={action.label}
                  onSelect={action.action}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors data-[selected=true]:bg-indigo-50 dark:data-[selected=true]:bg-indigo-900/20 text-gray-900 dark:text-white"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                    {action.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{action.label}</div>
                    {action.description && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {action.description}
                      </div>
                    )}
                  </div>
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {groupedActions.actions && groupedActions.actions.length > 0 && (
            <Command.Group heading="Actions" className="mb-2">
              <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                Actions
              </div>
              {groupedActions.actions.map((action) => (
                <Command.Item
                  key={action.id}
                  value={action.label}
                  onSelect={action.action}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors data-[selected=true]:bg-indigo-50 dark:data-[selected=true]:bg-indigo-900/20 text-gray-900 dark:text-white"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                    {action.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{action.label}</div>
                    {action.description && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {action.description}
                      </div>
                    )}
                  </div>
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {groupedActions.tasks && groupedActions.tasks.length > 0 && (
            <Command.Group heading="Recent Tasks" className="mb-2">
              <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                Recent Tasks
              </div>
              {groupedActions.tasks.map((action) => (
                <Command.Item
                  key={action.id}
                  value={action.label}
                  onSelect={action.action}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors data-[selected=true]:bg-indigo-50 dark:data-[selected=true]:bg-indigo-900/20 text-gray-900 dark:text-white"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                    {action.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{action.label}</div>
                    {action.description && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {action.description}
                      </div>
                    )}
                  </div>
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {groupedActions.settings && groupedActions.settings.length > 0 && (
            <Command.Group heading="Settings" className="mb-2">
              <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                Settings
              </div>
              {groupedActions.settings.map((action) => (
                <Command.Item
                  key={action.id}
                  value={action.label}
                  onSelect={action.action}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors data-[selected=true]:bg-indigo-50 dark:data-[selected=true]:bg-indigo-900/20 text-gray-900 dark:text-white"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                    {action.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{action.label}</div>
                    {action.description && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {action.description}
                      </div>
                    )}
                  </div>
                </Command.Item>
              ))}
            </Command.Group>
          )}
        </Command.List>

        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">↑↓</kbd>
            <span>Navigate</span>
          </div>
          <div className="flex items-center gap-4">
            <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">↵</kbd>
            <span>Select</span>
          </div>
          <div className="flex items-center gap-4">
            <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">ESC</kbd>
            <span>Close</span>
          </div>
        </div>
      </Command.Dialog>
    </div>
  );
}
