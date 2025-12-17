import {
  format,
  formatDistanceToNow,
  isToday,
  isTomorrow,
  isYesterday,
  isPast,
  isSameDay,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
  addWeeks,
  addMonths,
  differenceInDays,
  parseISO,
} from 'date-fns';

/**
 * Format a date in a human-readable relative format
 */
export const formatRelativeDate = (date: Date): string => {
  const dateObj = new Date(date);
  
  if (isToday(dateObj)) {
    return 'Today';
  }
  if (isTomorrow(dateObj)) {
    return 'Tomorrow';
  }
  if (isYesterday(dateObj)) {
    return 'Yesterday';
  }
  
  const daysAway = differenceInDays(dateObj, new Date());
  
  if (daysAway > 0 && daysAway <= 7) {
    return format(dateObj, 'EEEE'); // Day name
  }
  
  if (daysAway > 7 && daysAway <= 14) {
    return `Next ${format(dateObj, 'EEEE')}`;
  }
  
  return format(dateObj, 'MMM d, yyyy');
};

/**
 * Format a date with time
 */
export const formatDateTime = (date: Date, timeFormat: '12h' | '24h' = '12h'): string => {
  const dateObj = new Date(date);
  const timePattern = timeFormat === '12h' ? 'h:mm a' : 'HH:mm';
  return format(dateObj, `MMM d, yyyy ${timePattern}`);
};

/**
 * Format time only
 */
export const formatTime = (time: string, timeFormat: '12h' | '24h' = '12h'): string => {
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes);
  const pattern = timeFormat === '12h' ? 'h:mm a' : 'HH:mm';
  return format(date, pattern);
};

/**
 * Get human readable duration from now
 */
export const formatTimeUntil = (date: Date): string => {
  const dateObj = new Date(date);
  
  if (isPast(dateObj) && !isToday(dateObj)) {
    return `${formatDistanceToNow(dateObj)} ago`;
  }
  
  return `in ${formatDistanceToNow(dateObj)}`;
};

/**
 * Format duration in minutes to human readable string
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
};

/**
 * Get date range presets
 */
export const getDateRangePresets = () => {
  const today = new Date();
  
  return {
    today: {
      start: startOfDay(today),
      end: endOfDay(today),
      label: 'Today',
    },
    tomorrow: {
      start: startOfDay(addDays(today, 1)),
      end: endOfDay(addDays(today, 1)),
      label: 'Tomorrow',
    },
    thisWeek: {
      start: startOfWeek(today),
      end: endOfWeek(today),
      label: 'This Week',
    },
    nextWeek: {
      start: startOfWeek(addWeeks(today, 1)),
      end: endOfWeek(addWeeks(today, 1)),
      label: 'Next Week',
    },
    thisMonth: {
      start: startOfMonth(today),
      end: endOfMonth(today),
      label: 'This Month',
    },
    next7Days: {
      start: startOfDay(today),
      end: endOfDay(addDays(today, 7)),
      label: 'Next 7 Days',
    },
    next30Days: {
      start: startOfDay(today),
      end: endOfDay(addDays(today, 30)),
      label: 'Next 30 Days',
    },
  };
};

/**
 * Parse natural language date input
 */
export const parseNaturalDate = (input: string): Date | null => {
  const lowered = input.toLowerCase().trim();
  const today = new Date();
  
  // Handle common phrases
  if (lowered === 'today') {
    return today;
  }
  if (lowered === 'tomorrow') {
    return addDays(today, 1);
  }
  if (lowered === 'next week') {
    return addWeeks(today, 1);
  }
  if (lowered === 'next month') {
    return addMonths(today, 1);
  }
  
  // Handle "in X days"
  const inDaysMatch = lowered.match(/^in (\d+) days?$/);
  if (inDaysMatch) {
    return addDays(today, parseInt(inDaysMatch[1], 10));
  }
  
  // Handle day names
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayIndex = dayNames.indexOf(lowered);
  if (dayIndex !== -1) {
    const currentDay = today.getDay();
    const daysUntil = (dayIndex - currentDay + 7) % 7 || 7;
    return addDays(today, daysUntil);
  }
  
  // Handle "next {day}"
  const nextDayMatch = lowered.match(/^next (\w+)$/);
  if (nextDayMatch) {
    const targetDayIndex = dayNames.indexOf(nextDayMatch[1]);
    if (targetDayIndex !== -1) {
      const currentDay = today.getDay();
      const daysUntil = (targetDayIndex - currentDay + 7) % 7 || 7;
      return addDays(today, daysUntil + 7);
    }
  }
  
  // Try parsing ISO format
  try {
    const parsed = parseISO(input);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  } catch {
    // Not a valid ISO date
  }
  
  return null;
};

/**
 * Check if a date is overdue
 */
export const isOverdue = (date: Date): boolean => {
  const dateObj = new Date(date);
  dateObj.setHours(23, 59, 59, 999);
  return isPast(dateObj) && !isToday(dateObj);
};

/**
 * Check if two dates are the same day
 */
export const areSameDay = (date1: Date, date2: Date): boolean => {
  return isSameDay(new Date(date1), new Date(date2));
};

/**
 * Get days in a month for calendar
 */
export const getDaysInMonth = (year: number, month: number, firstDayOfWeek: 0 | 1 = 0): Date[] => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  const startDate = startOfWeek(firstDay, { weekStartsOn: firstDayOfWeek });
  const endDate = endOfWeek(lastDay, { weekStartsOn: firstDayOfWeek });
  
  const days: Date[] = [];
  let current = startDate;
  
  while (current <= endDate) {
    days.push(new Date(current));
    current = addDays(current, 1);
  }
  
  return days;
};

/**
 * Format date based on user preference
 */
export const formatDateByPreference = (
  date: Date,
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD'
): string => {
  const dateObj = new Date(date);
  const formatMap = {
    'MM/DD/YYYY': 'MM/dd/yyyy',
    'DD/MM/YYYY': 'dd/MM/yyyy',
    'YYYY-MM-DD': 'yyyy-MM-dd',
  };
  return format(dateObj, formatMap[dateFormat]);
};
