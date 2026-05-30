import type { IssueSeverity } from '@shared/schemas/issue';

import { Badge } from '@/components/ui/badge';
import { ISSUE_MESSAGES } from '@/features/projects/issues/messages';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

const VARIANT: Record<IssueSeverity, BadgeVariant> = {
  low: 'outline',
  medium: 'secondary',
  high: 'destructive',
};

export function IssueSeverityBadge({ severity }: { severity: IssueSeverity }) {
  return <Badge variant={VARIANT[severity]}>{ISSUE_MESSAGES.SEVERITY_LABELS[severity]}</Badge>;
}
