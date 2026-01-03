import Dexie, { type EntityTable } from 'dexie';
import type {
  GroceryList,
  GroceryItem,
  Category,
  ItemHistory,
  StoreProfile,
} from './schema';
import { DEFAULT_CATEGORIES } from './schema';
import { v4 as uuidv4 } from './uuid';

export class GroceryDatabase extends Dexie {
  lists!: EntityTable<GroceryList, 'id'>;
  items!: EntityTable<GroceryItem, 'id'>;
  categories!: EntityTable<Category, 'id'>;
  itemHistory!: EntityTable<ItemHistory, 'id'>;
  storeProfiles!: EntityTable<StoreProfile, 'id'>;

  constructor() {
    super('GroceryListDB');

    this.version(1).stores({
      lists: 'id, name, createdAt, updatedAt',
      items: 'id, listId, name, isPurchased, categoryId, createdAt',
      categories: 'id, name, defaultOrder',
      itemHistory: 'id, nameCanonical, lastUsedAt, isFavorite',
      storeProfiles: 'id, name',
    });
  }

  async initialize() {
    // Initialize default categories if they don't exist
    const existingCategories = await this.categories.count();
    if (existingCategories === 0) {
      const categories = DEFAULT_CATEGORIES.map((cat) => ({
        id: uuidv4(),
        ...cat,
      }));
      await this.categories.bulkAdd(categories);
    }
  }
}

// Create a singleton instance
export const db = new GroceryDatabase();
