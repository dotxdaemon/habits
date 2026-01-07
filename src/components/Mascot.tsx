// ABOUTME: Renders a small inline SVG mascot for empty and settings states.
// ABOUTME: Keeps the graphic lightweight with flat fills and ink outlines.
interface MascotProps {
  className?: string;
}

export function Mascot({ className = '' }: MascotProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      role="img"
      aria-label="Mascot"
    >
      <g stroke="var(--color-ink)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path
          d="M28 58c0-20 14-32 32-32s32 12 32 32c0 19-12 34-32 34S28 77 28 58Z"
          fill="var(--color-mascot)"
        />
        <path
          d="M40 33l-10-12 16 6"
          fill="var(--color-accent)"
        />
        <path
          d="M80 33l10-12-16 6"
          fill="var(--color-accent)"
        />
        <circle cx="48" cy="58" r="4" fill="var(--color-ink)" stroke="none" />
        <circle cx="72" cy="58" r="4" fill="var(--color-ink)" stroke="none" />
        <path d="M56 70c2 3 6 3 8 0" fill="none" />
        <path d="M36 72c6 5 14 8 24 8s18-3 24-8" fill="none" />
      </g>
      <circle cx="28" cy="88" r="5" fill="var(--color-sunshine)" opacity="0.8" />
      <circle cx="92" cy="86" r="4" fill="var(--color-cel-pink)" opacity="0.8" />
    </svg>
  );
}
