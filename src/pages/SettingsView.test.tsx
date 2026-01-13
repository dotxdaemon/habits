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

  it('toggles the retro anime themes and persists them', () => {
    render(<SettingsView onRefresh={async () => {}} />);

    const retroAnimeToggle = screen.getByRole('switch', { name: /^retro anime$/i });
    const retroAnimeDarkToggle = screen.getByRole('switch', { name: /retro anime dark/i });
    expect(retroAnimeToggle).not.toBeChecked();
    expect(retroAnimeDarkToggle).not.toBeChecked();
    expect(document.documentElement.dataset.theme).toBe('default');

    fireEvent.click(retroAnimeToggle);

    expect(retroAnimeToggle).toBeChecked();
    expect(retroAnimeDarkToggle).not.toBeChecked();
    expect(document.documentElement.dataset.theme).toBe('retro-anime');
    expect(storage.getItem('theme')).toBe('retro-anime');

    fireEvent.click(retroAnimeDarkToggle);

    expect(retroAnimeToggle).not.toBeChecked();
    expect(retroAnimeDarkToggle).toBeChecked();
    expect(document.documentElement.dataset.theme).toBe('retro-anime-dark');
    expect(storage.getItem('theme')).toBe('retro-anime-dark');

    fireEvent.click(retroAnimeDarkToggle);

    expect(retroAnimeDarkToggle).not.toBeChecked();
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

  it('does not show the mascot in the settings menu', () => {
    render(<SettingsView onRefresh={async () => {}} />);

    expect(screen.queryByRole('img', { name: /mascot/i })).not.toBeInTheDocument();
  });
});
