import { Badge } from '@/components/ui/badge';
import { PROGRESS_MESSAGES } from '@/features/projects/progress/messages';
import type { ProjectStatus } from '@/types/project';

type ProjectStatusBadgeProps = {
  status: ProjectStatus;
};

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

// Meaning never rests on color alone — the label is always shown alongside the badge.
const VARIANT: Record<ProjectStatus, BadgeVariant> = {
  idea: 'outline',
  planning: 'outline',
  ready_to_build: 'secondary',
  building: 'default',
  paused: 'secondary',
  completed: 'secondary',
};

export function ProjectStatusBadge({ status }: ProjectStatusBadgeProps) {
  return <Badge variant={VARIANT[status]}>{PROGRESS_MESSAGES.PROJECT_STATUS[status]}</Badge>;
}
