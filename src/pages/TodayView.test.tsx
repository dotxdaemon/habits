// ABOUTME: Validates Today view layout and controls for habit interactions.
// ABOUTME: Ensures manage mode and quick-add behaviors stay accessible inline.
import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { TodayView } from './TodayView';
import { useAppStore } from '../store';
import type { Habit } from '../db/schema';
import { createHabit } from '../db/queries';

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
    } as any);
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
});
