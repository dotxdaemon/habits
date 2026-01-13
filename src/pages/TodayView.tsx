// ABOUTME: Renders the Today view with daily habit controls and manage mode.
// ABOUTME: Supports quick completion, streak visibility, and inline habit creation.
import React, { type FormEvent, useRef, useState } from 'react';
import { useAppStore } from '../store';
import { createHabit, deleteHabit, toggleCheckbox, updateAmount, getToday } from '../db/queries';
import { calculateStreak } from '../domain/streaks';
import type { Habit, LogEntry } from '../db/schema';
import { Card } from '../components/Card';
import { IconButton } from '../components/IconButton';
import { Mascot } from '../components/Mascot';

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
            <div className="input-shell">
              <input
                type="text"
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                placeholder="Add a habit"
                className="input input--bare w-full"
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
            className={`button flex items-center gap-2 ${isManaging ? 'button--primary' : 'button--ghost'}`}
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
          <Card className="p-6 text-center space-y-3">
            <div className="flex justify-center">
              <Mascot className="h-20 w-20" />
            </div>
            <p className="text-sm text-muted">No habits yet. Type a habit name and press Enter to add one.</p>
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
  const [celebrateCheck, setCelebrateCheck] = useState(false);
  const celebrateTimeout = useRef<number | null>(null);

  const triggerCelebration = () => {
    if (!isCheckbox || isDone) return;
    setCelebrateCheck(true);
    if (celebrateTimeout.current !== null) {
      window.clearTimeout(celebrateTimeout.current);
    }
    celebrateTimeout.current = window.setTimeout(() => {
      setCelebrateCheck(false);
    }, 520);
  };

  const handleCardClick = () => {
    if (isCheckbox) {
      triggerCelebration();
      void onToggleCheckbox(habit.id);
    }
  };
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isCheckbox) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      triggerCelebration();
      void onToggleCheckbox(habit.id);
    }
  };

  return (
    <Card
      className={`habit-card p-4 flex items-center gap-3 transition ${isCheckbox ? 'cursor-pointer' : ''}`}
      data-done={isDone ? 'true' : 'false'}
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
            className={`habit-check ${celebrateCheck ? 'habit-check--celebrate' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              triggerCelebration();
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
            <div className="amount-pill min-w-[72px] text-center">
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
          <div className="text-base font-semibold text-[color:var(--color-text)] truncate">{habit.name}</div>
          <span
            className={`streak-badge ${streak > 0 ? 'streak-badge--active' : 'streak-badge--idle'}`}
          >
            <span className="streak-badge__icon" aria-hidden>★</span>
            {streak}d
          </span>
        </div>
        {habit.type === 'amount' && (
          <div className="mt-3">
            <div className="flex items-center gap-2">
              <div className="progress-track flex-1 h-2 rounded-full overflow-hidden">
                <div
                  className="progress-fill h-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-xs text-muted whitespace-nowrap">
                {log?.value || 0} / {habit.target} {habit.unit || ''}
              </div>
            </div>
            <p className="text-xs text-muted mt-1">
              Amount • Target {habit.target}{habit.unit ? ` ${habit.unit}` : ''}
            </p>
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
