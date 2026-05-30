import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/constants/routes';
import { KNOWLEDGE_MESSAGES } from '@/features/projects/knowledge/messages';
import { useLearnings } from '@/features/projects/knowledge/useLearnings';
import { EmptyPanelContent } from '@/features/projects/overview/EmptyPanelContent';
import { Lightbulb } from '@/features/projects/overview/icons';
import { PanelCard } from '@/features/projects/overview/PanelCard';

const RECENT_LIMIT = 5;

/**
 * Recent learnings panel — surfaces the latest extracted insights on the overview as a small
 * institutional-memory snapshot. Reads from the same `useLearnings` query the Knowledge page uses
 * (React Query dedupes the fetch), so opening Knowledge after viewing the overview hits the cache.
 */
export function RecentLearningsPanel({ projectId }: { projectId: string }) {
  const query = useLearnings(projectId);
  const learnings = query.data ?? [];
  const recent = learnings.slice(0, RECENT_LIMIT);

  const action = recent.length > 0
    ? (
      <Link
        className="text-sm text-muted-foreground hover:text-foreground"
        to={ROUTES.PROJECT_KNOWLEDGE(projectId)}
      >
        {KNOWLEDGE_MESSAGES.OVERVIEW_OPEN_ALL_LINK}
      </Link>
    )
    : undefined;

  return (
    <PanelCard
      action={action}
      icon={<Lightbulb aria-hidden="true" className="h-4 w-4 text-muted-foreground" />}
      title={KNOWLEDGE_MESSAGES.OVERVIEW_PANEL_TITLE}
    >
      {recent.length === 0
        ? (
          <EmptyPanelContent
            body={KNOWLEDGE_MESSAGES.OVERVIEW_EMPTY_BODY}
            cta={{
              label: KNOWLEDGE_MESSAGES.ADD_NOTES_BUTTON,
              to: ROUTES.PROJECT_KNOWLEDGE(projectId),
            }}
            title={KNOWLEDGE_MESSAGES.OVERVIEW_EMPTY_TITLE}
          />
        )
        : (
          <ul className="space-y-2">
            {recent.map((learning) => (
              <li
                className="flex items-start justify-between gap-3 rounded-md border p-3"
                key={learning.id}
              >
                <span className="truncate text-sm text-foreground">{learning.title}</span>
                <Badge className="shrink-0" variant="outline">
                  {KNOWLEDGE_MESSAGES.TYPE_BADGE_LABELS[learning.type]}
                </Badge>
              </li>
            ))}
          </ul>
        )}
    </PanelCard>
  );
}
