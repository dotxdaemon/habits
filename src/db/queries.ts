// ABOUTME: Manages habit CRUD operations and persistence helpers.
// ABOUTME: Handles log interactions and date utilities for the tracker.
import { db } from './database';
import { v4 as uuidv4 } from './uuid';
import type { Habit, HabitLogs, LogEntry } from './schema';

const LOGS_STORAGE_KEY = 'habit-tracker-logs';

// ===== Habit Operations =====

export async function createHabit(data: {
  name: string;
  type: 'checkbox' | 'amount';
  target?: number;
  unit?: string;
}): Promise<Habit> {
  const today = getDateKey(new Date());
  const newHabit: Habit = {
    id: uuidv4(),
    archived: false,
    ...data,
    createdAt: today,
  };
  await db.habits.add(newHabit);
  return newHabit;
}

export async function getHabits(): Promise<Habit[]> {
  const habits = await db.habits.toArray();
  return habits
    .filter((habit) => habit.archived !== 1 && habit.archived !== true)
    .map((habit) =>
      habit.archived === undefined ? { ...habit, archived: false } : habit
    );
}

export async function getHabit(id: string): Promise<Habit | undefined> {
  return await db.habits.get(id);
}

export async function updateHabit(
  id: string,
  updates: Partial<Omit<Habit, 'id' | 'createdAt'>>
): Promise<void> {
  await db.habits.update(id, updates);
}

export async function deleteHabit(id: string): Promise<void> {
  await db.habits.delete(id);
  
  // Also remove from logs
  const logs = getLogs();
  for (const dateKey in logs) {
    if (logs[dateKey][id]) {
      delete logs[dateKey][id];
    }
  }
  saveLogs(logs);
}

// ===== Log Operations =====

export function getLogs(): HabitLogs {
  try {
    const stored = localStorage.getItem(LOGS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Failed to load logs:', error);
    return {};
  }
}

export function saveLogs(logs: HabitLogs): void {
  try {
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs));
  } catch (error) {
    console.error('Failed to save logs:', error);
  }
}

export function getLog(dateKey: string, habitId: string): LogEntry | undefined {
  const logs = getLogs();
  return logs[dateKey]?.[habitId];
}

export function updateLog(dateKey: string, habitId: string, entry: LogEntry): void {
  const logs = getLogs();
  if (!logs[dateKey]) {
    logs[dateKey] = {};
  }
  logs[dateKey][habitId] = {
    ...logs[dateKey][habitId],
    ...entry,
    timestamp: Date.now(),
  };
  saveLogs(logs);
}

export function toggleCheckbox(habitId: string, dateKey: string): void {
  const currentLog = getLog(dateKey, habitId);
  updateLog(dateKey, habitId, {
    done: !currentLog?.done,
  });
}

export function updateAmount(habitId: string, dateKey: string, delta: number): void {
  const currentLog = getLog(dateKey, habitId);
  const newValue = Math.max(0, (currentLog?.value || 0) + delta);
  updateLog(dateKey, habitId, {
    value: newValue,
  });
}

// ===== Export/Import Operations =====

export interface ExportData {
  habits: Habit[];
  logs: HabitLogs;
  exportedAt: string;
}

export async function exportData(): Promise<ExportData> {
  const habits = await db.habits.toArray();
  const logs = getLogs();

  return {
    habits,
    logs,
    exportedAt: new Date().toISOString(),
  };
}

export async function importData(data: ExportData, mode: 'replace' | 'merge' = 'replace'): Promise<void> {
  if (mode === 'replace') {
    await db.habits.clear();
    await db.habits.bulkAdd(data.habits);
    saveLogs(data.logs);
  } else {
    // Merge mode
    const existingHabitIds = new Set((await db.habits.toArray()).map((h) => h.id));
    const newHabits = data.habits.filter((h) => !existingHabitIds.has(h.id));
    
    if (newHabits.length > 0) {
      await db.habits.bulkAdd(newHabits);
    }

    // Merge logs
    const existingLogs = getLogs();
    const mergedLogs = { ...existingLogs };
    
    for (const dateKey in data.logs) {
      if (!mergedLogs[dateKey]) {
        mergedLogs[dateKey] = {};
      }
      for (const habitId in data.logs[dateKey]) {
        if (!mergedLogs[dateKey][habitId]) {
          mergedLogs[dateKey][habitId] = data.logs[dateKey][habitId];
        }
      }
    }
    
    saveLogs(mergedLogs);
  }
}

// ===== Helper Functions =====

export function getDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDaysAgo(n: number): string {
  const date = new Date();
  date.setDate(date.getDate() - n);
  return getDateKey(date);
}

export function getToday(): string {
  return getDateKey(new Date());
}
