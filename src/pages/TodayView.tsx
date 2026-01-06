// ABOUTME: Renders the Today view with daily habit controls and manage mode.
// ABOUTME: Supports quick completion, streak visibility, and inline habit creation.
import { type FormEvent, useState } from 'react';
import { useAppStore } from '../store';
import { createHabit, deleteHabit, toggleCheckbox, updateAmount, getToday } from '../db/queries';
import { calculateStreak } from '../domain/streaks';
import type { Habit, LogEntry } from '../db/schema';

interface Props {
  onRefresh: () => Promise<void>;
}

export function TodayView({ onRefresh }: Props) {
  const { habits, logs } = useAppStore();
  const [isManaging, setIsManaging] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const today = getToday();

  const handleQuickAdd = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = newHabitName.trim();
    if (!name) return;
    setIsAdding(true);
    try {
      await createHabit({ name, type: 'checkbox' });
      setNewHabitName('');
      await onRefresh();
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleCheckbox = async (habitId: string) => {
    toggleCheckbox(habitId, today);
    await onRefresh();
  };

  const handleUpdateAmount = async (habitId: string, delta: number) => {
    updateAmount(habitId, today, delta);
    await onRefresh();
  };

  const handleDeleteHabit = async (id: string) => {
    if (confirm('Delete this habit?')) {
      await deleteHabit(id);
      await onRefresh();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <form onSubmit={handleQuickAdd} className="flex-1">
          <input
            type="text"
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            placeholder="Add a habit"
            className="w-full px-4 py-2 bg-stone-900 border border-stone-700 rounded-lg text-stone-50"
            disabled={isAdding}
            aria-label="Add habit"
          />
        </form>
        <button
          onClick={() => setIsManaging((prev) => !prev)}
          className={'px-3 py-2 rounded-lg text-sm font-medium border border-stone-700 transition ' + (
            isManaging ? 'bg-stone-700 text-stone-50' : 'text-stone-300 hover:bg-stone-800'
          )}
          aria-pressed={isManaging}
        >
          Manage
        </button>
      </div>

      <div className="rounded-lg border border-stone-800 divide-y divide-stone-800 overflow-hidden">
        {habits.map((habit) => (
          <HabitRow
            key={habit.id}
            habit={habit}
            log={(logs[today] as Record<string, LogEntry> | undefined)?.[habit.id]}
            streak={calculateStreak(habit, logs)}
            onToggleCheckbox={handleToggleCheckbox}
            onUpdateAmount={handleUpdateAmount}
            onDelete={handleDeleteHabit}
            isManaging={isManaging}
          />
        ))}
        {habits.length === 0 && (
          <div className="text-center py-10 text-stone-500">
            No habits yet. Type a habit name and press Enter to add one.
          </div>
        )}
      </div>
    </div>
  );
}

interface HabitRowProps {
  habit: Habit;
  log?: LogEntry;
  streak: number;
  isManaging: boolean;
  onToggleCheckbox: (habitId: string) => Promise<void>;
  onUpdateAmount: (habitId: string, delta: number) => Promise<void>;
  onDelete: (habitId: string) => Promise<void>;
}

function HabitRow({ habit, log, streak, isManaging, onToggleCheckbox, onUpdateAmount, onDelete }: HabitRowProps) {
  const isCheckbox = habit.type === 'checkbox';
  const isDone = isCheckbox ? log?.done : (log?.value || 0) >= (habit.target || 1);
  const progress = habit.type === 'amount' && habit.target ? Math.min(((log?.value || 0) / habit.target) * 100, 100) : 0;

  return (
    <div className="flex items-center gap-3 px-3 py-3 bg-stone-900/60">
      <div className="w-28 flex items-center">
        {isCheckbox ? (
          <button
            onClick={() => onToggleCheckbox(habit.id)}
            className={'w-11 h-11 rounded-full border flex items-center justify-center text-lg transition ' + (isDone ? 'bg-blue-600 border-blue-500 text-white' : 'border-stone-700 text-stone-400 hover:border-stone-500')}
            aria-label={`Toggle ${habit.name}`}
          >
            {isDone ? '✓' : ''}
          </button>
        ) : (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onUpdateAmount(habit.id, -1)}
              className="w-9 h-9 rounded-lg border border-stone-700 bg-stone-900 text-lg hover:border-stone-500"
              aria-label={`Decrease ${habit.name}`}
            >
              −
            </button>
            <div className="px-2 py-1 rounded-lg bg-stone-800 text-sm text-stone-100">
              {log?.value || 0}/{habit.target}
            </div>
            <button
              onClick={() => onUpdateAmount(habit.id, 1)}
              className="w-9 h-9 rounded-lg border border-stone-700 bg-stone-900 text-lg hover:border-stone-500"
              aria-label={`Increase ${habit.name}`}
            >
              +
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-base font-semibold text-stone-50 truncate">{habit.name}</div>
        {habit.type === 'amount' && (
          <div className="mt-1 flex items-center gap-2">
            <div className="flex-1 h-2 bg-stone-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-xs text-stone-400 whitespace-nowrap">{Math.round(progress)}%</div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className={'px-2 py-1 rounded-full text-xs font-semibold border ' + (streak > 0 ? 'border-amber-400 text-amber-300' : 'border-stone-700 text-stone-400')}>
          {streak}d
        </div>
        {isManaging && (
          <button
            onClick={() => onDelete(habit.id)}
            className="text-stone-400 hover:text-red-400 px-2"
            aria-label="Delete habit"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
