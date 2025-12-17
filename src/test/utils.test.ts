import { describe, it, expect } from 'vitest';
import { debounce, throttle } from '../lib/utils/performance';
import { getContrastRatio, meetsContrastRequirements, prefersReducedMotion } from '../lib/utils/accessibility';

describe('Performance Utils', () => {
  describe('debounce', () => {
    it('should delay function execution', async () => {
      let callCount = 0;
      const debouncedFn = debounce(() => callCount++, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      expect(callCount).toBe(0);

      await new Promise(resolve => setTimeout(resolve, 150));
      expect(callCount).toBe(1);
    });
  });

  describe('throttle', () => {
    it('should limit function execution', async () => {
      let callCount = 0;
      const throttledFn = throttle(() => callCount++, 100);

      throttledFn();
      throttledFn();
      throttledFn();

      expect(callCount).toBe(1);

      await new Promise(resolve => setTimeout(resolve, 150));
      throttledFn();
      expect(callCount).toBe(2);
    });
  });
});

describe('Accessibility Utils', () => {
  describe('getContrastRatio', () => {
    it('should calculate contrast ratio', () => {
      // Black on white
      const ratio1 = getContrastRatio('#000000', '#FFFFFF');
      expect(ratio1).toBe(21);

      // White on white
      const ratio2 = getContrastRatio('#FFFFFF', '#FFFFFF');
      expect(ratio2).toBe(1);
    });
  });

  describe('meetsContrastRequirements', () => {
    it('should validate WCAG AA contrast for normal text', () => {
      expect(meetsContrastRequirements('#000000', '#FFFFFF', false)).toBe(true);
      expect(meetsContrastRequirements('#777777', '#FFFFFF', false)).toBe(true);
      expect(meetsContrastRequirements('#999999', '#FFFFFF', false)).toBe(false);
    });

    it('should validate WCAG AA contrast for large text', () => {
      expect(meetsContrastRequirements('#777777', '#FFFFFF', true)).toBe(true);
      expect(meetsContrastRequirements('#999999', '#FFFFFF', true)).toBe(true);
    });
  });

  describe('prefersReducedMotion', () => {
    it('should check motion preference', () => {
      const result = prefersReducedMotion();
      expect(typeof result).toBe('boolean');
    });
  });
});
