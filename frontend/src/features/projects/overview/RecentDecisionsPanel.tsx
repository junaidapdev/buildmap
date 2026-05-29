import { Link } from 'react-router-dom';

import type { ArchitectureDecisionStatus } from '@shared/schemas/architecture';
import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/constants/routes';
import { ARCHITECTURE_MESSAGES } from '@/features/projects/architecture/messages';
import { EmptyPanelContent } from '@/features/projects/overview/EmptyPanelContent';
import { ScrollText } from '@/features/projects/overview/icons';
import { OVERVIEW_MESSAGES } from '@/features/projects/overview/messages';
import { PanelCard } from '@/features/projects/overview/PanelCard';
import { useDecisionsState } from '@/features/projects/overview/stubs/useDecisionsState';

const STATUS_VARIANT: Record<
  ArchitectureDecisionStatus,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  accepted: 'default',
  proposed: 'secondary',
  superseded: 'outline',
  rejected: 'destructive',
};

export function RecentDecisionsPanel({ projectId }: { projectId: string }) {
  const { data } = useDecisionsState(projectId);

  return (
    <PanelCard
      action={
        <Link
          className="text-sm text-muted-foreground hover:text-foreground"
          to={`${ROUTES.PROJECT_ARCHITECTURE(projectId)}#decisions`}
        >
          {OVERVIEW_MESSAGES.DECISIONS_OPEN_ALL_LINK}
        </Link>
      }
      icon={<ScrollText aria-hidden="true" className="h-4 w-4 text-muted-foreground" />}
      title={OVERVIEW_MESSAGES.DECISIONS_TITLE}
    >
      {data.recent.length === 0 ? (
        <EmptyPanelContent
          body={OVERVIEW_MESSAGES.DECISIONS_EMPTY_BODY}
          title={OVERVIEW_MESSAGES.DECISIONS_EMPTY_TITLE}
        />
      ) : (
        <ul className="space-y-2">
          {data.recent.map((decision) => (
            <li
              className="flex items-center justify-between gap-3 rounded-md border p-3"
              key={decision.id}
            >
              <span className="truncate text-sm text-foreground">{decision.title}</span>
              <Badge className="shrink-0" variant={STATUS_VARIANT[decision.status]}>
                {ARCHITECTURE_MESSAGES.DECISION_STATUS_LABELS[decision.status]}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </PanelCard>
  );
}
