import { CheckCircle2 } from 'lucide-react';
import { type ReactNode } from 'react';

import { cn } from '@/lib/utils';

type FeatureSpecSectionProps = {
  /** 1-indexed section number, rendered as a zero-padded mono caption ("01", "02") above the title. */
  number: number;
  title: string;
  /**
   * Reflects the spec's global `is_final` state. The whole document approves at once, so the
   * parent (FeatureSpecView) passes the same value to every section — either all green or all
   * neutral. Mirrors PrdSection / BriefSection / ArchitectureSection.
   */
  isApproved?: boolean;
  /** Optional right-aligned header slot (e.g. the section's Edit / Regenerate controls). */
  action?: ReactNode;
  /** Section body — markdown viewer, editor textarea, or regenerate skeletons. */
  children: ReactNode;
};

/**
 * Single spec section card. Card chrome matches PrdSection / BriefSection / ArchitectureSection:
 * rounded border, brand-soft tint + checkmark when approved, mono numbered eyebrow + title in the
 * header, icon-only action cluster in the right of the header. The body is whatever the caller
 * passes via children — same children-only contract as the other section components in the suite.
 */
export function FeatureSpecSection({
  number,
  title,
  isApproved,
  action,
  children,
}: FeatureSpecSectionProps) {
  const numberLabel = String(number).padStart(2, '0');

  return (
    <section
      className={cn(
        'overflow-hidden rounded-lg border transition-colors',
        isApproved
          ? 'border-brand-soft-border bg-brand-soft/60'
          : 'border-border bg-card',
      )}
    >
      <header
        className={cn(
          'flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3',
          isApproved ? 'border-brand-soft-border' : 'border-border-subtle',
        )}
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            {numberLabel}
          </span>
          <h2
            className={cn(
              'text-[16px] font-semibold tracking-tight',
              isApproved ? 'text-brand-text' : 'text-foreground',
            )}
          >
            {title}
          </h2>
          {isApproved && (
            <CheckCircle2
              aria-hidden="true"
              className="h-4 w-4 shrink-0 text-brand-text"
            />
          )}
        </div>
        {action}
      </header>
      <div className="px-5 py-4 text-[14px] leading-relaxed text-foreground">{children}</div>
    </section>
  );
}
