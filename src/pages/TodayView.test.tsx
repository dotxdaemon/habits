// ABOUTME: Validates Today view layout and controls for habit interactions.
// ABOUTME: Ensures manage mode and quick-add behaviors stay accessible inline.
import { act, fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { TodayView } from './TodayView';
import { useAppStore } from '../store';
import type { Habit } from '../db/schema';
import { createHabit } from '../db/queries';
import { getToday } from '../db/queries';

vi.mock('../db/queries', async () => {
  const actual = await vi.importActual<typeof import('../db/queries')>('../db/queries');
  return {
    ...actual,
    createHabit: vi.fn(async (data) => ({
      id: '2',
      name: data.name,
      type: data.type,
      createdAt: '2024-01-02',
    })),
  };
});

const createHabitMock = vi.mocked(createHabit);

describe('TodayView', () => {
  const habit: Habit = {
    id: '1',
    name: 'Read',
    type: 'checkbox',
    createdAt: '2024-01-01',
  };

  beforeEach(() => {
    useAppStore.setState({
      habits: [habit],
      logs: {},
      view: 'today',
      isLoading: false,
    });
  });

  it('hides delete controls until manage mode is enabled', () => {
    render(<TodayView onRefresh={async () => {}} />);

    expect(screen.queryByRole('button', { name: /delete habit/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /manage/i }));

    expect(screen.getByRole('button', { name: /delete habit/i })).toBeInTheDocument();
  });

  it('shows a quick add input inline without opening a modal', () => {
    render(<TodayView onRefresh={async () => {}} />);

    expect(screen.getByPlaceholderText(/add a habit/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /add habit/i })).not.toBeInTheDocument();
  });

  it('creates a checkbox habit when pressing enter in the quick add input', async () => {
    const newHabit: Habit = {
      id: '2',
      name: 'Jog',
      type: 'checkbox',
      createdAt: '2024-01-02',
    };
    const onRefresh = vi.fn(async () => {
      useAppStore.setState((state) => ({
        ...state,
        habits: [...state.habits, newHabit],
      }));
    });

    render(<TodayView onRefresh={onRefresh} />);

    const input = screen.getByPlaceholderText(/add a habit/i);
    fireEvent.change(input, { target: { value: newHabit.name } });
    fireEvent.submit(input.closest('form') as HTMLFormElement);

    expect(createHabitMock).toHaveBeenCalledWith({
      name: newHabit.name,
      type: 'checkbox',
    });
    expect(await screen.findByText(newHabit.name)).toBeInTheDocument();
  });

  it('does not show the checkbox type label under a habit name', () => {
    render(<TodayView onRefresh={async () => {}} />);

    expect(screen.queryByText(/checkbox/i)).not.toBeInTheDocument();
  });

  it('adds a sparkle class when the streak increases', () => {
    const today = getToday();
    vi.useFakeTimers();

    render(<TodayView onRefresh={async () => {}} />);

    const initialBadge = screen.getByText('0d').closest('span');
    expect(initialBadge).not.toHaveClass('streak-badge--sparkle');

    act(() => {
      useAppStore.setState((state) => ({
        ...state,
        logs: {
          [today]: {
            [habit.id]: { done: true },
          },
        },
      }));
    });

    act(() => {
      vi.advanceTimersByTime(1);
    });

    const updatedBadge = screen.getByText('1d').closest('span');
    expect(updatedBadge).toHaveClass('streak-badge--sparkle');

    act(() => {
      vi.advanceTimersByTime(320);
    });
    vi.useRealTimers();
  });

  it('adds a celebration class to the streak badge when a checkbox streak increases after a click', async () => {
    const today = getToday();
    vi.useFakeTimers();

    const onRefresh = vi.fn(async () => {
      useAppStore.setState((state) => ({
        ...state,
        logs: {
          [today]: {
            [habit.id]: { done: true },
          },
        },
      }));
    });

    render(<TodayView onRefresh={onRefresh} />);

    const toggle = screen.getByRole('button', { name: /toggle read/i });
    const initialBadge = screen.getByText('0d').closest('span');
    expect(initialBadge).not.toHaveClass('streak-badge--celebrate');

    await act(async () => {
      fireEvent.click(toggle);
    });

    act(() => {
      vi.advanceTimersByTime(1);
    });

    const updatedBadge = screen.getByText('1d').closest('span');
    expect(updatedBadge).toHaveClass('streak-badge--celebrate');

    act(() => {
      vi.advanceTimersByTime(480);
    });

    expect(updatedBadge).not.toHaveClass('streak-badge--celebrate');
    vi.useRealTimers();
  });

  it('adds a celebration class to the checkbox when a habit is completed', () => {
    const today = getToday();
    vi.useFakeTimers();

    render(<TodayView onRefresh={async () => {}} />);

    const toggle = screen.getByRole('button', { name: /toggle read/i });
    expect(toggle).not.toHaveClass('habit-check--celebrate');

    act(() => {
      useAppStore.setState((state) => ({
        ...state,
        logs: {
          [today]: {
            [habit.id]: { done: true },
          },
        },
      }));
    });

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(toggle).toHaveClass('habit-check--celebrate');

    act(() => {
      vi.advanceTimersByTime(360);
    });

    expect(toggle).not.toHaveClass('habit-check--celebrate');
    vi.useRealTimers();
  });
});
