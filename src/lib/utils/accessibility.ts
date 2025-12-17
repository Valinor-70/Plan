/**
 * Accessibility utilities for WCAG 2.1 AA compliance
 */

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Check if user prefers dark mode
 */
export function prefersDarkMode(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Check if user prefers high contrast
 */
export function prefersHighContrast(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-contrast: high)').matches;
}

/**
 * Calculate contrast ratio between two colors
 * Returns a value between 1 and 21
 * WCAG AA requires 4.5:1 for normal text, 3:1 for large text
 */
export function getContrastRatio(color1: string, color2: string): number {
  const getLuminance = (color: string): number => {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.slice(0, 2), 16) / 255;
    const g = parseInt(hex.slice(2, 4), 16) / 255;
    const b = parseInt(hex.slice(4, 6), 16) / 255;

    // Calculate relative luminance
    const [rs, gs, bs] = [r, g, b].map(val => {
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if color contrast meets WCAG AA standards
 */
export function meetsContrastRequirements(
  foreground: string,
  background: string,
  isLargeText = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Trap focus within a modal or dialog
 */
export function trapFocus(element: HTMLElement) {
  const focusableElements = element.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  };

  element.addEventListener('keydown', handleKeyDown);
  firstElement?.focus();

  return () => {
    element.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Announce message to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  if (typeof document === 'undefined') return;

  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Generate unique ID for ARIA attributes
 */
let idCounter = 0;
export function generateAriaId(prefix = 'aria'): string {
  idCounter += 1;
  return `${prefix}-${idCounter}-${Date.now()}`;
}

/**
 * Check if element is keyboard accessible
 */
export function isKeyboardAccessible(element: HTMLElement): boolean {
  const tabIndex = element.getAttribute('tabindex');
  const isInteractive = ['button', 'a', 'input', 'select', 'textarea'].includes(
    element.tagName.toLowerCase()
  );

  return isInteractive || (tabIndex !== null && tabIndex !== '-1');
}

/**
 * Get ARIA label for an element
 */
export function getAriaLabel(element: HTMLElement): string | null {
  return (
    element.getAttribute('aria-label') ||
    element.getAttribute('aria-labelledby') ||
    element.textContent ||
    null
  );
}

/**
 * Keyboard navigation helper
 */
export function handleArrowNavigation(
  event: KeyboardEvent,
  items: HTMLElement[],
  currentIndex: number,
  onSelect: (index: number) => void
) {
  const { key } = event;
  let nextIndex = currentIndex;

  switch (key) {
    case 'ArrowDown':
    case 'ArrowRight':
      event.preventDefault();
      nextIndex = (currentIndex + 1) % items.length;
      break;
    case 'ArrowUp':
    case 'ArrowLeft':
      event.preventDefault();
      nextIndex = (currentIndex - 1 + items.length) % items.length;
      break;
    case 'Home':
      event.preventDefault();
      nextIndex = 0;
      break;
    case 'End':
      event.preventDefault();
      nextIndex = items.length - 1;
      break;
    case 'Enter':
    case ' ':
      event.preventDefault();
      onSelect(currentIndex);
      return;
    default:
      return;
  }

  items[nextIndex]?.focus();
  onSelect(nextIndex);
}
