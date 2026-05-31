import { AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/constants/routes';
import { getAiErrorCopy } from '@/features/_shared/ai-error-copy';
import { useChunks } from '@/features/projects/chunks/useChunks';
import { IssueSeverityBadge } from '@/features/projects/issues/IssueSeverityBadge';
import { IssueStatusBadge } from '@/features/projects/issues/IssueStatusBadge';
import { IssuePromptDisplay } from '@/features/projects/issues/IssuePromptDisplay';
import { ISSUE_MESSAGES } from '@/features/projects/issues/messages';
import { useGenerateIssuePrompt } from '@/features/projects/issues/useGenerateIssuePrompt';
import { useIssue } from '@/features/projects/issues/useIssue';
import { useResolveIssue } from '@/features/projects/issues/useResolveIssue';
import { useProject } from '@/features/projects/layout/useProject';
import { useDocumentTitle } from '@/lib/document-title';

type DetailRouteState = { autoGenerate?: boolean } | null;

export function IssueDetailPage() {
  const { id, issueId } = useParams<{ id: string; issueId: string }>();
  const location = useLocation();
  // ProjectLayout has loaded the project before this nested route mounts.
  const { project } = useProject();
  const issueQuery = useIssue(issueId ?? '');
  const chunksQuery = useChunks(id ?? '');
  // Hooks are called unconditionally with a safe fallback so the hook order stays stable when the
  // params are momentarily absent; the early Navigate below catches the missing-param case.
  const generate = useGenerateIssuePrompt(id ?? '', issueId ?? '');
  const resolve = useResolveIssue(id ?? '', issueId ?? '');
  const generatePrompt = generate.mutate;
  const autoFiredRef = useRef<string | null>(null);

  // Title hook stays above the Navigate early return so hook order is stable across renders.
  // Falls back to a generic "Issue" while the issue row is loading.
  const issueTitle = issueQuery.data?.title ?? 'Issue';
  useDocumentTitle(`${issueTitle} — ${project.name || 'Project'} — buildmap`);

  // Auto-fire generation when the user just created this issue from the dialog. Run-once per id so
  // returning to the page later doesn't regenerate.
  useEffect(() => {
    if (!issueId) {
      return;
    }
    const navState = location.state as DetailRouteState;
    if (!navState?.autoGenerate) {
      return;
    }
    if (autoFiredRef.current === issueId) {
      return;
    }
    if (issueQuery.isPending || issueQuery.isError) {
      return;
    }
    // Only fire if there's no prompt yet — guard against double-fire on a returning visit.
    if (issueQuery.data?.corrective_prompt) {
      return;
    }
    autoFiredRef.current = issueId;
    generatePrompt();
  }, [
    issueId,
    location.state,
    issueQuery.isPending,
    issueQuery.isError,
    issueQuery.data,
    generatePrompt,
  ]);

  if (!id || !issueId) {
    return <Navigate replace to={ROUTES.DASHBOARD} />;
  }

  if (issueQuery.isPending) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (issueQuery.isError || !issueQuery.data) {
    return (
      <div className="mx-auto max-w-4xl">
        <section className="flex flex-col items-center py-16 text-center" role="alert">
          <div className="mb-4 rounded-full bg-destructive/10 p-3 text-destructive">
            <AlertCircle aria-hidden="true" className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-semibold">{ISSUE_MESSAGES.ERROR_TITLE}</h2>
          <p className="mt-2 max-w-md text-muted-foreground">{ISSUE_MESSAGES.ERROR_BODY}</p>
          <div className="mt-6 flex gap-3">
            <Button asChild variant="outline">
              <Link to={ROUTES.PROJECT_ISSUES(id)}>{ISSUE_MESSAGES.BACK_TO_ISSUES}</Link>
            </Button>
            <Button onClick={() => void issueQuery.refetch()}>{ISSUE_MESSAGES.ERROR_RETRY}</Button>
          </div>
        </section>
      </div>
    );
  }

  const issue = issueQuery.data;
  const linkedChunk = issue.chunk_id
    ? (chunksQuery.data ?? []).find((chunk) => chunk.id === issue.chunk_id)
    : null;

  let promptBody: ReactNode;
  if (generate.isPending) {
    promptBody = (
      <section aria-label={ISSUE_MESSAGES.PROMPT_PENDING_TITLE} className="space-y-4" role="status">
        <div className="text-center">
          <h3 className="text-lg font-semibold">{ISSUE_MESSAGES.PROMPT_PENDING_TITLE}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{ISSUE_MESSAGES.PROMPT_PENDING_BODY}</p>
        </div>
        <div aria-hidden="true" className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </section>
    );
  } else if (issue.corrective_prompt) {
    promptBody = (
      <IssuePromptDisplay
        content={issue.corrective_prompt}
        issueId={issue.id}
        issueTitle={issue.title}
        isRegenerating={generate.isPending}
        onRegenerate={() => generate.mutate()}
        updatedAt={issue.updated_at}
        version={issue.version}
      />
    );
  } else {
    promptBody = (
      <div className="space-y-4 rounded-lg border border-dashed p-12 text-center">
        <h3 className="text-lg font-semibold">{ISSUE_MESSAGES.PROMPT_EMPTY_TITLE}</h3>
        <p className="text-muted-foreground">{ISSUE_MESSAGES.PROMPT_EMPTY_BODY}</p>
        <Button onClick={() => generate.mutate()}>{ISSUE_MESSAGES.GENERATE_PROMPT_BUTTON}</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Button asChild className="-ml-2 text-muted-foreground" size="sm" variant="ghost">
        <Link to={ROUTES.PROJECT_ISSUES(id)}>
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          {ISSUE_MESSAGES.BACK_TO_ISSUES}
        </Link>
      </Button>

      <header className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <h1 className="text-[28px] font-semibold leading-[1.1] tracking-tight">{issue.title}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <IssueStatusBadge status={issue.status} />
              <IssueSeverityBadge severity={issue.severity} />
              {linkedChunk && (
                <Badge variant="outline">
                  <Link className="hover:underline" to={ROUTES.PROJECT_CHUNK(id, linkedChunk.id)}>
                    {linkedChunk.title}
                  </Link>
                </Badge>
              )}
            </div>
          </div>
          <Button
            aria-busy={resolve.isPending}
            disabled={resolve.isPending}
            onClick={() => resolve.mutate({ resolved: issue.status === 'open' })}
            variant={issue.status === 'open' ? 'default' : 'outline'}
          >
            {issue.status === 'open'
              ? ISSUE_MESSAGES.MARK_RESOLVED_BUTTON
              : ISSUE_MESSAGES.MARK_OPEN_BUTTON}
          </Button>
        </div>
        {resolve.isError && (
          <p className="text-sm text-destructive">{ISSUE_MESSAGES.RESOLVE_FAILED}</p>
        )}
      </header>

      {issue.status === 'resolved' && (
        <Alert className="border-green-600/40 text-green-700 dark:border-green-500/40 dark:text-green-500 [&>svg]:text-green-600 dark:[&>svg]:text-green-500">
          <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
          <AlertTitle>{ISSUE_MESSAGES.RESOLVED_BANNER}</AlertTitle>
        </Alert>
      )}

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">{ISSUE_MESSAGES.ORIGINAL_REPORT_HEADER}</h2>
        <p className="whitespace-pre-wrap rounded-md border bg-muted/30 p-3 text-sm">
          {issue.description}
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">{ISSUE_MESSAGES.PROMPT_HEADER}</h2>
        {generate.isError && (
          <Alert variant="destructive">
            <AlertDescription>
              {getAiErrorCopy(generate.error, ISSUE_MESSAGES.PROMPT_FAILED)}
            </AlertDescription>
          </Alert>
        )}
        {promptBody}
      </section>
    </div>
  );
}
