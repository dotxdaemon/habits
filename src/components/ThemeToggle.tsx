// ABOUTME: Provides switches to update the selected theme and scanlines.
// ABOUTME: Syncs toggle state with stored appearance preferences.
import { useId, useLayoutEffect, useState } from 'react';
import { applyScanlines, applyTheme, getStoredScanlines, getStoredTheme, type ScanlinesMode, type ThemeName } from '../theme/theme';

interface ToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}

function Toggle({ label, description, checked, onChange }: ToggleProps) {
  const id = useId();

  return (
    <div className="flex items-center justify-between gap-4">
      <label htmlFor={id} className="space-y-1">
        <div className="text-sm font-semibold text-[color:var(--color-text)]">{label}</div>
        <div className="text-xs text-[color:var(--color-text-muted)]">{description}</div>
      </label>
      <button
        type="button"
        role="switch"
        id={id}
        aria-checked={checked}
        aria-label={label}
        className={`toggle-switch ${checked ? 'toggle-switch--on' : ''}`}
        onClick={() => onChange(!checked)}
      >
        <span className="toggle-switch__thumb" aria-hidden />
      </button>
    </div>
  );
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeName>(() => getStoredTheme());
  const [scanlines, setScanlines] = useState<ScanlinesMode>(() => getStoredScanlines());

  useLayoutEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useLayoutEffect(() => {
    applyScanlines(scanlines);
  }, [scanlines]);

  return (
    <div className="space-y-4">
      <Toggle
        label="Retro Anime"
        description="Cel-shaded palette, ink outlines, and playful accents."
        checked={theme === 'retro-anime'}
        onChange={(next) => setTheme(next ? 'retro-anime' : 'default')}
      />
      <Toggle
        label="Scanlines"
        description="Subtle background scanlines (reduced-motion friendly)."
        checked={scanlines === 'on'}
        onChange={(next) => setScanlines(next ? 'on' : 'off')}
      />
    </div>
  );
}
