// ABOUTME: Validates Today view layout and controls for habit interactions.
// ABOUTME: Ensures manage mode and add habit overlay behave as expected.
import { fireEvent, render, screen } from '@testing-library/react';
import { TodayView } from './TodayView';
import { useAppStore } from '../store';
import type { Habit } from '../db/schema';

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

  it('shows an inline add form without changing the surrounding layout', () => {
    render(<TodayView onRefresh={async () => {}} />);

    fireEvent.click(screen.getByRole('button', { name: /add habit/i }));

    expect(screen.queryByRole('dialog', { name: /add habit/i })).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText(/habit name/i)).toBeInTheDocument();
    expect(screen.getByText('Read')).toBeInTheDocument();
  });
});
