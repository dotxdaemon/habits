// ABOUTME: Renders the Today view with daily habit controls and manage mode.
// ABOUTME: Supports quick completion, streak visibility, and inline habit creation.
import React, { type FormEvent, useState } from 'react';
import { useAppStore } from '../store';
import { createHabit, deleteHabit, toggleCheckbox, updateAmount, getToday } from '../db/queries';
import { calculateStreak } from '../domain/streaks';
import type { Habit, LogEntry } from '../db/schema';
import { Card } from '../components/Card';
import { IconButton } from '../components/IconButton';

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
      <Card className="p-3">
        <div className="flex items-center gap-3">
          <form onSubmit={handleQuickAdd} className="flex-1">
            <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2 ring-1 ring-inset ring-white/10 focus-within:ring-white/20">
              <input
                type="text"
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                placeholder="Add a habit"
                className="w-full bg-transparent text-slate-100 placeholder:text-slate-500 outline-none"
                disabled={isAdding}
                aria-label="Add habit"
              />
              <IconButton type="submit" size="sm" variant="primary" aria-label="Add">
                +
              </IconButton>
            </div>
          </form>
          <button
            type="button"
            onClick={() => setIsManaging((prev) => !prev)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold ring-1 ring-inset transition ${
              isManaging ? 'bg-blue-600 ring-blue-500 text-white' : 'bg-white/5 ring-white/10 text-slate-100 hover:bg-white/10'
            }`}
            aria-pressed={isManaging}
          >
            <span aria-hidden>⚙️</span>
            Manage
          </button>
        </div>
      </Card>

      <div className="space-y-3">
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
          <Card className="p-6 text-center text-slate-400">
            No habits yet. Type a habit name and press Enter to add one.
          </Card>
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
  const handleCardClick = () => {
    if (isCheckbox) {
      void onToggleCheckbox(habit.id);
    }
  };
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isCheckbox) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      void onToggleCheckbox(habit.id);
    }
  };

  return (
    <Card
      className={`p-4 flex items-center gap-3 transition ${isCheckbox ? 'cursor-pointer hover:bg-white/5' : ''}`}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      role={isCheckbox ? 'button' : undefined}
      aria-pressed={isCheckbox ? isDone : undefined}
      tabIndex={isCheckbox ? 0 : undefined}
    >
      <div className="shrink-0">
        {isCheckbox ? (
          <IconButton
            variant={isDone ? 'primary' : 'ghost'}
            aria-label={`Toggle ${habit.name}`}
            onClick={(e) => {
              e.stopPropagation();
              void onToggleCheckbox(habit.id);
            }}
          >
            {isDone ? '✓' : ''}
          </IconButton>
        ) : (
          <div className="flex items-center gap-2">
            <IconButton
              size="sm"
              aria-label={`Decrease ${habit.name}`}
              onClick={(e) => {
                e.stopPropagation();
                void onUpdateAmount(habit.id, -1);
              }}
            >
              −
            </IconButton>
            <div className="px-3 py-2 rounded-xl bg-white/5 ring-1 ring-inset ring-white/10 text-sm font-semibold text-slate-100 min-w-[72px] text-center">
              {log?.value || 0}/{habit.target}
            </div>
            <IconButton
              size="sm"
              variant="primary"
              aria-label={`Increase ${habit.name}`}
              onClick={(e) => {
                e.stopPropagation();
                void onUpdateAmount(habit.id, 1);
              }}
            >
              +
            </IconButton>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="text-base font-semibold text-slate-50 truncate">{habit.name}</div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ring-1 ring-inset ${
            streak > 0 ? 'bg-amber-500/15 text-amber-200 ring-amber-400/40' : 'bg-white/5 text-slate-300 ring-white/10'
          }`}>
            {streak}d
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          {habit.type === 'checkbox' ? 'Checkbox' : `Amount • Target ${habit.target}${habit.unit ? ` ${habit.unit}` : ''}`}
        </p>
        {habit.type === 'amount' && (
          <div className="mt-3">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden ring-1 ring-inset ring-white/10">
                <div
                  className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-xs text-slate-300 whitespace-nowrap">
                {log?.value || 0} / {habit.target} {habit.unit || ''}
              </div>
            </div>
          </div>
        )}
      </div>

      {isManaging && (
        <IconButton
          variant="danger"
          size="sm"
          aria-label="Delete habit"
          onClick={(e) => {
            e.stopPropagation();
            void onDelete(habit.id);
          }}
        >
          ×
        </IconButton>
      )}
    </Card>
  );
}
