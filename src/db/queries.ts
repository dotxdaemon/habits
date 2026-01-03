import { db } from './database';
import { v4 as uuidv4 } from './uuid';
import type { GroceryList, GroceryItem, Category, ItemHistory } from './schema';

// ===== List Operations =====

export async function createList(name: string): Promise<GroceryList> {
  const categories = await db.categories.orderBy('defaultOrder').toArray();
  const newList: GroceryList = {
    id: uuidv4(),
    name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sortMode: 'category',
    categoryOrder: categories.map((c) => c.id),
  };
  await db.lists.add(newList);
  return newList;
}

export async function getLists(): Promise<GroceryList[]> {
  return await db.lists.orderBy('updatedAt').reverse().toArray();
}

export async function getList(id: string): Promise<GroceryList | undefined> {
  return await db.lists.get(id);
}

export async function updateList(
  id: string,
  updates: Partial<Omit<GroceryList, 'id' | 'createdAt'>>
): Promise<void> {
  await db.lists.update(id, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteList(id: string): Promise<void> {
  await db.transaction('rw', [db.lists, db.items], async () => {
    await db.items.where('listId').equals(id).delete();
    await db.lists.delete(id);
  });
}

// ===== Item Operations =====

export async function createItem(
  listId: string,
  data: {
    name: string;
    nameOriginal: string;
    quantity?: number;
    unit?: string;
    categoryId?: string;
    notes?: string;
  }
): Promise<GroceryItem> {
  const now = new Date().toISOString();
  const newItem: GroceryItem = {
    id: uuidv4(),
    listId,
    ...data,
    isPurchased: false,
    createdAt: now,
    updatedAt: now,
  };

  await db.items.add(newItem);

  // Update item history
  await updateItemHistory(data.name, data.categoryId);

  // Touch the list's updatedAt
  await updateList(listId, {});

  return newItem;
}

export async function getItems(listId: string): Promise<GroceryItem[]> {
  return await db.items.where('listId').equals(listId).toArray();
}

export async function updateItem(
  id: string,
  updates: Partial<Omit<GroceryItem, 'id' | 'createdAt' | 'listId'>>
): Promise<void> {
  const item = await db.items.get(id);
  if (!item) return;

  await db.items.update(id, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });

  // Touch the list's updatedAt
  await updateList(item.listId, {});
}

export async function toggleItemPurchased(id: string): Promise<void> {
  const item = await db.items.get(id);
  if (!item) return;

  const isPurchased = !item.isPurchased;
  await db.items.update(id, {
    isPurchased,
    purchasedAt: isPurchased ? Date.now() : undefined,
    updatedAt: new Date().toISOString(),
  });

  await updateList(item.listId, {});
}

export async function deleteItem(id: string): Promise<void> {
  const item = await db.items.get(id);
  if (!item) return;

  await db.items.delete(id);
  await updateList(item.listId, {});
}

export async function clearPurchased(listId: string): Promise<void> {
  await db.items.where('listId').equals(listId).and((item) => item.isPurchased).delete();
  await updateList(listId, {});
}

// ===== Category Operations =====

export async function getCategories(): Promise<Category[]> {
  return await db.categories.orderBy('defaultOrder').toArray();
}

export async function updateCategoryOrder(categoryIds: string[]): Promise<void> {
  await db.transaction('rw', [db.categories], async () => {
    for (let i = 0; i < categoryIds.length; i++) {
      await db.categories.update(categoryIds[i], { defaultOrder: i });
    }
  });
}

// ===== Item History Operations =====

async function updateItemHistory(
  nameCanonical: string,
  categoryId?: string
): Promise<void> {
  const canonical = nameCanonical.toLowerCase().trim();
  const existing = await db.itemHistory.where('nameCanonical').equals(canonical).first();

  if (existing) {
    await db.itemHistory.update(existing.id, {
      lastUsedAt: Date.now(),
      timesUsed: existing.timesUsed + 1,
      defaultCategoryId: categoryId || existing.defaultCategoryId,
    });
  } else {
    await db.itemHistory.add({
      id: uuidv4(),
      nameCanonical: canonical,
      lastUsedAt: Date.now(),
      timesUsed: 1,
      defaultCategoryId: categoryId,
      isFavorite: false,
    });
  }
}

export async function getItemHistory(): Promise<ItemHistory[]> {
  return await db.itemHistory.orderBy('lastUsedAt').reverse().toArray();
}

export async function getFavorites(): Promise<ItemHistory[]> {
  return await db.itemHistory.where('isFavorite').equals(1).toArray();
}

export async function toggleFavorite(id: string): Promise<void> {
  const item = await db.itemHistory.get(id);
  if (!item) return;

  await db.itemHistory.update(id, {
    isFavorite: !item.isFavorite,
  });
}

// ===== Export/Import Operations =====

export interface ExportData {
  lists: GroceryList[];
  items: GroceryItem[];
  categories: Category[];
  itemHistory: ItemHistory[];
  storeProfiles: any[];
  exportedAt: string;
}

export async function exportData(): Promise<ExportData> {
  const [lists, items, categories, itemHistory, storeProfiles] = await Promise.all([
    db.lists.toArray(),
    db.items.toArray(),
    db.categories.toArray(),
    db.itemHistory.toArray(),
    db.storeProfiles.toArray(),
  ]);

  return {
    lists,
    items,
    categories,
    itemHistory,
    storeProfiles,
    exportedAt: new Date().toISOString(),
  };
}

export async function importData(data: ExportData, mode: 'replace' | 'merge' = 'replace'): Promise<void> {
  if (mode === 'replace') {
    await db.transaction('rw', [db.lists, db.items, db.categories, db.itemHistory, db.storeProfiles], async () => {
      await Promise.all([
        db.lists.clear(),
        db.items.clear(),
        db.categories.clear(),
        db.itemHistory.clear(),
        db.storeProfiles.clear(),
      ]);

      await Promise.all([
        db.lists.bulkAdd(data.lists),
        db.items.bulkAdd(data.items),
        db.categories.bulkAdd(data.categories),
        db.itemHistory.bulkAdd(data.itemHistory),
        data.storeProfiles.length > 0 ? db.storeProfiles.bulkAdd(data.storeProfiles) : Promise.resolve(),
      ]);
    });
  } else {
    // Merge mode: add only new items, keep existing
    await db.transaction('rw', [db.lists, db.items, db.categories, db.itemHistory, db.storeProfiles], async () => {
      const existingListIds = new Set((await db.lists.toArray()).map((l) => l.id));
      const existingItemIds = new Set((await db.items.toArray()).map((i) => i.id));
      const existingCategoryIds = new Set((await db.categories.toArray()).map((c) => c.id));
      const existingHistoryIds = new Set((await db.itemHistory.toArray()).map((h) => h.id));

      const newLists = data.lists.filter((l) => !existingListIds.has(l.id));
      const newItems = data.items.filter((i) => !existingItemIds.has(i.id));
      const newCategories = data.categories.filter((c) => !existingCategoryIds.has(c.id));
      const newHistory = data.itemHistory.filter((h) => !existingHistoryIds.has(h.id));

      await Promise.all([
        newLists.length > 0 ? db.lists.bulkAdd(newLists) : Promise.resolve(),
        newItems.length > 0 ? db.items.bulkAdd(newItems) : Promise.resolve(),
        newCategories.length > 0 ? db.categories.bulkAdd(newCategories) : Promise.resolve(),
        newHistory.length > 0 ? db.itemHistory.bulkAdd(newHistory) : Promise.resolve(),
      ]);
    });
  }
}
