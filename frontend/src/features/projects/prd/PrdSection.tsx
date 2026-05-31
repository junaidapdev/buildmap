import { CheckCircle2 } from 'lucide-react';
import { type ReactNode } from 'react';

import { cn } from '@/lib/utils';

type PrdSectionProps = {
  title: string;
  /**
   * 1-indexed section number, rendered as a zero-padded mono caption ("01", "02") above the title.
   * Numbering is assigned by the parent (PrdView) so reorders stay in one place.
   */
  number: number;
  /**
   * Reflects the PRD's global `is_final` state. When true, the section card gets the brand-soft
   * green tint + checkmark — making approval state visible at a glance as the reader scrolls. The
   * mockup hints at per-section approval; the backend approves the whole PRD, so all sections share
   * this state until per-section approval lands.
   */
  isApproved?: boolean;
  /** Optional right-aligned header slot (e.g. the section's Edit / Regenerate controls). */
  action?: ReactNode;
  children: ReactNode;
};

export function PrdSection({ number, title, isApproved, action, children }: PrdSectionProps) {
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
          'flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b',
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
