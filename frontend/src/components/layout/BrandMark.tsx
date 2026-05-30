import { cn } from '@/lib/utils';

type BrandMarkProps = {
  /** Pixel size of the mark. Defaults to 26 (sidebar/header size). */
  size?: number;
  className?: string;
};

/**
 * The buildmap wordmark glyph — a small filled rounded square with a stylized M outline. Used in
 * the sidebar header, landing page nav, and any future surface that needs the brand. Pure SVG, no
 * external assets, scales cleanly from 16px (mini previews) to 40px (landing footer).
 */
export function BrandMark({ size = 26, className }: BrandMarkProps) {
  const radius = Math.max(5, Math.round(size * 0.27));
  const inner = Math.round(size * 0.62);

  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-grid place-items-center bg-foreground text-background',
        className,
      )}
      style={{ width: size, height: size, borderRadius: radius }}
    >
      <svg
        fill="none"
        height={inner}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.7}
        viewBox="0 0 16 16"
        width={inner}
      >
        <path d="M3 13V4l5 3 5-3v9" />
        <path d="M3 8l5 3 5-3" />
      </svg>
    </span>
  );
}
