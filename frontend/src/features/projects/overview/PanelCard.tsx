import { type ReactNode } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type PanelCardProps = {
  title: string;
  /** Optional small icon next to the title. */
  icon?: ReactNode;
  /** Optional right-aligned action element (e.g. a "View all" link). */
  action?: ReactNode;
  /** Optional className override for the inner content area. */
  contentClassName?: string;
  children: ReactNode;
};

/**
 * Overview panel card. Tightened to a 13px uppercase eyebrow-style section title so the panel
 * reads as a document section, not a generic shadcn card. The icon (when supplied) sits at
 * muted-foreground and the right-aligned action slot stays at small text. Bottom-border under
 * the header gives the doc-section feel and aligns with the section cards used on PRD.
 */
export function PanelCard({ title, icon, action, contentClassName, children }: PanelCardProps) {
  return (
    <Card className="overflow-hidden border-border-subtle">
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 border-b border-border-subtle bg-subtle/40 px-5 py-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          {icon}
          <CardTitle className="font-mono text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {title}
          </CardTitle>
        </div>
        {action}
      </CardHeader>
      <CardContent className={cn('px-5 py-5', contentClassName)}>{children}</CardContent>
    </Card>
  );
}
