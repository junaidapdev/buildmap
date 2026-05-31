import { CheckCircle2 } from 'lucide-react';
import { type ReactNode } from 'react';

import { cn } from '@/lib/utils';

type ArchitectureSectionProps = {
  title: string;
  /**
   * 1-indexed section number, rendered as a zero-padded mono caption ("01", "02") above the title.
   * Numbering is assigned by the parent (ArchitectureView).
   */
  number: number;
  /**
   * Reflects the architecture's global `is_final` state. The whole document approves at once, so
   * the parent (ArchitectureView) passes the same value to every section — either all green or all
   * neutral. Mirrors PrdSection / BriefSection.
   */
  isApproved?: boolean;
  /** Optional right-aligned header slot (e.g. the section's Edit / Regenerate controls). */
  action?: ReactNode;
  children: ReactNode;
};

export function ArchitectureSection({
  number,
  title,
  isApproved,
  action,
  children,
}: ArchitectureSectionProps) {
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
      <div className="px-5 py-4 text-[14px] leading-relaxed text-foreground">
        {children}
      </div>
    </section>
  );
}
