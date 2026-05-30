import { Link } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';
import { IssueSeverityBadge } from '@/features/projects/issues/IssueSeverityBadge';
import { IssueStatusBadge } from '@/features/projects/issues/IssueStatusBadge';
import { ISSUE_MESSAGES } from '@/features/projects/issues/messages';
import type { IssueRow } from '@/features/projects/issues/useIssues';
import { formatRelativeTime } from '@/lib/relative-time';

type IssueListItemProps = {
  issue: IssueRow;
  projectId: string;
};

export function IssueListItem({ issue, projectId }: IssueListItemProps) {
  return (
    <li>
      <Link
        className="block rounded-md border p-3 transition-colors hover:bg-muted/50"
        to={ROUTES.PROJECT_ISSUE(projectId, issue.id)}
      >
        <div className="flex items-start gap-3">
          <div className="flex flex-wrap gap-1.5">
            <IssueStatusBadge status={issue.status} />
            <IssueSeverityBadge severity={issue.severity} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-medium">{issue.title}</h3>
            <p className="line-clamp-2 text-sm text-muted-foreground">{issue.description}</p>
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">
            {formatRelativeTime(issue.created_at, ISSUE_MESSAGES.UPDATED_JUST_NOW)}
          </span>
        </div>
      </Link>
    </li>
  );
}
