// ABOUTME: Renders the Trends view with compact habit summaries.
// ABOUTME: Expands a selected habit to show a shared weekday grid for recent history.
import { useState } from 'react';
import { useAppStore } from '../store';
import { calculateCompletionRate, getLast7Days, getShortDayName } from '../domain/streaks';
import { getDaysAgo } from '../db/queries';
import { Card } from '../components/Card';

interface Props {
  onRefresh: () => Promise<void>;
}

export function TrendsView({ onRefresh }: Props) {
  const { habits, logs } = useAppStore();
  const [expandedHabitId, setExpandedHabitId] = useState<string | null>(null);
  void onRefresh;

  const last14DayCompletion = Array.from({ length: 14 }).map((_, index) => {
    const dateKey = getDaysAgo(13 - index);
    const entries = logs[dateKey];
    if (!entries || habits.length === 0) {
      return { dateKey, percent: 0 };
    }
    const completeCount = habits.reduce((count, habit) => {
      const log = entries[habit.id];
      if (habit.type === 'checkbox') {
        return log?.done ? count + 1 : count;
      }
      const target = habit.target || 1;
      return (log?.value || 0) >= target ? count + 1 : count;
    }, 0);
    return { dateKey, percent: Math.round((completeCount / habits.length) * 100) };
  });

  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">This month</p>
            <h2 className="text-lg font-semibold text-slate-50">Consistency</h2>
          </div>
          <div className="text-sm text-slate-400">Last 14 days</div>
        </div>
        <div className="grid grid-cols-14 gap-1">
          {last14DayCompletion.map((day) => (
            <div key={day.dateKey} className="w-full h-10 rounded-lg bg-white/5 ring-1 ring-white/10 overflow-hidden">
              <div
                className="bg-gradient-to-b from-sky-400 to-indigo-500 w-full"
                style={{ height: `${day.percent}%` }}
              />
            </div>
          ))}
        </div>
      </Card>
      {habits.map((habit) => {
        const completionRate = calculateCompletionRate(habit, logs, 30);
        const last7Days = getLast7Days(habit, logs);
        const isExpanded = expandedHabitId === habit.id;

        return (
          <Card key={habit.id} className="overflow-hidden">
            <button
              onClick={() => setExpandedHabitId(isExpanded ? null : habit.id)}
              className="w-full text-left px-4 py-4 flex items-center gap-3 hover:bg-white/5 transition"
              aria-expanded={isExpanded}
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm text-slate-400">30-day</div>
                <div className="flex items-center gap-3">
                  <div className="text-lg font-semibold text-slate-50 truncate">{habit.name}</div>
                  <div className="text-sm text-slate-200">{completionRate}%</div>
                </div>
                <div className="mt-2 h-2 w-full bg-white/5 rounded-full overflow-hidden ring-1 ring-inset ring-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </div>
              <div className="text-slate-500 text-sm">{isExpanded ? 'Hide' : 'View'}</div>
            </button>

            {isExpanded && (
              <div className="px-4 pb-4 space-y-3">
                <div
                  className="grid grid-cols-7 gap-2 text-center text-xs text-slate-500"
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
                        'h-10 rounded-md ring-1 ring-inset ' +
                        (day.isComplete
                          ? 'bg-gradient-to-b from-sky-400 to-indigo-500 ring-blue-400/70'
                          : day.isToday
                          ? 'ring-blue-400/70 bg-transparent'
                          : 'bg-white/5 ring-white/10')
                      }
                      aria-label={`${habit.name} ${day.dateKey}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </Card>
        );
      })}
      {habits.length === 0 && (
        <Card className="p-6 text-center text-slate-400">
          No habits to show. Add some from the Today tab!
        </Card>
      )}
    </div>
  );
}
