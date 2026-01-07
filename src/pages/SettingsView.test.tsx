// ABOUTME: Verifies settings toggles for theme and scanline preferences.
// ABOUTME: Confirms preferences persist to the document and storage.
import { fireEvent, render, screen } from '@testing-library/react';
import { SettingsView } from './SettingsView';

const storage = window.localStorage;

describe('SettingsView', () => {
  beforeEach(() => {
    storage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('data-scanlines');
  });

  it('toggles the retro anime theme and persists it', () => {
    render(<SettingsView onRefresh={async () => {}} />);

    const toggle = screen.getByRole('switch', { name: /retro anime/i });
    expect(toggle).not.toBeChecked();
    expect(document.documentElement.dataset.theme).toBe('default');

    fireEvent.click(toggle);

    expect(toggle).toBeChecked();
    expect(document.documentElement.dataset.theme).toBe('retro-anime');
    expect(storage.getItem('theme')).toBe('retro-anime');

    fireEvent.click(toggle);

    expect(toggle).not.toBeChecked();
    expect(document.documentElement.dataset.theme).toBe('default');
    expect(storage.getItem('theme')).toBe('default');
  });

  it('toggles scanlines and persists the preference', () => {
    render(<SettingsView onRefresh={async () => {}} />);

    const toggle = screen.getByRole('switch', { name: /scanlines/i });
    expect(toggle).not.toBeChecked();
    expect(document.documentElement.dataset.scanlines).toBe('off');

    fireEvent.click(toggle);

    expect(toggle).toBeChecked();
    expect(document.documentElement.dataset.scanlines).toBe('on');
    expect(storage.getItem('scanlines')).toBe('on');
  });
});
