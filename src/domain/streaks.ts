// ABOUTME: Computes streaks, completion rates, and summaries for habit history.
// ABOUTME: Provides date formatting helpers for trend and timeline displays.
/**
 * Streak calculation logic for habit tracking
 */

import type { Habit, HabitLogs, LogEntry } from '../db/schema';
import { getDateKey, getDaysAgo } from '../db/queries';

/**
 * Calculate current streak for a habit
 * Rules:
 * - Count backwards from today
 * - If today is NOT complete, start counting from yesterday
 * - Stop when hit first incomplete day
 * - Max streak to check: 365 days
 */
export function calculateStreak(habit: Habit, logs: HabitLogs): number {
  let streak = 0;
  const checkDate = new Date();

  const isComplete = (log: LogEntry | undefined): boolean => {
    if (!log) return false;
    if (habit.type === 'checkbox') return log.done === true;
    return (log.value || 0) >= (habit.target || 1);
  };

  const today = getDateKey(new Date());
  const todayLog = logs[today]?.[habit.id];

  if (!isComplete(todayLog)) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (streak < 365) {
    const dateKey = getDateKey(checkDate);
    const log = logs[dateKey]?.[habit.id];

    if (isComplete(log)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Calculate completion rate for a habit over specified days
 */
export function calculateCompletionRate(habit: Habit, logs: HabitLogs, days: number = 30): number {
  const isComplete = (log: LogEntry | undefined): boolean => {
    if (!log) return false;
    if (habit.type === 'checkbox') return log.done === true;
    return (log.value || 0) >= (habit.target || 1);
  };

  let completed = 0;
  let total = 0;

  for (let i = 0; i < days; i++) {
    const dateKey = getDaysAgo(i);
    if (dateKey < habit.createdAt) break;

    total++;
    const log = logs[dateKey]?.[habit.id];
    if (isComplete(log)) {
      completed++;
    }
  }

  return total > 0 ? Math.round((completed / total) * 100) : 0;
}

/**
 * Get completion status for last N days
 */
export function getLast7Days(habit: Habit, logs: HabitLogs): Array<{
  dateKey: string;
  isComplete: boolean;
  isToday: boolean;
}> {
  const today = getDateKey(new Date());

  const isComplete = (log: LogEntry | undefined): boolean => {
    if (!log) return false;
    if (habit.type === 'checkbox') return log.done === true;
    return (log.value || 0) >= (habit.target || 1);
  };

  const result = [];
  for (let i = 6; i >= 0; i--) {
    const dateKey = getDaysAgo(i);
    const log = logs[dateKey]?.[habit.id];
    result.push({
      dateKey,
      isComplete: isComplete(log),
      isToday: dateKey === today,
    });
  }

  return result;
}

/**
 * Get the longest streak ever for a habit
 */
export function getLongestStreak(habit: Habit, logs: HabitLogs): number {
  const isComplete = (log: LogEntry | undefined): boolean => {
    if (!log) return false;
    if (habit.type === 'checkbox') return log.done === true;
    return (log.value || 0) >= (habit.target || 1);
  };

  let longestStreak = 0;
  let currentStreak = 0;

  // Check all days from creation to today
  const createdDate = new Date(habit.createdAt);
  const today = new Date();
  const daysSinceCreation = Math.floor((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

  for (let i = daysSinceCreation; i >= 0; i--) {
    const dateKey = getDaysAgo(i);
    const log = logs[dateKey]?.[habit.id];

    if (isComplete(log)) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  return longestStreak;
}

/**
 * Format date for display
 */
export function formatDate(dateKey: string): string {
  const [year, month, day] = dateKey.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Get short day name for mini calendar
 */
export function getShortDayName(dateKey: string): string {
  const [year, month, day] = dateKey.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}
