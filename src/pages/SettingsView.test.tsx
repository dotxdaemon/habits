// ABOUTME: Verifies Settings view exposes data management actions.
// ABOUTME: Ensures export and import controls are accessible in the settings tab.
import { render, screen } from '@testing-library/react';
import { SettingsView } from './SettingsView';

it('shows export and import controls in settings', () => {
  render(<SettingsView onRefresh={async () => {}} />);

  expect(screen.getByRole('button', { name: /export data/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /import data/i })).toBeInTheDocument();
});
