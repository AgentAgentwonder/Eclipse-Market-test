import { describe, it, expect } from 'vitest';
import { cn } from '../lib/utils';
import { formatNumber, generateId, debounce } from '../lib/utils';
import { validateField, validateForm } from '../lib/validation';
import { formatDate, timeAgo } from '../lib/date';

describe('V0 Utils', () => {
  describe('cn', () => {
    it('should combine class names', () => {
      expect(cn('foo', 'bar')).toBe('foo bar');
      expect(cn('foo', null && 'bar', 'baz')).toBe('foo baz');
    });
  });

  describe('formatNumber', () => {
    it('should format numbers correctly', () => {
      expect(formatNumber(1234.567)).toBe('1,234.57');
      expect(formatNumber(100, { style: 'currency' })).toBe('$100.00');
    });
  });

  describe('generateId', () => {
    it('should generate random ID', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).toHaveLength(8);
      expect(id2).toHaveLength(8);
      expect(id1).not.toBe(id2);
    });
  });

  describe('debounce', () => {
    it('should debounce function calls', done => {
      let callCount = 0;
      const debouncedFn = debounce(() => {
        callCount++;
      }, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      setTimeout(() => {
        expect(callCount).toBe(1);
        done();
      }, 150);
    });
  });
});

describe('V0 Validation', () => {
  describe('validateField', () => {
    it('should validate required fields', () => {
      const result = validateField('', { required: true });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('This field is required');
    });

    it('should validate string length', () => {
      const result = validateField('ab', { min: 3, max: 5 });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Minimum length is 3 characters');
    });
  });

  describe('validateForm', () => {
    it('should validate form with multiple fields', () => {
      const schema = {
        name: { required: true, min: 2 },
        email: { required: true, pattern: /^\S+@\S+\.\S+$/ },
      };

      const result = validateForm({ name: '', email: 'invalid' }, schema);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});

describe('V0 Date Utils', () => {
  describe('formatDate', () => {
    it('should format dates correctly', () => {
      const date = new Date('2024-01-15');
      expect(formatDate(date)).toContain('Jan');
      expect(formatDate(date)).toContain('2024');
    });
  });

  describe('timeAgo', () => {
    it('should calculate time ago correctly', () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      const result = timeAgo(oneHourAgo);
      expect(result).toContain('hour');
    });
  });
});
