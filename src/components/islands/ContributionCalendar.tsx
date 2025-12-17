import { format, subDays, startOfWeek, addDays, isSameDay } from 'date-fns';
import type { Task } from '../../lib/types';
import { useTaskStore } from '../../lib/store/taskStore';
import { usePomodoroStore } from '../../lib/store/pomodoroStore';

interface DayData {
  date: Date;
  count: number;
  level: 0 | 1 | 2 | 3 | 4; // Intensity level
}

export function ContributionCalendar() {
  const { tasks } = useTaskStore();
  const { sessionHistory } = usePomodoroStore();

  // Generate data for the last 12 weeks (84 days)
  const weeks = 12;
  const totalDays = weeks * 7;
  const endDate = new Date();
  const startDate = subDays(endDate, totalDays - 1);

  // Count completed tasks per day
  const taskCounts = new Map<string, number>();
  const pomoCounts = new Map<string, number>();

  tasks
    .filter((t) => t.status === 'completed' && t.completedAt)
    .forEach((task) => {
      const dateKey = format(new Date(task.completedAt!), 'yyyy-MM-dd');
      taskCounts.set(dateKey, (taskCounts.get(dateKey) || 0) + 1);
    });

  // Count Pomodoro sessions per day
  sessionHistory
    .filter((s) => s.completed && s.type === 'work')
    .forEach((session) => {
      const dateKey = format(new Date(session.startTime), 'yyyy-MM-dd');
      pomoCounts.set(dateKey, (pomoCounts.get(dateKey) || 0) + 1);
    });

  // Generate grid data
  const gridData: DayData[][] = [];
  let currentWeek: DayData[] = [];
  
  // Find the start of the week for the first day
  let currentDate = startOfWeek(startDate, { weekStartsOn: 0 }); // Sunday

  for (let i = 0; i < totalDays + 7; i++) {
    const dateKey = format(currentDate, 'yyyy-MM-dd');
    const count = (taskCounts.get(dateKey) || 0) + (pomoCounts.get(dateKey) || 0);
    
    // Determine intensity level
    let level: 0 | 1 | 2 | 3 | 4 = 0;
    if (count > 0) level = 1;
    if (count >= 3) level = 2;
    if (count >= 6) level = 3;
    if (count >= 10) level = 4;

    currentWeek.push({
      date: new Date(currentDate),
      count,
      level,
    });

    // Start a new week
    if (currentWeek.length === 7) {
      gridData.push(currentWeek);
      currentWeek = [];
    }

    currentDate = addDays(currentDate, 1);
  }

  // Add remaining days
  if (currentWeek.length > 0) {
    gridData.push(currentWeek);
  }

  const getLevelColor = (level: number): string => {
    switch (level) {
      case 0:
        return 'bg-gray-100 dark:bg-gray-800';
      case 1:
        return 'bg-green-200 dark:bg-green-900/40';
      case 2:
        return 'bg-green-400 dark:bg-green-700/60';
      case 3:
        return 'bg-green-600 dark:bg-green-600';
      case 4:
        return 'bg-green-800 dark:bg-green-500';
      default:
        return 'bg-gray-100 dark:bg-gray-800';
    }
  };

  const getTooltipText = (day: DayData): string => {
    const dateStr = format(day.date, 'MMM d, yyyy');
    if (day.count === 0) return `${dateStr}: No activity`;
    return `${dateStr}: ${day.count} contribution${day.count > 1 ? 's' : ''}`;
  };

  const totalContributions = Array.from(taskCounts.values()).reduce((a, b) => a + b, 0) +
    Array.from(pomoCounts.values()).reduce((a, b) => a + b, 0);

  const activeDays = new Set([...taskCounts.keys(), ...pomoCounts.keys()]).size;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Contribution Activity
        </h3>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium text-gray-900 dark:text-white">
            {totalContributions}
          </span>{' '}
          contributions in the last {weeks} weeks
        </div>
      </div>

      <div className="mb-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium text-gray-900 dark:text-white">{activeDays}</span> active days
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        <div className="inline-flex gap-1">
          {/* Day labels */}
          <div className="flex flex-col justify-around text-xs text-gray-500 dark:text-gray-400 pr-2">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Weeks */}
          <div className="flex gap-1">
            {gridData.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day, dayIndex) => (
                  <div
                    key={dayIndex}
                    className={`w-3 h-3 rounded-sm ${getLevelColor(day.level)} hover:ring-2 hover:ring-indigo-500 transition-all cursor-pointer`}
                    title={getTooltipText(day)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-2 mt-4">
        <span className="text-xs text-gray-500 dark:text-gray-400">Less</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={`w-3 h-3 rounded-sm ${getLevelColor(level)}`}
            />
          ))}
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">More</span>
      </div>
    </div>
  );
}
