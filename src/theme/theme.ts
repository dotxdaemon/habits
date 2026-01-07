// ABOUTME: Manages theme and scanline preferences with document updates.
// ABOUTME: Stores user appearance selections in local storage for reuse.
export type ThemeName = 'default' | 'retro-anime';
export type ScanlinesMode = 'on' | 'off';

const THEME_KEY = 'theme';
const SCANLINES_KEY = 'scanlines';

const isThemeName = (value: string): value is ThemeName => value === 'retro-anime' || value === 'default';
const isScanlinesMode = (value: string): value is ScanlinesMode => value === 'on' || value === 'off';

export const getStoredTheme = (): ThemeName => {
  const stored = window.localStorage.getItem(THEME_KEY);
  return stored && isThemeName(stored) ? stored : 'default';
};

export const getStoredScanlines = (): ScanlinesMode => {
  const stored = window.localStorage.getItem(SCANLINES_KEY);
  return stored && isScanlinesMode(stored) ? stored : 'off';
};

export const applyTheme = (theme: ThemeName) => {
  document.documentElement.dataset.theme = theme;
  window.localStorage.setItem(THEME_KEY, theme);
};

export const applyScanlines = (mode: ScanlinesMode) => {
  document.documentElement.dataset.scanlines = mode;
  window.localStorage.setItem(SCANLINES_KEY, mode);
};
