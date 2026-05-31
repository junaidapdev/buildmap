import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useProject } from '@/features/projects/layout/useProject';
import { useDocumentTitle } from '@/lib/document-title';
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
  useDocumentTitle(`Issues — ${project.name || 'Project'} — buildmap`);
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
    // max-w-7xl + editorial header (eyebrow + border-b) matches Overview / Brief / PRD /
    // Architecture / Context Files / Chunks / Progress so all eight project surfaces share one
    // viewport rhythm.
    <div className="mx-auto max-w-7xl">
      <header className="mb-8 border-b border-border-subtle pb-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="page-eyebrow">{ISSUE_MESSAGES.PAGE_EYEBROW}</p>
            <h1 className="mt-2 text-[28px] font-semibold leading-[1.1] tracking-tight">
              {ISSUE_MESSAGES.PAGE_TITLE}
            </h1>
            <p className="mt-2 max-w-2xl text-[14px] text-muted-foreground">
              {ISSUE_MESSAGES.PAGE_SUBTITLE}
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)} size="sm">
            {ISSUE_MESSAGES.NEW_ISSUE_BUTTON}
          </Button>
        </div>
      </header>

      {body}

      <NewIssueDialog onOpenChange={setDialogOpen} open={dialogOpen} projectId={projectId} />
    </div>
  );
}
