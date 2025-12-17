import { useMemo } from 'react';
import { useTaskStore } from '../../lib/store/taskStore';
import { usePomodoroStore } from '../../lib/store/pomodoroStore';

interface HeatmapCell {
  hour: number;
  day: number;
  value: number;
  label: string;
}

export function ProductivityHeatmap() {
  const { tasks } = useTaskStore();
  const { sessionHistory } = usePomodoroStore();

  const heatmapData = useMemo(() => {
    // Initialize a 7x24 grid (days x hours)
    const grid: number[][] = Array(7)
      .fill(0)
      .map(() => Array(24).fill(0));

    // Count completed tasks by day and hour
    tasks
      .filter((t) => t.status === 'completed' && t.completedAt)
      .forEach((task) => {
        const date = new Date(task.completedAt!);
        const day = date.getDay(); // 0 = Sunday
        const hour = date.getHours();
        grid[day][hour] += 1;
      });

    // Count completed Pomodoro sessions
    sessionHistory
      .filter((s) => s.completed && s.type === 'work')
      .forEach((session) => {
        const date = new Date(session.startTime);
        const day = date.getDay();
        const hour = date.getHours();
        grid[day][hour] += 2; // Weight Pomodoro sessions higher
      });

    // Find max value for normalization
    const maxValue = Math.max(...grid.flat());

    // Convert to cells array
    const cells: HeatmapCell[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        const value = grid[day][hour];
        cells.push({
          hour,
          day,
          value,
          label: `${dayNames[day]} ${hour}:00 - ${value} activities`,
        });
      }
    }

    return { cells, maxValue };
  }, [tasks, sessionHistory]);

  const getIntensity = (value: number, maxValue: number): number => {
    if (maxValue === 0) return 0;
    const normalized = value / maxValue;
    if (normalized === 0) return 0;
    if (normalized < 0.25) return 1;
    if (normalized < 0.5) return 2;
    if (normalized < 0.75) return 3;
    return 4;
  };

  const getColor = (intensity: number): string => {
    switch (intensity) {
      case 0:
        return 'bg-gray-100 dark:bg-gray-800';
      case 1:
        return 'bg-indigo-200 dark:bg-indigo-900/40';
      case 2:
        return 'bg-indigo-400 dark:bg-indigo-700/60';
      case 3:
        return 'bg-indigo-600 dark:bg-indigo-600';
      case 4:
        return 'bg-indigo-800 dark:bg-indigo-500';
      default:
        return 'bg-gray-100 dark:bg-gray-800';
    }
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Find peak productivity time
  const peakCell = heatmapData.cells.reduce((max, cell) =>
    cell.value > max.value ? cell : max
  );

  const peakTimeLabel =
    peakCell.value > 0
      ? `${dayNames[peakCell.day]}s at ${peakCell.hour}:00`
      : 'No data yet';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Productivity Heatmap
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Your most productive time:{' '}
          <span className="font-medium text-indigo-600 dark:text-indigo-400">
            {peakTimeLabel}
          </span>
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Hour labels */}
          <div className="flex mb-2">
            <div className="w-12" /> {/* Spacer for day labels */}
            <div className="flex-1 flex justify-between text-xs text-gray-500 dark:text-gray-400 px-1">
              {[0, 6, 12, 18, 23].map((hour) => (
                <span key={hour} className="text-center" style={{ width: '4%' }}>
                  {hour}
                </span>
              ))}
            </div>
          </div>

          {/* Heatmap grid */}
          {dayNames.map((dayName, dayIndex) => (
            <div key={dayIndex} className="flex items-center mb-1">
              {/* Day label */}
              <div className="w-12 text-xs text-gray-500 dark:text-gray-400 text-right pr-2">
                {dayName}
              </div>

              {/* Hour cells */}
              <div className="flex-1 flex gap-0.5">
                {Array.from({ length: 24 }, (_, hour) => {
                  const cell = heatmapData.cells.find(
                    (c) => c.day === dayIndex && c.hour === hour
                  );
                  const intensity = cell
                    ? getIntensity(cell.value, heatmapData.maxValue)
                    : 0;

                  return (
                    <div
                      key={hour}
                      className={`h-6 flex-1 rounded-sm ${getColor(intensity)} hover:ring-2 hover:ring-indigo-500 transition-all cursor-pointer`}
                      title={cell?.label || ''}
                    />
                  );
                })}
              </div>
            </div>
          ))}

          {/* Legend */}
          <div className="flex items-center justify-end gap-2 mt-4">
            <span className="text-xs text-gray-500 dark:text-gray-400">Less active</span>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map((level) => (
                <div key={level} className={`w-3 h-3 rounded-sm ${getColor(level)}`} />
              ))}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">More active</span>
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
        <p className="text-sm text-indigo-900 dark:text-indigo-200">
          💡 <strong>Tip:</strong> Schedule your most important tasks during your peak
          productivity hours for better results.
        </p>
      </div>
    </div>
  );
}
