import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/constants/routes';
import { useExistingBrief } from '@/features/projects/brief/useExistingBrief';
import { EmptyPanelContent } from '@/features/projects/overview/EmptyPanelContent';
import { CheckCircle2, FileText } from '@/features/projects/overview/icons';
import { OVERVIEW_MESSAGES } from '@/features/projects/overview/messages';
import { PanelCard } from '@/features/projects/overview/PanelCard';
import { formatRelativeTime } from '@/lib/relative-time';

export function BriefStatusPanel({ projectId }: { projectId: string }) {
  const brief = useExistingBrief(projectId);

  return (
    <PanelCard
      icon={<FileText aria-hidden="true" className="h-4 w-4 text-muted-foreground" />}
      title={OVERVIEW_MESSAGES.BRIEF_TITLE}
    >
      {brief.isPending && (
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      )}

      {brief.isError && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{OVERVIEW_MESSAGES.BRIEF_ERROR_BODY}</p>
          <Button onClick={() => void brief.refetch()} size="sm" variant="outline">
            {OVERVIEW_MESSAGES.BRIEF_ERROR_RETRY}
          </Button>
        </div>
      )}

      {!brief.isPending && !brief.isError && !brief.data && (
        <EmptyPanelContent
          body={OVERVIEW_MESSAGES.BRIEF_EMPTY_BODY}
          cta={{ label: OVERVIEW_MESSAGES.BRIEF_EMPTY_CTA, to: ROUTES.PROJECT_BRIEF(projectId) }}
          title={OVERVIEW_MESSAGES.BRIEF_EMPTY_TITLE}
        />
      )}

      {!brief.isPending && !brief.isError && brief.data && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            {brief.data.is_final ? (
              <>
                <CheckCircle2 aria-hidden="true" className="h-4 w-4 text-brand-text" />
                <span className="font-medium text-brand-text">
                  {OVERVIEW_MESSAGES.BRIEF_APPROVED_BANNER}
                </span>
              </>
            ) : (
              <span className="text-muted-foreground">{OVERVIEW_MESSAGES.BRIEF_DRAFT_BANNER}</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {OVERVIEW_MESSAGES.BRIEF_LAST_UPDATED_PREFIX}{' '}
            {formatRelativeTime(brief.data.updated_at, OVERVIEW_MESSAGES.SUMMARY_JUST_NOW)}
          </p>
          <Button asChild size="sm" variant="outline">
            <Link to={ROUTES.PROJECT_BRIEF(projectId)}>{OVERVIEW_MESSAGES.BRIEF_OPEN_LINK}</Link>
          </Button>
        </div>
      )}
    </PanelCard>
  );
}
