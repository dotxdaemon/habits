import { useEffect, useState } from 'react';
import { useAppStore } from '../store';
import { createList, getLists, deleteList } from '../db/queries';

export function ListsView() {
  const { lists, setLists, setCurrentListId } = useAppStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newListName, setNewListName] = useState('');

  useEffect(() => {
    loadLists();
  }, []);

  const loadLists = async () => {
    const allLists = await getLists();
    setLists(allLists);
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) return;
    await createList(newListName.trim());
    setNewListName('');
    setIsCreating(false);
    await loadLists();
  };

  const handleDeleteList = async (id: string) => {
    if (confirm('Delete this list and all its items?')) {
      await deleteList(id);
      await loadLists();
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Grocery Lists</h1>
        <p className="text-gray-600">Create and manage your shopping lists</p>
      </div>

      <button
        onClick={() => setIsCreating(true)}
        className="w-full mb-6 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
      >
        + Create New List
      </button>

      {isCreating && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow">
          <input
            type="text"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateList()}
            placeholder="List name (e.g., Costco, Weekly Shop)"
            className="w-full px-4 py-2 border rounded mb-2"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleCreateList}
              className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Create
            </button>
            <button
              onClick={() => {
                setIsCreating(false);
                setNewListName('');
              }}
              className="flex-1 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {lists.map((list) => (
          <div
            key={list.id}
            className="bg-white p-4 rounded-lg shadow hover:shadow-md transition cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div onClick={() => setCurrentListId(list.id)} className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{list.name}</h3>
                <p className="text-sm text-gray-500">
                  Updated {new Date(list.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteList(list.id);
                }}
                className="px-3 py-1 text-red-600 hover:bg-red-50 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {lists.length === 0 && !isCreating && (
          <div className="text-center py-12 text-gray-500">
            No lists yet. Create your first one!
          </div>
        )}
      </div>
    </div>
  );
}
