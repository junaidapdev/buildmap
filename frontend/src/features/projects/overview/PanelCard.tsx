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

export function PanelCard({ title, icon, action, contentClassName, children }: PanelCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          {icon}
          <CardTitle className="text-base font-medium">{title}</CardTitle>
        </div>
        {action}
      </CardHeader>
      <CardContent className={cn(contentClassName)}>{children}</CardContent>
    </Card>
  );
}
