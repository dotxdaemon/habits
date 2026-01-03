import { create } from 'zustand';
import type { GroceryList, GroceryItem, Category } from './db/schema';

interface AppState {
  // Current view
  currentListId: string | null;

  // Data
  lists: GroceryList[];
  items: GroceryItem[];
  categories: Category[];

  // UI state
  purchasedPlacement: 'bottom' | 'top';
  isLoading: boolean;

  // Actions
  setCurrentListId: (id: string | null) => void;
  setLists: (lists: GroceryList[]) => void;
  setItems: (items: GroceryItem[]) => void;
  setCategories: (categories: Category[]) => void;
  setPurchasedPlacement: (placement: 'bottom' | 'top') => void;
  setLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentListId: null,
  lists: [],
  items: [],
  categories: [],
  purchasedPlacement: 'bottom',
  isLoading: true,

  setCurrentListId: (id) => set({ currentListId: id }),
  setLists: (lists) => set({ lists }),
  setItems: (items) => set({ items }),
  setCategories: (categories) => set({ categories }),
  setPurchasedPlacement: (placement) => set({ purchasedPlacement: placement }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
