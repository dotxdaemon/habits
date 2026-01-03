import { describe, it, expect } from 'vitest';
import { sortItems, inferCategory } from './sorting';
import type { GroceryItem, Category } from '../db/schema';

const mockCategories: Category[] = [
  { id: '1', name: 'Produce', defaultOrder: 0 },
  { id: '2', name: 'Dairy', defaultOrder: 1 },
  { id: '3', name: 'Meat', defaultOrder: 2 },
];

const createItem = (overrides: Partial<GroceryItem>): GroceryItem => ({
  id: '1',
  listId: 'list1',
  name: 'Test Item',
  nameOriginal: 'Test Item',
  isPurchased: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

describe('sortItems', () => {
  it('sorts unpurchased before purchased (bottom placement)', () => {
    const items = [
      createItem({ id: '1', name: 'A', isPurchased: true }),
      createItem({ id: '2', name: 'B', isPurchased: false }),
    ];

    const sorted = sortItems(items, {
      mode: 'category',
      categoryOrder: ['1', '2', '3'],
      purchasedPlacement: 'bottom',
    }, mockCategories);

    expect(sorted[0].id).toBe('2'); // unpurchased first
    expect(sorted[1].id).toBe('1'); // purchased last
  });

  it('sorts by category order', () => {
    const items = [
      createItem({ id: '1', name: 'Chicken', categoryId: '3', isPurchased: false }),
      createItem({ id: '2', name: 'Apple', categoryId: '1', isPurchased: false }),
      createItem({ id: '3', name: 'Milk', categoryId: '2', isPurchased: false }),
    ];

    const sorted = sortItems(items, {
      mode: 'category',
      categoryOrder: ['1', '2', '3'], // Produce, Dairy, Meat
      purchasedPlacement: 'bottom',
    }, mockCategories);

    expect(sorted[0].name).toBe('Apple'); // Produce first
    expect(sorted[1].name).toBe('Milk'); // Dairy second
    expect(sorted[2].name).toBe('Chicken'); // Meat last
  });

  it('sorts alphabetically within same category', () => {
    const items = [
      createItem({ id: '1', name: 'Carrot', categoryId: '1', isPurchased: false }),
      createItem({ id: '2', name: 'Apple', categoryId: '1', isPurchased: false }),
      createItem({ id: '3', name: 'Banana', categoryId: '1', isPurchased: false }),
    ];

    const sorted = sortItems(items, {
      mode: 'category',
      categoryOrder: ['1', '2', '3'],
      purchasedPlacement: 'bottom',
    }, mockCategories);

    expect(sorted[0].name).toBe('Apple');
    expect(sorted[1].name).toBe('Banana');
    expect(sorted[2].name).toBe('Carrot');
  });

  it('handles manual mode with positions', () => {
    const items = [
      createItem({ id: '1', name: 'C', position: 2 }),
      createItem({ id: '2', name: 'A', position: 0 }),
      createItem({ id: '3', name: 'B', position: 1 }),
    ];

    const sorted = sortItems(items, {
      mode: 'manual',
      categoryOrder: [],
      purchasedPlacement: 'bottom',
    }, mockCategories);

    expect(sorted[0].position).toBe(0);
    expect(sorted[1].position).toBe(1);
    expect(sorted[2].position).toBe(2);
  });
});

describe('inferCategory', () => {
  it('infers Produce category for fruits', () => {
    const categoryId = inferCategory('apple', mockCategories);
    expect(categoryId).toBe('1'); // Produce
  });

  it('infers Dairy category for dairy products', () => {
    const categoryId = inferCategory('milk', mockCategories);
    expect(categoryId).toBe('2'); // Dairy
  });

  it('infers Meat category for meats', () => {
    const categoryId = inferCategory('chicken', mockCategories);
    expect(categoryId).toBe('3'); // Meat
  });

  it('returns undefined for unknown items', () => {
    const categoryId = inferCategory('xyz unknown item', mockCategories);
    expect(categoryId).toBeUndefined();
  });

  it('uses history when provided', () => {
    const history = [
      { nameCanonical: 'special item', defaultCategoryId: '2', lastUsedAt: 0, timesUsed: 1, isFavorite: false, id: '1' },
    ];
    const categoryId = inferCategory('special item', mockCategories, history);
    expect(categoryId).toBe('2');
  });
});
