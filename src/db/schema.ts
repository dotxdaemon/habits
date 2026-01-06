// ABOUTME: Defines the persistent data shapes used throughout the habit tracker.
// ABOUTME: Documents habit records, log entries, and user settings schemas.

export interface Habit {
  id: string;
  name: string;
  type: 'checkbox' | 'amount'; // checkbox = yes/no, amount = track quantity with target
  target?: number; // for amount type
  unit?: string; // for amount type (e.g., "glasses", "minutes", "pages")
  createdAt: string; // YYYY-MM-DD
  archived?: boolean | 0 | 1;
  color?: string; // future feature
}

// Logs structure: { [dateKey: YYYY-MM-DD]: { [habitId]: LogEntry } }
export interface LogEntry {
  // For checkbox habits
  done?: boolean;
  // For amount habits
  value?: number;
  timestamp?: number;
}

export type HabitLogs = Record<string, Record<string, LogEntry>>;

export interface Settings {
  theme?: 'light' | 'dark';
  notifications?: boolean;
}
