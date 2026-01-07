// ABOUTME: Provides a reusable surface with rounded corners and subtle ring styling.
// ABOUTME: Wraps child content in a softly elevated card background.
import type React from 'react';
import type { PropsWithChildren } from 'react';

interface CardProps extends PropsWithChildren {
  className?: string;
  onClick?: () => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  role?: string;
  tabIndex?: number;
  'aria-pressed'?: boolean;
}

export function Card({ children, className = '', onClick, onKeyDown, role, tabIndex, 'aria-pressed': ariaPressed }: CardProps) {
  return (
    <div
      className={`rounded-2xl bg-slate-950/40 ring-1 ring-white/10 ${className}`}
      onClick={onClick}
      onKeyDown={onKeyDown}
      role={role}
      tabIndex={tabIndex}
      aria-pressed={ariaPressed}
    >
      {children}
    </div>
  );
}
