// ABOUTME: Tests habit creation flows to ensure records stay queryable after insertion.
// ABOUTME: Confirms database defaults keep habits visible in standard habit retrieval.
import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { createHabit, getHabits } from './queries';
import { db } from './database';

describe('habits queries', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
    await db.initialize();
    localStorage.clear();
  });

  it('returns habits created without an archived flag', async () => {
    await createHabit({ name: 'Read a book', type: 'checkbox' });

    const habits = await getHabits();

    expect(habits).toHaveLength(1);
    expect(habits[0]).toMatchObject({ name: 'Read a book', archived: false });
  });

  it('drops archived numeric records and normalizes archived flags to booleans', async () => {
    const createdAt = '2024-01-01';
    await db.habits.bulkAdd([
      { id: 'archived-1', name: 'Archived numeric', type: 'checkbox', createdAt, archived: 1 },
      { id: 'active-0', name: 'Active numeric', type: 'checkbox', createdAt, archived: 0 },
    ]);

    const habits = await getHabits();

    expect(habits).toHaveLength(1);
    expect(habits[0]).toMatchObject({ id: 'active-0', archived: false });
  });
});
