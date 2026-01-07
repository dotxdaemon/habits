// ABOUTME: Orchestrates application layout and navigation between views.
// ABOUTME: Loads data, manages active tab, and renders page components.
import { useEffect, useMemo } from 'react';
import { db } from './db/database';
import { useAppStore } from './store';
import { getHabits, getLogs, getToday } from './db/queries';
import { formatDate } from './domain/streaks';
import { TodayView } from './pages/TodayView';
import { TrendsView } from './pages/TrendsView';
import { SettingsView } from './pages/SettingsView';
import { ProgressRing } from './components/ProgressRing';
import { Card } from './components/Card';
import { applyScanlines, applyTheme, getStoredScanlines, getStoredTheme } from './theme/theme';

function App() {
  const { view, habits, logs, isLoading, setHabits, setLogs, setLoading, setView } = useAppStore();
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

  useEffect(() => {
    applyTheme(getStoredTheme());
    applyScanlines(getStoredScanlines());
  }, []);

  const refreshData = async () => {
    const habits = await getHabits();
    const logs = getLogs();
    setHabits(habits);
    setLogs(logs);
  };

  const { doneCount, totalCount } = useMemo(() => {
    const todayLogs = logs[today] as Record<string, any> | undefined;
    const total = habits.length;
    const done = habits.reduce((count, habit) => {
      const log = todayLogs?.[habit.id];
      if (habit.type === 'checkbox') {
        return log?.done ? count + 1 : count;
      }
      const target = habit.target || 1;
      return (log?.value || 0) >= target ? count + 1 : count;
    }, 0);
    return { doneCount: done, totalCount: total };
  }, [habits, logs, today]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-300">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-md mx-auto px-4 pt-8 pb-4">
        <Card className="p-4 header-card">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-label">習慣トラッカー</p>
              <h1 className="text-title">Habits</h1>
              <p className="text-sm text-muted mt-1">{formatDate(today)}</p>
            </div>
            <ProgressRing value={doneCount} max={Math.max(totalCount, 1)} size={92} strokeWidth={8} />
          </div>
        </Card>
      </div>

      <main className="max-w-md mx-auto px-4 pb-24 space-y-6">
        {view === 'today' && <TodayView onRefresh={refreshData} />}
        {view === 'trends' && <TrendsView onRefresh={refreshData} />}
        {view === 'settings' && <SettingsView onRefresh={refreshData} />}
      </main>

      <div className="fixed bottom-0 inset-x-0">
        <div className="max-w-md mx-auto px-4 pb-[env(safe-area-inset-bottom)]">
          <Card className="mb-4 nav-bar">
            <div className="grid grid-cols-3">
              {[
                { key: 'today', label: 'Today' },
                { key: 'trends', label: 'Trends' },
                { key: 'settings', label: 'Settings' },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setView(item.key as typeof view)}
                  className={`nav-button ${view === item.key ? 'nav-button--active' : ''}`}
                  aria-pressed={view === item.key}
                >
                  <span
                    className={`nav-pill ${view === item.key ? 'nav-pill--active' : ''}`}
                    aria-hidden
                  >
                    {item.label.slice(0, 1)}
                  </span>
                  {item.label}
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default App;
