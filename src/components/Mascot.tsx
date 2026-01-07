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
          d="M28 60c0-20 14-34 32-34s32 14 32 34-14 34-32 34-32-14-32-34Z"
          fill="var(--color-mascot)"
        />
        <path
          d="M38 36l-12-14 4 20"
          fill="var(--color-accent)"
        />
        <path
          d="M82 36l12-14-4 20"
          fill="var(--color-accent)"
        />
        <circle cx="48" cy="58" r="4" fill="var(--color-ink)" stroke="none" />
        <circle cx="72" cy="58" r="4" fill="var(--color-ink)" stroke="none" />
        <path d="M58 66l2 2 2-2" fill="none" />
        <path d="M50 74c6 4 14 4 20 0" fill="none" />
        <path d="M30 64h16" />
        <path d="M74 64h16" />
        <path d="M30 70h14" />
        <path d="M76 70h14" />
      </g>
      <circle cx="40" cy="78" r="5" fill="var(--color-sunshine)" opacity="0.8" />
      <circle cx="80" cy="78" r="5" fill="var(--color-cel-pink)" opacity="0.8" />
    </svg>
  );
}
