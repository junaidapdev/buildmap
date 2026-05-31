import { CheckCircle2, type LucideIcon } from 'lucide-react';
import { type ReactNode } from 'react';

import { cn } from '@/lib/utils';

type BriefSectionProps = {
  /** 1-indexed section number, rendered as a zero-padded mono caption ("01", "02"). */
  number: number;
  icon: LucideIcon;
  title: string;
  /**
   * Reflects the brief's global `is_final` state. The brief approves as a single document, so the
   * parent (BriefView) passes the same value to every section — they're either all green or all
   * neutral. Mirrors the same pattern used on PrdSection.
   */
  isApproved?: boolean;
  children: ReactNode;
};

export function BriefSection({
  number,
  icon: Icon,
  title,
  isApproved,
  children,
}: BriefSectionProps) {
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
          <Icon
            aria-hidden="true"
            className={cn(
              'h-4 w-4 shrink-0',
              isApproved ? 'text-brand-text' : 'text-muted-foreground',
            )}
          />
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
      </header>
      <div className="px-5 py-4 text-[14px] leading-relaxed text-foreground">
        {children}
      </div>
    </section>
  );
}
