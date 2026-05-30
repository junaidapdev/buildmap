import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useProject } from '@/features/projects/layout/useProject';
import { IssueListItem } from '@/features/projects/issues/IssueListItem';
import { IssuesEmpty } from '@/features/projects/issues/IssuesEmpty';
import { IssuesError } from '@/features/projects/issues/IssuesError';
import { IssuesPending } from '@/features/projects/issues/IssuesPending';
import { ISSUE_MESSAGES } from '@/features/projects/issues/messages';
import { NewIssueDialog } from '@/features/projects/issues/NewIssueDialog';
import { useIssues } from '@/features/projects/issues/useIssues';

export function IssuesListPage() {
  // ProjectLayout guarantees a loaded project before this page renders.
  const { project } = useProject();
  const projectId = project.id;
  const issuesQuery = useIssues(projectId);
  const [dialogOpen, setDialogOpen] = useState(false);

  const issues = issuesQuery.data ?? [];

  let body;
  if (issuesQuery.isPending) {
    body = <IssuesPending />;
  } else if (issuesQuery.isError) {
    body = <IssuesError onRetry={() => void issuesQuery.refetch()} />;
  } else if (issues.length === 0) {
    body = <IssuesEmpty onCreate={() => setDialogOpen(true)} />;
  } else {
    body = (
      <ul className="space-y-2">
        {issues.map((issue) => (
          <IssueListItem issue={issue} key={issue.id} projectId={projectId} />
        ))}
      </ul>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold leading-[1.1] tracking-tight">{ISSUE_MESSAGES.PAGE_TITLE}</h1>
          <p className="mt-2 text-muted-foreground">{ISSUE_MESSAGES.PAGE_SUBTITLE}</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>{ISSUE_MESSAGES.NEW_ISSUE_BUTTON}</Button>
      </header>

      {body}

      <NewIssueDialog onOpenChange={setDialogOpen} open={dialogOpen} projectId={projectId} />
    </div>
  );
}
