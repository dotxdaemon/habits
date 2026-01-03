import { useState } from 'react';
import { useAppStore } from '../store';
import { createHabit, deleteHabit, toggleCheckbox, updateAmount, getToday } from '../db/queries';
import { calculateStreak } from '../domain/streaks';

interface Props {
  onRefresh: () => Promise<void>;
}

export function TodayView({ onRefresh }: Props) {
  const { habits, logs } = useAppStore();
  const [showAddHabit, setShowAddHabit] = useState(false);
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
      <button
        onClick={() => setShowAddHabit(true)}
        className="w-full py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
      >
        + Add Habit
      </button>

      {showAddHabit && (
        <div className="bg-stone-800 p-4 rounded-lg border border-stone-700">
          <input
            type="text"
            value={newHabit.name}
            onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
            placeholder="Habit name (e.g., Meditate, Drink water)"
            className="w-full px-4 py-2 bg-stone-700 border border-stone-600 rounded mb-2 text-stone-50"
            autoFocus
          />
          <div className="flex gap-2 mb-2">
            <button
              onClick={() => setNewHabit({ ...newHabit, type: 'checkbox', target: 1, unit: '' })}
              className={'px-4 py-2 rounded ' + (newHabit.type === 'checkbox' ? 'bg-blue-600 text-white' : 'bg-stone-700 text-stone-400')}
            >
              Checkbox
            </button>
            <button
              onClick={() => setNewHabit({ ...newHabit, type: 'amount' })}
              className={'px-4 py-2 rounded ' + (newHabit.type === 'amount' ? 'bg-blue-600 text-white' : 'bg-stone-700 text-stone-400')}
            >
              Amount
            </button>
          </div>
          {newHabit.type === 'amount' && (
            <div className="flex gap-2 mb-2">
              <input
                type="number"
                value={newHabit.target}
                onChange={(e) => setNewHabit({ ...newHabit, target: parseInt(e.target.value) || 1 })}
                placeholder="Target"
                className="flex-1 px-4 py-2 bg-stone-700 border border-stone-600 rounded text-stone-50"
              />
              <input
                type="text"
                value={newHabit.unit}
                onChange={(e) => setNewHabit({ ...newHabit, unit: e.target.value })}
                placeholder="Unit (e.g., glasses, minutes)"
                className="flex-1 px-4 py-2 bg-stone-700 border border-stone-600 rounded text-stone-50"
              />
            </div>
          )}
          <div className="flex gap-2">
            <button
              onClick={handleAddHabit}
              className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Create
            </button>
            <button
              onClick={() => {
                setShowAddHabit(false);
                setNewHabit({ name: '', type: 'checkbox', target: 1, unit: '' });
              }}
              className="flex-1 py-2 bg-stone-700 rounded hover:bg-stone-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {habits.map((habit) => (
          <HabitCard
            key={habit.id}
            habit={habit}
            log={logs[today]?.[habit.id]}
            streak={calculateStreak(habit, logs)}
            onToggleCheckbox={handleToggleCheckbox}
            onUpdateAmount={handleUpdateAmount}
            onDelete={handleDeleteHabit}
          />
        ))}
        {habits.length === 0 && !showAddHabit && (
          <div className="text-center py-12 text-stone-500">
            No habits yet. Create your first one!
          </div>
        )}
      </div>
    </div>
  );
}

function HabitCard({ habit, log, streak, onToggleCheckbox, onUpdateAmount, onDelete }: any) {
  const isDone = habit.type === 'checkbox' ? log?.done : (log?.value || 0) >= habit.target;
  const progress = habit.type === 'amount' ? (log?.value || 0) / habit.target : 0;

  return (
    <div className="bg-stone-800 p-4 rounded-lg border border-stone-700 hover:border-stone-600 transition">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-stone-50">{habit.name}</h3>
          {habit.type === 'amount' && (
            <p className="text-sm text-stone-400">Target: {habit.target} {habit.unit}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className={'text-2xl font-bold ' + (streak > 0 ? 'text-amber-400' : 'text-stone-500')}>{streak}</div>
            <div className="text-xs text-stone-500">day streak</div>
          </div>
          <button
            onClick={() => onDelete(habit.id)}
            className="text-red-500 hover:text-red-400 px-2"
          >
            ×
          </button>
        </div>
      </div>

      {habit.type === 'checkbox' ? (
        <button
          onClick={() => onToggleCheckbox(habit.id)}
          className={'w-full py-3 rounded-lg font-medium transition ' + (isDone ? 'bg-blue-600 text-white' : 'bg-stone-700 text-stone-400 hover:bg-stone-600')}
        >
          {isDone ? '✓ Done' : 'Mark Complete'}
        </button>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onUpdateAmount(habit.id, -1)}
              className="w-10 h-10 bg-stone-700 rounded-lg hover:bg-stone-600"
            >
              -
            </button>
            <div className="flex-1 bg-stone-700 rounded-lg p-2">
              <div className="bg-stone-900 rounded h-6 relative overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-600 to-blue-500 transition-all"
                  style={{ width: Math.min(progress * 100, 100) + '%' }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-sm font-medium">
                  {log?.value || 0} / {habit.target}
                </div>
              </div>
            </div>
            <button
              onClick={() => onUpdateAmount(habit.id, 1)}
              className="w-10 h-10 bg-stone-700 rounded-lg hover:bg-stone-600"
            >
              +
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
