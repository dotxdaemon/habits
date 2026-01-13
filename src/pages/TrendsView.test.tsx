// ABOUTME: Validates Trends view interactions for compact lists and detail panels.
// ABOUTME: Confirms expanded detail shows shared weekday labels and 7-day grid.
import { fireEvent, render, screen } from '@testing-library/react';
import { TrendsView } from './TrendsView';
import { useAppStore } from '../store';
import type { Habit, HabitLogs } from '../db/schema';

const habit: Habit = {
  id: 'h1',
  name: 'Stretch',
  type: 'checkbox',
  createdAt: '2024-01-01',
};

const logs: HabitLogs = {};

beforeEach(() => {
  useAppStore.setState({
    habits: [habit],
    logs,
    view: 'trends',
    isLoading: false,
  });
});

describe('TrendsView', () => {
  it('does not show export controls and keeps details collapsed by default', () => {
    render(<TrendsView onRefresh={async () => {}} />);

    expect(screen.queryByText(/export data/i)).not.toBeInTheDocument();
    expect(screen.queryByTestId('habit-detail-grid')).not.toBeInTheDocument();
  });

  it('reveals a 7-day grid with shared weekday labels when a habit is selected', () => {
    render(<TrendsView onRefresh={async () => {}} />);

    fireEvent.click(screen.getByRole('button', { name: /stretch/i }));

    expect(screen.getByTestId('habit-detail-grid')).toBeInTheDocument();
    expect(screen.getAllByTestId('day-cell')).toHaveLength(7);
    expect(screen.getAllByTestId('weekday-labels')).toHaveLength(1);
  });

  it('shows date labels for each consistency bar', () => {
    render(<TrendsView onRefresh={async () => {}} />);

    const dateLabels = screen.getAllByTestId('consistency-date');
    expect(dateLabels).toHaveLength(14);
    dateLabels.forEach((label) => {
      expect(label.textContent?.trim()).not.toBe('');
    });
  });
});
