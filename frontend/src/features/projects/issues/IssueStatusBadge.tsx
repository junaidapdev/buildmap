import type { IssueStatus } from '@shared/schemas/issue';

import { Badge } from '@/components/ui/badge';
import { ISSUE_MESSAGES } from '@/features/projects/issues/messages';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

// Meaning never rests on color alone — the label is always shown alongside the badge.
const VARIANT: Record<IssueStatus, BadgeVariant> = {
  open: 'default',
  resolved: 'secondary',
};

export function IssueStatusBadge({ status }: { status: IssueStatus }) {
  return <Badge variant={VARIANT[status]}>{ISSUE_MESSAGES.STATUS_LABELS[status]}</Badge>;
}
