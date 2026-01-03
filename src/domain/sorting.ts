import type { GroceryItem, Category } from '../db/schema';

export interface SortOptions {
  mode: 'category' | 'manual';
  categoryOrder: string[]; // ordered category IDs
  purchasedPlacement: 'bottom' | 'top'; // where to put purchased items
}

/**
 * Sort items according to the rules:
 * - Not purchased first, purchased last (unless toggle changes)
 * - Within not purchased:
 *   1) category order (user-defined)
 *   2) then alphabetical by name
 * - Purchased items:
 *   - Sort by purchasedAt descending (most recent at bottom or top depending on toggle)
 * - Manual ordering: use position field
 */
export function sortItems(
  items: GroceryItem[],
  options: SortOptions,
  _categories: Category[]
): GroceryItem[] {
  const categoryOrderMap = new Map(options.categoryOrder.map((id, index) => [id, index]));

  const sorted = [...items].sort((a, b) => {
    // Manual mode: use position
    if (options.mode === 'manual') {
      const posA = a.position ?? Infinity;
      const posB = b.position ?? Infinity;
      if (posA !== posB) return posA - posB;
      // Fall back to name if positions are equal
      return a.name.localeCompare(b.name);
    }

    // Category mode

    // Group by purchased status
    if (a.isPurchased !== b.isPurchased) {
      if (options.purchasedPlacement === 'bottom') {
        return a.isPurchased ? 1 : -1;
      } else {
        return a.isPurchased ? -1 : 1;
      }
    }

    // Both purchased: sort by purchasedAt
    if (a.isPurchased && b.isPurchased) {
      const timeA = a.purchasedAt ?? 0;
      const timeB = b.purchasedAt ?? 0;
      // Most recent at bottom if placement is bottom, else top
      if (options.purchasedPlacement === 'bottom') {
        return timeA - timeB; // oldest first
      } else {
        return timeB - timeA; // newest first
      }
    }

    // Both not purchased: sort by category then name
    const catA = a.categoryId;
    const catB = b.categoryId;

    // Items without category go last within their purchased group
    if (!catA && catB) return 1;
    if (catA && !catB) return -1;

    if (catA && catB && catA !== catB) {
      const orderA = categoryOrderMap.get(catA) ?? Infinity;
      const orderB = categoryOrderMap.get(catB) ?? Infinity;
      return orderA - orderB;
    }

    // Same category: alphabetical by name
    return a.name.localeCompare(b.name);
  });

  return sorted;
}

/**
 * Group items by category for display
 */
export interface ItemGroup {
  categoryId: string | null;
  categoryName: string;
  items: GroceryItem[];
}

export function groupItemsByCategory(
  items: GroceryItem[],
  categories: Category[]
): ItemGroup[] {
  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const groups = new Map<string | null, GroceryItem[]>();

  for (const item of items) {
    const key = item.categoryId ?? null;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(item);
  }

  const result: ItemGroup[] = [];

  for (const [categoryId, groupItems] of groups) {
    const category = categoryId ? categoryMap.get(categoryId) : null;
    result.push({
      categoryId,
      categoryName: category?.name ?? 'Uncategorized',
      items: groupItems,
    });
  }

  return result;
}

/**
 * Infer category from item name based on common patterns
 */
export function inferCategory(
  itemName: string,
  categories: Category[],
  itemHistory?: { nameCanonical: string; defaultCategoryId?: string }[]
): string | undefined {
  const name = itemName.toLowerCase().trim();

  // Check history first
  if (itemHistory) {
    const historyMatch = itemHistory.find((h) => h.nameCanonical === name);
    if (historyMatch?.defaultCategoryId) {
      return historyMatch.defaultCategoryId;
    }
  }

  // Simple keyword-based inference
  const produce = categories.find((c) => c.name === 'Produce');
  const dairy = categories.find((c) => c.name === 'Dairy');
  const meat = categories.find((c) => c.name === 'Meat');
  const pantry = categories.find((c) => c.name === 'Pantry');
  const frozen = categories.find((c) => c.name === 'Frozen');
  const bakery = categories.find((c) => c.name === 'Bakery');
  const household = categories.find((c) => c.name === 'Household');

  // Produce
  const produceKeywords = [
    'apple', 'banana', 'orange', 'grape', 'berry', 'lettuce', 'tomato',
    'potato', 'onion', 'carrot', 'celery', 'pepper', 'broccoli', 'spinach',
    'cucumber', 'avocado', 'lemon', 'lime', 'garlic', 'ginger', 'mushroom',
  ];
  if (produceKeywords.some((k) => name.includes(k))) {
    return produce?.id;
  }

  // Dairy
  const dairyKeywords = [
    'milk', 'cheese', 'yogurt', 'butter', 'cream', 'eggs', 'egg',
  ];
  if (dairyKeywords.some((k) => name.includes(k))) {
    return dairy?.id;
  }

  // Meat
  const meatKeywords = [
    'chicken', 'beef', 'pork', 'fish', 'salmon', 'tuna', 'turkey',
    'sausage', 'bacon', 'ham', 'steak', 'lamb',
  ];
  if (meatKeywords.some((k) => name.includes(k))) {
    return meat?.id;
  }

  // Frozen
  const frozenKeywords = [
    'frozen', 'ice cream', 'popsicle', 'frozen pizza',
  ];
  if (frozenKeywords.some((k) => name.includes(k))) {
    return frozen?.id;
  }

  // Bakery
  const bakeryKeywords = [
    'bread', 'bagel', 'muffin', 'donut', 'croissant', 'roll', 'baguette',
  ];
  if (bakeryKeywords.some((k) => name.includes(k))) {
    return bakery?.id;
  }

  // Household
  const householdKeywords = [
    'soap', 'detergent', 'paper towel', 'toilet paper', 'cleaner',
    'sponge', 'trash bag', 'dish soap',
  ];
  if (householdKeywords.some((k) => name.includes(k))) {
    return household?.id;
  }

  // Pantry (catch-all for many items)
  const pantryKeywords = [
    'rice', 'pasta', 'bean', 'flour', 'sugar', 'salt', 'oil', 'sauce',
    'cereal', 'oat', 'can', 'jar', 'spice',
  ];
  if (pantryKeywords.some((k) => name.includes(k))) {
    return pantry?.id;
  }

  return undefined;
}
