import { useState } from 'react';
import { usePlanningStore } from '../../lib/store/planningStore';
import { useTaskStore } from '../../lib/store/taskStore';
import { useSubjectStore } from '../../lib/store/subjectStore';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Trash2,
  RefreshCw,
  Settings,
  BarChart3,
  GripVertical,
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import type { TaskSegment } from '../../lib/store/planningStore';

// Draggable Segment Component
function DraggableSegment({
  segment,
  onRemove,
  getTaskInfo,
}: {
  segment: TaskSegment;
  onRemove: (id: string) => void;
  getTaskInfo: (taskId: string) => any;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: segment.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const task = getTaskInfo(segment.taskId);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative p-3 rounded-lg border-l-4 cursor-move hover:shadow-md transition-shadow"
      {...attributes}
      {...listeners}
      data-segment-id={segment.id}
    >
      <div
        style={{
          backgroundColor: `${segment.color}20`,
          borderLeftColor: segment.color,
        }}
        className="absolute inset-0 rounded-lg"
      />
      <div className="relative flex items-start justify-between">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate">
              {task?.title || 'Unknown Task'}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <Clock className="w-3 h-3 text-gray-500" />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {format(segment.startTime, 'h:mm a')} -{' '}
                {format(segment.endTime, 'h:mm a')}
              </span>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                ({segment.duration}min)
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(segment.id);
          }}
          className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors flex-shrink-0 ml-2"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function PlanningPageEnhanced() {
  const {
    selectedDate,
    viewMode,
    distributionStrategy,
    setSelectedDate,
    setViewMode,
    setDistributionStrategy,
    removeSegment,
    distributeTask,
    getSegmentsForDate,
    clearAllSegments,
    moveSegment,
  } = usePlanningStore();

  const { tasks } = useTaskStore();
  const { subjects } = useSubjectStore();

  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [showDistributeModal, setShowDistributeModal] = useState(false);
  const [distributeConfig, setDistributeConfig] = useState({
    taskId: '',
    hours: 2,
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
  });

  const [activeSegment, setActiveSegment] = useState<TaskSegment | null>(null);

  // Get pending tasks
  const pendingTasks = tasks.filter(
    (t) => t.status !== 'completed' && t.status !== 'archived'
  );

  // Get segments for selected date
  const todaySegments = getSegmentsForDate(selectedDate);

  // Calculate total planned time for selected date
  const totalPlannedMinutes = todaySegments.reduce((sum, seg) => sum + seg.duration, 0);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const segment = todaySegments.find((s) => s.id === event.active.id);
    setActiveSegment(segment || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = todaySegments.findIndex((s) => s.id === active.id);
      const newIndex = todaySegments.findIndex((s) => s.id === over?.id);

      // Reorder segments by updating start times
      const reordered = arrayMove(todaySegments, oldIndex, newIndex);
      
      // Update start times to reflect new order
      reordered.forEach((segment, index) => {
        const previousEndTime = index === 0 
          ? segment.startTime 
          : reordered[index - 1].endTime;
        
        const newStartTime = index === 0 
          ? segment.startTime 
          : new Date(previousEndTime);
        
        moveSegment(segment.id, newStartTime);
      });
    }

    setActiveSegment(null);
  };

  const handleDistributeTask = () => {
    const totalMinutes = distributeConfig.hours * 60;
    distributeTask(
      distributeConfig.taskId,
      totalMinutes,
      new Date(distributeConfig.startDate),
      new Date(distributeConfig.endDate)
    );
    setShowDistributeModal(false);
    setDistributeConfig({
      taskId: '',
      hours: 2,
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
    });
  };

  const getTaskInfo = (taskId: string) => {
    return tasks.find((t) => t.id === taskId);
  };

  const getSubjectName = (subjectId: string) => {
    return subjects.find((s) => s.id === subjectId)?.name || 'Unknown';
  };

  // Generate time slots for timeline (24 hours)
  const timeSlots = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Task Planning
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Break down and schedule your tasks across time with drag-and-drop
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('day')}
              className={`px-4 py-2 rounded font-medium text-sm transition-colors ${
                viewMode === 'day'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 rounded font-medium text-sm transition-colors ${
                viewMode === 'week'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Week
            </button>
          </div>

          {/* Clear All */}
          <button
            onClick={() => {
              if (confirm('Clear all planned segments?')) {
                clearAllSegments();
              }
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Task List */}
        <div className="lg:col-span-1 space-y-4">
          {/* Distribution Strategy */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Distribution Strategy
            </h3>
            
            <div className="space-y-2">
              {[
                { value: 'even', label: 'Even Distribution', desc: 'Equal time each day' },
                { value: 'frontload', label: 'Front-loaded', desc: 'More work early' },
                { value: 'balanced', label: 'Balanced', desc: 'With break intervals' },
              ].map((strategy) => (
                <label
                  key={strategy.value}
                  className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
                >
                  <input
                    type="radio"
                    name="strategy"
                    value={strategy.value}
                    checked={distributionStrategy === strategy.value}
                    onChange={(e) => setDistributionStrategy(e.target.value as any)}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white text-sm">
                      {strategy.label}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {strategy.desc}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Pending Tasks */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Pending Tasks
              </h3>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {pendingTasks.length} tasks
              </span>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {pendingTasks.length === 0 ? (
                <p className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                  No pending tasks
                </p>
              ) : (
                pendingTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-3 rounded-lg border-2 transition-colors cursor-pointer ${
                      selectedTask === task.id
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                    }`}
                    onClick={() => setSelectedTask(task.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                          {task.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                            {getSubjectName(task.subjectId)}
                          </span>
                          {task.estimatedDuration && (
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              ~{task.estimatedDuration}min
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {selectedTask && (
              <button
                onClick={() => {
                  const task = tasks.find((t) => t.id === selectedTask);
                  if (task) {
                    setDistributeConfig({
                      ...distributeConfig,
                      taskId: selectedTask,
                      hours: task.estimatedDuration ? task.estimatedDuration / 60 : 2,
                    });
                    setShowDistributeModal(true);
                  }
                }}
                className="w-full mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Distribute Selected Task
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Today's Plan
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Time</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {Math.floor(totalPlannedMinutes / 60)}h {totalPlannedMinutes % 60}m
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Sessions</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {todaySegments.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Completed</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {todaySegments.filter((s) => s.completed).length}/{todaySegments.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Timeline with Drag & Drop */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          {/* Date Navigator */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setSelectedDate(addDays(selectedDate, -1))}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <CalendarIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </h2>
            </div>

            <button
              onClick={() => setSelectedDate(addDays(selectedDate, 1))}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Drag and Drop Timeline */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="space-y-3">
              {todaySegments.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    No segments planned for this day
                  </p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                    Select a task and click "Distribute Selected Task" to get started
                  </p>
                </div>
              ) : (
                <SortableContext
                  items={todaySegments.map((s) => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {todaySegments.map((segment) => (
                    <DraggableSegment
                      key={segment.id}
                      segment={segment}
                      onRemove={removeSegment}
                      getTaskInfo={getTaskInfo}
                    />
                  ))}
                </SortableContext>
              )}
            </div>

            <DragOverlay>
              {activeSegment ? (
                <div
                  className="p-3 rounded-lg border-l-4 opacity-90 shadow-lg"
                  style={{
                    backgroundColor: `${activeSegment.color}20`,
                    borderLeftColor: activeSegment.color,
                  }}
                >
                  <div className="flex items-start gap-2">
                    <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                        {getTaskInfo(activeSegment.taskId)?.title || 'Unknown Task'}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-gray-500" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {format(activeSegment.startTime, 'h:mm a')} -{' '}
                          {format(activeSegment.endTime, 'h:mm a')}
                        </span>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          ({activeSegment.duration}min)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>

      {/* Distribution Modal */}
      {showDistributeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Distribute Task
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Estimated Hours
                </label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={distributeConfig.hours}
                  onChange={(e) =>
                    setDistributeConfig({
                      ...distributeConfig,
                      hours: parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={distributeConfig.startDate}
                  onChange={(e) =>
                    setDistributeConfig({
                      ...distributeConfig,
                      startDate: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={distributeConfig.endDate}
                  onChange={(e) =>
                    setDistributeConfig({
                      ...distributeConfig,
                      endDate: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowDistributeModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDistributeTask}
                  className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                >
                  Distribute
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
