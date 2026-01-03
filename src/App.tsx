import { useEffect } from 'react';
import { db } from './db/database';
import { useAppStore } from './store';
import { getHabits, getLogs, getToday } from './db/queries';
import { formatDate } from './domain/streaks';
import { TodayView } from './pages/TodayView';
import { TrendsView } from './pages/TrendsView';

function App() {
  const { view, isLoading, setHabits, setLogs, setLoading, setView } = useAppStore();
  const today = getToday();

  useEffect(() => {
    const init = async () => {
      try {
        await db.initialize();
        const habits = await getHabits();
        const logs = getLogs();
        setHabits(habits);
        setLogs(logs);
        setLoading(false);
      } catch (error) {
        console.error('Failed to initialize database:', error);
        setLoading(false);
      }
    };

    init();
  }, [setHabits, setLogs, setLoading]);

  const refreshData = async () => {
    const habits = await getHabits();
    const logs = getLogs();
    setHabits(habits);
    setLogs(logs);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center">
        <div className="text-stone-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-900 text-stone-50">
      <div className="bg-stone-800 border-b border-stone-700 p-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-stone-400 text-sm mb-1">習慣トラッカー</p>
          <h1 className="text-3xl font-bold">Habits</h1>
          <p className="text-stone-400 text-sm mt-2">{formatDate(today)}</p>
        </div>
      </div>

      <div className="bg-stone-800 border-b border-stone-700">
        <div className="max-w-4xl mx-auto px-6 py-3">
          <div className="flex gap-2">
            <button
              onClick={() => setView('today')}
              className={'px-4 py-2 rounded-lg font-medium transition ' + (
                view === 'today'
                  ? 'bg-stone-700 text-stone-50'
                  : 'text-stone-400 hover:text-stone-300'
              )}
            >
              Today
            </button>
            <button
              onClick={() => setView('trends')}
              className={'px-4 py-2 rounded-lg font-medium transition ' + (
                view === 'trends'
                  ? 'bg-stone-700 text-stone-50'
                  : 'text-stone-400 hover:text-stone-300'
              )}
            >
              Trends
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {view === 'today' ? (
          <TodayView onRefresh={refreshData} />
        ) : (
          <TrendsView onRefresh={refreshData} />
        )}
      </div>
    </div>
  );
}

export default App;
