// ABOUTME: Handles IndexedDB persistence for habits and settings.
// ABOUTME: Configures Dexie schema and initialization helpers.
import Dexie, { type EntityTable } from 'dexie';
import type { Habit, Settings } from './schema';

export type SettingsTable = EntityTable<Settings & { id: string }, 'id'>;

export async function ensureDefaultSettings(settingsTable: SettingsTable) {
  await settingsTable.put({
    id: 'default',
    theme: 'light',
    notifications: false,
  });
}

export class HabitDatabase extends Dexie {
  habits!: EntityTable<Habit, 'id'>;
  settings!: EntityTable<Settings & { id: string }, 'id'>;

  constructor() {
    super('HabitTrackerDB');

    this.version(1).stores({
      habits: 'id, name, type, createdAt, archived',
      settings: 'id',
    });

    this.habits = this.table('habits');
    this.settings = this.table('settings');
  }

  async initialize() {
    // Initialize default settings if they don't exist
    await ensureDefaultSettings(this.settings);
  }
}

// Create a singleton instance
export const db = new HabitDatabase();
