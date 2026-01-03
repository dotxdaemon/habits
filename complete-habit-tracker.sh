#!/bin/bash

# Create streaks test file
cat > src/domain/streaks.test.ts << 'EOF'
import { describe, it, expect } from 'vitest';
import { calculateStreak, calculateCompletionRate, getLast7Days } from './streaks';
import type { Habit, HabitLogs } from '../db/schema';
import { getDateKey, getDaysAgo } from '../db/queries';

const mockCheckboxHabit: Habit = {
  id: 'h1',
  name: 'Meditate',
  type: 'checkbox',
  createdAt: getDaysAgo(30),
};

const mockAmountHabit: Habit = {
  id: 'h2',
  name: 'Drink water',
  type: 'amount',
  target: 8,
  unit: 'glasses',
  createdAt: getDaysAgo(30),
};

describe('calculateStreak', () => {
  it('calculates streak for completed checkbox habit', () => {
    const logs: HabitLogs = {};
    for (let i = 0; i < 5; i++) {
      const dateKey = getDaysAgo(i);
      logs[dateKey] = { [mockCheckboxHabit.id]: { done: true } };
    }

    const streak = calculateStreak(mockCheckboxHabit, logs);
    expect(streak).toBe(5);
  });

  it('starts from yesterday if today is incomplete', () => {
    const logs: HabitLogs = {};
    const today = getDateKey(new Date());
    logs[today] = { [mockCheckboxHabit.id]: { done: false } };
    
    for (let i = 1; i <= 3; i++) {
      const dateKey = getDaysAgo(i);
      logs[dateKey] = { [mockCheckboxHabit.id]: { done: true } };
    }

    const streak = calculateStreak(mockCheckboxHabit, logs);
    expect(streak).toBe(3);
  });

  it('calculates streak for amount-based habit', () => {
    const logs: HabitLogs = {};
    for (let i = 0; i < 4; i++) {
      const dateKey = getDaysAgo(i);
      logs[dateKey] = { [mockAmountHabit.id]: { value: 8 } };
    }

    const streak = calculateStreak(mockAmountHabit, logs);
    expect(streak).toBe(4);
  });

  it('stops at first incomplete day', () => {
    const logs: HabitLogs = {};
    logs[getDaysAgo(0)] = { [mockCheckboxHabit.id]: { done: true } };
    logs[getDaysAgo(1)] = { [mockCheckboxHabit.id]: { done: true } };
    logs[getDaysAgo(2)] = { [mockCheckboxHabit.id]: { done: false } };
    logs[getDaysAgo(3)] = { [mockCheckboxHabit.id]: { done: true } };

    const streak = calculateStreak(mockCheckboxHabit, logs);
    expect(streak).toBe(2);
  });
});

describe('calculateCompletionRate', () => {
  it('calculates 100% completion', () => {
    const logs: HabitLogs = {};
    for (let i = 0; i < 30; i++) {
      const dateKey = getDaysAgo(i);
      logs[dateKey] = { [mockCheckboxHabit.id]: { done: true } };
    }

    const rate = calculateCompletionRate(mockCheckboxHabit, logs, 30);
    expect(rate).toBe(100);
  });

  it('calculates 50% completion', () => {
    const logs: HabitLogs = {};
    for (let i = 0; i < 10; i++) {
      const dateKey = getDaysAgo(i * 2);
      logs[dateKey] = { [mockCheckboxHabit.id]: { done: true } };
    }

    const rate = calculateCompletionRate(mockCheckboxHabit, logs, 20);
    expect(rate).toBe(50);
  });

  it('returns 0 for no completions', () => {
    const logs: HabitLogs = {};
    const rate = calculateCompletionRate(mockCheckboxHabit, logs, 30);
    expect(rate).toBe(0);
  });
});

describe('getLast7Days', () => {
  it('returns 7 days of data', () => {
    const logs: HabitLogs = {};
    const result = getLast7Days(mockCheckboxHabit, logs);
    expect(result).toHaveLength(7);
  });

  it('marks today correctly', () => {
    const logs: HabitLogs = {};
    const result = getLast7Days(mockCheckboxHabit, logs);
    const todayEntry = result.find((d) => d.isToday);
    expect(todayEntry).toBeDefined();
  });
});
EOF

echo "Created streaks.test.ts"
