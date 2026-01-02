// ABOUTME: Validates that habit data persistence safeguards prevent accidental data loss.
// ABOUTME: Ensures primary storage writes preserve a recoverable backup for redeploys or schema changes.
const assert = require('assert');

const storage = require('../storage.js');

const createMemoryStorage = (initial = {}) => {
  const state = { ...initial };
  return {
    getItem: (key) => (key in state ? state[key] : null),
    setItem: (key, value) => {
      state[key] = String(value);
    },
    removeItem: (key) => {
      delete state[key];
    }
  };
};

const baseData = {
  habits: [{ id: 'habit-1', name: 'Read', type: 'checkbox', target: 1, unit: '' }],
  logs: { '2024-01-01': { 'habit-1': { done: true } } }
};

(() => {
  const memoryStorage = createMemoryStorage({
    [storage.STORAGE_KEY]: '{not-json}',
    [storage.STORAGE_BACKUP_KEY]: JSON.stringify(baseData)
  });

  const loggedErrors = [];
  const originalError = console.error;
  console.error = (message, ...rest) => {
    loggedErrors.push([message, ...rest].join(' '));
  };

  const restored = storage.readData(memoryStorage);
  console.error = originalError;

  assert.deepStrictEqual(
    restored,
    storage.normalizeData(baseData),
    'Should recover persisted habits from backup when primary payload is invalid.'
  );
  assert(
    loggedErrors.some((entry) => entry.includes('Failed to parse stored data')),
    'Should report the failed primary payload while restoring from backup.'
  );
})();

(() => {
  const memoryStorage = createMemoryStorage({
    [storage.STORAGE_KEY]: JSON.stringify(baseData)
  });

  storage.writeData({ habits: [], logs: {} }, memoryStorage);

  assert.strictEqual(
    memoryStorage.getItem(storage.STORAGE_BACKUP_KEY),
    JSON.stringify(storage.normalizeData(baseData)),
    'Should create a backup snapshot before overwriting stored data.'
  );
})();

console.log('Persistence safeguards passed.');
