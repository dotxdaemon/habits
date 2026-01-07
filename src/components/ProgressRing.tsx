// ABOUTME: Displays circular progress as an SVG ring with numeric summary.
// ABOUTME: Shows completion text in the center for quick habit overview.
interface ProgressRingProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
}

export function ProgressRing({ value, max, size = 96, strokeWidth = 10 }: ProgressRingProps) {
  const clampedMax = Math.max(max, 1);
  const clampedValue = Math.min(Math.max(value, 0), clampedMax);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (clampedValue / clampedMax) * circumference;
  const center = size / 2;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="var(--color-progress-track)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        <circle
          data-testid="progress-ring-arc"
          cx={center}
          cy={center}
          r={radius}
          stroke="url(#progress-gradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={progress}
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-progress-start)" />
            <stop offset="100%" stopColor="var(--color-progress-end)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-[color:var(--color-text)]">
        {clampedValue}/{clampedMax}
      </div>
    </div>
  );
}
