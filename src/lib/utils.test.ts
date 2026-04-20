import { describe, expect, it } from 'vitest';
import {
  abbreviateName,
  cn,
  formatMoneyValue,
  formatPhoneNumber,
  getRandomIntBetweenInclusive
} from './utils';

describe('cn', () => {
  it('joins and dedupes tailwind classes', () => {
    expect(cn('px-2', 'py-2', false && 'hidden')).toContain('px-2');
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });
});

describe('abbreviateName', () => {
  it('returns the uppercase initials of each word', () => {
    expect(abbreviateName('John Doe')).toBe('JD');
    expect(abbreviateName('mary jane watson')).toBe('MJW');
  });

  it('handles a single name', () => {
    expect(abbreviateName('Madonna')).toBe('M');
  });

  it('returns NA when the name is empty', () => {
    expect(abbreviateName('')).toBe('NA');
  });
});

describe('formatPhoneNumber', () => {
  it('returns falsy input untouched', () => {
    expect(formatPhoneNumber('')).toBe('');
    expect(formatPhoneNumber(undefined)).toBeUndefined();
  });

  it('returns raw digits under 4 characters', () => {
    expect(formatPhoneNumber('12')).toBe('12');
    expect(formatPhoneNumber('abc')).toBe('');
  });

  it('formats 4-6 digit strings with area code parens', () => {
    expect(formatPhoneNumber('1234')).toBe('(123) 4');
    expect(formatPhoneNumber('123456')).toBe('(123) 456');
  });

  it('formats full 10-digit US numbers', () => {
    expect(formatPhoneNumber('5551234567')).toBe('(555) 123-4567');
  });

  it('strips non-digit characters before formatting', () => {
    expect(formatPhoneNumber('(555) 123-4567')).toBe('(555) 123-4567');
    expect(formatPhoneNumber('555.123.4567')).toBe('(555) 123-4567');
  });
});

describe('formatMoneyValue', () => {
  it('formats a plain number with two fraction digits', () => {
    expect(formatMoneyValue(1234.5)).toBe('1,234.50');
  });

  it('rounds up to the next cent', () => {
    // Math.ceil(12.341 * 100) / 100 === 12.35
    expect(formatMoneyValue(12.341)).toBe('12.35');
  });

  it('handles zero', () => {
    expect(formatMoneyValue(0)).toBe('0.00');
  });

  it('passes through non-number input via toLocaleString', () => {
    // The service layer sometimes hands in a numeric string
    expect(formatMoneyValue('not-a-number')).toBe('not-a-number');
  });
});

describe('getRandomIntBetweenInclusive', () => {
  it('stays within the requested bounds', () => {
    for (let i = 0; i < 100; i++) {
      const n = getRandomIntBetweenInclusive(1, 5);
      expect(n).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThanOrEqual(5);
      expect(Number.isInteger(n)).toBe(true);
    }
  });
});
