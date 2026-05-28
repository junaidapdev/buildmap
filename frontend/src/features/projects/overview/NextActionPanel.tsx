import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Compass } from '@/features/projects/overview/icons';
import { OVERVIEW_MESSAGES } from '@/features/projects/overview/messages';
import { PanelCard } from '@/features/projects/overview/PanelCard';
import { useNextAction } from '@/features/projects/overview/useNextAction';

export function NextActionPanel({ projectId }: { projectId: string }) {
  const { nextAction, isPending } = useNextAction(projectId);

  return (
    <PanelCard
      icon={<Compass aria-hidden="true" className="h-4 w-4 text-muted-foreground" />}
      title={OVERVIEW_MESSAGES.NEXT_ACTION_TITLE}
    >
      {isPending ? (
        <Skeleton className="h-6 w-2/3" />
      ) : (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-lg font-medium">{nextAction.label}</p>
          {nextAction.to && (
            <Button asChild className="shrink-0">
              <Link to={nextAction.to}>{OVERVIEW_MESSAGES.NEXT_ACTION_CTA_LABEL}</Link>
            </Button>
          )}
        </div>
      )}
    </PanelCard>
  );
}
