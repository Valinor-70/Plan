import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';
import type { Task } from '../../lib/types';
import { TaskCard } from './TaskCard';

interface VirtualTaskListProps {
  tasks: Task[];
  onTaskEdit?: (task: Task) => void;
  compact?: boolean;
}

/**
 * Virtualized task list for efficient rendering of large task lists
 * Only renders visible tasks to improve performance
 */
export function VirtualTaskList({ tasks, onTaskEdit, compact = false }: VirtualTaskListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: tasks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => compact ? 80 : 120, // Estimated height of each task card
    overscan: 5, // Number of items to render outside visible area
  });

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">No tasks to display</p>
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className="h-full overflow-auto"
      style={{ contain: 'strict' }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const task = tasks[virtualRow.index];
          return (
            <div
              key={task.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <TaskCard
                task={task}
                onEdit={onTaskEdit}
                compact={compact}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
