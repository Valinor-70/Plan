import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TaskSegment {
  id: string;
  taskId: string;
  title: string;
  startTime: Date;
  endTime: Date;
  duration: number; // minutes
  color: string;
  completed: boolean;
}

export interface TimeBlock {
  id: string;
  date: Date;
  segments: TaskSegment[];
}

interface PlanningState {
  timeBlocks: TimeBlock[];
  selectedDate: Date;
  viewMode: 'day' | 'week';
  distributionStrategy: 'even' | 'frontload' | 'balanced' | 'custom';
  workingHours: { start: string; end: string };
  
  // Actions
  setSelectedDate: (date: Date) => void;
  setViewMode: (mode: 'day' | 'week') => void;
  setDistributionStrategy: (strategy: PlanningState['distributionStrategy']) => void;
  addSegment: (segment: Omit<TaskSegment, 'id'>) => void;
  updateSegment: (id: string, updates: Partial<TaskSegment>) => void;
  removeSegment: (id: string) => void;
  moveSegment: (id: string, newStartTime: Date) => void;
  distributeTask: (taskId: string, totalMinutes: number, startDate: Date, endDate: Date) => void;
  getSegmentsForDate: (date: Date) => TaskSegment[];
  getSegmentsForDateRange: (startDate: Date, endDate: Date) => TaskSegment[];
  clearAllSegments: () => void;
}

