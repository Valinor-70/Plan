/**
 * Performance utilities for optimizing app performance
 */

/**
 * Debounce function to limit the rate of function execution
 * Useful for search inputs, resize handlers, etc.
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to limit function execution to once per interval
 * Useful for scroll handlers, mouse move events, etc.
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Check if browser supports a feature
 */
export const supports = {
  webp: (() => {
    if (typeof window === 'undefined') return false;
    const elem = document.createElement('canvas');
    if (elem.getContext && elem.getContext('2d')) {
      return elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }
    return false;
  })(),
  
  webWorker: typeof Worker !== 'undefined',
  
  serviceWorker: typeof navigator !== 'undefined' && 'serviceWorker' in navigator,
  
  indexedDB: typeof window !== 'undefined' && 'indexedDB' in window,
  
  notifications: typeof window !== 'undefined' && 'Notification' in window,
};

/**
 * Lazy load images with Intersection Observer
 */
export function lazyLoadImages(selector = 'img[data-src]') {
  if (typeof window === 'undefined') return;
  
  const images = document.querySelectorAll(selector);
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.src;
          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        }
      });
    });

    images.forEach((img) => imageObserver.observe(img));
  } else {
    // Fallback for browsers without Intersection Observer
    images.forEach((img: Element) => {
      const htmlImg = img as HTMLImageElement;
      const src = htmlImg.dataset.src;
      if (src) {
        htmlImg.src = src;
        htmlImg.removeAttribute('data-src');
      }
    });
  }
}

/**
 * Measure performance of a function
 */
export async function measurePerformance<T>(
  name: string,
  fn: () => T | Promise<T>
): Promise<T> {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  console.log(`[Performance] ${name}: ${(end - start).toFixed(2)}ms`);
  return result;
}

/**
 * Get current performance metrics
 */
export function getPerformanceMetrics() {
  if (typeof window === 'undefined' || !window.performance) {
    return null;
  }

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  
  if (!navigation) return null;

  return {
    // Time to first byte
    ttfb: navigation.responseStart - navigation.requestStart,
    
    // DOM Content Loaded
    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
    
    // Load complete
    loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
    
    // DOM Interactive
    domInteractive: navigation.domInteractive - navigation.fetchStart,
    
    // Total page load time
    pageLoadTime: navigation.loadEventEnd - navigation.fetchStart,
  };
}

/**
 * Log performance metrics to console (development only)
 */
export function logPerformanceMetrics() {
  if (process.env.NODE_ENV !== 'development') return;
  
  window.addEventListener('load', () => {
    setTimeout(() => {
      const metrics = getPerformanceMetrics();
      if (metrics) {
        console.table(metrics);
      }
    }, 0);
  });
}

/**
 * Optimize bundle size by code splitting
 * Example usage with React.lazy
 */
export const LazyComponents = {
  // Example: Heavy components that should be lazy loaded
  // Chart: React.lazy(() => import('./components/Chart')),
};
