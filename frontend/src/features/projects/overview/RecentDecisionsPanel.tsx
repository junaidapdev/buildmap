import { Link } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';
import { EmptyPanelContent } from '@/features/projects/overview/EmptyPanelContent';
import { ScrollText } from '@/features/projects/overview/icons';
import { OVERVIEW_MESSAGES } from '@/features/projects/overview/messages';
import { PanelCard } from '@/features/projects/overview/PanelCard';
import { useDecisionsState } from '@/features/projects/overview/stubs/useDecisionsState';

export function RecentDecisionsPanel({ projectId }: { projectId: string }) {
  const { data } = useDecisionsState(projectId);

  return (
    <PanelCard
      action={
        <Link
          className="text-sm text-muted-foreground hover:text-foreground"
          to={ROUTES.PROJECT_ARCHITECTURE(projectId)}
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
      ) : // TODO(chunk-16): render the 5 most recent decisions once a decision log exists.
      null}
    </PanelCard>
  );
}