export const usePlanningStore = create<PlanningState>()(
  persist(
    (set, get) => ({
      timeBlocks: [],
      selectedDate: new Date(),
      viewMode: 'day',
      distributionStrategy: 'even',
      workingHours: { start: '09:00', end: '17:00' },

      setSelectedDate: (date) => set({ selectedDate: date }),
      
      setViewMode: (mode) => set({ viewMode: mode }),
      
      setDistributionStrategy: (strategy) => set({ distributionStrategy: strategy }),

      addSegment: (segment) => {
        const id = crypto.randomUUID();
        const newSegment: TaskSegment = { ...segment, id };
        
        set((state) => {
          const dateKey = newSegment.startTime.toDateString();
          const existingBlock = state.timeBlocks.find(
            (b) => b.date.toDateString() === dateKey
          );

          if (existingBlock) {
            return {
              timeBlocks: state.timeBlocks.map((block) =>
                block.date.toDateString() === dateKey
                  ? { ...block, segments: [...block.segments, newSegment] }
                  : block
              ),
            };
          } else {
            return {
              timeBlocks: [
                ...state.timeBlocks,
                {
                  id: crypto.randomUUID(),
                  date: new Date(newSegment.startTime),
                  segments: [newSegment],
                },
              ],
            };
          }
        });
      },

      updateSegment: (id, updates) => {
        set((state) => ({
          timeBlocks: state.timeBlocks.map((block) => ({
            ...block,
            segments: block.segments.map((seg) =>
              seg.id === id ? { ...seg, ...updates } : seg
            ),
          })),
        }));
      },

      removeSegment: (id) => {
        set((state) => ({
          timeBlocks: state.timeBlocks.map((block) => ({
            ...block,
            segments: block.segments.filter((seg) => seg.id !== id),
          })),
        }));
      },

      moveSegment: (id, newStartTime) => {
        const state = get();
        const segment = state.timeBlocks
          .flatMap((b) => b.segments)
          .find((s) => s.id === id);

        if (!segment) return;

        const duration = segment.duration;
        const newEndTime = new Date(newStartTime.getTime() + duration * 60000);

        get().updateSegment(id, {
          startTime: newStartTime,
          endTime: newEndTime,
        });
      },

      distributeTask: (taskId, totalMinutes, startDate, endDate) => {
        const state = get();
        const { distributionStrategy, workingHours } = state;
        
        // Calculate work days between start and end
        const workDays = [];
        const currentDate = new Date(startDate);
        
        while (currentDate <= endDate) {
          const day = currentDate.getDay();
          // Skip weekends (0 = Sunday, 6 = Saturday)
          if (day !== 0 && day !== 6) {
            workDays.push(new Date(currentDate));
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }

        if (workDays.length === 0) return;

        // Distribute based on strategy
        let segments: Omit<TaskSegment, 'id'>[] = [];
        const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];
        const color = colors[Math.floor(Math.random() * colors.length)];

        switch (distributionStrategy) {
          case 'even':
            // Distribute evenly across all work days
            const minutesPerDay = Math.ceil(totalMinutes / workDays.length);
            segments = workDays.map((date, index) => {
              const [startHour, startMin] = workingHours.start.split(':').map(Number);
              const start = new Date(date);
              start.setHours(startHour, startMin, 0);
              
              const duration = index === workDays.length - 1
                ? totalMinutes - (minutesPerDay * (workDays.length - 1))
                : minutesPerDay;
              
              const end = new Date(start.getTime() + duration * 60000);
              
              return {
                taskId,
                title: `Work Session ${index + 1}`,
                startTime: start,
                endTime: end,
                duration,
                color,
                completed: false,
              };
            });
            break;

          case 'frontload':
            // Put more work in earlier days
            let remainingMinutes = totalMinutes;
            segments = workDays.map((date, index) => {
              const [startHour, startMin] = workingHours.start.split(':').map(Number);
              const start = new Date(date);
              start.setHours(startHour, startMin, 0);
              
              // Frontload: first half of days get 70%, second half get 30%
              const midPoint = Math.floor(workDays.length / 2);
              let duration;
              
              if (index < midPoint) {
                duration = Math.min(
                  Math.ceil((totalMinutes * 0.7) / midPoint),
                  remainingMinutes
                );
              } else {
                duration = Math.min(
                  Math.ceil(remainingMinutes / (workDays.length - index)),
                  remainingMinutes
                );
              }
              
              remainingMinutes -= duration;
              const end = new Date(start.getTime() + duration * 60000);
              
              return {
                taskId,
                title: `Work Session ${index + 1}`,
                startTime: start,
                endTime: end,
                duration,
                color,
                completed: false,
              };
            }).filter((s) => s.duration > 0);
            break;

          case 'balanced':
            // Balance with breaks between sessions
            const sessionsCount = Math.min(workDays.length, Math.ceil(totalMinutes / 120));
            const minutesPerSession = Math.ceil(totalMinutes / sessionsCount);
            
            segments = workDays.slice(0, sessionsCount).map((date, index) => {
              const [startHour, startMin] = workingHours.start.split(':').map(Number);
              const start = new Date(date);
              start.setHours(startHour, startMin + (index % 2) * 30, 0); // Alternate start times
              
              const duration = index === sessionsCount - 1
                ? totalMinutes - (minutesPerSession * (sessionsCount - 1))
                : minutesPerSession;
              
              const end = new Date(start.getTime() + duration * 60000);
              
              return {
                taskId,
                title: `Work Session ${index + 1}`,
                startTime: start,
                endTime: end,
                duration,
                color,
                completed: false,
              };
            });
            break;
        }

        // Add all segments
        segments.forEach((seg) => get().addSegment(seg));
      },

      getSegmentsForDate: (date) => {
        const dateKey = date.toDateString();
        const block = get().timeBlocks.find(
          (b) => b.date.toDateString() === dateKey
        );
        return block?.segments || [];
      },

      getSegmentsForDateRange: (startDate, endDate) => {
        return get()
          .timeBlocks.filter((block) => {
            const blockDate = new Date(block.date);
            return blockDate >= startDate && blockDate <= endDate;
          })
          .flatMap((block) => block.segments)
          .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
      },

      clearAllSegments: () => set({ timeBlocks: [] }),
    }),
    {
      name: 'homework-planner-planning',
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Convert date strings back to Date objects
          state.selectedDate = new Date(state.selectedDate);
          state.timeBlocks = state.timeBlocks.map((block) => ({
            ...block,
            date: new Date(block.date),
            segments: block.segments.map((seg) => ({
              ...seg,
              startTime: new Date(seg.startTime),
              endTime: new Date(seg.endTime),
            })),
          }));
        }
      },
    }
  )
);
