// ABOUTME: Provides a reusable surface with rounded corners and subtle ring styling.
// ABOUTME: Wraps child content in a softly elevated card background.
import type { HTMLAttributes, PropsWithChildren } from 'react';

interface CardProps extends PropsWithChildren, HTMLAttributes<HTMLDivElement> {}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`surface-card ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
