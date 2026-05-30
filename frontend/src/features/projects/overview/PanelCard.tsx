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
 * Overview panel card. Tightened to a 14px section title with a subtle border-bottom under the
 * header so the panel reads as a doc-section rather than a generic shadcn card. The icon (when
 * supplied) sits at muted-foreground and the right-aligned action slot stays at small text.
 */
export function PanelCard({ title, icon, action, contentClassName, children }: PanelCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 border-b border-border-subtle px-5 py-3.5">
        <div className="flex items-center gap-2 text-muted-foreground">
          {icon}
          <CardTitle className="text-[14px] font-semibold tracking-tight text-foreground">
            {title}
          </CardTitle>
        </div>
        {action}
      </CardHeader>
      <CardContent className={cn('px-5 py-4', contentClassName)}>{children}</CardContent>
    </Card>
  );
}
