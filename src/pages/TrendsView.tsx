// ABOUTME: Renders the Trends view with compact habit summaries.
// ABOUTME: Expands a selected habit to show a shared weekday grid for recent history.
import { useState } from 'react';
import { useAppStore } from '../store';
import { calculateCompletionRate, getLast7Days, getShortDayName } from '../domain/streaks';

interface Props {
  onRefresh: () => Promise<void>;
}

export function TrendsView({ onRefresh }: Props) {
  const { habits, logs } = useAppStore();
  const [expandedHabitId, setExpandedHabitId] = useState<string | null>(null);
  void onRefresh;

  return (
    <div className="space-y-3">
      {habits.map((habit) => {
        const completionRate = calculateCompletionRate(habit, logs, 30);
        const last7Days = getLast7Days(habit, logs);
        const isExpanded = expandedHabitId === habit.id;

        return (
          <div key={habit.id} className="rounded-lg border border-stone-800 bg-stone-900/60">
            <button
              onClick={() => setExpandedHabitId(isExpanded ? null : habit.id)}
              className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-stone-800 transition"
              aria-expanded={isExpanded}
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm text-stone-400">30-day</div>
                <div className="flex items-center gap-3">
                  <div className="text-lg font-semibold text-stone-50 truncate">{habit.name}</div>
                  <div className="text-sm text-stone-300">{completionRate}%</div>
                </div>
                <div className="mt-2 h-2 w-full bg-stone-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </div>
              <div className="text-stone-500 text-sm">{isExpanded ? 'Hide' : 'View'}</div>
            </button>

            {isExpanded && (
              <div className="px-4 pb-4">
                <div
                  className="grid grid-cols-7 gap-2 text-center text-xs text-stone-500 mb-2"
                  data-testid="weekday-labels"
                >
                  {last7Days.map((day) => (
                    <div key={`label-${day.dateKey}`} className="uppercase tracking-wide">
                      {getShortDayName(day.dateKey).slice(0, 1)}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2" data-testid="habit-detail-grid">
                  {last7Days.map((day) => (
                    <div
                      key={day.dateKey}
                      data-testid="day-cell"
                      className={
                        'h-10 rounded-md border ' +
                        (day.isComplete
                          ? 'bg-blue-600 border-blue-500'
                          : day.isToday
                          ? 'border-blue-500 bg-transparent'
                          : 'bg-stone-800 border-stone-700')
                      }
                      aria-label={`${habit.name} ${day.dateKey}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
      {habits.length === 0 && (
        <div className="text-center py-12 text-stone-500">
          No habits to show. Add some from the Today tab!
        </div>
      )}
    </div>
  );
}
