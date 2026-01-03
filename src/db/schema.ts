// Database type definitions for the grocery list app

export interface GroceryList {
  id: string;
  name: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  sortMode: 'category' | 'manual';
  categoryOrder: string[]; // ordered category IDs
  storeProfileId?: string;
}

export interface GroceryItem {
  id: string;
  listId: string;
  name: string; // canonical name (trimmed, normalized)
  nameOriginal: string; // raw user input for safety
  quantity?: number;
  unit?: string; // normalized units: lb, oz, g, kg, ct, pcs, pc
  categoryId?: string;
  notes?: string;
  isPurchased: boolean;
  position?: number; // for manual ordering
  createdAt: string;
  updatedAt: string;
  purchasedAt?: number; // timestamp
}

export interface Category {
  id: string;
  name: string;
  defaultOrder: number; // default sort position
}

export interface ItemHistory {
  id: string;
  nameCanonical: string; // lowercase, trimmed
  lastUsedAt: number; // timestamp
  timesUsed: number;
  defaultCategoryId?: string;
  isFavorite: boolean;
}

export interface StoreProfile {
  id: string;
  name: string;
  aisleOrder: string[]; // ordered category IDs
  perStoreCategoryAliases?: Record<string, string>; // category ID -> custom name
}

// Default categories following common grocery store layout
export const DEFAULT_CATEGORIES: Omit<Category, 'id'>[] = [
  { name: 'Produce', defaultOrder: 0 },
  { name: 'Dairy', defaultOrder: 1 },
  { name: 'Meat', defaultOrder: 2 },
  { name: 'Pantry', defaultOrder: 3 },
  { name: 'Frozen', defaultOrder: 4 },
  { name: 'Bakery', defaultOrder: 5 },
  { name: 'Household', defaultOrder: 6 },
  { name: 'Other', defaultOrder: 7 },
];
