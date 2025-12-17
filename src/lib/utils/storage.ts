const STORAGE_PREFIX = 'homework-planner-';

/**
 * Get item from localStorage with type safety
 */
export const getFromStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const item = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (item === null) return defaultValue;
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error reading from localStorage: ${key}`, error);
    return defaultValue;
  }
};

/**
 * Set item in localStorage
 */
export const setToStorage = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage: ${key}`, error);
  }
};

/**
 * Remove item from localStorage
 */
export const removeFromStorage = (key: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
  } catch (error) {
    console.error(`Error removing from localStorage: ${key}`, error);
  }
};

/**
 * Clear all app data from localStorage
 */
export const clearAllStorage = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  } catch (error) {
    console.error('Error clearing localStorage', error);
  }
};

/**
 * Get storage usage stats
 */
export const getStorageStats = (): { used: number; available: number; percentage: number } => {
  if (typeof window === 'undefined') {
    return { used: 0, available: 5 * 1024 * 1024, percentage: 0 };
  }
  
  let totalSize = 0;
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        const value = localStorage.getItem(key) || '';
        totalSize += new Blob([key + value]).size;
      }
    }
  } catch (error) {
    console.error('Error calculating storage stats', error);
  }
  
  const maxSize = 5 * 1024 * 1024; // 5MB typical localStorage limit
  
  return {
    used: totalSize,
    available: maxSize - totalSize,
    percentage: (totalSize / maxSize) * 100,
  };
};

/**
 * Export all data as JSON
 */
export const exportAllData = (): string => {
  if (typeof window === 'undefined') return '{}';
  
  const data: Record<string, unknown> = {};
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        const shortKey = key.replace(STORAGE_PREFIX, '');
        const value = localStorage.getItem(key);
        if (value) {
          data[shortKey] = JSON.parse(value);
        }
      }
    }
  } catch (error) {
    console.error('Error exporting data', error);
  }
  
  return JSON.stringify(data, null, 2);
};

/**
 * Import data from JSON
 */
export const importAllData = (jsonString: string): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    const data = JSON.parse(jsonString) as Record<string, unknown>;
    
    Object.entries(data).forEach(([key, value]) => {
      localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
    });
    
    return true;
  } catch (error) {
    console.error('Error importing data', error);
    return false;
  }
};
