import { useState } from 'react';
import { useNotificationStore } from '../../lib/store/notificationStore';
import { Bell, Check, Trash2, Settings, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, markAsRead, markAllAsRead, deleteNotification, clearAll, getUnreadCount } = useNotificationStore();

  const unreadCount = getUnreadCount();

  const getIcon = (type: string) => {
    switch (type) {
      case 'due_soon':
        return '📅';
      case 'overdue':
        return '⚠️';
      case 'reminder':
        return '🔔';
      case 'suggestion':
        return '💡';
      case 'achievement':
        return '🏆';
      default:
        return '📢';
    }
  };

  const getColorClass = (type: string) => {
    switch (type) {
      case 'overdue':
        return 'border-l-4 border-red-500';
      case 'due_soon':
        return 'border-l-4 border-yellow-500';
      case 'achievement':
        return 'border-l-4 border-green-500';
      case 'suggestion':
        return 'border-l-4 border-blue-500';
      default:
        return 'border-l-4 border-gray-500';
    }
  };

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 z-50">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Notifications
            </h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                  title="Mark all as read"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                  title="Clear all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer transition-colors ${
                      !notification.read ? 'bg-indigo-50 dark:bg-indigo-900/10' : ''
                    } ${getColorClass(notification.type)}`}
                    onClick={() => {
                      markAsRead(notification.id);
                      if (notification.actionUrl) {
                        window.location.href = notification.actionUrl;
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl flex-shrink-0">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                            {notification.title}
                          </h4>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-center">
            <button
              onClick={() => {
                setIsOpen(false);
                window.location.href = '/settings/index.html';
              }}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 mx-auto"
            >
              <Settings className="w-4 h-4" />
              Notification Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
