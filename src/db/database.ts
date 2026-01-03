import Dexie, { type EntityTable } from 'dexie';
import type { Habit, Settings } from './schema';

export class HabitDatabase extends Dexie {
  habits!: EntityTable<Habit, 'id'>;
  settings!: EntityTable<Settings & { id: string }, 'id'>;

  constructor() {
    super('HabitTrackerDB');

    this.version(1).stores({
      habits: 'id, name, type, createdAt, archived',
      settings: 'id',
    });
  }

  async initialize() {
    // Initialize default settings if they don't exist
    const existingSettings = await this.settings.count();
    if (existingSettings === 0) {
      await this.settings.add({
        id: 'default',
        theme: 'light',
        notifications: false,
      });
    }
  }
}

// Create a singleton instance
export const db = new HabitDatabase();
