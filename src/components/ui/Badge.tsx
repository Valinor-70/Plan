import React from 'react';

export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'outline';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  className?: string;
  dot?: boolean;
  removable?: boolean;
  onRemove?: () => void;
}

const variantClasses: Record<BadgeVariant, string> = {
  primary: 'badge-primary',
  secondary: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  success: 'badge-success',
  warning: 'badge-warning',
  error: 'badge-error',
  info: 'badge-info',
  outline: 'bg-transparent border border-current',
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-sm',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'sm',
  className = '',
  dot = false,
  removable = false,
  onRemove,
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full bg-current"
          aria-hidden="true"
        />
      )}
      {children}
      {removable && onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 -mr-1 p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          aria-label={`Remove ${children}`}
        >
          <svg
            className="w-3 h-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </span>
  );
};

// Priority Badge helper
export interface PriorityBadgeProps {
  priority: 'low' | 'medium' | 'high' | 'urgent';
  className?: string;
}

const priorityConfig = {
  urgent: { label: 'Urgent', variant: 'error' as BadgeVariant },
  high: { label: 'High', variant: 'warning' as BadgeVariant },
  medium: { label: 'Medium', variant: 'info' as BadgeVariant },
  low: { label: 'Low', variant: 'success' as BadgeVariant },
};

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className }) => {
  const config = priorityConfig[priority];
  return (
    <Badge variant={config.variant} size="sm" dot className={className}>
      {config.label}
    </Badge>
  );
};

// Status Badge helper
export interface StatusBadgeProps {
  status: 'todo' | 'in-progress' | 'completed' | 'archived';
  className?: string;
}

const statusConfig = {
  todo: { label: 'To Do', variant: 'secondary' as BadgeVariant },
  'in-progress': { label: 'In Progress', variant: 'info' as BadgeVariant },
  completed: { label: 'Completed', variant: 'success' as BadgeVariant },
  archived: { label: 'Archived', variant: 'secondary' as BadgeVariant },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const config = statusConfig[status];
  return (
    <Badge variant={config.variant} size="sm" className={className}>
      {config.label}
    </Badge>
  );
};

export default Badge;
