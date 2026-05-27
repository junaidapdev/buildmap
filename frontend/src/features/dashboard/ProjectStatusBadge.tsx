import { Badge } from '@/components/ui/badge';
import { PROJECT_STATUS_CONFIG } from '@/features/dashboard/status-config';
import { cn } from '@/lib/utils';
import type { ProjectStatus } from '@/types/project';

type ProjectStatusBadgeProps = {
  status: ProjectStatus;
};

export function ProjectStatusBadge({ status }: ProjectStatusBadgeProps) {
  const config = PROJECT_STATUS_CONFIG[status];

  return (
    <Badge variant={config.variant} className="shrink-0 gap-1.5">
      <span className={cn('size-2 rounded-full', config.dotClass)} aria-hidden="true" />
      {config.label}
    </Badge>
  );
}
