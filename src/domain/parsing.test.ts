import { describe, it, expect } from 'vitest';
import { parseItemInput, fuzzyMatch } from './parsing';

describe('parseItemInput', () => {
  it('parses quantity at start', () => {
    const result = parseItemInput('2 milk');
    expect(result.quantity).toBe(2);
    expect(result.name).toBe('milk');
    expect(result.nameOriginal).toBe('2 milk');
  });

  it('parses quantity at end', () => {
    const result = parseItemInput('milk 2');
    expect(result.quantity).toBe(2);
    expect(result.name).toBe('milk');
  });

  it('parses quantity with x multiplier', () => {
    const result1 = parseItemInput('2x milk');
    expect(result1.quantity).toBe(2);
    expect(result1.name).toBe('milk');

    const result2 = parseItemInput('milk x2');
    expect(result2.quantity).toBe(2);
    expect(result2.name).toBe('milk');
  });

  it('parses quantity with unit', () => {
    const result = parseItemInput('1.5 lb chicken');
    expect(result.quantity).toBe(1.5);
    expect(result.unit).toBe('lb');
    expect(result.name).toBe('chicken');
  });

  it('parses complex input', () => {
    const result = parseItemInput('3 oz cheese slices');
    expect(result.quantity).toBe(3);
    expect(result.unit).toBe('oz');
    expect(result.name).toBe('cheese slices');
  });

  it('normalizes units', () => {
    const result = parseItemInput('2 lbs beef');
    expect(result.unit).toBe('lb');
  });

  it('handles plain text without quantity', () => {
    const result = parseItemInput('apples');
    expect(result.quantity).toBeUndefined();
    expect(result.name).toBe('apples');
  });

  it('preserves original input', () => {
    const input = '2 lb chicken breast (organic)';
    const result = parseItemInput(input);
    expect(result.nameOriginal).toBe(input);
  });
});

describe('fuzzyMatch', () => {
  it('scores exact match highest', () => {
    expect(fuzzyMatch('milk', 'milk')).toBe(1.0);
  });

  it('scores starts-with high', () => {
    const score = fuzzyMatch('mil', 'milk');
    expect(score).toBeGreaterThan(0.8);
    expect(score).toBeLessThan(1.0);
  });

  it('scores contains match medium', () => {
    const score = fuzzyMatch('ilk', 'milk');
    expect(score).toBeGreaterThan(0.5);
    expect(score).toBeLessThan(0.9);
  });

  it('handles no match', () => {
    expect(fuzzyMatch('xyz', 'milk')).toBe(0);
  });

  it('is case insensitive', () => {
    expect(fuzzyMatch('MILK', 'milk')).toBe(1.0);
  });
});
