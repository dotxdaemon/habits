// ABOUTME: Tests the database helpers that set up IndexedDB tables.
// ABOUTME: Ensures initialization logic stays stable under concurrent calls.
import { describe, expect, it, vi } from 'vitest';
import { ensureDefaultSettings, type SettingsTable } from './database';

describe('ensureDefaultSettings', () => {
  it('handles concurrent initialization without throwing', async () => {
    let hasRecord = false;
    const settingsTable = {
      count: vi.fn().mockResolvedValue(0),
      add: vi.fn().mockImplementation(async () => {
        if (hasRecord) {
          const error = new Error('duplicate');
          error.name = 'ConstraintError';
          throw error;
        }
        hasRecord = true;
      }),
      put: vi.fn().mockResolvedValue(undefined),
    };

    await expect(
      Promise.all([
        ensureDefaultSettings(settingsTable as SettingsTable),
        ensureDefaultSettings(settingsTable as SettingsTable),
      ])
    ).resolves.toBeDefined();

    expect(settingsTable.add).not.toHaveBeenCalled();
    expect(settingsTable.put).toHaveBeenCalledTimes(2);
  });
});
