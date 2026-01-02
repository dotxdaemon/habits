// ABOUTME: Provides persistence helpers for the Habits tracker with normalization and backups.
// ABOUTME: Exposes shared encode/decode utilities to keep local data stable across releases.
(function (globalFactory) {
  const moduleExports = globalFactory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = moduleExports;
  } else if (typeof window !== 'undefined') {
    window.HabitStorage = moduleExports;
  } else {
    globalThis.HabitStorage = moduleExports;
  }
})(function () {
  const STORAGE_KEY = 'habit-tracker-data';
  const STORAGE_BACKUP_KEY = 'habit-tracker-data-backup';

  const normalizeData = (raw) => {
    const safeHabits = Array.isArray(raw?.habits) ? raw.habits.filter(Boolean) : [];
    const safeLogs =
      raw && typeof raw.logs === 'object' && !Array.isArray(raw.logs) && raw.logs !== null ? raw.logs : {};
    return { habits: safeHabits, logs: safeLogs };
  };

  const encodeDataForShare = (payload) => {
    try {
      return btoa(unescape(encodeURIComponent(JSON.stringify(normalizeData(payload)))));
    } catch (e) {
      console.error('Failed to encode data for sharing:', e);
      return '';
    }
  };

  const decodeSharedData = (token) => {
    const parsed = JSON.parse(decodeURIComponent(escape(atob(token))));
    return normalizeData(parsed);
  };

  const resolveStorage = (providedStorage) => {
    if (providedStorage) return providedStorage;
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
    return null;
  };

  const writeData = (data, providedStorage) => {
    const storage = resolveStorage(providedStorage);
    if (!storage) return null;

    const normalized = normalizeData(data);
    const serialized = JSON.stringify(normalized);
    try {
      const existing = storage.getItem(STORAGE_KEY);
      if (existing && existing !== serialized) {
        storage.setItem(STORAGE_BACKUP_KEY, existing);
      }
      storage.setItem(STORAGE_KEY, serialized);
      return normalized;
    } catch (e) {
      console.error('Failed to save data:', e);
      return null;
    }
  };

  const readData = (providedStorage) => {
    const storage = resolveStorage(providedStorage);
    if (!storage) return null;

    const parseStored = (value) => {
      if (!value) return null;
      try {
        return normalizeData(JSON.parse(value));
      } catch (e) {
        console.error('Failed to parse stored data:', e);
        return null;
      }
    };

    const primary = parseStored(storage.getItem(STORAGE_KEY));
    if (primary) return primary;

    const backup = parseStored(storage.getItem(STORAGE_BACKUP_KEY));
    if (backup) {
      try {
        storage.setItem(STORAGE_KEY, JSON.stringify(backup));
      } catch (e) {
        console.error('Failed to restore data from backup:', e);
      }
      return backup;
    }

    return null;
  };

  return {
    STORAGE_KEY,
    STORAGE_BACKUP_KEY,
    normalizeData,
    encodeDataForShare,
    decodeSharedData,
    writeData,
    readData
  };
});
