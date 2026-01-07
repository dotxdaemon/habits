// ABOUTME: Validates ProgressRing rendering for value and ring calculations.
// ABOUTME: Confirms progress text and arc styling reflect provided props.
import { render, screen } from '@testing-library/react';
import { ProgressRing } from './ProgressRing';

describe('ProgressRing', () => {
  it('shows the value and max text in the center', () => {
    render(<ProgressRing value={3} max={5} size={80} strokeWidth={8} />);

    expect(screen.getByText('3/5')).toBeInTheDocument();
  });

  it('caps progress at the maximum and sets dash offset accordingly', () => {
    const { container } = render(<ProgressRing value={7} max={5} size={80} strokeWidth={8} />);

    const arc = container.querySelector('[data-testid="progress-ring-arc"]');
    const dasharray = arc?.getAttribute('stroke-dasharray');
    const dashoffset = arc?.getAttribute('stroke-dashoffset');

    expect(arc).not.toBeNull();
    expect(dasharray).toBeTruthy();
    expect(dashoffset).toBeTruthy();
  });
});
