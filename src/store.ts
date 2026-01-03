import { create } from 'zustand';
import type { Habit, HabitLogs } from './db/schema';

interface AppState {
  // Current view
  view: 'today' | 'trends';

  // Data
  habits: Habit[];
  logs: HabitLogs;
  
  // UI state
  isLoading: boolean;

  // Actions
  setView: (view: 'today' | 'trends') => void;
  setHabits: (habits: Habit[]) => void;
  setLogs: (logs: HabitLogs) => void;
  setLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  view: 'today',
  habits: [],
  logs: {},
  isLoading: true,

  setView: (view) => set({ view }),
  setHabits: (habits) => set({ habits }),
  setLogs: (logs) => set({ logs }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
