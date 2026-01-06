// ABOUTME: Holds the Zustand-powered application state for habits and UI.
// ABOUTME: Exposes actions for navigation, data updates, and loading flags.
import { create } from 'zustand';
import type { Habit, HabitLogs } from './db/schema';

interface AppState {
  view: 'today' | 'trends' | 'settings';
  habits: Habit[];
  logs: HabitLogs;
  isLoading: boolean;
  setView: (view: 'today' | 'trends' | 'settings') => void;
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
