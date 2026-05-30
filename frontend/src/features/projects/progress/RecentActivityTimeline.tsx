import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import type { ChunkStatus } from '@shared/schemas/chunks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ROUTES } from '@/constants/routes';
import type { ChunkRow } from '@/features/projects/chunks/useChunks';
import { PROGRESS_MESSAGES } from '@/features/projects/progress/messages';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/relative-time';

type RecentActivityTimelineProps = {
  chunks: ChunkRow[];
  projectId: string;
};

const RECENT_LIMIT = 10;

// Status dot color — pulled from the same six-status palette the board uses. Meaning never rests on
// color alone; the status label is always shown in the text next to the dot.
const STATUS_DOT_CLASS: Record<ChunkStatus, string> = {
  backlog: 'bg-muted-foreground/30',
  ready: 'bg-blue-500',
  in_progress: 'bg-amber-500',
  needs_review: 'bg-purple-500',
  completed: 'bg-green-500',
  blocked: 'bg-destructive',
};

/**
 * Approximation of a transition history: the N most recently updated chunks, ordered newest-first.
 * Without a dedicated transitions table (out of scope per Chunk 22), a chunk that was renamed or
 * had its description edited would also appear — this is an acceptable MVP trade-off.
 */
export function RecentActivityTimeline({ chunks, projectId }: RecentActivityTimelineProps) {
  const recent = useMemo(() => {
    return [...chunks]
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
      .slice(0, RECENT_LIMIT);
  }, [chunks]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{PROGRESS_MESSAGES.RECENT_ACTIVITY_TITLE}</CardTitle>
      </CardHeader>
      <CardContent>
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {PROGRESS_MESSAGES.RECENT_ACTIVITY_EMPTY}
          </p>
        ) : (
          <ul className="space-y-3">
            {recent.map((chunk) => (
              <li className="flex items-start gap-3" key={chunk.id}>
                <span
                  aria-hidden="true"
                  className={cn(
                    'mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full',
                    STATUS_DOT_CLASS[chunk.status],
                  )}
                />
                <div className="min-w-0 flex-1">
                  <Link
                    className="block truncate font-medium hover:underline"
                    to={ROUTES.PROJECT_CHUNK(projectId, chunk.id)}
                  >
                    {chunk.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {PROGRESS_MESSAGES.RECENT_PREFIX(
                      PROGRESS_MESSAGES.STATUS_SECTION_LABELS[chunk.status],
                    )}{' '}
                    · {formatRelativeTime(chunk.updated_at, PROGRESS_MESSAGES.UPDATED_JUST_NOW)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
