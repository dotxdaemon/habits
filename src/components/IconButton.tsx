// ABOUTME: Renders a small circular icon button with consistent focus styling.
// ABOUTME: Supports optional label text and integrates with the card palette.
import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & PropsWithChildren & {
  variant?: 'primary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
};

export function IconButton({
  children,
  className = '',
  variant = 'ghost',
  size = 'md',
  ...props
}: IconButtonProps) {
  const sizeClass = size === 'sm' ? 'h-10 w-10 text-sm' : 'h-11 w-11 text-base';
  const variantClass = {
    primary: 'icon-button--primary',
    ghost: 'icon-button--ghost',
    danger: 'icon-button--danger',
  }[variant];

  return (
    <button
      type="button"
      className={`icon-button ${sizeClass} ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
