import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Notification {
  id: string;
  type: 'due_soon' | 'overdue' | 'reminder' | 'suggestion' | 'achievement';
  title: string;
  message: string;
  taskId?: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

interface NotificationSettings {
  enabled: boolean;
  dueSoonHours: number; // Hours before due date to notify
  quietHoursEnabled: boolean;
  quietHoursStart: string; // "22:00"
  quietHoursEnd: string; // "08:00"
  notifyBrowser: boolean;
  notifyInApp: boolean;
  procrastinationDetection: boolean;
}

interface NotificationState {
  notifications: Notification[];
  settings: NotificationSettings;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  getUnreadCount: () => number;
}

const defaultSettings: NotificationSettings = {
  enabled: true,
  dueSoonHours: 24,
  quietHoursEnabled: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
  notifyBrowser: true,
  notifyInApp: true,
  procrastinationDetection: true,
};

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      settings: defaultSettings,

      addNotification: (notification) => {
        const { settings } = get();
        
        // Check if in quiet hours
        if (settings.quietHoursEnabled && isQuietHours(settings)) {
          return; // Don't add notification during quiet hours
        }

        const newNotification: Notification = {
          ...notification,
          id: Date.now().toString() + Math.random().toString(36).slice(2, 9),
          timestamp: new Date(),
          read: false,
        };

        set((state) => ({
          notifications: [newNotification, ...state.notifications],
        }));

        // Send browser notification if enabled
        if (settings.notifyBrowser && typeof window !== 'undefined') {
          sendBrowserNotification(newNotification);
        }
      },

      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        }));
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        }));
      },

      deleteNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      },

      clearAll: () => {
        set({ notifications: [] });
      },

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },

      getUnreadCount: () => {
        return get().notifications.filter((n) => !n.read).length;
      },
    }),
    {
      name: 'homework-planner-notifications',
    }
  )
);

function isQuietHours(settings: NotificationSettings): boolean {
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  const { quietHoursStart, quietHoursEnd } = settings;
  
  // Handle case where quiet hours span midnight
  if (quietHoursStart > quietHoursEnd) {
    return currentTime >= quietHoursStart || currentTime < quietHoursEnd;
  }
  
  return currentTime >= quietHoursStart && currentTime < quietHoursEnd;
}

async function sendBrowserNotification(notification: Notification) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  
  if (Notification.permission === 'granted') {
    new Notification(notification.title, {
      body: notification.message,
      icon: '/favicon.svg',
      tag: notification.id,
    });
  } else if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.svg',
        tag: notification.id,
      });
    }
  }
}
