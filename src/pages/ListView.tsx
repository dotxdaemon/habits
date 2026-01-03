import { useEffect, useState } from 'react';
import { useAppStore } from '../store';
import { getList, getItems, createItem, toggleItemPurchased, deleteItem, clearPurchased, exportData, importData } from '../db/queries';
import { parseItemInput } from '../domain/parsing';
import { sortItems, groupItemsByCategory, inferCategory } from '../domain/sorting';
import type { GroceryItem } from '../db/schema';

export function ListView() {
  const {
    currentListId,
    setCurrentListId,
    items: storeItems,
    setItems,
    categories,
    purchasedPlacement,
    setPurchasedPlacement,
  } = useAppStore();

  const [list, setList] = useState<any>(null);
  const [quickAddInput, setQuickAddInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showExport, setShowExport] = useState(false);
  const [exportJson, setExportJson] = useState('');

  useEffect(() => {
    if (currentListId) {
      loadListData();
    }
  }, [currentListId]);

  const loadListData = async () => {
    if (!currentListId) return;
    const listData = await getList(currentListId);
    const itemsData = await getItems(currentListId);
    setList(listData);
    setItems(itemsData);
  };

  const handleQuickAdd = async () => {
    if (!quickAddInput.trim() || !currentListId) return;

    const parsed = parseItemInput(quickAddInput);
    const categoryId = inferCategory(parsed.name, categories);

    await createItem(currentListId, {
      name: parsed.name,
      nameOriginal: parsed.nameOriginal,
      quantity: parsed.quantity,
      unit: parsed.unit,
      categoryId,
    });

    setQuickAddInput('');
    await loadListData();
  };

  const handleTogglePurchased = async (itemId: string) => {
    await toggleItemPurchased(itemId);
    await loadListData();
  };

  const handleDeleteItem = async (itemId: string) => {
    await deleteItem(itemId);
    await loadListData();
  };

  const handleClearPurchased = async () => {
    if (!currentListId) return;
    if (confirm('Remove all purchased items from this list?')) {
      await clearPurchased(currentListId);
      await loadListData();
    }
  };

  const handleExport = async () => {
    const data = await exportData();
    const json = JSON.stringify(data, null, 2);
    setExportJson(json);
    setShowExport(true);
  };

  const handleImport = async () => {
    const input = prompt('Paste your export JSON:');
    if (!input) return;

    try {
      const data = JSON.parse(input);
      await importData(data, 'replace');
      alert('Data imported successfully!');
      await loadListData();
    } catch (error) {
      alert('Failed to import data. Please check the JSON format.');
    }
  };

  if (!list) {
    return <div className="p-4">Loading...</div>;
  }

  const filteredItems = storeItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedItems = sortItems(
    filteredItems,
    {
      mode: list.sortMode,
      categoryOrder: list.categoryOrder,
      purchasedPlacement,
    },
    categories
  );

  const grouped = groupItemsByCategory(sortedItems, categories);
  const purchasedCount = storeItems.filter((i) => i.isPurchased).length;

  return (
    <div className="max-w-2xl mx-auto pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-white shadow-sm z-10 p-4">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => setCurrentListId(null)}
            className="text-blue-600 hover:text-blue-700"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold flex-1">{list.name}</h1>
          <button
            onClick={handleExport}
            className="text-sm px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
          >
            Export
          </button>
          <button
            onClick={handleImport}
            className="text-sm px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
          >
            Import
          </button>
        </div>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search items..."
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      {/* Actions Bar */}
      <div className="px-4 py-3 bg-gray-50 flex gap-2 items-center text-sm">
        <span className="text-gray-600">{purchasedCount} purchased</span>
        {purchasedCount > 0 && (
          <button
            onClick={handleClearPurchased}
            className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Clear Purchased
          </button>
        )}
        <button
          onClick={() =>
            setPurchasedPlacement(purchasedPlacement === 'bottom' ? 'top' : 'bottom')
          }
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          Purchased: {purchasedPlacement}
        </button>
      </div>

      {/* Items */}
      <div className="p-4">
        {grouped.map((group) => (
          <div key={group.categoryId || 'uncategorized'} className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
              {group.categoryName}
            </h3>
            <div className="space-y-2">
              {group.items.map((item) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  onToggle={handleTogglePurchased}
                  onDelete={handleDeleteItem}
                />
              ))}
            </div>
          </div>
        ))}
        {sortedItems.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {searchQuery ? 'No items match your search' : 'No items yet. Add your first item below!'}
          </div>
        )}
      </div>

      {/* Quick Add - Fixed Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg">
        <div className="max-w-2xl mx-auto flex gap-2">
          <input
            type="text"
            value={quickAddInput}
            onChange={(e) => setQuickAddInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()}
            placeholder="Add item (e.g., 2 milk, 1.5 lb chicken)"
            className="flex-1 px-4 py-3 border rounded-lg text-lg"
          />
          <button
            onClick={handleQuickAdd}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
          >
            Add
          </button>
        </div>
      </div>

      {/* Export Modal */}
      {showExport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-xl font-bold mb-4">Export Data</h2>
            <textarea
              value={exportJson}
              readOnly
              className="w-full h-64 p-3 border rounded font-mono text-sm"
              onClick={(e) => e.currentTarget.select()}
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(exportJson);
                  alert('Copied to clipboard!');
                }}
                className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Copy to Clipboard
              </button>
              <button
                onClick={() => setShowExport(false)}
                className="flex-1 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ItemRow({
  item,
  onToggle,
  onDelete,
}: {
  item: GroceryItem;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div
      className={'flex items-center gap-3 p-3 rounded-lg border ' + (
        item.isPurchased ? 'bg-gray-50 opacity-60' : 'bg-white'
      )}
    >
      <button
        onClick={() => onToggle(item.id)}
        className={'w-6 h-6 rounded border-2 flex items-center justify-center ' + (
          item.isPurchased ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
        )}
      >
        {item.isPurchased && <span className="text-white text-sm">✓</span>}
      </button>
      <div className="flex-1">
        <div className={item.isPurchased ? 'line-through text-gray-500' : ''}>
          {item.quantity && <span className="font-semibold">{item.quantity} </span>}
          {item.unit && <span className="text-gray-600">{item.unit} </span>}
          <span>{item.name}</span>
        </div>
      </div>
      <button
        onClick={() => onDelete(item.id)}
        className="text-red-600 hover:text-red-700 px-2"
      >
        ×
      </button>
    </div>
  );
}
