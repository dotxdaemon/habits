// ABOUTME: Renders the Today view with daily habit controls and manage mode.
// ABOUTME: Supports quick completion, streak visibility, and modal habit creation.
import { useState } from 'react';
import { useAppStore } from '../store';
import { createHabit, deleteHabit, toggleCheckbox, updateAmount, getToday } from '../db/queries';
import { calculateStreak } from '../domain/streaks';
import type { Habit, LogEntry } from '../db/schema';

interface Props {
  onRefresh: () => Promise<void>;
}

export function TodayView({ onRefresh }: Props) {
  const { habits, logs } = useAppStore();
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [isManaging, setIsManaging] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: '', type: 'checkbox' as 'checkbox' | 'amount', target: 1, unit: '' });
  const today = getToday();

  const handleAddHabit = async () => {
    if (!newHabit.name.trim()) return;
    await createHabit(newHabit);
    setNewHabit({ name: '', type: 'checkbox', target: 1, unit: '' });
    setShowAddHabit(false);
    await onRefresh();
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
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => setIsManaging((prev) => !prev)}
          className={'px-3 py-2 rounded-lg text-sm font-medium border border-stone-700 transition ' + (
            isManaging ? 'bg-stone-700 text-stone-50' : 'text-stone-300 hover:bg-stone-800'
          )}
          aria-pressed={isManaging}
        >
          Manage
        </button>
        <button
          onClick={() => setShowAddHabit(true)}
          className="px-3 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
          aria-label="Add habit"
        >
          +
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
            No habits yet. Tap + to add one.
          </div>
        )}
      </div>

      {showAddHabit && (
        <div className="rounded-lg border border-stone-800 bg-stone-900/60 p-4 space-y-3" aria-label="Add habit">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-stone-50">Add Habit</h2>
            <button
              onClick={() => setShowAddHabit(false)}
              className="text-stone-400 hover:text-stone-200"
              aria-label="Close add habit"
            >
              ×
            </button>
          </div>
          <input
            type="text"
            value={newHabit.name}
            onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
            placeholder="Habit name (e.g., Meditate, Drink water)"
            className="w-full px-4 py-2 bg-stone-900 border border-stone-700 rounded-lg text-stone-50"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={() => setNewHabit({ ...newHabit, type: 'checkbox', target: 1, unit: '' })}
              className={'flex-1 px-4 py-2 rounded-lg text-sm font-medium ' + (newHabit.type === 'checkbox' ? 'bg-blue-600 text-white' : 'bg-stone-900 text-stone-300 border border-stone-700')}
            >
              Checkbox
            </button>
            <button
              onClick={() => setNewHabit({ ...newHabit, type: 'amount' })}
              className={'flex-1 px-4 py-2 rounded-lg text-sm font-medium ' + (newHabit.type === 'amount' ? 'bg-blue-600 text-white' : 'bg-stone-900 text-stone-300 border border-stone-700')}
            >
              Amount
            </button>
          </div>
          {newHabit.type === 'amount' && (
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="number"
                value={newHabit.target}
                onChange={(e) => setNewHabit({ ...newHabit, target: parseInt(e.target.value) || 1 })}
                placeholder="Target"
                className="flex-1 px-4 py-2 bg-stone-900 border border-stone-700 rounded-lg text-stone-50"
              />
              <input
                type="text"
                value={newHabit.unit}
                onChange={(e) => setNewHabit({ ...newHabit, unit: e.target.value })}
                placeholder="Unit (e.g., glasses, minutes)"
                className="flex-1 px-4 py-2 bg-stone-900 border border-stone-700 rounded-lg text-stone-50"
              />
            </div>
          )}
          <div className="flex gap-2">
            <button
              onClick={handleAddHabit}
              className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            >
              Create
            </button>
            <button
              onClick={() => {
                setShowAddHabit(false);
                setNewHabit({ name: '', type: 'checkbox', target: 1, unit: '' });
              }}
              className="flex-1 py-2 bg-stone-900 rounded-lg border border-stone-700 text-stone-200 hover:bg-stone-800"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
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
