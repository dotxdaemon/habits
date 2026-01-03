import { useEffect } from 'react';
import { db } from './db/database';
import { useAppStore } from './store';
import { getCategories } from './db/queries';
import { ListsView } from './pages/ListsView';
import { ListView } from './pages/ListView';

function App() {
  const { currentListId, isLoading, setCategories, setLoading } = useAppStore();

  useEffect(() => {
    const init = async () => {
      try {
        await db.initialize();
        const categories = await getCategories();
        setCategories(categories);
        setLoading(false);
      } catch (error) {
        console.error('Failed to initialize database:', error);
        setLoading(false);
      }
    };

    init();
  }, [setCategories, setLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {currentListId ? <ListView /> : <ListsView />}
    </div>
  );
}

export default App;
