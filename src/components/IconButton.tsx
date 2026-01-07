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
    primary: 'bg-blue-600 text-white hover:bg-blue-500 focus-visible:ring-blue-400',
    ghost: 'bg-white/5 text-slate-100 hover:bg-white/10 focus-visible:ring-white/40',
    danger: 'bg-red-500/20 text-red-200 hover:bg-red-400/30 focus-visible:ring-red-300/60',
  }[variant];

  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center rounded-full ring-1 ring-inset ring-white/10 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${sizeClass} ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
