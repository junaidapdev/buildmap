import { Link } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';
import { EmptyPanelContent } from '@/features/projects/overview/EmptyPanelContent';
import { AlertOctagon } from '@/features/projects/overview/icons';
import { OVERVIEW_MESSAGES } from '@/features/projects/overview/messages';
import { PanelCard } from '@/features/projects/overview/PanelCard';
import { useIssuesState } from '@/features/projects/overview/stubs/useIssuesState';

export function OpenIssuesPanel({ projectId }: { projectId: string }) {
  const { data } = useIssuesState(projectId);

  const action =
    data.openCount > 0 ? (
      <Link
        className="text-sm text-muted-foreground hover:text-foreground"
        to={ROUTES.PROJECT_ISSUES(projectId)}
      >
        {OVERVIEW_MESSAGES.ISSUES_OPEN_ALL_LINK}
      </Link>
    ) : undefined;

  return (
    <PanelCard
      action={action}
      icon={<AlertOctagon aria-hidden="true" className="h-4 w-4 text-muted-foreground" />}
      title={OVERVIEW_MESSAGES.ISSUES_TITLE}
    >
      {data.recent.length === 0 ? (
        <EmptyPanelContent
          body={OVERVIEW_MESSAGES.ISSUES_EMPTY_BODY}
          title={OVERVIEW_MESSAGES.ISSUES_EMPTY_TITLE}
        />
      ) : // TODO(chunk-23): render the 3 most recent open issues (title + relative time).
      null}
    </PanelCard>
  );
}
