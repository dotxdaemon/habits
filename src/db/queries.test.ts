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
});
